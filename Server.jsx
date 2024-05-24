const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 3001;

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "useR12345@",
    port:3306,
    database: "movie_review"
});

db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL: ' + err.stack);
      return;
    }
    console.log('Connected to MySQL as id ' + db.threadId);
  });

app.post("/add-new-movie-id", (req,res) => {
    const MovieId = req.body.Id;
    console.log(req.body)
    if (!MovieId) {
        return res.status(400).json({ error: "Missing movieId in the request body" });
    }

    const CheckIfExitMovieId = "SELECT * FROM movies_rating WHERE movie_id = ? ";
    db.query(CheckIfExitMovieId,[MovieId], (err,results) => {
        if(err){
            console.error(err);
            return res.status(500).json({error: "Internal Server Error! 1"});
        }

        if(results.length > 0){
            return res.status(200).json({message: "Already Exists"});
        }else{
            const InsertQuery = "INSERT INTO movies_rating (movie_id) VALUES (?)";
            db.query(InsertQuery,[MovieId],(err,results) => {
             
                if(err){
                    console.error(err);
                    return res.status(500).json({error: "Internal Server Error! 2"});
                } 
                return res.status(201).json({message: "Movie Id save successfully!"})
            });
        }
    });
    
});

app.get("/", function(req, res){
    res.send("Hi Im here");
});

app.get("/get-movie-ratings", function (req, res) {
    const GetMovieRatingDetails = "SELECT * FROM movies_rating";
    db.query(GetMovieRatingDetails, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error!" });
        }
        res.send(results);
    });
});

app.put("/update-rating",(req,res) =>{
    const MovieId = req.body.movieId;
    const RatingCount = req.body.ratingValue;
    const FansCount = req.body.newFansCount;

    console.log("Movie Id : ",MovieId);
    console.log("Rating Count : ",RatingCount);
    console.log("Fans Count : ",FansCount);

    if(MovieId === null || RatingCount === null || FansCount === null){
        return res.status(400).json({ error: "Missing movieId in the request body" });
    }else{
        const CheckIfExitMovieId = "SELECT * FROM movies_rating WHERE movie_id = ? ";
        db.query(CheckIfExitMovieId,[MovieId], (err,results) => {
        if(err){
            console.error(err);
            return res.status(500).json({error: "Internal Server Error! 1"});
        }
        if(results.length > 0){
            const SaveQuery = "UPDATE movies_rating SET rating_count = ? , fans_count = ? WHERE movie_id = ?";
            db.query(SaveQuery,[RatingCount,FansCount,MovieId],(err,result) =>{
            if(err){
                console.error(err);
                return res.status(500).json({error: "Internal Server Error!"});
            } 
            return res.status(201).json({message: "Rating Update successfully!"})
          });
        }
        else{
            return res.status(400).json({ error: "Id Not Found!" }); 
        }
    });
    }
});

app.listen(port, () => {
    console.log("Server running...");
  });