const express = require("express");
const router = express.Router();
const {
  createReview,
  getMyReviews,
  getReviewsByCar,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const { validateCreateReview } = require("../middleware/validationMiddleware");

router.post("/", protect, validateCreateReview, createReview);
router.get("/my", protect, getMyReviews);
router.get("/car/:carId", getReviewsByCar);
router.delete("/:id", protect, deleteReview);

module.exports = router;
