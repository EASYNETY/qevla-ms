const _ = require("lodash");
const ServiceStation = require("../Model/serviceStationModel");

module.exports.addServicess = async (req, res) => {
  const service = await ServiceStation.findOne({
    service_name: req.body.service_name,
  });
  if (service)
    return res.status(400).json({
      ResponseCode: 200,
      ResponseMessage: "You have added the Service before!",
    });
  return res.status(200).json({
    ResponseCode: 200,
  });
};
module.exports.addServiceStation = async (req, res) => {
  try {
    const service = await ServiceStation.create(req.body);
    return res.status(200).send({
      message: "Service Station Registration Successfull!",
      data: service,
    });

    // let serviceRendered = new userinfo({
    //   userid: "1001",
    //   username: req.body.username,
    //   gender: req.body.gender,
    //   class: req.body.class,
    //   status: req.body.status,
    // });
    // await newuserinfo.save();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports.getServiceStation = function (req, res) {
  ServiceStation.find({}, function (err, service_station) {
    if (err) {
      res.send("Something went wrong!!!");
      next();
    }
    res.json(service_station);
  });
};

// app.get("/:id", async

module.exports.getServiceStationById = function (req, res, next) {
  const stationId = req.params.id;

  try {
    const { data } = ServiceStation.findById(stationId);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
