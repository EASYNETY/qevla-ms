const {
  resetPassword,
  requestPasswordReset,
  passReset,
} = require("../services/auth.service");
const User = require("../Model/userModel");



const resetPasswordRequestController = async (req, res, next) => {
  const requestPasswordResetService = await requestPasswordReset(
    req.body.email
  );
  return res.json(requestPasswordResetService);
};


const resetPasswordController = async (req, res, next) => {
  console.log("Reset password");
  const resetPasswordService = await resetPassword(
    req.body.userId,
    req.body.token,
    req.body.password
  );
  return res.status(201).json(resetPasswordService);
};



module.exports = {
  resetPasswordRequestController,
  resetPasswordController,
};
