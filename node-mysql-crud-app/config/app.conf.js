module.exports = {
  region: process.env.REGION || "ap-south-1",
  server: {
    port: process.env.PORT || 5000,
  },
  secretId: process.env.AWS_SECRET_ID,
};
