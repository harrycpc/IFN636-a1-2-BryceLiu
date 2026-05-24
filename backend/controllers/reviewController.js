const Booking = require("../models/Booking");
const Car = require("../models/Car");
const Review = require("../models/Review");

const updateCarRatingSummary = async (carId) => {
  const summary = await Review.aggregate([
    { $match: { carId } },
    {
      $group: {
        _id: "$carId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const ratingData = summary[0] || { averageRating: 0, reviewCount: 0 };

  await Car.findByIdAndUpdate(carId, {
    averageRating: Number(ratingData.averageRating.toFixed(1)),
    reviewCount: ratingData.reviewCount,
  });
};

const createReview = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Admins cannot create reviews" });
    }

    const { carId, bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!booking.carId || booking.carId.toString() !== carId) {
      return res.status(400).json({ message: "Review car does not match booking" });
    }

    if (booking.bookingStatus !== "completed") {
      return res.status(400).json({ message: "Only completed bookings can be reviewed" });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: "This booking has already been reviewed" });
    }

    const review = await Review.create({
      carId,
      bookingId,
      rating,
      comment,
      userId: req.user.id,
    });

    await updateCarRatingSummary(review.carId);
    const populatedReview = await review.populate("userId", "name");

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .populate("carId", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviewsByCar = async (req, res) => {
  try {
    const reviews = await Review.find({ carId: req.params.carId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const carId = review.carId;
    await Review.findByIdAndDelete(req.params.id);
    await updateCarRatingSummary(carId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getMyReviews, getReviewsByCar, deleteReview };
