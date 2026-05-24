const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookings,
  getAllBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { validateCreateBooking, validateUpdateBooking } = require("../middleware/validationMiddleware");

router.post("/", protect, validateCreateBooking, createBooking);
router.get("/", protect, getBookings);
router.get("/admin/all", protect, admin, getAllBookings);
router.patch("/:id/status", protect, admin, updateBookingStatus);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, validateUpdateBooking, updateBooking);
router.delete("/:id", protect, deleteBooking);

module.exports = router;
