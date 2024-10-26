const dotenv = require("dotenv");
const express = require("express");
const { connectDB } = require("./config/database");
//Importing Routers from router folder
const userRouter = require("./router/user.router");

dotenv.config();
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//parse JSON request bodies.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router Configuration
app.use("/api/v1/users", userRouter);

// Error Handling middleware
app.use("/", (err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).send("Server Error");
});

connectDB();

app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
