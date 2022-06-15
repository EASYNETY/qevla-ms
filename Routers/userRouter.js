const router = require("express").Router();
const {
  signUp,
  personalInfo,
  login,
  getUsers,
  createAdmin,
  getUserById,
  deleteUser,
  updateUserById,
  vehicleDetails,
  documents,
  paymentDetails,
  getVehicleByUserId,
  getDocumentByUserId,
  getPaymentDetailsByUserId,
  getRegistrationStatusById,
  userReg,
} = require("../Controllers/userController");


router.route("/signup").post(userReg);
// router.route("/signup/full-reg").post(userReg);
router.route("/signup/personal-info").post(personalInfo);
router.route("/signup/vehicle-details").post(vehicleDetails);
router.route("/signup/documents").post(documents);
router.route("/signup/payment-details").post(paymentDetails);
router.route("/vehicle/:userId").get(getVehicleByUserId);
router.route("/document/:userId").get(getDocumentByUserId);
router.route("/payment-details/:userId").get(getPaymentDetailsByUserId);
router.route("/status/:userId").get(getRegistrationStatusById);
router.route("/:id").get(getUserById);
router.route("/admin/create").post(createAdmin);
router.route("/admin/update/:id").patch(updateUserById);
router.route("/update/:id").patch(updateUserById);
router.route("/admin/delete").delete(deleteUser);
// router.route("/admin/getall").get(getUsers);
router.route("/login").post(login);
router.route("/login/verify").post(personalInfo);
router.route("/get/all").get(getUsers);
router.route("/delete").delete(deleteUser);
router.route("/update/:id").patch(updateUserById);

module.exports = router;
