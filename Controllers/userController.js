const bcrypt = require("bcrypt");
const _ = require("lodash");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const https = require('https');
const User = require("../Model/userModel");
const UserReg = require("../Model/fullReguserModel");
const Address = require("../Model/addressModel");
const Vehicle = require("../Model/vehicleModel");
const Document = require("../Model/documentModel");
const Payment = require("../Model/paymentModel");
const { Otp } = require("../Model/otpModel");
const sendMail = require("../utils/email/authVerification");
const userModel = require("../Model/userModel");
const serviceModel = require("../Model/serviceModel");
const { verifyToken, verifyTokenAndAuthorization } = require("./verifyToken");
const CustomerService = require("../services/customer-service");
const Transaction = require('../Model/trnxModel')

// const UserAuth = require("./middlewares/auth");

const Paystack_KEY = process.env.PAYSTACK_KEY;
// const authToken = process.env.AUTH_TOKEN;
// const client = require("twilio")(accountSid, authToken);

const express = require("express");
const catchAsyncErrors = require("./catchAsyncErrors");
const app = express();
// const service = new CustomerService();


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
    client.messages
      .create({
        body: `Your One Time Login Password For Qevla is ${OTP}`,
        from: process.env.PHONE_NUMBER,
        to: number,
      })
      .then((messages) => console.log(messages))
      .catch((err) => console.error(err));

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

module.exports.userReg = async (req, res) => {
  try {
    const user = new UserReg(
      _.pick(req.body, [
        "first_name",
        "last_name",
        "dob",
        "number",
        "email",
        "password",
        "isAdmin",
        "userAddress",
        "location",
        "vehicle_details",
        "documents",
        "payment_details",
      ])
    );
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.isAdmin = false;
    const token = user.generateJWT();
    const result = await user.save();
    console.log(user);
    try {
      if (result.vehicle_details.length < 1) {
        return res.status(205).json({
          ResponseMessage: "You have not added your vehicle details yet",
          RegStatus: 1,
          data: result,
        });
      } else if (result.documents.length < 1) {
        return res.status(205).json({
          ResponseMessage: "You have not added your documents yet",
          RegStatus: 2,
          data: result,
        });
      } else if (result.payment_details.length < 1) {
        return res.status(205).json({
          ResponseMessage: "You have not added your payment details yet",
          RegStatus: 3,
          data: result,
        });
      } else {
        return res.status(200).send({
          message: "User Registration Successfull!",
          token: token,
          data: result,
        });
      }
    } catch (error) {
      res.send(error.message);
    }

    // console.log(result.data[1]);

    // } else {
    //   return res.status(400).send("Your OTP was wrong!");
    // }
  } catch (error) {
    if (error.code == 11000) {
      console.log(error);
      res.status(503).send({
        message: "User phone number already taken!!",
      });
    } else {
      console.log("Error Encontered!!", error);
    }
  }
};

module.exports.personalInfo = async (req, res) => {
  try {
    // const otpHolder = await Otp.find({
    //   number: req.body.number,
    // });
    // if (otpHolder.length === 0)
    //   return res.status(400).send("You use an Expired OTP!");
    // const rightOtpFind = otpHolder[otpHolder.length - 1];
    // const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);

    // if (rightOtpFind.number === req.body.number && validUser) {
    const user = new User(
      _.pick(req.body, [
        "first_name",
        "last_name",
        "dob",
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
    // const OTPDelete = await Otp.deleteMany({
    //   number: rightOtpFind.number,
    // });
    // if(result.data)
    // Stages

    return res.status(200).send({
      message: "User Registration Successfull!",
      token: token,
      data: result,
    });
    // console.log(result.data[1]);

    // } else {
    //   return res.status(400).send("Your OTP was wrong!");
    // }
  } catch (error) {
    if (error.code == 11000) {
      res.status(503).send({
        message: "User phone number already taken!!",
      });
    }
  }
};

module.exports.vehicleDetails = async (req, res, next) => {
  try {
    const vehicle = new Vehicle(
      _.pick(req.body, [
        "userId",
        "v_manufacturer",
        "vehicle_type",
        "max_weight",
        "v_license",
        "address",
      ])
    );
    User.updateOne(
      { _id: req.body.userId },
      { $addToSet: { vehicle_details: [vehicle] } },
      { new: true },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          console.log(result);
        }
      }
    );

    console.log(vehicle);

    const data = await vehicle.save();
    return res.json({ data });
  } catch (error) {
    try {
      if (error.code == 11000) {
        const { userId } = req.body;

        if (!userId) {
          res.status(400).send("No user to add the payment details provided");
        }
        const user = await User.findOne({ _id: userId });
        res.status(503).send({
          message: `User ${user.first_name} ${user.last_name}'s  vehicle details already taken!!`,
        });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports.documents = async (req, res, next) => {
  try {
    const document = new Document(
      _.pick(req.body, ["userId", "nin", "bvn", "license"])
    );

    User.updateOne(
      { _id: req.body.userId },
      { $addToSet: { documents: [document] } },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          console.log(result);
        }
      }
    );
    const data = await document.save();

    return res.json(data);
  } catch (error) {
    try {
      if (error.code == 11000) {
        const { userId } = req.body;

        if (!userId) {
          res.status(400).send("No user to add the payment details provided");
        }
        const user = await User.findOne({ _id: userId });
        res.status(503).send({
          message: `User ${user.first_name} ${user.last_name}'s  documents already taken!!`,
        });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports.paymentDetails = async (req, res, next) => {
  try {
    const payment = new Payment(
      _.pick(req.body, [
        "userId",
        "bank_holder_name",
        "account_number",
        "bank_name",
      ])
    );

    User.updateOne(
      { _id: req.body.userId },
      { $addToSet: { payment_details: [payment] } },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          console.log(result);
        }
      }
    );
    const data = await payment.save();
    return res.json(data);
  } catch (error) {
    if (error.code == 11000) {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).send("No user to add the payment details provided");
      }
      const user = await User.findOne({ _id: userId });
      res.status(503).send({
        message: `User ${user.first_name} ${user.last_name}'s  payment details already taken!!`,
      });
    }
  }
};


module.exports.userAddress = async (req, res, next) => {
  try {
    const newAddress = new Address(
      _.pick(req.body, [
        "userId",
        "lng",
        "lat",
        "formattedAddress",
      ])
    );

    User.updateOne(
      { _id: req.body.userId },
      { $addToSet: { userAddress: [newAddress] } },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
      // io.emit('userLocationUpdated', result)
          console.log("Result here:", result);
        }
      }
    );
    const data = await newAddress.save();
    return res.json(data);
  } catch (error) {
    if (error.code == 11000) {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).send("No user to add the new address coord provided");
      }
      const user = await User.findOne({ _id: userId });
      res.status(503).send({
        message: `User ${user.first_name} ${user.last_name}'s  address already taken!!`,
      });
    }
  }
};


module.exports.getRegistrationStatusById = async (req, res) => {
  try {
    const { userId } = req.params;
    const userVehicle = await Vehicle.findOne({ userId: userId });
    const userDocument = await Document.findOne({ userId: userId });
    const userPaymentDetails = await Payment.findOne({ userId: userId });
    try {
      if (userVehicle.userId == userId) {
        res.json({ RegStatus: 1 });
      } else if (!userVehicle) {
        res.send("Please enter you vehicle details");
      }
    } catch (error) {}
  } catch (error) {}
};

// Get user information by user id
module.exports.getVehicleByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const userVehicle = await Vehicle.findOne({ userId: userId });
    res.status(200).json(userVehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.getDocumentByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const userDocument = await Document.findOne({ userId: userId });
    res.status(200).json(userDocument);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.getPaymentDetailsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const userPaymentDetails = await Payment.findOne({ userId: userId });
    res.status(200).json(userPaymentDetails);
  } catch (error) {
    res
      .status(500)
      .json({ message: "No payment details associated with the user" });
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
    res.status(500).json(error.message);
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
    const user = await UserReg.findOne({ number });

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
        ResponseMessage: `Welcome ${user.first_name}! You have logged in successfully!`,
        Token: token,
        user: user,
      });
    } else {
      res.status(400).json({ error: "Incorrect Password!!" });
    }
    // res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
};

module.exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    const user = await UserReg.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email: user.email },
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
        ResponseMessage: `Welcome ${user.first_name}! You have logged in successfully!`,
        Token: token,
        user: user,
      });
    } else {
      res.status(400).json({ error: "Invalid email or password provided" });
    }
    // res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
};

module.exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

module.exports.getUsers = function (req, res) {
  try {
    UserReg.find({}, function (err, users) {
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
  UserReg.find({}, function (err, users) {
    if (err) {
      res.send("Something went wrong!!!");
      next();
    }
    res.json(users);
  });
});

exports.deleteUser = async (req, res, next) => {
  const { id } = req.body;
  await UserReg.findById(id)
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
    const data = await UserReg.findById(req.params.id);
    try {
      if (data.vehicle_details.length < 1) {
        return res
          .status(205)
          .json({
            ResponseMessage: "You have not added your vehicle details yet",
            RegStatus: 1,
            data: data,
          });
      } else if (data.documents.length < 1) {
        return res.status(205).json({
          ResponseMessage: "You have not added your documents yet",
          RegStatus: 2,
          data: data,
        });
      } else if (data.payment_details.length < 1) {
        return res.status(205).json({
          ResponseMessage: "You have not added your payment details yet",
          RegStatus: 3,
          data: data,
        });
      } else {
        return res.status(200).send({
          RegStatus: "Completed",
          message: "This user is fully registered",
          data: data,
        });
      }
    } catch (error) {
      res.send(error.message);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.updateUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };
    if (req.body.password) {
      res.json({
        message: "Can not send user update  request with password parameter",
      });
    } else {
      const result = await UserReg.findByIdAndUpdate(id, updatedData, options);

      res
        .status(201)
        .json({ message: "User successfully updated!", updatedData });
    }
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

    const result = await UserReg.findByIdAndUpdate(
      id,
      updatedPassword,
      options
    );

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

    return true;
  } catch (error) {
    console.log(error);
  }
};

module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  UserReg.findOne({ email }),
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
        UserReg.findOne(resetLink, (err, user) => {
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


//Payment / Transtions

// Assuming you have an endpoint for handling Paystack callbacks
module.exports.HandlePaymentCallbackUrl = async (req, res) => {
  // Parse the callback data sent by Paystack
  console.log("This was called!!!!!!");
  const callbackData = req.body;

  // Check if the payment was successful
  if (callbackData.status === 'success') {
    // Calculate the subaccount's share (percentage)
    const subaccountShare = calculateSubaccountShare(callbackData.amount);

    // Initiate a transfer to the subaccount using the Paystack API
    initiateTransferToSubaccount(callbackData.customer_id, subaccountShare)
      .then(() => {
        // Update your database to record the successful payment
        updatePaymentStatus(callbackData);

        // Send a response to Paystack (HTTP 200 OK)
        res.status(200).send('Callback received and processed.');
      })
      .catch((error) => {
        console.error('Error processing callback:', error);
        res.status(500).send('An error occurred while processing the callback.');
      });
  } else {
    // Handle failed payments or other statuses
    // Update your database accordingly
    res.status(200).send('Callback received but payment was not successful.');
  }
};


module.exports.Transaction = async (req, res) => {
  console.log(`${process.env.CLIENT_URL_DEV}/api/user/callback/paystack-callback`);
  const { email, amount, subaccount, transaction_charge } = req.body;

  const data = JSON.stringify({
    email,
    amount,
    subaccount,
    transaction_charge,
    callback_url:`${process.env.CLIENT_URL_DEV}`
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Paystack_KEY}`, // Make sure Paystack_KEY is defined
      'Content-Type': 'application/json',
    },
  };

  const paystackRequest = https.request(options, (paystackResponse) => {
    let responseData = '';

    paystackResponse.on('data', (chunk) => {
      responseData += chunk;
    });

    paystackResponse.on('end', () => {
      // Parse the response and send it as JSON to the client
      const paystackData = JSON.parse(responseData);

      console.log(paystackData);
      // Assuming you have a function to save the transaction to the database
      // saveTransactionToDatabase(paystackData);

      res.json(paystackData);
    });
  });

  paystackRequest.on('error', (error) => {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while initializing payment.' });
  });

  paystackRequest.write(data);
  paystackRequest.end();
};

function saveTransactionToDatabase(paystackData) {
  // Extract the required fields from Paystack data
  const {
      id: paystackId,
      customer: {
          account_name: accountHolderName,
      },
      authorization: {
          account_number: accountNumber,
          bank: bankName,
      },
      amount,
  } = paystackData.data;

  // Create a new transaction document
  const newTransaction = new Transaction({
      paystack_id: paystackId,
      account_holder_name: accountHolderName,
      account_number: accountNumber,
      bank_name: bankName,
      amount: amount / 100, // Convert from kobo to naira or your preferred currency
      // Add more fields from Paystack data as needed
  });

  // Save the transaction to the database
  newTransaction.save()
      .then(() => {
          console.log('Transaction saved to the database.');
      })
      .catch((error) => {
          console.error('Error saving transaction:', error);
      });
}


module.exports.transactionList = async (req, res) => {
  console.log("This endpoint was called!!!");
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Paystack_KEY}`, // Replace 'SECRET_KEY' with your actual Paystack secret key
    },
  };

  const paystackRequest = https.request(options, (paystackResponse) => {
    let responseData = '';

    paystackResponse.on('data', (chunk) => {
      responseData += chunk;
    });

    paystackResponse.on('end', () => {
      try {
        // Parse the response and send it as JSON to the client
        const paystackData = JSON.parse(responseData);
        res.json(paystackData);
      } catch (error) {
        console.error('Error parsing Paystack API response:', error);
        res.status(500).json({ error: 'An error occurred while fetching transaction data.' });
      }
    });
  });

  paystackRequest.on('error', (error) => {
    console.error('Error making Paystack API request:', error);
    res.status(500).json({ error: 'An error occurred while fetching transaction data.' });
  });

  paystackRequest.end();
};


module.exports.CreateSubAccount = async (req, res) => {
  // Replace 'SECRET_KEY' with your actual Paystack secret key
  const paystackSecretKey = process.env.PAYSTACK_KEY;

  const requestData = JSON.stringify({
    business_name: req.body.business_name,
    settlement_bank: req.body.settlement_bank,
    account_number: req.body.account_number,
    percentage_charge: req.body.percentage_charge,
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/subaccount',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
  };

  const paystackRequest = https.request(options, (paystackResponse) => {
    let responseData = '';

    paystackResponse.on('data', (chunk) => {
      responseData += chunk;
    });

    paystackResponse.on('end', () => {
      try {
        const paystackData = JSON.parse(responseData);
        res.json(paystackData);
      } catch (error) {
        console.error('Error parsing Paystack API response:', error);
        res.status(500).json({ error: 'An error occurred while creating the subaccount.' });
      }
    });
  });

  paystackRequest.on('error', (error) => {
    console.error('Error making Paystack API request:', error);
    res.status(500).json({ error: 'An error occurred while creating the subaccount.' });
  });

  paystackRequest.write(requestData);
  paystackRequest.end();
};

module.exports.getSubAccountList = async (req, res) => {
  // Define Paystack API options
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/subaccount',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Paystack_KEY}`, // Replace with your actual secret key
    },
  };

  // Make the GET request to Paystack
  const paystackRequest = https.request(options, (paystackResponse) => {
    let responseData = '';

    paystackResponse.on('data', (chunk) => {
      responseData += chunk;
    });

    paystackResponse.on('end', () => {
      try {
        // Parse the response and send it as JSON to the client
        const paystackData = JSON.parse(responseData);
        res.json(paystackData);
      } catch (error) {
        console.error('Error parsing Paystack API response:', error);
        res.status(500).json({ error: 'An error occurred while fetching subaccount data.' });
      }
    });
  });

  paystackRequest.on('error', (error) => {
    console.error('Error making Paystack API request:', error);
    res.status(500).json({ error: 'An error occurred while fetching subaccount data.' });
  });

  paystackRequest.end();
};