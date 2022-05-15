const router = require("express").Router();
const {
  signUp,
  verifyOtp,
  login,
  getUsers,
  createAdmin,
  getUserById,
  deleteUser,
  updateUserById
} = require("../Controllers/userController");

router.route("/signup").post(signUp);
router.route("/signup/verify").post(verifyOtp);
router.route("/:id").get(getUserById);
router.route("/admin/create").post(createAdmin);
router.route("/admin/update/:id").patch(updateUserById);
router.route("/admin/delete").delete(deleteUser);
// router.route("/admin/getall").get(getUsers);
router.route("/login").post(login);
router.route("/login/verify").post(verifyOtp);
router.route("/get/all").get(getUsers);
router.route("/delete").delete(deleteUser);
router.route("/update/:id").patch(updateUserById);

module.exports = router;
