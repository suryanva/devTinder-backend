const User = require("../models/user.model");
const Connection = require("../models/connection.model");
const bcrypt = require("bcrypt");
const { tokenGeneration } = require("../utils/tokenGeneration");
const { validateRequestBody } = require("../utils/profileUpdateValidation");

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "photoUrl",
  "skills",
  "age",
  "about",
  "gender",
  "email",
];

const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, gender, skills, age } =
      req.body;

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
      age,
    });
    const result = await user.save();
    res
      .status(201)
      .json({ message: "User created successfully", data: result });
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const feed = await User.findById(userId).select(USER_SAFE_DATA);
    if (feed.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ data: feed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getFeed = async (req, res) => {
  try {
    // User should be logged in to access the feed
    // User should not see his own card
    // User should not see the card of the users he has already connected with(accepted/rejected)
    // User should not see the card of the users he has already sent a connection request to(ignored/interested)

    //Pagination
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    if (limit > 5) {
      limit = 5;
    }

    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const connections = await Connection.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    });

    const hideUsersFromFeed = new Set();
    connections.forEach((connection) => {
      hideUsersFromFeed.add(connection.fromUserId.toString());
      hideUsersFromFeed.add(connection.toUserId.toString());
    });

    hideUsersFromFeed.add(userId.toString());
    const usersFeed = await User.find({
      _id: { $nin: [...hideUsersFromFeed] },
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    usersFeed.filter((user) => user._id.toString() !== userId.toString());

    res.status(200).json({ data: usersFeed });
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
    const isEditAllowed = validateRequestBody(req);
    if (!isEditAllowed) {
      throw new Error("Invalid Edit Request");
    }
    const userId = req.body.userId;
    const allowedUpdates = [
      "firstName",
      "lastName",
      "age",
      "photoUrl",
      "gender",
      "skills",
      "about",
    ];
    const updates = Object.keys(req.body).filter((key) =>
      allowedUpdates.includes(key)
    );
    const updateData = {};
    updates.forEach((key) => (updateData[key] = req.body[key]));

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select(USER_SAFE_DATA);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      message: `${user.firstName} , your profile has been updated`,
      data: user,
    });
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
      secure: true,
      sameSite: "none",
      
    });

    // Filter user data to only include fields in USER_SAFE_DATA
    const safeUserData = Object.keys(user._doc) // Accessing the raw user object
      .filter((key) => USER_SAFE_DATA.includes(key)) // Keep only keys in USER_SAFE_DATA
      .reduce((obj, key) => {
        obj[key] = user[key]; // Assign the safe fields to the new object
        return obj;
      }, {});

    res.status(200).json({ data: safeUserData });
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

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//Get All Connection Requests of a User
const requests = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const pendingRequests = await Connection.find({
      $and: [{ toUserId: userId }, { status: "interested" }],
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "photoUrl",
      "skills",
      "age",
      "about",
      "gender",
    ]);

    if (pendingRequests.length === 0) {
      return res.status(404).json({ error: "No pending requests" });
    }

    res.status(200).json({ data: pendingRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//Accepted Connections
const myConnections = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const myConnections = await Connection.find({
      $or: [
        { toUserId: userId, status: "accepted" },
        { fromUserId: userId, status: "accepted" },
      ],
    })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "photoUrl",
        "skills",
        "age",
        "about",
        "gender",
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "photoUrl",
        "skills",
        "age",
        "about",
        "gender",
      ]);

    if (myConnections.length === 0) {
      return res.status(200).json({ data: myConnections });
    }

    const data = myConnections.map((connection) => {
      if (connection.fromUserId._id.toString() === userId.toString()) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });
    res.status(200).json({ data });
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
  requests,
  myConnections,
};
