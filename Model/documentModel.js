const { Schema, model } = require('mongoose');
const jwt = require('jsonwebtoken');

const documentSchema = Schema(
  {
    userId: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    nin: {
      type: String,
      trim: true,
      required: true,
    },
    bvn: {
      type: String,
      required: true,
    },
    license: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);



// module.exports.User = model('user', documentSchema);
module.exports = model("documentModel", documentSchema);
