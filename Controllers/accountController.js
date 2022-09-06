const Account = require("../Model/accModel");
const UserReg = require("../Model/fullReguserModel");


const express = require("express");
const catchAsyncErrors = require("./catchAsyncErrors");
const app = express();


module.exports.deposit = async (req, res) => {
  try {
    const user = await UserReg.findOne({
      number: req.body.userId,
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
    client.messages
      .create({
        body: `Your One Time Login Password For Qevla is ${OTP}`,
        from: process.env.PHONE_NUMBER,
        to: number,
      })
      .then((messages) => console.log(messages))
      .catch((err) => console.error(err));
const deposit = new Account(
  _.pick(req.body, [
    "userId",
    "balance",
    "deposit",
    "commission",
    "payment",
    "description",
  ])
);
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