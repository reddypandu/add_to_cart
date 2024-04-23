const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");
const crypto = require("crypto");

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

// Function to generate a random token
function generateResetToken() {
  return crypto.randomBytes(20).toString("hex");
}

// Define a route for forgot password
app.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});

app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    email: req.body.email,
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

// Define a route for handling forgot password form submission
app.post("/forgot-password", async (req, res) => {
  try {
    const user = await collection.findOne({ name: req.body.username });
    if (!user) {
      return res.send("User not found");
    }

    // Generate and store a reset token
    const resetToken = generateResetToken();
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send the reset link to the user's email (implementation not included here)

    res.send("Reset link sent to your email");
  } catch (error) {
    console.error("Error processing forgot password request", error);
    res.status(500).send("Internal Server Error");
  }
});

// Define a route for handling password reset
app.get("/reset-password/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const user = await collection.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.send("Invalid or expired reset token");
    }

    res.render("reset-password", { token });
  } catch (error) {
    console.error("Error processing password reset request", error);
    res.status(500).send("Internal Server Error");
  }
});

// Define a route for handling password reset form submission
app.post("/reset-password/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const user = await collection.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.send("Invalid or expired reset token");
    }

    // Update the user's password
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
    user.password = hashPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.send("Password reset successfully");
  } catch (error) {
    console.error("Error processing password reset request", error);
    res.status(500).send("Internal Server Error");
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
