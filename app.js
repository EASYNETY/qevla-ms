const express = require("express");
const app = express();
const userRouter = require("./Routers/userRouter");
const serviceRouter = require("./Routers/serviceRouter");
// const serviceStationRouter = require("./Routers/serviceStationRouter");
const passwordReset = require("./Routers/passwordAuth");
const authRouter = require("./Routers/index.route");
app.use(express.json());
const {
  verifyToken,
  verifyTokenAndAuthorization,
} = require("./Controllers/verifyToken");
const User = require("./Model/userModel");

app.use("/api/user", userRouter);
app.use("/api/service", serviceRouter);
app.use("/api/service-station", serviceRouter);
// app.use("/api/auth/password-reset", authRouter);
app.use("/api/auth", authRouter);
app.get("/", async (req, res) => {
  res.status(200).send(`<h1>Welcome to Qevla</h1>
  <h3>This project contains the API endpoints for <ul><li>User Onboarding</li><li>Authorization and authentication</li>
  <li>Service Station Map registration /Pinning</li></ul> 
  Enjoy your seemless experience🙌 </h3>`);
});

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
module.exports = app;
