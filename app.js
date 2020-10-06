//jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/hrDB",
{
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useFindAndModify', false);

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
  adminID: String,
  adminPassword: String
});

const Employee = new mongoose.model("Employee", employeeSchema);
const Admin = new mongoose.model("Admin", adminSchema);

app.route("/")
  .get((req, res) => {
    res.render("home");
  });

app.route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    Admin.findOne({adminID: req.body.username}, (err, foundAdmin) => {
      if(err){
        console.log(err);
      } else {
        if(foundAdmin.adminPassword === req.body.password){
          Employee.find({}, (err, foundEmployee) => {
            if(err){
              res.redirect("/login");
            } else {
              res.render("table", {
                foundEmployees: foundEmployee
              });
            };
          });
        };
      };
    });
  });

// app.get("/table", (req, res) =>{
//   Employee.find({}, (err, foundEmployee)=>{
//     if (err){
//       console.log(err);
//     } else {
//       res.render("table", {
//         foundEmployees: foundEmployee
//       });
//     };
//   });
// });

app.route("/superUser")
  .get((req, res) =>{
    res.render("registerAdmin");
  })

  .post((req, res) => {
    if(req.body.superPassword === "superAdmin25"){
      const newAdmin = new Admin({
        adminID: req.body.username,
        adminPassword: req.body.password
      });
      newAdmin.save(err => {
        if(err){
          console.log(err);
        } else {
          console.log("Successfully Added New Admin");
        }
      });
    } else {
      console.log("Invalid Super User Password");
    };
    res.redirect("/");
  });

app.route("/register")
  .get((req, res) => {
    res.render("register");
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
      console.log("Successfully added new employee"); // TODO: provide option to add more employees
      res.redirect("/table");
    }
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

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(3000, ()=>{
  console.log("Server started on Port 3000");
});
