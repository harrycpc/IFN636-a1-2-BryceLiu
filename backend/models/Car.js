const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    availability: {
      type: String,
      default: "Available",
      trim: true,
    },
    seats: {
      type: Number,
      default: 5,
    },
    transmission: {
      type: String,
      default: "Automatic",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "/images/default-car.png",
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);