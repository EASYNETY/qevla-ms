const JWT = require("jsonwebtoken");
const User = require("../Model/userModel");
const Token = require("../Model/Token.model");
const sendEmail = require("../utils/email/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { ObjectID } = require("mongodb");

const JWTSecret = process.env.JWT_SECRET_KEY;
const bcryptSalt = process.env.BCRYPT_SALT;
const clientURL = process.env.CLIENT_URL;

const requestPasswordReset = async (email) => {
try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Email does not exist");

    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

    await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const link = `${clientURL}/api/auth/password-reset?token=${resetToken}&userId=${user._id}`;

    sendEmail(
      user.email,
      "Password Reset Request",
      {
        name: user.name,
        link: link,
      },
      "./template/requestResetPassword.handlebars"
    );
    return link;
} catch (err) {
  console.log(err);
  return {error: err.message}
}
};





const resetPassword = async (userId, token, password) => {
  try {
    let passwordResetToken = await Token.findOne({userId: userId});
    if (!passwordResetToken) {
      return ("No user with the token exist");
    }

    const isValid = await bcrypt.compare(token, passwordResetToken.token);

    if (!isValid) {
      return ("Invalid or expired password reset token");
    }

    const hash = await bcrypt.hash(password, Number(bcryptSalt));

        const id = { _id: userId };
        const updatedData = { $set: { password: hash } };
        const options = { new: true };

        const result = await User.findByIdAndUpdate(id, updatedData, options);
  
console.log(hash);
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

    return ({message: "Password reset successful!", _id: userId });

  } catch (error) {
    console.log("Error>>>>>>>>>>>>>:", error);
         return ({message: "Password reset not successful!",  _id: userId });


  }
};




module.exports = {
  requestPasswordReset,
  resetPassword,
};
