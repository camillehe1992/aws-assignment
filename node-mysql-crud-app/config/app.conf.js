module.exports = {
  server: {
    port: process.env.PORT || 5000,
  },
  database: {
    host: process.env.MYSQL_DB_HOST || "localhost",
    user: process.env.MYSQL_ROOT_USER || "root",
    password: process.env.MYSQL_ROOT_PASSWORD,
    databse: process.env.MYSQL_DB_NAME || "player_db",
    secretId: process.env.SECRET_NAME,
  },
};
