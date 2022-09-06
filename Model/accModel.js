const { Schema, model } = require('mongoose');
const jwt = require('jsonwebtoken');

const accountSchema = Schema(
  {
    userId: {
      type: String,
      trim: true,
    },
    balance: {
      type: String,
      trim: true,
    },
    deposit: {
      type: String,
      trim: true,
    },
    commission: {
      type: String,
      trim: true,
    },
    payment: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      require: true,
    },
  },
  { timestamps: true }
);



// module.exports.User = model('user', accountSchema);
module.exports = model("paymentModel", accountSchema);
