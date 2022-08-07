import 'dotenv/config'

export default {
  account: process.env.AWS_ACCOUNT_ID,
  region: process.env.AWS_REGION,
  appName: process.env.APP_NAME,
  environment: process.env.ENVIRONEMNT,
  hostedZoneName: process.env.HOSTED_ZONE_NAME,
  ec2InstanceRoleName: process.env.EC2_INSTANCE_ROLE_NAME,
  ecsClusterName: process.env.ECS_CLUSTER_NAME,
  ec2InstanceType: process.env.ECS_INSTANCE_TYPE,
  certArn: process.env.CERTIFICATE_ARN
};