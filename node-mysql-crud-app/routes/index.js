module.exports = {
  getHomePage: (req, res) => {
    let query = "SELECT * FROM `players` ORDER BY id ASC"; // query database to get all the players

    // execute query
    pool.query(query, (err, result) => {
      if (err) {
        console.log(`failed to query database with query ${query}`, err);
        res.redirect("/");
        return;
      }
      res.render("index.ejs", {
        title: "Welcome to Socka | View Players",
        players: result,
      });
    });
  },
};
