const router = require('express').Router();
const { addService, getServices } = require('../Controllers/serviceController');
const {
  addServiceStation,
  getServiceStation,
  getServiceStationById,
  deleteServiceStation,
  updateServiceStationById
} = require("../Controllers/serviceStationController");

router.route('/addservice')
    .post(addService);
router.route("/getservices").get(getServices);

router.route("/addservice-station").post(addServiceStation);
router.route("/getservice-stations").get(getServiceStation);
router.route("/:id").get(getServiceStationById);
router.route("/delete").delete(deleteServiceStation);
router.route("/update/:id").patch(updateServiceStationById);

module.exports = router;