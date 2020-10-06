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

const Employee = new mongoose.model("Employee", employeeSchema);

app.route("/")
.get((req, res) => {
  res.render("home");
});

app.route("/login")
.get((req, res) => {
  res.render("login");
})
.post((req, res)=>{
 // TODO: allow admin access after credential verification
 if(req.body.username === 'admin@admin.com' && req.body.password === 'admin123'){
   res.redirect("/table")
 }
});

app.get("/table", (req, res) =>{
  Employee.find({}, (err, foundEmployee)=>{
    if (err){
      console.log(err);
    } else {
      res.render("table", {
        foundEmployees: foundEmployee
      });
    };
  });
  // res.render("table", {
  //   empID: "ABC123446",
  //   empName: "Deepro Sengupta",
  //   empAge: 25,
  //   empGender: "Male",
  //   empPost: "Web-Developer",
  //   empSalary: 50000,
  //   empRelDept: "IT Data",
  //   empInfo: "None"
  // });
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
    info: req.body.moreInfo
  });

app.get("/secrets", (req, res) => {
  // USE THIS ROUTE TO DISPLAY EMPLOYEE TABLE TO ADMIN
  //1. Authenticate admin

  //2. Render table ejs template after authentication
});

  newEmp.save(err=>{
    if(err){
      console.log(err);
    } else {
      console.log("Successfully added new employee"); // TODO: provide option to add more employees
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
