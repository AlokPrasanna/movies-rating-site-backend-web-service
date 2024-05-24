const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv/config");

const Configs = require('./configurations');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = Configs.PORT || 3001;

// Create a pool of connections
const pool = mysql.createPool({
    host: Configs.HOST,
    user: Configs.USER,
    password: Configs.PASSWORD,
    port: Configs.DB_PORT,
    database: Configs.DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.post("/add-new-movie-id", async (req, res) => {
    const MovieId = req.body.Id;
    console.log("Request body:", req.body);
    if (!MovieId) {
        console.error("Missing movieId in the request body");
        return res.status(400).json({ error: "Missing movieId in the request body" });
    }

    try {
        const connection = await pool.getConnection();
        try {
            const [results] = await connection.query("SELECT * FROM movies_rating WHERE movie_id = ?", [MovieId]);
            if (results.length > 0) {
                console.log("Movie ID already exists:", MovieId);
                return res.status(200).json({ message: "Already Exists" });
            } else {
                await connection.query("INSERT INTO movies_rating (movie_id, rating_count) VALUES (?, ?)", [MovieId, 0]);
                console.log("Movie ID saved successfully:", MovieId);
                return res.status(201).json({ message: "Movie Id saved successfully!" });
            }
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("Error during database operation:", err);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
});

app.get("/", (req, res) => {
    res.send("Hi I'm here");
});

app.get("/get-movie-ratings", async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [results] = await connection.query("SELECT * FROM movies_rating");
            res.send(results);
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("Error fetching movie ratings:", err);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
});

app.put("/update-rating", async (req, res) => {
    const MovieId = req.body.movieId;
    const RatingCount = req.body.ratingValue;
    const FansCount = req.body.newFansCount;

    console.log("Movie Id:", MovieId);
    console.log("Rating Count:", RatingCount);
    console.log("Fans Count:", FansCount);

    if (MovieId === null || RatingCount === null || FansCount === null) {
        return res.status(400).json({ error: "Missing movieId in the request body" });
    }

    try {
        const connection = await pool.getConnection();
        try {
            const [results] = await connection.query("SELECT * FROM movies_rating WHERE movie_id = ?", [MovieId]);
            if (results.length > 0) {
                await connection.query("UPDATE movies_rating SET rating_count = ?, fans_count = ? WHERE movie_id = ?", [RatingCount, FansCount, MovieId]);
                console.log("Rating updated successfully for movie ID:", MovieId);
                return res.status(201).json({ message: "Rating updated successfully!" });
            } else {
                console.error("Movie ID not found:", MovieId);
                return res.status(400).json({ error: "Id Not Found!" });
            }
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("Error during database operation:", err);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
});

app.listen(port, () => {
    console.log("Server running on port", port);
});
