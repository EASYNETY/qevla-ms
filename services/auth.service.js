const JWT = require("jsonwebtoken");
const User = require("../Model/userModel");
const UserReg = require("../Model/fullReguserModel");
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
    const user = await UserReg.findOne({ email });
    if (!user) throw new Error("Email does not exist");

    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

    await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
      password: user.password,
    }).save();

    const link = `${clientURL}/password-reset/${user._id}/${resetToken}`;

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
    // {
    //   responseCode: "00",
    //   message: "Password request sent successfully!!",
    //   token: resetToken,
    //   userId: user._id
    // };
  } catch (err) {
    console.log(err);
    return { error: err.message };
  }
};

const resetPasswordw = async (userId, token, password) => {
  try {
    let passwordResetToken = await Token.findOne({ userId: userId });
    if (!passwordResetToken) {
      return "No user with the token exist";
    }

    const isValid = await bcrypt.compare(token, passwordResetToken.token);

    if (!isValid) {
      return "Invalid or expired password reset token";
    }

    const hash = await bcrypt.hash(password, Number(bcryptSalt));

    const id = { _id: userId };
    const updatedData = { $set: { password: hash } };
    const options = { new: true };

    const result = await UserReg.findByIdAndUpdate(id, updatedData, options);

    console.log(hash);
    const user = await UserReg.findById({ _id: userId });
    sendEmail(
      user.email,
      "Password Reset Successfully",
      {
        name: user.name,
      },
      "./template/resetPassword.handlebars"
    );

    await passwordResetToken.deleteOne();

    return { message: "Password reset successful!", _id: userId };
  } catch (error) {
    console.log("Error>>>>>>>>>>>>>:", error);
    return { message: "Password reset not successful!", _id: userId };
  }
};

const resetPassword4 = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
  try {
    let passwordResetToken = await Token.findById({
      useId: req.params.userId,
    });
    if (!passwordResetToken) {
      return "No user with the token exist";
    }

    const isValid = await bcrypt.compare(req.params.token, passwordResetToken.token);

    if (!isValid) {
      return "Invalid or expired password reset token";
    }

    const hash = await bcrypt.hash(password, Number(bcryptSalt));
    if (!passwordResetToken)
      return res.status(400).send("invalid link or expired");

    const id = { _id: req.params.userId };
    const updatedData = { $set: { password: hash } };
    const options = { new: true };

    const result = await UserReg.findByIdAndUpdate(id, updatedData, options);

    console.log(hash);
    const user = await UserReg.findById({ _id: userId });
    sendEmail(
      user.email,
      "Password Reset Successfully",
      {
        name: user.name,
      },
      "./template/resetPassword.handlebars"
    );

    await passwordResetToken.deleteOne();

    return { message: "Password reset successful!", _id: userId };
  } catch (error) {
    console.log("Error>>>>>>>>>>>>>:", error);
    return { message: "Password reset not successful!", error, _id: req.params.userId };
  }
};

// const resetPassword = async (req, res) => {
// // const { id, token } = req.params;
//   const { password } = req.body;

//   const user = await User.findOne({ _id: "id" });
//   if (!user) {
//     return res.json({ status: "User Not Exists!!" });
//   }
//   const secret = JWT_SECRET + user.password;
//   try {
//     const verify = jwt.verify("token", secret);
//     const encryptedPassword = await bcrypt.hash(password, 10);
//     await User.updateOne(
//       {
//         _id: id,
//       },
//       {
//         $set: {
//           password: encryptedPassword,
//         },
//       }
//     );
//     res.render("index", { email: verify.email, status: "verified" });
//   } catch (error) {
//     console.log(error);
//     res.json({ status: "Something Went Wrong" });
//   }
// };





module.exports = {
  requestPasswordReset,
  // resetPassword,
};



// const resetPassword = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId);
//     if (!user) return res.status(400).send("invalid link or expired");

//     const token = await Token.findOne({
//       userId: user._id,
//       token: req.params.token,
//     });
//     if (!token) return res.status(400).send("Invalid link or expired");

//     user.password = req.body.password;
//     await user.save();
//     await token.delete();

//     return "password reset sucessfully.";
//   } catch (error) {
//     console.log(error);

//     return "An error occured";
//   }
// };