const {
  signUp,
  getFeed,
  getProfile,
  deleteUser,
  updateUser,
  login,
  logout,
  resetPassword,
  requests,
  myConnections,
} = require("../controller/user.controller");
const { tokenValidation } = require("../middleware/auth.middleware");

const router = require("express").Router();

router.route("/profile").get(tokenValidation, getProfile);
router.route("/deleteUser").delete(tokenValidation, deleteUser);
router.route("/updateUser").patch(tokenValidation, updateUser);
router.route("/getFeed").get(tokenValidation, getFeed);
router.route("/signUp").post(signUp);
router.route("/login").post(login);
router.route("/logout").post(tokenValidation, logout);
router.route("/resetPassword").patch(tokenValidation, resetPassword);

router.route("/requests/received").get(tokenValidation, requests);
router.route("/myConnections").get(tokenValidation, myConnections);

module.exports = router;

//API endpoints:
/* 
-POST /SIGNUP
- POST /LOGIN
- POST LOGOUT

- GET /GET_PROFILE_VIEW
- PATCH /UPDATE_USER
- PATCH /UPDATE_PASSWORD


- POST /CONNECTION_REQUEST/IGNORED/:USER_ID
- POST /CONNECTION_REQUEST/INTERESTED/:USER_ID

-POST /CONNECTION_STATUS/ACCEPTED/:REQUEST_ID
- POST /CONNECTION_STATUS/REJECTED/:REQUEST_ID
- GET /GET_FEED



- GET /GET_ALL_CONNECTIONS/:USER_ID

*/
