import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// ---------------------------------------------------------------
// STACK REFERENCE — read outputs from the persistent stack
// ---------------------------------------------------------------
const persistent = new pulumi.StackReference("sushrutm29/tef-persistent/dev");

const vpcId = persistent.getOutput("vpcId");
const vpcCidr = persistent.getOutput("vpcCidr");
const publicSubnetIds = persistent.getOutput("publicSubnetIds");
const webRepoUrl = persistent.getOutput("webRepoUrl");
const apiRepoUrl = persistent.getOutput("apiRepoUrl");
const certArn = persistent.getOutput("certArn");
const zoneId = persistent.getOutput("zoneId");
const domainName = persistent.getOutput("domainName");
const dbUrlParamName = persistent.getOutput("dbUrlParamName");

const tags = { Project: "tef-canada", ManagedBy: "pulumi" };

// ---------------------------------------------------------------
// ECS CLUSTER — logical group your Fargate services run in
// ---------------------------------------------------------------
const cluster = new aws.ecs.Cluster("tef-cluster", {
  name: "tef-canada",
  tags: { ...tags, Name: "tef-cluster" },
});

// ---------------------------------------------------------------
// CLOUDWATCH LOG GROUPS — where container logs are collected
// 7-day retention keeps storage cost near zero.
// ---------------------------------------------------------------
const webLogGroup = new aws.cloudwatch.LogGroup("tef-web-logs", {
  name: "/ecs/tef-web",
  retentionInDays: 7,
  tags: { ...tags, Name: "tef-web-logs" },
});
const apiLogGroup = new aws.cloudwatch.LogGroup("tef-api-logs", {
  name: "/ecs/tef-api",
  retentionInDays: 7,
  tags: { ...tags, Name: "tef-api-logs" },
});

// ---------------------------------------------------------------
// IAM — EXECUTION ROLE: what Fargate needs to START a task
// (pull image from ECR, read the DB secret, write logs)
// ---------------------------------------------------------------
const executionRole = new aws.iam.Role("tef-exec-role", {
  name: "tef-canada-exec-role",
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
      Action: "sts:AssumeRole",
      Effect: "Allow",
      Principal: { Service: "ecs-tasks.amazonaws.com" },
    }],
  }),
  tags: { ...tags, Name: "tef-exec-role" },
});

// AWS-managed policy covering ECR pull + CloudWatch logs
new aws.iam.RolePolicyAttachment("tef-exec-role-managed", {
  role: executionRole.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
});

// Extra permission: read the DATABASE_URL SSM SecureString
new aws.iam.RolePolicy("tef-exec-role-ssm", {
  role: executionRole.id,
  policy: pulumi.jsonStringify({
    Version: "2012-10-17",
    Statement: [{
      Effect: "Allow",
      Action: ["ssm:GetParameters"],
      Resource: pulumi.interpolate`arn:aws:ssm:us-east-1:974737712658:parameter${dbUrlParamName}`,
    }],
  }),
});

// ---------------------------------------------------------------
// IAM — TASK ROLE: what the RUNNING container is allowed to do
// Minimal; SSM messages permissions enable ECS Exec ("SSH into prod").
// ---------------------------------------------------------------
const taskRole = new aws.iam.Role("tef-task-role", {
  name: "tef-canada-task-role",
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
      Action: "sts:AssumeRole",
      Effect: "Allow",
      Principal: { Service: "ecs-tasks.amazonaws.com" },
    }],
  }),
  tags: { ...tags, Name: "tef-task-role" },
});

new aws.iam.RolePolicy("tef-task-role-exec", {
  role: taskRole.id,
  policy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
      Effect: "Allow",
      Action: [
        "ssmmessages:CreateControlChannel",
        "ssmmessages:CreateDataChannel",
        "ssmmessages:OpenControlChannel",
        "ssmmessages:OpenDataChannel",
      ],
      Resource: "*",
    }],
  }),
});

// Temporary export to verify the reference works before we build on it.
export const checkVpcId = vpcId;
export const checkDomain = domainName;