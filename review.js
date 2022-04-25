var mongoose = require('mongoose');
var reviewSchema = new mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
const {Schema} = require("mongoose");
mongoose.Promise = global.Promise;
//from users.js
try {//creat env variable and use new parser
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);

//shcema
var reviewSchema = new Schema(
    {
        review:{type: String, required: true},
        name: {type: String, required: true},
        quote: {type: String},
        rating: {type: String, required: true},
    });


module.exports = mongoose.model("reviews", reviewSchema);//return