const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { tokenGeneration } = require("../utils/tokenGeneration");

const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, gender, skills } = req.body;

    // Validate input data
    if (!firstName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    //Hashing Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gender,
      skills,
    });
    const result = await user.save();
    res.status(201).json({ message: "User created successfully", result });
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const feed = await User.findById(userId);
    if (feed.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ feed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getFeed = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const feed = await User.find({});
    if (feed.length === 0) {
      return res.status(404).json({ error: "Users not found" });
    }
    res.status(200).json({ feed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !password) {
      return res.status(401).json({ error: "Invalid Login credentials" });
    }
    //Compare Password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid Login credentials" });
    }
    const token = tokenGeneration(user);
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid old password" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signUp,
  getFeed,
  getProfile,
  deleteUser,
  updateUser,
  login,
  resetPassword,
  logout,
};
