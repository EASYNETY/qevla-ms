const router = require('express').Router();
const { addService, getServices } = require('../Controllers/serviceController');
const { addServiceStation, getServiceStation } = require("../Controllers/serviceStationController");

router.route('/addservice')
    .post(addService);
router.route("/getservices").get(getServices);

router.route("/addservice-station").post(addServiceStation);
router.route("/getservice-stations").get(getServiceStation);

module.exports = router;