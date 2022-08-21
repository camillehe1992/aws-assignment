const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
const conf = require("../../config/app.conf");

const getSecretValue = async (secretId) => {
  const client = new SecretsManagerClient({
    region: conf.region,
  });
  const command = new GetSecretValueCommand({
    SecretId: secretId,
  });
  try {
    console.log(`Get secretId ${secretId}`);
    const response = await client.send(command);
    let secret;
    if ("SecretString" in response) {
      secret = response.SecretString;
    } else {
      console.log("else:", response);
      // Create a buffer
      const buff = Buffer.from(data.SecretBinary, "base64");
      secret = buff.toString("ascii");
    }
    return JSON.parse(secret);
  } catch (error) {
    console.error("failed to get secret value from secret manager", error);
  }
};

module.exports = {
  getSecretValue,
};
