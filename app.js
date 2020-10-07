//jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "HRDB secret for safety 32136.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/hrDB",
{
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useFindAndModify', false);
mongoose.set("useCreateIndex", true);

const employeeSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  empID: String,
  currPost: String,
  salary: Number,
  relatedDept: String,
  info: String,
  status: String
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

adminSchema.plugin(passportLocalMongoose);

const Employee = new mongoose.model("Employee", employeeSchema);
const Admin = new mongoose.model("Admin", adminSchema);

passport.use(Admin.createStrategy());

passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());


app.route("/")
  .get((req, res) => {
    res.render("home");
  });

app.route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const adminUser = new Admin({
      username: req.body.username,
      password: req.body.password
    });


    req.login(adminUser, err => {
      if(err){
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/table");
        });
      };
    });
    // Admin.findOne({adminID: req.body.username}, (err, foundAdmin) => {
    //   if(err){
    //     console.log(err);
    //   } else {
    //     if(foundAdmin.adminPassword === req.body.password){
    //       Employee.find({}, (err, foundEmployee) => {
    //         if(err){
    //           res.redirect("/login");
    //         } else {
    //           res.render("table", {
    //             foundEmployees: foundEmployee
    //           });
    //         };
    //       });
    //     };
    //   };
    // });
  });


app.route("/superUser")
  .get((req, res) =>{
    res.render("registerAdmin");
  })

  .post((req, res) => {
    if(req.body.superPassword === "superAdmin25"){
      Admin.register({username: req.body.username}, req.body.password, (err, adminuser) =>{
        if(err){
          console.log(err);
          res.redirect("/superUser");
        } else {
            passport.authenticate("local")(req, res, () =>{
              res.redirect("/table");
            });
        };
      });
    };

    // if(req.body.superPassword === "superAdmin25"){
    //   const newAdmin = new Admin({
    //     adminID: req.body.username,
    //     adminPassword: req.body.password
    //   });
    //   newAdmin.save(err => {
    //     if(err){
    //       console.log(err);
    //     } else {
    //       console.log("Successfully Added New Admin");
    //     }
    //   });
    // } else {
    //   console.log("Invalid Super User Password");
    // };
    // res.redirect("/");
  });

app.route("/register")
  .get((req, res) => {
    if (req.isAuthenticated()){
      res.render("register");
    } else {
      res.redirect("/login");
    };
  })
  .post((req, res) =>{
    const newEmp = new Employee({
      name: req.body.empName,
      age: req.body.EmpAge,
      gender: req.body.genSel,
      empID: req.body.empID,
      currPost: req.body.currPost,
      salary: req.body.salary,
      relatedDept: req.body.relatedDept,
      info: req.body.moreInfo,
      status: "Active"
    });

  newEmp.save(err=>{
    if(err){
      console.log(err);
    } else {
      console.log("Successfully added new employee");
      res.redirect("/table");
    };
  });
});

app.route("/edit/:id")
  .get((req, res)=>{
    Employee.findById(req.params.id, (err, employeeRecord) =>{
      res.render("edit", {
        employee: employeeRecord
      });
    })
  })
  .post((req, res) =>{
    Employee.findByIdAndUpdate(req.params.id,{
      name: req.body.empName,
      age: req.body.EmpAge,
      gender: req.body.genSel,
      empID: req.body.empID,
      currPost: req.body.currPost,
      salary: req.body.salary,
      relatedDept: req.body.relatedDept,
      info: req.body.moreInfo,
      status: req.body.status
    }, err =>{
      if(!err){
        console.log("Successfully Update");
        res.redirect("/table")
      }
    })
  });

app.route("/edit/delete/:id")
  .post((req, res) => {
    Employee.findOneAndDelete({_id: req.params.id}, err => {
      if(err){
        console.log(err);
      } else {
        console.log("Employee Deleted");
        res.redirect("/table");
      }
    });
  });

  app.get("/table", (req, res)=>{
    if (req.isAuthenticated()){
      Employee.find({}, (err, foundEmployee) => {
        if(err){
          res.redirect("/login");
        } else {
          res.render("table", {
            foundEmployees: foundEmployee
          });
        };
      });
    } else {
      res.redirect("/login");
    };
  });

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(3000, ()=>{
  console.log("Server started on Port 3000");
});
