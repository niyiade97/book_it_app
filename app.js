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
const findOrCreate = require("mongoose-findorcreate");
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
    username: String,
    passWord : String
});



userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model("User" , userSchema); 

passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/BOOKIT",
    userProfileURL : "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile)
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", function(req, res){
    res.render("register", {errorMessage : ""});
})

app.get("/auth/google" , function(req , res){
  console.log("done")
    passport.authenticate("google" , { scope : ["email" ,"profile"]});
})

app.get("/auth/google/BOOKIT", 
  passport.authenticate('google', { failureRedirect: '/login'  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  });
app.get("/dashboard", function(req, res){
    if(req.isAuthenticated()){
        res.render("dashboard" , { username : req.user.username});
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
   
    User.findOne({email : email} , function(err , user){
        if(err){
            console.log(err)
        }
        else{
            if(!user){
                res.render("login" , {errorMessage: "User does not exist"});
            }
            else{
                bcrypt.compare(password , user.passWord , function(err , result){
                    if(err){
                      console.log(err)
                    }
                    else{
                      if(!result){
                        res.render("login" , {errorMessage: "wrong password"})
                      }
                      else{
                        req.login(user, function(err){
                          if(err){
                            console.log(err)
                          }
                          else{
                            res.redirect("/dashboard");
                          }
                        })
                        // passport.authenticate("local")(req, res, function(){
                          
                          
                        // });
                      }
                    }
                  })
            }
        }
    })
   
   
})
app.post("/register", function(req,res){
    const fName = req.body.Fname;
    const lName = req.body.Lname;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({usenamr : username}, function(err, foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                res.render("register" , {errorMessage : "User Exists"});
            }
            else{
                bcrypt.hash(password ,10 , function(err, hash){
                    if(err){
                        console.log(err)
                    }
                    else{
                        if(hash){
                            const user = new User({
                                firstName : fName,
                                lastName : lName,
                                email : email,
                                username : username,
                                passWord : hash
                            });
                            user.save(function(err){
                                if(err){
                                    console.log(err)
                                }
                                else{
                                    res.redirect("/login");
                                }
                            })
                            
                        }
                    }
                })
            } 
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
let port = process.env.PORT;
if(port == null || port == ""){
    port = 5000;
}

app.listen(port ,function(){
    console.log("Server started on port 5000");
});