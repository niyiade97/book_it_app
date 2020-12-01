//jshint esversion:6
require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require("bcrypt");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// var encrypt = require("mongoose-encryption");

app.set("view engine" , "ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
app.use(session({
    secret : "thisisthebestapplication",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/bookItUserDB" , {useNewUrlParser : true , useUnifiedTopology : true});

mongoose.set("useCreateIndex" , true);
const userSchema = new mongoose.Schema({
    firstName : String,
    lastName : String,
    email : String,
});

const loginSchema = new mongoose.Schema({
    username : String,
    passWord : String
});

userSchema.plugin(passportLocalMongoose);
loginSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User" , userSchema); 
const LoginDetails = mongoose.model("LoginDetails" , loginSchema); 

passport.use(LoginDetails.createStrategy());
passport.serializeUser(LoginDetails.serializeUser());
passport.deserializeUser(LoginDetails.deserializeUser());

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://www.example.com/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

const saltRounds = 10;

app.get("/", function(req, res){
    res.render("register", {errorMessage : ""});
})

app.get("/dashboard", function(req, res){
    if(req.isAuthenticated()){
        res.render("dashboard");
    }
    else{
        res.redirect("/login");
    }
})

app.get("/bookAppointment", function(req, res){
    if(req.isAuthenticated()){
        res.render("bookAppointment",{errorMessage : ""});
    }
    else{
        res.redirect("/login");
    }
    
})
app.get("/appointmentDetails", function(req, res){
    res.render("appointmentDetails" , {timefrom : "",timeto : ""});
})

app.get("/register", function(req, res){
    res.render("register", {errorMessage : ""});
})

app.get("/login", function(req, res){
    res.render("login",{errorMessage : ""});
})

app.post("/login", function(req,res){
    const email = req.body.email;
    const password = req.body.password;
   
    LoginDetails.findOne({email : email} , function(err , user){
        if(err){
            console.log(err)
        }
        else{
            if(!user){
                res.render("login" ,{errorMessage : "User doesn't exists!!!"})
            }
            else{
                const userDetails = new LoginDetails({
                    username : email,
                    passWord : password
                }); 
                req.login(userDetails, function(err){
                    if(err){
                      console.log(err);
                      
                    } 
                    else {
                        res.redirect("/dashboard");
                      
                    }
                  });
            }
        }
    })
   
})
app.post("/register", function(req,res){
    const fName = req.body.Fname;
    const lName = req.body.Lname;
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email : email}, function(err, foundUser){
        if(err){
            console.log(err);
            console.log("error");
        }
        else{
            if(foundUser){
                res.render("register" , {errorMessage : "Email has been used"});
            }
            else{
                    const user = new User({
                        firstName : fName,
                        lastName : lName,
                        email : email,
                    });
                    user.save(function(err){
                        if(err){
                            console.log("error")
                            console.log(err);
                        }
                        else{
                            console.log("success")
                            
                        }
                    });
                    LoginDetails.register({username : email},password, function(err , user){
                        if (err) {
                            console.log(err);
                            res.redirect("/");
                          } 
                          else {
                              res.redirect("/login");
                            
                          }
                    })
                }
                // Now we can store the password hash in db.
            
        }
    });
})
app.get("/logout" , function(req,res){
    req.logOut();
    res.redirect("/login");
})
 
app.post("/bookAppointment" , function(req , res){
const title = req.body.title;
const timeFrom = req.body.timeFrom;
const timeTo = req.body.timeTo;
function getTime(time){
    var timeSplit = time.split(':'),
    hours,
    minutes,
    meridian;
  hours = timeSplit[0];
  minutes = timeSplit[1];
  if (hours > 12) {
    meridian = 'PM';
    hours -= 12;
  } else if (hours < 12) {
    meridian = 'AM';
    if (hours == 0) {
      hours = 12;
    }
  } else {
    meridian = 'PM';
  }
  var splittedTime = hours + " : " + minutes + " : " + meridian;
  return splittedTime;
}

if(title === ""){
    res.render("bookAppointment" ,{ errorMessage : "Title field can't be empty"})
}
else{
  res.render("appointmentDetails",{month : "october" , day : 12 , title : title , timefrom :getTime(timeFrom) , timeto :getTime(timeTo)});
}
    


});
app.listen(5000 ,function(){
    console.log("Server started on port 5000");
});