const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

const getSecretValue = async (secretId) => {
  const client = new SecretsManagerClient({
    region: conf.region,
  });
  const command = new GetSecretValueCommand({
    SecretId: secretId,
  });
  return await client.send(command);
};

module.exports = {
  getSecretValue,
};
