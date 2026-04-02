const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking);
router.get("/", protect, getBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, deleteBooking);

module.exports = router;
