const express = require("express");
const app = express();

app.use("/health", (req, res, next) => {
  const data = {
    time: new Date().toISOString(),
    msg: "SERVER IS UP",
  };
  res.status(200).send(data);
  next();
});

app.get("/", (req, res) => {
  res.send("Successful response.");
});

app.listen(5000, console.log("App Listening to port 5000"));
