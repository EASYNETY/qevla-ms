var User = require("../Model/userModel");
const Token = require("../Model/Token.model");
const sendEmail = require("../utils/email/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const bcryptSalt = process.env.BCRYPT_SALT;
const clientURL = process.env.CLIENT_URL;

module.exports.requestPasswordReset = async (email) => {
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
    console.log(err.message);
    return { error: err.message };
  }
};

module.exports.resetPassword = async (userId, token, password) => {
  try {
    let passwordResetToken = await Token.findOne(userId);

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
  } catch (error) {
    console.log(error);
  }
};

// module.exports = {
//   // signup,
//   // getUsers,
//   requestPasswordReset,
//   resetPassword,
// };
