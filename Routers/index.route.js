const {
  resetPasswordController,
  resetPasswordRequestController,
} = require("../Controllers/auth.controller");
const {
  updateUserPasswordById,
  forgotPassword,
  passReset,
} = require("../Controllers/userController");

const router = require("express").Router();

router.post("/requestResetPassword", resetPasswordRequestController);
// router.put("/requestResetPassword", forgotPassword);
// router.post("/password-reset", passReset); 
router.post("/password-reset", resetPasswordController); 
router.patch("/password-resetp", updateUserPasswordById); 

module.exports = router;
