const { Schema, model } = require('mongoose');
const jwt = require('jsonwebtoken');

const payemntSchema = Schema(
  {
    userId: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    bank_holder_name: {
      type: String,
      trim: true,
      required: true,
    },
    account_number: {
      type: String,
      trim: true,
      required: true,
    },
    bank_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);



// module.exports.User = model('user', payemntSchema);
module.exports = model("paymentModel", payemntSchema);
