const {
  // signup,
  // getUsers,
  resetPassword,
  requestPasswordReset,
} = require("../services/auth.service");
// const {

//   resetPassword,
// } = require("../services/pwd.auth");

// const signUpController = async (req, res, next) => {
//   const signupService = await signup(req.body);
//   return res.json(signupService);
// };

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
  // signUpController,
  resetPasswordRequestController,
  resetPasswordController,
};
