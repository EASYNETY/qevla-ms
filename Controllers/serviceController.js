const bcrypt = require("bcrypt");
const _ = require("lodash");
const axios = require("axios");
const otpGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");
const  Service  = require('../Model/serviceModel');
const { Otp } = require('../Model/otpModel');
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();
const app = require("express");



module.exports.addServicess = async (req, res) => {
  const service = await Service.findOne({
    service_name: req.body.service_name,
  });
  if (service)
    return res.status(400).json({
      ResponseCode: 200,
      ResponseMessage:
        "You have added the Service before!",
      // username: full_name,
    });
  return res.status(200).json({
    ResponseCode: 200,
  });
};
module.exports.addService = async (req, res) => {
        try {
          const service = new Service(
            _.pick(req.body, ["service_id", "service_name", "service_cost"])
          );
          const result = await service.save();
          return res.status(200).send({
            message: "Service Registration Successfull!",
            data: result,
          });
        } catch (error) {
          if(error === 11000){
            res.status(400).json({error: "service already exist"})

          }
          res.status(500).json({error: "Server error"});
          
        }
}

module.exports.getServices = function (req, res)  {
   Service.find({}, function (err, services) {
    if (err) {
      res.send("Something went wrong!!!");
      next();
    }
    res.json(services);
  });
};


// app.get("/api/users", verifyTokenAndAuthorization, function (req, res) {
//   User.find({}, function (err, users) {
//     if (err) {
//       res.send("Something went wrong!!!");
//       next();
//     }
//     res.json(users);
//   });
// });