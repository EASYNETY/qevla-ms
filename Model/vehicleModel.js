const { Schema, model } = require('mongoose');
const jwt = require('jsonwebtoken');

const vehicleSchema = Schema(
  {
    userId: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    v_manufacturer: {
      type: String,
      trim: true,
      required: true,
    },
    vehicle_type: {
      type: String,
      trim: true,
      required: true,
    },
    max_weight: {
      type: String,
      required: true,
    },
    v_license: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);



// module.exports.User = model('user', vehicleSchema);
module.exports = model("vehicleModel", vehicleSchema);
