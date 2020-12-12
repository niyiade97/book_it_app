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
const path = require("path");
const multer = require("multer");
const { compileFunction } = require('vm');

// var encrypt = require("mongoose-encryption");
//set storage engine

const storage = multer.diskStorage({
  destination : "./public/uploads",
  filename : function(req , file , cb){
    cb(null , file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

//init upload
const upload = multer({
  storage : storage
}).single("myImage");

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


const appointmentDetailsSchema = new mongoose.Schema({
  username : String,
  year : String,
  month : String,
  day : String,
  date : String,
  title : String,
  timeFromHour :  String,
  timeToHour : String,
  timeFromMin :  String,
  timeToMin : String,
  timeFromMeridian : String,
  timeToMeridian : String
});

const userSchema = new mongoose.Schema({
    firstName : String,
    lastName : String,
    email : String,
    username: String,
    passWord : String,
    appointments : [appointmentDetailsSchema]
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model("User" , userSchema);

const appointmentDetails = mongoose.model("appointmentDetails" , appointmentDetailsSchema);

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
});

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
    res.render("appointmentDetails" , {userRecord : req.user});
})

// app.post("/appointmentDetails", function(req, res){
//   const appointmentId =  req.body.appointment_id;
//   appointmentDetails.findOne({_id : appointmentId} ,function(err, foundList){
//     console.log(foundList)
//       res.render("fullDetails" ,{
//         user : foundList
//         });
// })

// })


app.get("/register", function(req, res){
    res.render("register", {errorMessage : ""});
})

app.get("/login", function(req, res){
    res.render("login",{errorMessage : ""});
})

app.post("/login", function(req,res){
    const username = req.body.username;
    const password = req.body.password;
   
    User.findOne({email : username} , function(err , user){
        if(err){
            console.log(err)
        }
        else{
            if(!user){
              User.findOne({username : username} , function(err , user){
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

    User.findOne({email : email}, function(err, foundUser){
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
});

app.get("/fullDetails/:username/:detailId", function(req , res){
  const username = req.params.username;
  const appointmentId = req.params.detailId;
  User.findOne({username : username} , function(err , foundUser){
    if(err){
      console.log(err)
    }
    else{
      res.render("fullDetails" ,{
        user : foundUser.appointments,
        id : appointmentId,
        email : foundUser.email
        });
    }
  });
  });

app.post("/profile" , function(req , res){
  res.render("profile");
})
app.post("/bookAppointment" , function(req , res){
const title = req.body.title;
const timeFrom = req.body.timeFrom;
const timeTo = req.body.timeTo;
const year = req.body.year;
const day = req.body.day;
const date = req.body.date;
const month = req.body.month;
const username = req.user.username;

function getTime(time){
  var timeArray = [];
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
timeArray[0] = hours;
timeArray[1] = minutes;
timeArray[2] = meridian;
return timeArray;
}
const timeFromHour = getTime(timeFrom)[0];
const timeFromMinute = getTime(timeFrom)[1];
const timeFromMeridian = getTime(timeFrom)[2];

const timeToHour = getTime(timeTo)[0];
const timeToMinute = getTime(timeTo)[1];
const timeToMeridian = getTime(timeTo)[2];

const timefrom = getTime(timeFrom)[0] + " : " + getTime(timeFrom)[1] + " : " + getTime(timeFrom)[2];

const timeto = getTime(timeTo)[0] + " : " + getTime(timeTo)[1] + " : " + getTime(timeTo)[2];




if(title === "" ){
    res.render("bookAppointment" ,{ errorMessage : "Title field can't be empty"})
}
else if((getTime(timeTo)[0] === undefined || getTime(timeTo)[1] === undefined) || (getTime(timeFrom)[0] === undefined && getTime(timeFrom)[1] === undefined)){
  res.render("bookAppointment" ,{ errorMessage : "Time field can't be empty"})
}
else{
  
  User.findOne({username : username} , function(err , user){
    if(err){
      console.log(err)
    }
    else{
      const Details = new appointmentDetails({
        username : username,
        year : year,
        month : month,
        day : day,
        date : date,
        title : title,
        timeFromHour : timeFromHour,
        timeToHour : timeToHour,
        timeFromMin : timeFromMinute,
        timeToMin : timeToMinute,
        timeFromMeridian : timeFromMeridian,
        timeToMeridian : timeToMeridian
      });
      user.appointments.push(Details);
      user.save();
      Details.save();
      res.render("appointmentDetails",{userRecord : user});
    }
  })
      
}


});
let port = process.env.PORT;
if(port == null || port == ""){
    port = 5000;
}

app.listen(port ,function(){
    console.log("Server started on port 5000");
});