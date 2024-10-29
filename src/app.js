const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");
//Importing Routers from router folder
const userRouter = require("./router/user.router");
const connectionRouter = require("./router/connection.router");

dotenv.config();
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//parse JSON request bodies.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router Configuration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/connections", connectionRouter);

// Error Handling middleware
app.use("/", (err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).send("Server Error");
});

connectDB();

app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
