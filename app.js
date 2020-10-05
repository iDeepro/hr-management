//jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//const session = require('express-session');
//const passport = require('passport');
//const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// app.use(session({
//   secret: "our little secret.",
//   resave: false,
//   saveUninitialized: false
// }));
//
// app.use(passport.initialize());
// app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/hrDB",
{
  useNewUrlParser: true,
  useUnifiedTopology: true
});
//mongoose.set("useCreateIndex", true);

const employeeSchema = new mongoose.Schema ({
  name: String,
  age: Number,
  gender: String,
  empID: String,
  currPost: String,
  salary: Number,
  relatedDept: String,
  info: String
});

//userScheme.plugin(passportLocalMongoose);

const Employee = new mongoose.model("Employee", employeeSchema);

// passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res) => {
  if(req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", (req, res) =>{
  const newEmp = new Employee({
    name: req.body.empName,
    age: req.body.EmpAge,
    gender: req.body.genSel,
    empID: req.body.empID,
    currPost: req.body.currPost,
    salary: req.body.salary,
    relatedDept: req.body.relatedDept,
    info: req.body.moreInfo
  });

  newEmp.save(err=>{
    if(err){
      console.log(err);
    } else {
      console.log("Successfully added new employee"); // TODO: provide option to add more employees
    }
  });
});

app.post("/login", (req, res)=>{
 // TODO: allow admin access after credential verification
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});



app.listen(3000, ()=>{
  console.log("Server started on Port 3000");
});
