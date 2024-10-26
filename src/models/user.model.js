const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 50,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 99,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      validate: {
        validator: function (value) {
          return ["M", "F", "O"].includes(value);
        },
        message: (props) => `${props.value} is not a valid gender!`,
      },
    },
    photoUrl: {
      type: String,
      default: "https://i.imgur.com/6W2Pv7I.png",
    },
    about: {
      type: String,
      default: "Hello there!",
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
