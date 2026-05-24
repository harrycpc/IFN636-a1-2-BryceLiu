const express = require("express");
const router = express.Router();
const { getCars, getCarById, createCar, updateCar, deleteCar } = require("../controllers/carController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

router.get("/", getCars);
router.post("/", protect, admin, createCar);
router.get("/:id", getCarById);
router.put("/:id", protect, admin, updateCar);
router.delete("/:id", protect, admin, deleteCar);

module.exports = router;
