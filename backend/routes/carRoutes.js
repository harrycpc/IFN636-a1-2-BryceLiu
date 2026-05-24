const express = require("express");
const router = express.Router();
const { getCars, getCarById, createCar, updateCar, deleteCar } = require("../controllers/carController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { validateCreateCar, validateUpdateCar } = require("../middleware/validationMiddleware");

router.get("/", getCars);
router.post("/", protect, admin, validateCreateCar, createCar);
router.get("/:id", getCarById);
router.put("/:id", protect, admin, validateUpdateCar, updateCar);
router.delete("/:id", protect, admin, deleteCar);

module.exports = router;
