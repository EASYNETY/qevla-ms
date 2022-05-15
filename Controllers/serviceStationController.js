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
    res
      .status(200)
      .json({
        responseCode: "00",
        count: service_station.length,
        service_station,
      });
  });
};

module.exports.getServiceStationById = async (req, res, next) => {
  try {
    const data = await ServiceStation.findById(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteServiceStation = async (req, res, next) => {
  const { id } = req.body;
  await ServiceStation.findById(id)
    .then((service_station) => service_station.remove())
    .then((service_station) =>
      res
        .status(201)
        .json({ message: "User successfully deleted", service_station })
    )
    .catch((error) =>
      res
        .status(400)
        .json({ message: "An error occurred", error: error.message })
    );
};


module.exports.updateServiceStationById = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };

    const result = await ServiceStation.findByIdAndUpdate(id, updatedData, options);

    res
      .status(201)
      .json({ message: "Service Station successfully updated!", updatedData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};