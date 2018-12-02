var Uuid = require("uuid");
var Cors = require("cors");
var Express = require("express");
var Couchbase = require("couchbase");
var BodyParser = require("body-parser");

// Express.js connection
var app = Express();

//Database object
var DB = Couchbase.N1qlQuery;

//Port for back-end server, localhost:3000
const port = 3000;

//Cross origin resource sharing
app.use(BodyParser.json());
app.use(Cors())


// Database connection
  var cluster = new Couchbase.Cluster('couchbase://localhost');
  cluster.authenticate('admin', 'admin123'); 
  var bucket = cluster.openBucket('moviedb'); 

// Add new movies
app.post("/movies", function(req, res) {
        //Check for missing information
        if(!req.body.name) {
            return res.status(400).send({ "message": "Name is missing" });
        } else if(!req.body.genre) {
            return res.status(400).send({ "message": "Genre is missing" });
        }
        //Insert the movie to the database
        bucket.insert(Uuid.v4(), req.body, function(error, result) {
            res.send(req.body);
        });
});

//Display movie list on the homepage
app.get("/movies", function(req, res) {
    var query = DB.fromString("SELECT moviedb.* FROM moviedb").consistency(DB.Consistency.REQUEST_PLUS);
    bucket.query(query, function(error, result) {
        res.send(result);
    });
});

//Search for spesific genre
app.get("/movies/:title", function(req, res) {
    if(!req.params.title) {
        return res.status(400).send({ "message": "Genre is missing" });
    }
    var query = DB.fromString("SELECT moviedb.* FROM moviedb WHERE LOWER(genre) LIKE '%' || $1 || '%'").consistency(DB.Consistency.REQUEST_PLUS);
    bucket.query(query, [req.params.title.toLowerCase()], function(error, result) {
        res.send(result);
    });
});

//Start the server
app.listen(port, () => {
    console.log('Server started on port ' +port);
})