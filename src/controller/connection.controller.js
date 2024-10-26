const Connection = require("../models/connection.model");
const User = require("../models/user.model");

const swipe = async (req, res) => {
  try {
    const toUserId = req.params.toUserId;
    const status = req.params.status;
    const userId = req.body.userId;
    const fromUserId = userId;

    const allowedStatuses = ["interested", "ignored"];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status. Must be 'interested' or 'ignored'" });
    }

    //Both fromUserId and toUserId cannot be the same
    if (toUserId == fromUserId) {
      return res.status(400).json({ error: "Cannot choose yourself" });
    }

    // Check if both users exist
    const user1 = await User.findById(fromUserId);
    const user2 = await User.findById(toUserId);
    if (!user1 || !user2) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has already sent a request to this user
    const existingConnection = await Connection.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingConnection) {
      return res
        .status(400)
        .json({ error: "You have already made a choice for this user" });
    }

    // Check if toUserId sent a request to this user

    const connectionInstance = new Connection({ fromUserId, toUserId, status });
    const newConnection = await connectionInstance.save();
    res.status(201).json({
      message: `${user1.firstName} is ${status} in ${user2.firstName}`,
      data: newConnection,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Review a connection

const review = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const status = req.params.status;
    const userId = req.body.userId;
    const fromUserId = userId;

    const allowedStatuses = ["accepted", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status. Must be 'accepted' or 'rejected'" });
    }

    const connection = await Connection.findById(requestId);
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    if (connection.toUserId != fromUserId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to review this connection" });
    }

    if (connection.status != "interested") {
      return res.status(400).json({
        error: "You can only review connections in 'interested' status",
      });
    }

    connection.status = status;
    const updatedConnection = await connection.save();
    res.status(200).json({
      message: `Connection ${status}`,
      data: updatedConnection,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { swipe, review };
