require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const conf = require("./config/app.conf");
const { dbConnection } = require("./connect");

global.db = dbConnection();

const { getHomePage } = require("./routes/index");
const {
  addPlayerPage,
  addPlayer,
  deletePlayer,
  editPlayer,
  editPlayerPage,
} = require("./routes/player");

// configure middleware
app.set("port", conf.server.port); // set express to use this port
app.set("views", __dirname + "/views"); // set express to look in this folder to render our view
app.set("view engine", "ejs"); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, "public"))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload

// route for health check

app.get("/health", (req, res) => {
  const data = {
    message: "SERVER IS UP",
    date: new Date(),
  };
  res.status(200).send(data);
});
// routes for the app
app.get("/", getHomePage);
app.get("/add", addPlayerPage);
app.get("/edit/:id", editPlayerPage);
app.get("/delete/:id", deletePlayer);
app.post("/add", addPlayer);
app.post("/edit/:id", editPlayer);

// set the app to listen on the port
app.listen(conf.server.port, () => {
  console.log(`server running on port: ${conf.server.port}`);
});
