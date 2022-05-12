const { Schema, model } = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = Schema(
  {
    full_name: {
      type: String,
      trim: true,
      required: true,
    },
    number: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    referral: {
      type: String,
    },
    // sevices: [{ type: Schema.Types.ObjectId, ref: "service", require: true }],
    // station: [
    //   { type: Schema.Types.ObjectId, ref: "service-station", require: true },
    // ],
  },
  { timestamps: true }
);

userSchema.methods.generateJWT = function () {
    const token = jwt.sign(
      {
        _id: this._id,
        full_name: this.full_name,
        number: this.number,
        email: this.email,
        password: this.password,
        referral: this.referral
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    return token
}

// module.exports.User = model('user', userSchema);
module.exports = model("user", userSchema);
