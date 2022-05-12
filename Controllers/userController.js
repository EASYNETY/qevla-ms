const bcrypt = require("bcrypt");
const _ = require("lodash");
const axios = require("axios");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const User = require("../Model/userModel");
const { Otp } = require("../Model/otpModel");
const sendMail = require("../utils/email/authVerification");
const router = require("express").Router();
const app = require("express");
const userModel = require("../Model/userModel");
const serviceModel = require("../Model/serviceModel");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const sendSms = (number, message) => {
  client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: number,
    })
    .then((message) => console.log(message.sid));
};

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

    sendSms(number, otpMessage);

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
module.exports.CreateServices = async (_Id, service_name, service_ncost) => {
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
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
};

module.exports.getUsers = async (req, res) => {
  await User.find().toArray((err, users) => {
    if (err) {
      console.error(err);
      res.status(500).json({ err: err });
      return;
    }
    res.status(200).json({ users: users });
  });
};
