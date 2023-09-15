const express = require("express");
const app = express();
const userRouter = require("./Routers/userRouter");
const serviceRouter = require("./Routers/serviceRouter");
// const serviceStationRouter = require("./Routers/serviceStationRouter");
const passwordReset = require("./Routers/passwordAuth");
const authRouter = require("./Routers/index.route");
const CustomerService = require("./services/customer-service");
const UserAuth = require("./Controllers/middlewares/auth");
const cookieParser = require("cookie-parser");
const UserReg = require("./Model/fullReguserModel");
const Token = require("./Model/Token.model");
const sendEmail = require("./utils/email/sendEmail");
// const popup = require("popups");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
app.use(cookieParser());
const cors = require("cors");
app.use(express.urlencoded({ extended: false }));
app.use("/static", express.static(__dirname + "/static"));
app.set("view engine", "ejs");

const JWTSecret = process.env.JWT_SECRET_KEY;
const bcryptSalt = process.env.BCRYPT_SALT;
const clientURL = process.env.CLIENT_URL;


app.use(cors());

app.options(
  "*",
  cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }),
  cors({ origin: "https://admin.socket.io", optionsSuccessStatus: 200 })
);

app.use(cors({ origin: '*' }));
// app.use(cors({ origin: "https://admin.socket.io", optionsSuccessStatus: 200 }));
app.use(express.json());
const {
  verifyToken,
  verifyTokenAndAuthorization,
} = require("./Controllers/verifyToken");
const User = require("./Model/userModel");

const service = new CustomerService();

app.use("/api/user", userRouter);
app.use("/api/service", serviceRouter);
app.use("/api/service-station", serviceRouter);
// app.use("/api/auth/password-reset", authRouter);
app.use("/api/auth", authRouter);
app.get("/", async (req, res) => {
  res.status(200).render("pages/home");
});


// // Assuming you have an endpoint for handling Paystack callbacks
// app.post('/paystack-callback', (req, res) => {
//   // Parse the callback data sent by Paystack
//   console.log("This was called!!!!!!");
//   const callbackData = req.body;

//   // Check if the payment was successful
//   if (callbackData.status === 'success') {
//     // Calculate the subaccount's share (percentage)
//     const subaccountShare = calculateSubaccountShare(callbackData.amount);

//     // Initiate a transfer to the subaccount using the Paystack API
//     initiateTransferToSubaccount(callbackData.customer_id, subaccountShare)
//       .then(() => {
//         // Update your database to record the successful payment
//         updatePaymentStatus(callbackData);

//         // Send a response to Paystack (HTTP 200 OK)
//         res.status(200).send('Callback received and processed.');
//       })
//       .catch((error) => {
//         console.error('Error processing callback:', error);
//         res.status(500).send('An error occurred while processing the callback.');
//       });
//   } else {
//     // Handle failed payments or other statuses
//     // Update your database accordingly
//     res.status(200).send('Callback received but payment was not successful.');
//   }
// });


app.get("/api/user/get/all", verifyTokenAndAuthorization, function (req, res) {
  User.find({}, function (err, users) {
    if (err) {
      res.send("Something went wrong!!!");
      next();
    }
    res.json(users);
  });
});

app.get("/api/isadmin/:id", function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (user.isAdmin == true) {
      res.send(user);
    } else {
      return res.status(400).send({ message: "User is not Admin" });
    }
  });
});

app.get("/api/auth/forgot-password",  (req, res, next) => {
  res.render("pages/forgot-password");
});

app.post("/api/auth/forgot-password", async  (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await UserReg.findOne({ email });
    if (!user) throw new Error("User  does not exist");
console.log(user);
    secret = JWTSecret + user.password;
    const payload = {
      email: user.email,
      id: user._id,
    };
console.log("The generated secret>>>", secret);
    const token = jwt.sign(payload, secret, { expiresIn: "15m" });
    console.log("This is token", token)
    const link = `${clientURL}/api/auth/password-reset/${user._id}/${token}`;

    sendEmail(
      user.email,
      "Password Reset Request",
      {
        name: user.name,
        link: link,
      },
      "./template/requestResetPassword.handlebars"
    );
    console.log(link);
        res.render("pages/success-email", { email: user.email });
   } catch (err) {
    console.log(err);
    res.send( { error: err.message });
  }
});

app.get("/api/auth/password-reset/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;
  // res.send(req.params);
  // console.log(id);
  const user = await UserReg.findById(req.params.id);


     if (!user) {
       res.send("No user with the token exist");
       
     }
    const secret = JWTSecret + user.password;
  try {
    const payload = jwt.verify(token, secret);
    res.render("pages/reset-password", { email: user.email });
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" , error});
  }
});

app.post("/api/auth/password-reset/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;
  const user = await UserReg.findById(req.params.id);
  if (!user) {
    res.send("No user with the token exist");
  }
  const secret = JWTSecret + user.password;
  try {
    const payload = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log(encryptedPassword);
    user.password = encryptedPassword;
    user.save();
    // res.render('http://localhost:3000/auth/login');
        res.writeHead(302, {
          Location: "http://localhost:3000/auth/login",
        });
        res.end();
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
});

app.get("/auth/password-reset/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  console.log(req.params);
  const user = await UserReg.findOne({ _id: id });
  if (!user) {
   res.send.json({ status: "User Not Exists!!" });
  }
  const secret = process.env.JWT_SECRET_KEY + user.password;
  try {
    const verify = jwt.verify(token, secret);
    res.render("index", { email: verify.email, status: "Not Verified" });
  } catch (error) {
    console.log(error);
    res.send("Not Verified");
  }
});

app.post("/auth/password-reset/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({ _id: id });
  if (!user) {
     res.send.json({ status: "User Not Exists!!" });
  }
  const secret = JWTSecret + user.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );
    res.render("index", { email: verify.email, status: "verified" });
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
});
// app.post(
//   "/api/user/signup/vehicle-details",
//   verifyToken,
//   async (req, res, next) => {
//     try {
//       const { _id } = req.user;

//       const { v_manufacture, vehicle_type, max_weight, v_license, address } =
//         req.body;

//       const { data } = await service.AddNewVehicleDetails(_id, {
//         v_manufacture,
//         vehicle_type,
//         max_weight,
//         v_license,
//         address,
//       });
//       console.log(data);
//       return res.json(data);
//     } catch (err) {
//       next(err);
//     }
//   }
// );
module.exports = app;
