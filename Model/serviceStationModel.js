const { Schema, model } = require('mongoose');
const geocoder = require("../utils/geocoder");

const serviceStationSchema = Schema(
  {
    st_id: {
      type: String,
      trim: true,
      required: [true, "Station Id is required"],
      unique: true,
      maxlenght: [10, "Station Id cannot be more than 10"],
    },
    service_provider_name: {
      type: String,
      trim: true,
      required: true,
    },
    service_provider_number: {
      type: Number,
      trim: true,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    open_till: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  { timestamps: true }
);


// Geocode & create location
serviceStationSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
  };

  // Do not save address
  this.address = undefined;
  next();
});

module.exports = model("service-station", serviceStationSchema);
