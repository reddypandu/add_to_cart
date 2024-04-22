const mongoose = require("mongoose");

const connect = mongoose.connect("");

//check database connection

connect
  .then(() => {
    console.log("Data base connected succefully");
  })
  .catch(() => {
    console.log("data base not connected");
  });

//create schemma

const LoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

//collection modal

const collection = new mongoose.model("users", LoginSchema);

module.exports = collection;
