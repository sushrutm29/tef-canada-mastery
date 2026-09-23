import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const domain = config.require("domain");
const dbName = config.get("dbName") ?? "tefdb";
const dbUser = config.get("dbUser") ?? "tefadmin";
const dbPassword = config.requireSecret("dbPassword");

// Tags applied to every resource — lets Cost Explorer filter by project.
const tags = { Project: "tef-canada", ManagedBy: "pulumi" };

// ---------------------------------------------------------------
// NETWORK
// ---------------------------------------------------------------
const vpc = new aws.ec2.Vpc("tef-vpc", {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: { ...tags, Name: "tef-vpc" },
});

const igw = new aws.ec2.InternetGateway("tef-igw", {
  vpcId: vpc.id,
  tags: { ...tags, Name: "tef-igw" },
});

const azs = aws.getAvailabilityZonesOutput({ state: "available" });

const publicSubnetA = new aws.ec2.Subnet("tef-public-a", {
  vpcId: vpc.id,
  cidrBlock: "10.0.0.0/20",
  availabilityZone: azs.names[0],
  mapPublicIpOnLaunch: true,
  tags: { ...tags, Name: "tef-public-a" },
});
const publicSubnetB = new aws.ec2.Subnet("tef-public-b", {
  vpcId: vpc.id,
  cidrBlock: "10.0.16.0/20",
  availabilityZone: azs.names[1],
  mapPublicIpOnLaunch: true,
  tags: { ...tags, Name: "tef-public-b" },
});

const publicRouteTable = new aws.ec2.RouteTable("tef-public-rt", {
  vpcId: vpc.id,
  routes: [{ cidrBlock: "0.0.0.0/0", gatewayId: igw.id }],
  tags: { ...tags, Name: "tef-public-rt" },
});
new aws.ec2.RouteTableAssociation("tef-public-rt-a", {
  subnetId: publicSubnetA.id,
  routeTableId: publicRouteTable.id,
});
new aws.ec2.RouteTableAssociation("tef-public-rt-b", {
  subnetId: publicSubnetB.id,
  routeTableId: publicRouteTable.id,
});

const dbSubnetA = new aws.ec2.Subnet("tef-db-a", {
  vpcId: vpc.id,
  cidrBlock: "10.0.32.0/20",
  availabilityZone: azs.names[0],
  tags: { ...tags, Name: "tef-db-a" },
});
const dbSubnetB = new aws.ec2.Subnet("tef-db-b", {
  vpcId: vpc.id,
  cidrBlock: "10.0.48.0/20",
  availabilityZone: azs.names[1],
  tags: { ...tags, Name: "tef-db-b" },
});

// ---------------------------------------------------------------
// ECR — explicit names so the repo URLs stay stable across rebuilds
// ---------------------------------------------------------------
const webRepo = new aws.ecr.Repository("tef-web", {
  name: "tef-web",
  forceDelete: true,
  tags: { ...tags, Name: "tef-web" },
});
const apiRepo = new aws.ecr.Repository("tef-api", {
  name: "tef-api",
  forceDelete: true,
  tags: { ...tags, Name: "tef-api" },
});

// ---------------------------------------------------------------
// RDS
// ---------------------------------------------------------------
const dbSubnets = new aws.rds.SubnetGroup("tef-db-subnets", {
  name: "tef-canada-db-subnets",
  subnetIds: [dbSubnetA.id, dbSubnetB.id],
  tags: { ...tags, Name: "tef-canada-db-subnets" },
}, { deleteBeforeReplace: true });

const dbSecurityGroup = new aws.ec2.SecurityGroup("tef-db-sg", {
  name: "tef-canada-db-sg",
  vpcId: vpc.id,
  description: "Postgres access from inside the VPC only",
  ingress: [{
    protocol: "tcp",
    fromPort: 5432,
    toPort: 5432,
    cidrBlocks: [vpc.cidrBlock],
  }],
  egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
  tags: { ...tags, Name: "tef-canada-db-sg" },
}, { deleteBeforeReplace: true });

const db = new aws.rds.Instance("tef-db", {
  identifier: "tef-canada-db",        // readable name in the console
  engine: "postgres",
  engineVersion: "18.6",                // pinned — no surprise upgrades
  instanceClass: "db.t4g.micro",
  allocatedStorage: 20,
  storageEncrypted: true,             // free, and standard practice
  dbName: dbName,
  username: dbUser,
  password: dbPassword,
  dbSubnetGroupName: dbSubnets.name,
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  publiclyAccessible: false,
  backupRetentionPeriod: 7,           // explicit rather than implicit
  skipFinalSnapshot: true,            // fine for a learning DB; not for real data
  tags: { ...tags, Name: "tef-canada-db" },
}, { deleteBeforeReplace: true });

// ---------------------------------------------------------------
// DNS + TLS
// ---------------------------------------------------------------
const zone = new aws.route53.Zone("tef-zone", {
  name: domain,
  tags: { ...tags, Name: domain },
});

const cert = new aws.acm.Certificate("tef-cert", {
  domainName: domain,
  subjectAlternativeNames: [`www.${domain}`, `api.${domain}`],
  validationMethod: "DNS",
  tags: { ...tags, Name: domain },
});

const makeValidationRecord = (i: number) => {
  const opt = cert.domainValidationOptions[i];
  return new aws.route53.Record(`tef-cert-validation-${i}`, {
    zoneId: zone.zoneId,
    name: opt.resourceRecordName,
    type: opt.resourceRecordType,
    records: [opt.resourceRecordValue],
    ttl: 300,
    allowOverwrite: true,
  });
};
const validationRecords = [0, 1, 2].map(makeValidationRecord);

const certValidation = new aws.acm.CertificateValidation("tef-cert-validated", {
  certificateArn: cert.arn,
  validationRecordFqdns: validationRecords.map(r => r.fqdn),
});

const dbConnectionString = pulumi.interpolate`postgresql://${dbUser}:${dbPassword}@${db.address}:5432/${dbName}`;

// ---------------------------------------------------------------
// SSM PARAMETER — DATABASE_URL for Fargate tasks
// Lives in the persistent stack so it survives ephemeral teardowns.
// SecureString = encrypted at rest; injected into containers by reference, never plaintext.
// ---------------------------------------------------------------

const dbUrlParam = new aws.ssm.Parameter("tef-db-url", {
  name: "/tef-canada/database-url",
  type: "SecureString",
  value: dbConnectionString,
  tags: { ...tags, Name: "tef-db-url" },
});

// ---------------------------------------------------------------
// OUTPUTS
// ---------------------------------------------------------------
export const vpcId = vpc.id;
export const vpcCidr = vpc.cidrBlock;
export const publicSubnetIds = [publicSubnetA.id, publicSubnetB.id];
export const webRepoUrl = webRepo.repositoryUrl;
export const apiRepoUrl = apiRepo.repositoryUrl;
export const dbEndpoint = db.address;
export { dbConnectionString };
export const dbUrlParamName = dbUrlParam.name;
export const zoneId = zone.zoneId;
export const certArn = certValidation.certificateArn;
export const domainName = domain;
export const nameServers = zone.nameServers;