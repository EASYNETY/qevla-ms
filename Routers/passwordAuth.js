var User = require("../Model/userModel");
const Token = require("../Model/Token.model");
const sendEmail = require("../utils/email/sendEmail");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();



router.post("/", async (req, res) => {
  try {
   
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).send("user with given email doesn't exist");

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`;
    console.log(link);
    await sendEmail(user.email, "Password reset", link);

    res.send("password reset link sent to your email account").json({ResponseMessage : link});
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
});

router.post("/:userId/:token", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).send("invalid link or expired");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link or expired");

    user.password = req.body.password;
    await user.save();
    await token.delete();

    res.send("password reset sucessfully.");
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
});


router.post("/:userId/:token", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).send("invalid link or expired");

    const passwordResetToken = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!passwordResetToken)
      return res.status(400).send("Invalid link or expired");

    user.password = req.body.password;
    await user.save();
    await passwordResetToken.delete();

    res.send("password reset sucessfully.");
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
});


const resetPassword = async (userId, token, password) => {
  let passwordResetToken = await Token.findOne({ userId });

  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }

  const isValid = await bcrypt.compare(token, passwordResetToken.token);

  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }

  const hash = await bcrypt.hash(password, Number(bcryptSalt));

  await User.updateOne(
    { _id: userId },
    { $set: { password: hash } },
    { new: true }
  );

  const user = await User.findById({ _id: userId });

  sendEmail(
    user.email,
    "Password Reset Successfully",
    {
      name: user.name,
    },
    "./template/resetPassword.handlebars"
  );

  await passwordResetToken.deleteOne();

  return true;
};


resetPasswordController = async (req, res, next) => {
  console.log("Reset password");
  const resetPasswordService = await resetPassword(
    req.body.userId,
    req.body.token,
    req.body.password
  );
  return res.status(201).json(resetPasswordService);
};

module.exports = router;
