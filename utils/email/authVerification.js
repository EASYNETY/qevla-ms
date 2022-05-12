const nodemailer = require("nodemailer");

// const sendOTP = (email, otp) => {
//   try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "testedeye@gmail.com",
        pass: "Hislove@22", //Password
      },
    });
 function sendMail(email, otp) {
      const details = {
        from: "testedeye@gmail.com",
        to: email,
        subject: "Qevla OTP is ",
        html: otp,
      };

      transporter.sendMail(details, function (error, data) {
        if (error) console.log(error);
        else console.log(data);
      });
    }

module.exports = sendMail;