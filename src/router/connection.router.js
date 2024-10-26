const router = require("express").Router();
const { tokenValidation } = require("../middleware/auth.middleware");
const { swipe, review } = require("../controller/connection.controller");

// Importing controllers

router.route("/send/:status/:toUserId").post(tokenValidation, swipe);
router
  .route("/review/:status/:requestId")
  .post(tokenValidation, review);

module.exports = router;
