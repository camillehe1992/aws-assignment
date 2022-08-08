module.exports = {
  server: {
    port: process.env.PORT || 5000,
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS,
    databse: process.env.DB_NAME || "player_db",
  },
};
