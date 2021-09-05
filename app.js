//jshint esversion:6
//require modules
require("dotenv").config();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

//Express() as app
const app = express();

//Access public folder for styles.css
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

//Connect to mongodb
mongoose.connect("mongodb://localhost:27017/secretsDB", {useNewUrlParser: true, useUnifiedTopology: true});
//Create user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
//Create encrypt password with secret string from .env file

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});
//Create user collection
const User = mongoose.model("User", userSchema);

//Render home page
app.get("/", function(req, res){
  res.render("home");
});

//Render login page
app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne(
    {email: username},
    function(err, foundUser) {
      if (err) {
        console.log("findOne borked!");
      } else {
        if (foundUser) {
          if (foundUser.password === password) {
            console.log("Passwords match!");
            res.render("secrets");
          } else {
            console.log("Passwords don't match...");
          }
        } else {
          console.log("No user found!");
        }
      }
    }
  );
});

//Render register page
app.get("/register", function(req, res){
  res.render("register");
});

//Post created user data
app.post("/register", function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

//Listen in on port 3000 upon spinning up server
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
