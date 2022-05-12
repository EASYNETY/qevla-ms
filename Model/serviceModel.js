const { Schema, model } = require('mongoose');
const jwt = require('jsonwebtoken');

const serviceSchema = Schema(
  {
    service_id:{
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    service_name: {
      type: String,
      trim: true,
      required: true,
    },
    service_cost: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);



// module.exports.User = model('user', serviceSchema);
module.exports = model("service", serviceSchema);
