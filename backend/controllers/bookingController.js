const Booking = require("../models/Booking");

// Create booking
const createBooking = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, pickupDate, returnDate, totalPrice, bookingStatus, carId } = req.body;
    const booking = await Booking.create({
      pickupLocation,
      dropoffLocation,
      pickupDate,
      returnDate,
      totalPrice,
      bookingStatus,
      carId,
      userId: req.user.id,
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings for current user
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate("carId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("carId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id) return res.status(403).json({ message: "Access denied" });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id) return res.status(403).json({ message: "Access denied" });
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id) return res.status(403).json({ message: "Access denied" });
    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getBookings, getBookingById, updateBooking, deleteBooking };
