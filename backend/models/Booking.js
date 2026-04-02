const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
      trim: true,
    },
    pickupDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
