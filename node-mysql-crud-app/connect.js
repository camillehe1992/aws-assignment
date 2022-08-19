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

// create connection to database
// the mysql.createConnection function takes in a configuration object
// which contains host, user, password and the database name.
const dbConnection = async () => {
  const { host, username, password, port } = await getSecret(conf.secretId);
  console.log(`get secret for ${host}`);
  const db = mysql.createConnection({
    host,
    user: username,
    password,
    port,
    multipleStatements: true,
  });

  // connect to database
  db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log("connected to database");
  });
  return db;
};

module.exports = {
  dbConnection,
};
