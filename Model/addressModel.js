const { Schema, model } = require('mongoose');
const jwt = require('jsonwebtoken');

const addressSchema = Schema(
  {
    userId: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    long: {
      type: String,
      trim: true,
      required: true,
    },
    lat: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);



// module.exports.User = model('user', vehicleSchema);
module.exports = model("addressModel", addressSchema);
