const bcrypt = require("bcrypt");
const _ = require("lodash");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const User = require("../Model/userModel");
const { Otp } = require("../Model/otpModel");
const sendMail = require("../utils/email/authVerification");
const userModel = require("../Model/userModel");
const serviceModel = require("../Model/serviceModel");
const {
  verifyToken,
  verifyTokenAndAuthorization,
} = require("./verifyToken");

const express = require("express");
const app = express();


module.exports.signUp = async (req, res) => {
  try {
    const user = await User.findOne({
      number: req.body.number,
    });

    if (user)
      return res.status(400).json({
        ResponseCode: 09,
        ResponseMessage:
          "You have registered before!, Please login to your account",
      });
    const OTP = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    const number = req.body.number;
    const email = req.body.email;

    const otpMessage = `Welcome to Qevla! Your verification code is ${OTP}`;

    sendMail(email, otpMessage);
    const otp = new Otp({ number: number, email: email, otp: OTP });
    const salt = await bcrypt.genSalt(10);
    otp.otp = await bcrypt.hash(otp.otp, salt);
    const result = await otp.save();

    console.log("User number:>....", number);

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Otp sent successfully!",
      OTP: OTP,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports.verifyOtp = async (req, res) => {
  const otpHolder = await Otp.find({
    number: req.body.number,
  });
  if (otpHolder.length === 0)
    return res.status(400).send("You use an Expired OTP!");
  const rightOtpFind = otpHolder[otpHolder.length - 1];
  const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);

  if (rightOtpFind.number === req.body.number && validUser) {
    const user = new User(
      _.pick(req.body, [
        "full_name",
        "number",
        "email",
        "password",
        "isAdmin",
        "referral",
      ])
    );
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.isAdmin = false;
    const token = user.generateJWT();
    const result = await user.save();
    const OTPDelete = await Otp.deleteMany({
      number: rightOtpFind.number,
    });

    return res.status(200).send({
      message: "User Registration Successfull!",
      token: token,
      data: result,
    });
  } else {
    return res.status(400).send("Your OTP was wrong!");
  }
};


module.exports.createAdmin = async (req, res) => {
    try {
      const admin = new User(
        _.pick(req.body, [
          "full_name",
          "number",
          "email",
          "password",
          "isAdmin",
          "referral",
        ])
      );
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(admin.password, salt);
      admin.isAdmin = true;
      const token = admin.generateJWT();
      const result = await admin.save();

      return res.status(200).send({
        message: "User Registration Successfull!",
        token: token,
        data: result,
      });
    } catch (error) {
      res.status(500).json(error.message)
      
    }
};


module.exports.UpdateUser = async (_Id, service_name, service_ncost) => {
  try {
    const profile = await userModel.findById(_id);

    if (profile) {
      const newService = new serviceModel({
        service_name,
        service_cost,
      });

      await newService.save();

      profile.service.push(newService);
    }

    return await profile.save();
  } catch (err) {
    throw new { error: "Error on Create Address" }();
  }
};

module.exports.login = async (req, res) => {
  try {
    const { number, password } = req.body;
    if (!(number && password)) {
      res.status(400).send("All input is required");
    }
    const user = await User.findOne({ number });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, number: user.number },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );
      console.log(token);

      // save user token
      user.token = token;

      // user
      res.status(200).json({
        ResponseCode: "00",
        ResponseMessage: `Welcome ${user.full_name}! You have logged in successfully!`,
        Token: token,
      });
    }else{
    res.status(400).json({ error: "Incorrect Password!!" });

    }
    // res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
};

module.exports.getUsers = function ( req, res) {
  try {
    User.find({}, function (err, users) {
      if (err) {
        res.send("Something went wrong!!!");
        next();
      }
      res.status(200).json({
        responseCode: "00",
        count: users.length,
        users,
      });
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

app.get("/api/users", verifyTokenAndAuthorization, function (req, res) {
  User.find({}, function (err, users) {
    if (err) {
      res.send("Something went wrong!!!");
      next();
    }
    res.json(users);
  });
});

exports.deleteUser = async (req, res, next) => {
  const { id } = req.body;
  await User.findById(id)
    .then((user) => user.remove())
    .then((user) =>
      res.status(201).json({ message: "User successfully deleted", user })
    )
    .catch((error) =>
      res
        .status(400)
        .json({ message: "An error occurred", error: error.message })
    );
};

module.exports.getUserById = async (req, res) => {
  try {
    const data = await User.findById(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.updateUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };

    const result = await User.findByIdAndUpdate(id, updatedData, options);

    res
      .status(201)
      .json({ message: "User successfully updated!", updatedData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


module.exports.updateUserPasswordByIdyu = async (req, res) => {
  try {
    const id = req.params.id;
    var updatedPassword = req.body.password;
    const options = { new: true };

    const salt = await bcrypt.genSalt(10);
    updatedPassword = await bcrypt.hash(updatedPassword, salt);

    const result = await User.findByIdAndUpdate(id, updatedPassword, options);

    res
      .status(201)
      .json({ message: "User successfully updated!", updatedPassword });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};





module.exports.updateUserPasswordById = async (userId, token, password) => {
  try {
    let passwordResetToken = await Token.findOne(ObjectID(userId));
    console.log(passwordResetToken.token);

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



module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  User.findOne({ email }),
    (err, user) => {
      if (err) {
      console.lor(err);
        return res
          .status(400)
          .json({ error: "User with this email does not exist" });
      }
       const token = jwt.sign(
         { user_id: user._id, number: user.number },
         process.env.JWT_SECRET_KEY,
         {
           expiresIn: "20m",
         }
       );

         sendEmail(
           user.email,
           "Password Reset Request",
           {
             name: user.name,
             link: link,
           },
           "./template/requestResetPassword.handlebars"
         );

    return user.updateOne({ resetLink: token }, function (err, success) {
      console.lor(err);
    if (err) {
      return res.status(400).json({ error: "password reset link error!!" });
    } else {
      res.json({ message: "Password reset link sent successfully" });
    }
  });
    };
};


module.exports.passReset = async (req, res) => {
  const { resetLink, newPass } = req.body;
  if (resetLink) {
    twt.verify(
      resetLink,
      process.env.RESET_PASSWORD_KEY,
      function (error, decodedData) {
        if (error) {
          return res.status(400).json({
            error: "Incorrect or expired token!!",
          });
        }
        User.findOne(resetLink, (err, user) => {
          if (err || user) {
            return res.status(400).json({
              error: "User with this token does not exist",
            });
          }
          const obj = {
            password: newPass,
            resetLink: "",
          };
          user = _.extend(user, obj);
          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: "Reset Password Error!!",
              });
            } else {
              res.status(200).json({
                message: "Password changed successfully!!",
              });
            }
          });
        });
      }
    );
  }
};
