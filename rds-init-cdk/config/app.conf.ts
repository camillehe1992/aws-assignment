import 'dotenv/config'

export default {
  // General
  account: process.env.AWS_ACCOUNT_ID,
  region: process.env.AWS_REGION,
  environment: process.env.ENVIRONEMNT || 'dev',
  // RDS
  instanceIdentifier: process.env.DB_INSTANCE_IDENTIFIER || 'mysql-01'
};