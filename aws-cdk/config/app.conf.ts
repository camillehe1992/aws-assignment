import 'dotenv/config'

export default {
  account: process.env.AWS_ACCOUNT_ID,
  region: process.env.AWS_REGION,
  appName: process.env.APP_NAME,
  environment: process.env.ENVIRONEMNT,
  hostedZoneName: process.env.HOSTED_ZONE_NAME,
  ec2InstanceRoleName: process.env.EC2_INSTANCE_ROLE_NAME,
  ecsTaskExecutionRoleName: process.env.ECS_TASK_EXECUTION_ROLE_NAME,
  image: process.env.IMAGE,
  ecsClusterName: process.env.ECS_CLUSTER_NAME,
  ec2InstanceType: process.env.ECS_INSTANCE_TYPE,
  certArn: process.env.CERTIFICATE_ARN,
  taskCpu: process.env.TASK_CPU,
  taskMemoryMiB: process.env.TASK_MEMORY,
  groupId: process.env.GROUP_ID,
  containerCount: process.env.CONTAINER_COUNT
};