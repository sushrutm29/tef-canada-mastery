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

const region = "us-east-1";
const accountId = "974737712658";
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

new aws.iam.RolePolicyAttachment("tef-exec-role-managed", {
  role: executionRole.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
});

new aws.iam.RolePolicy("tef-exec-role-ssm", {
  role: executionRole.id,
  policy: pulumi.jsonStringify({
    Version: "2012-10-17",
    Statement: [{
      Effect: "Allow",
      Action: ["ssm:GetParameters"],
      Resource: pulumi.interpolate`arn:aws:ssm:${region}:${accountId}:parameter${dbUrlParamName}`,
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

// ---------------------------------------------------------------
// SECURITY GROUPS — the firewall rules
// ---------------------------------------------------------------

// ALB: the public front door. Accepts HTTP/HTTPS from anywhere.
const albSg = new aws.ec2.SecurityGroup("tef-alb-sg", {
  name: "tef-canada-alb-sg",
  vpcId: vpcId,
  description: "ALB: allow HTTP/HTTPS from the internet",
  ingress: [
    { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
    { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] },
  ],
  egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
  tags: { ...tags, Name: "tef-alb-sg" },
});

// Tasks: reachable ONLY from the ALB, on the two app ports.
const taskSg = new aws.ec2.SecurityGroup("tef-task-sg", {
  name: "tef-canada-task-sg",
  vpcId: vpcId,
  description: "Fargate tasks: allow app ports from the ALB only",
  ingress: [
    { protocol: "tcp", fromPort: 3000, toPort: 3000, securityGroups: [albSg.id] },
    { protocol: "tcp", fromPort: 4000, toPort: 4000, securityGroups: [albSg.id] },
  ],
  egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
  tags: { ...tags, Name: "tef-task-sg" },
});

// ---------------------------------------------------------------
// TARGET GROUPS — where the ALB routes traffic (one per service)
// targetType "ip" is required for Fargate awsvpc networking.
// ---------------------------------------------------------------
const webTargetGroup = new aws.lb.TargetGroup("tef-web-tg", {
  name: "tef-canada-web-tg",
  port: 3000,
  protocol: "HTTP",
  targetType: "ip",
  vpcId: vpcId,
  healthCheck: { path: "/", matcher: "200-399" },
  tags: { ...tags, Name: "tef-web-tg" },
});

const apiTargetGroup = new aws.lb.TargetGroup("tef-api-tg", {
  name: "tef-canada-api-tg",
  port: 4000,
  protocol: "HTTP",
  targetType: "ip",
  vpcId: vpcId,
  healthCheck: { path: "/db-test", matcher: "200-399" },
  tags: { ...tags, Name: "tef-api-tg" },
});

// ---------------------------------------------------------------
// APPLICATION LOAD BALANCER — the public entry point
// ---------------------------------------------------------------
const alb = new aws.lb.LoadBalancer("tef-alb", {
  name: "tef-canada-alb",
  loadBalancerType: "application",
  subnets: publicSubnetIds as pulumi.Output<string[]>,
  securityGroups: [albSg.id],
  tags: { ...tags, Name: "tef-alb" },
});

// HTTP :80 — redirect everything to HTTPS.
const httpListener = new aws.lb.Listener("tef-http-listener", {
  loadBalancerArn: alb.arn,
  port: 80,
  protocol: "HTTP",
  defaultActions: [{
    type: "redirect",
    redirect: { port: "443", protocol: "HTTPS", statusCode: "HTTP_301" },
  }],
});

// HTTPS :443 — terminate TLS; default to web, api via host rule below.
const httpsListener = new aws.lb.Listener("tef-https-listener", {
  loadBalancerArn: alb.arn,
  port: 443,
  protocol: "HTTPS",
  sslPolicy: "ELBSecurityPolicy-TLS13-1-2-2021-06",
  certificateArn: certArn,
  defaultActions: [{
    type: "forward",
    targetGroupArn: webTargetGroup.arn,
  }],
  tags: { ...tags, Name: "tef-https-listener" },
});

// Host-based rule: api.tefcanadaexpert.com → api target group.
new aws.lb.ListenerRule("tef-api-rule", {
  listenerArn: httpsListener.arn,
  priority: 10,
  conditions: [{
    hostHeader: { values: [pulumi.interpolate`api.${domainName}`] },
  }],
  actions: [{
    type: "forward",
    targetGroupArn: apiTargetGroup.arn,
  }],
  tags: { ...tags, Name: "tef-api-rule" },
});

// ---------------------------------------------------------------
// ROUTE 53 — point the domain at the ALB (alias A records)
// root, www, and api all resolve to the load balancer.
// ---------------------------------------------------------------
const rootRecord = new aws.route53.Record("tef-alias-root", {
  zoneId: zoneId,
  name: domainName,
  type: "A",
  aliases: [{
    name: alb.dnsName,
    zoneId: alb.zoneId,
    evaluateTargetHealth: true,
  }],
});

const wwwRecord = new aws.route53.Record("tef-alias-www", {
  zoneId: zoneId,
  name: pulumi.interpolate`www.${domainName}`,
  type: "A",
  aliases: [{
    name: alb.dnsName,
    zoneId: alb.zoneId,
    evaluateTargetHealth: true,
  }],
});

const apiRecord = new aws.route53.Record("tef-alias-api", {
  zoneId: zoneId,
  name: pulumi.interpolate`api.${domainName}`,
  type: "A",
  aliases: [{
    name: alb.dnsName,
    zoneId: alb.zoneId,
    evaluateTargetHealth: true,
  }],
});

// ---------------------------------------------------------------
// FARGATE — task definitions + services (the running containers)
// ---------------------------------------------------------------
const dbUrlArn = pulumi.interpolate`arn:aws:ssm:${region}:${accountId}:parameter${dbUrlParamName}`;

// --- API task definition ---
const apiTaskDef = new aws.ecs.TaskDefinition("tef-api-task", {
  family: "tef-api",
  cpu: "256",
  memory: "512",
  networkMode: "awsvpc",
  requiresCompatibilities: ["FARGATE"],
  runtimePlatform: { cpuArchitecture: "ARM64", operatingSystemFamily: "LINUX" },
  executionRoleArn: executionRole.arn,
  taskRoleArn: taskRole.arn,
  containerDefinitions: pulumi.jsonStringify([{
    name: "api",
    image: pulumi.interpolate`${apiRepoUrl}:latest`,
    essential: true,
    portMappings: [{ containerPort: 4000, protocol: "tcp" }],
    secrets: [{ name: "DATABASE_URL", valueFrom: dbUrlArn }],
    logConfiguration: {
      logDriver: "awslogs",
      options: {
        "awslogs-group": apiLogGroup.name,
        "awslogs-region": region,
        "awslogs-stream-prefix": "api",
      },
    },
  }]),
  tags: { ...tags, Name: "tef-api-task" },
});

// --- WEB task definition ---
const webTaskDef = new aws.ecs.TaskDefinition("tef-web-task", {
  family: "tef-web",
  cpu: "256",
  memory: "512",
  networkMode: "awsvpc",
  requiresCompatibilities: ["FARGATE"],
  runtimePlatform: { cpuArchitecture: "ARM64", operatingSystemFamily: "LINUX" },
  executionRoleArn: executionRole.arn,
  taskRoleArn: taskRole.arn,
  containerDefinitions: pulumi.jsonStringify([{
    name: "web",
    image: pulumi.interpolate`${webRepoUrl}:latest`,
    essential: true,
    portMappings: [{ containerPort: 3000, protocol: "tcp" }],
    environment: [{ name: "API_URL", value: pulumi.interpolate`https://api.${domainName}` }],
    logConfiguration: {
      logDriver: "awslogs",
      options: {
        "awslogs-group": webLogGroup.name,
        "awslogs-region": region,
        "awslogs-stream-prefix": "web",
      },
    },
  }]),
  tags: { ...tags, Name: "tef-web-task" },
});

// --- API service ---
new aws.ecs.Service("tef-api-service", {
  name: "tef-api",
  cluster: cluster.arn,
  taskDefinition: apiTaskDef.arn,
  desiredCount: 1,
  launchType: "FARGATE",
  enableExecuteCommand: true,
  networkConfiguration: {
    subnets: publicSubnetIds as pulumi.Output<string[]>,
    securityGroups: [taskSg.id],
    assignPublicIp: true,
  },
  loadBalancers: [{
    targetGroupArn: apiTargetGroup.arn,
    containerName: "api",
    containerPort: 4000,
  }],
}, { dependsOn: [httpsListener] });

// --- WEB service ---
new aws.ecs.Service("tef-web-service", {
  name: "tef-web",
  cluster: cluster.arn,
  taskDefinition: webTaskDef.arn,
  desiredCount: 1,
  launchType: "FARGATE",
  enableExecuteCommand: true,
  networkConfiguration: {
    subnets: publicSubnetIds as pulumi.Output<string[]>,
    securityGroups: [taskSg.id],
    assignPublicIp: true,
  },
  loadBalancers: [{
    targetGroupArn: webTargetGroup.arn,
    containerName: "web",
    containerPort: 3000,
  }],
}, { dependsOn: [httpsListener] });

// ---------------------------------------------------------------
// OUTPUTS
// ---------------------------------------------------------------
export const albDnsName = alb.dnsName;