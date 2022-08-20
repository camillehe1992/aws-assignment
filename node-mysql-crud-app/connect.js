const mysql = require("mysql2");
const { getSecretValue } = require("./helpers/aws");
const conf = require("./config/app.conf");

const getSecret = async (secretId) => {
  if (conf.environment == "local") {
    return conf.database;
  } else {
    return await getSecretValue(conf.secretId);
  }
};

// Create the connection pool. The pool-specific settings are the defaults
const createPool = async () => {
  try {
    const { host, username, password, port } = await getSecret(conf.secretId);
    console.log(`get secret for ${host}`);
    const pool = mysql.createPool({
      host,
      user: username,
      password,
      port,
      database: conf.database.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log("pool is initialized");
    return pool;
  } catch (error) {
    console.error("failed to init database connection pool", error);
  }
};

module.exports = {
  createPool,
};
