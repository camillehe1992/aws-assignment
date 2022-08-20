module.exports = {
  environment: process.env.ENVIRONMENT || "local",
  region: process.env.REGION || "ap-south-1",
  server: {
    port: process.env.PORT || 5000,
  },
  secretId: process.env.AWS_SECRET_ID,
  database: {
    name: process.env.MYSQL_DATABASE || "socka",
    host: process.env.MYSQL_HOST || "localhost",
    username: process.env.MYSQL_USERNAME || "root",
    passord: process.env.MYSQL_ROOT_PASSWORD,
    port: process.env.MYSQL_PORT || 6603,
  },
};
