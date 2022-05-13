const {
  resetPasswordController,
  resetPasswordRequestController,
} = require("../Controllers/auth.controller");

const router = require("express").Router();

router.post("/requestResetPassword", resetPasswordRequestController);
router.post("/password-reset", resetPasswordController); 

module.exports = router;
