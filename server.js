/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
//db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var movie = require('./movies');
var review = require('./reviews');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successfully created new user.'})
    }
});

router.post('/signin', function (req, res) {
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json ({success: true, token: 'JWT ' + token});
        }
        else {
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

router.route('/movies/movieID')
    .delete( authController.isAuthenticated, function(req, res) {
        movie.deletedMovies({title: req.params.movieID}, function (err, movie) {
            if (err) throw err;
            if (!movie) {
                res.json({success: false, msg: "not movie"});
            } else {
                return res.status(200).json({success: true, msg: "Movie deleted"});
            }
        });
    })
    .put(authJwtController.isAuthenticated, function(req, res) {
        const {title, year, genre, actors } = req.body;
        movie.findMovies(
            req.params.movieID,
            {
                $set: {title: title, year: year, genre: genre, actors: actors },
            },

            { new:true }
        )
            .exec((error, result) => {
            if (error) {
                return res.status(500).json(error);
            }
            return res.status(200).json({ success:true, msg: "Movie updated",result});
        });
    })

    .get(function(req, res) {
        if(req.query.review === "true") {
            movie.find({}, function (err, movies) {
                if (err) throw err
                res.json(movies);
            });}
        else{
            movie.aggregate(req.params.movieID[
                    {
                        $lookup: {
                            from: "reviews",
                            localField: "title",
                            as: "review",
                        },
                    }
                ],
                (error, result) => {
                    if (error) {
                        return res.status(500).json(error);
                    }
                    return res
                        .status(200)
                        .json({ success: true, msg: "success movie found", result });
                })
        }
    })

    .post(function(req, res) {
        if (!req.body.title || !req.body.year || !req.body.genre || !req.body.actors){
            return res.json({success: false, message: "complete all"});
        }
        else{
            var movie = new movie();
            movie.title = req.body.title;
            movie.year = req.body.year;
            movie.genre = req.body.genre;
            movie.actors = req.body.actors;
            if (error) {
                return res.status(500).json(error);
            }
            else
                return res.status(200).send({success: true, message: 'succesful movie created.'});

        };

    })
    .all(function (req, res) {
            console.log(req.body);
            res = res.status(403);
            res.send("Request type not supported");
        }
    );

router.route('/reviews')
    .post(authJwtController.isAuthenticated, async (req, res) => {
        const linkToMovie = await movie.link({ title: movielink });//hvuing trouble here
        if (!movielink || !req.body.title || !req.body.reviewer || !req.body.quote || !req.body.rating){
            return res.json({success:false, message: "complete all"});
        }
        else{

            review.title = req.body.title;
            review.reviewer = req.body.reviewer;
            review.quote = req.body.quote;
            review.rating = req.body.rating;
            if (error) {
                return res.status(500).json(error);
            }
            else
                return res.status(200).send({success: true, message: 'review added'});

        };

    });



app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only



