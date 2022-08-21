import 'dotenv/config'

export default {
  account: process.env.AWS_ACCOUNT_ID,
  region: process.env.AWS_REGION,
  appName: process.env.APP_NAME,
  environment: process.env.ENVIRONEMNT,
  hostedZoneName: process.env.HOSTED_ZONE_NAME || 'playground.demo.com',
  ec2InstanceRoleName: process.env.EC2_INSTANCE_ROLE_NAME || 'EC2_Instance_Role',
  ecsTaskExecutionRoleName: process.env.ECS_TASK_EXECUTION_ROLE_NAME || 'ECS_Task_Execution_Role',
  ecsTaskRoleName: process.env.ECS_TASK_ROLE_NAME || 'ECS_Task_Role',
  image: process.env.IMAGE || 'camillehe1992/webapp',
  ecsClusterName: process.env.ECS_CLUSTER_NAME,
  ec2InstanceType: process.env.ECS_INSTANCE_TYPE || 't2.micro',
  certArn: process.env.CERTIFICATE_ARN,
  albIsInternetFacing: (process.env.ALB_IS_INTERNET_FACTING == 'true') || false,
  taskCpu: process.env.TASK_CPU || '128',
  taskMemoryMiB: process.env.TASK_MEMORY || '512',
  groupId: process.env.GROUP_ID,
  containerCount: process.env.CONTAINER_COUNT,
  keyPairName: process.env.KEY_PAIR_NAME || 'ecs-instances-private-key'
};