const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");
const geocoder = require('../utils/geocoder');

const fulluserSchema = Schema(
  {
    first_name: {
      type: String,
      trim: true,
      required: true,
    },
    last_name: {
      type: String,
      trim: true,
      required: true,
    },
    dob: {
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
    // referral: {
    //   type: String,
    // },
    userAddress : {
      type: String,
      required: [true, 'Please add an address']
    },
    address: {
      // type: {
      //   type: String,
      //   enum: ['Point']
      // },
      // coordinates: {
        type: {Number},
        index: '2dsphere'
      // },
      // formattedAddress: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // address: {
    //   lat: {
    //     type: Number,
    //     trim: true,
    //     required: true,
    //   },
    //   lng: {
    //     type: Number,
    //     trim: true,
    //     required: true,
    //   },
    // },
    vehicle_details: {
      v_manufacturer: {
        type: String,
        trim: true,
        // required: true,
      },
      vehicle_type: {
        type: String,
        trim: true,
        // required: true,
      },
      max_weight: {
        type: String,
        // required: true,
      },
      v_license: {
        type: String,
        // required: true,
      },
      address: {
        type: String,
        // required: true,
      },
    },
    documents: {
      nin: {
        type: String,
        trim: true,
        // required: true,
      },
      bvn: {
        type: String,
        // required: true,
      },
      license: {
        type: String,
        // required: true,
      },
    },
    payment_details: {
      bank_holder_name: {
        type: String,
        trim: true,
        // required: true,
      },
      account_number: {
        type: String,
        trim: true,
        // required: true,
      },
      bank_name: {
        type: String,
        // required: true,
      },
    },
    
    // station: [
    //   { type: Schema.Types.ObjectId, ref: "service-station", require: true },
    // ],
  },
  { timestamps: true }
);

fulluserSchema.methods.generateJWT = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      first_name: this.first_name,
      last_name: this.last_name,
      number: this.number,
      email: this.email,
      password: this.password,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );
  return token;
};

// Geocode & create address
fulluserSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.userAddress);
  this.address = {
    lng: 
    // type: 'Point',
    // coordinates: [
      loc[0].longitude,
      lat: loc[0].latitude,
    formattedAddress: loc[0].formattedAddress
  };

  // Do not save userAddress
  this.userAddress = undefined;
  next();
});

// module.exports.User = model('user', userSchema);
module.exports = model("fullUser", fulluserSchema);
