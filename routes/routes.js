const express = require("express");
const {
  signupEmpMan,
  register_User,
  fetchUserDetailUserId,
  login,
} = require("../controllers/LoginSignupController");
const { addPlant, plantList } = require("../controllers/PlantController");
const {
  addDriver,
  fetchDriverList,
} = require("../controllers/DriverController");
const { addShift, shiftList } = require("../controllers/ShiftController");
const {
  requestTrip,
  allUsers,
  recentTripUserId,
  tripDetail,
  feedback,
  fetchTripsWithStatus,
  updateStatus,
} = require("../controllers/TripController");
const authenticateToken = require("../utils/jwtAuthVerify");
const router = express.Router();

// router.route("/allUsers").get(authenticateToken, allUsers);

router.route("/login").post(login);
router.route("/signupEmp").post(signupEmpMan);
router.route("/registrationEmp").post(register_User);
router.route("/addPlant").post(addPlant);
router.route("/plantList").get(plantList);
router.route("/addShift").post(addShift);
router.route("/shiftList").get(shiftList);
router.route("/addDriver").post(addDriver);
router.route("/allUsers").get(allUsers);
router.route("/requestTrip").post(requestTrip);
router.route("/recentTripUserId").get(recentTripUserId);
router.route("/tripDetail/:trip_id").get(tripDetail);
router.route("/feedback/:trip_id").post(feedback);
router.route("/userDetail/:user_id").get(fetchUserDetailUserId);
router.route("/fetchTripsWithStatus").get(fetchTripsWithStatus);
router.route("/fetchDriverList").get(fetchDriverList);
router.route("/updateStatus/:tripId").post(updateStatus);

module.exports = router;
