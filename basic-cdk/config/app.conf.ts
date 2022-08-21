import 'dotenv/config'

export default {
  // General
  account: process.env.AWS_ACCOUNT_ID,
  region: process.env.AWS_REGION,
  appName: process.env.APP_NAME || 'pokemon',
  environment: process.env.ENVIRONEMNT || 'dev',
  // ECS Cluster
  ec2InstanceRoleName: process.env.EC2_INSTANCE_ROLE_NAME || 'EC2_Instance_Role',
  ecsClusterName: process.env.ECS_CLUSTER_NAME || 'MY-FIRST-ECS-CLUSTER',
  ec2InstanceType: process.env.ECS_INSTANCE_TYPE || 't2.micro',
  keyPairName: process.env.KEY_PAIR_NAME || 'ecs-instances-private-key',
  // ECS Service
  ecsTaskExecutionRoleName: process.env.ECS_TASK_EXECUTION_ROLE_NAME || 'ECS_Task_Execution_Role',
  ecsTaskRoleName: process.env.ECS_TASK_ROLE_NAME || 'ECS_Task_Role',
  image: process.env.IMAGE || 'camillehe1992/webapp',
  taskCpu: process.env.TASK_CPU || '128',
  taskMemoryMiB: process.env.TASK_MEMORY || '512',
  containerCount: process.env.CONTAINER_COUNT || '1',
  // Hosted Zone
  hostedZoneName: process.env.HOSTED_ZONE_NAME || 'pokemon.playground.com',
};