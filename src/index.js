const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();
//convert data into json
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

//static file
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});
//register user

app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password,
  };
  //check user
  const exsitingname = await collection.findOne({ name: data.name });
  if (exsitingname) {
    res.send("user already exists");
  } else {
    //hashing password
    const saltRounds = 10;
    const hashpassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashpassword;
    const userdata = await collection.insertMany(data);
    console.log(userdata);
  }
});
//login useer

app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) {
      res.send("user name cannot found");
    }
    //compare the hash password
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      check.password
    );
    if (isPasswordMatch) {
      res.render("home");
    } else {
      req.send("wrong password");
    }
  } catch {
    res.send("wrong details");
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
