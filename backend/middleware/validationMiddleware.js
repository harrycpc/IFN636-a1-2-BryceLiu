/**
 * Validation Middleware - Centralized request body validation
 * Provides validators for different entity creations
 */

// Car Validation
const validateCreateCar = (req, res, next) => {
  const { name, type, location, pricePerDay } = req.body;

  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('name is required and must be a non-empty string');
  }

  if (!type || typeof type !== 'string' || type.trim() === '') {
    errors.push('type is required and must be a non-empty string');
  }

  if (!location || typeof location !== 'string' || location.trim() === '') {
    errors.push('location is required and must be a non-empty string');
  }

  if (pricePerDay === undefined || pricePerDay === null) {
    errors.push('pricePerDay is required');
  } else if (typeof pricePerDay !== 'number' || pricePerDay < 0) {
    errors.push('pricePerDay must be a non-negative number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

const validateUpdateCar = (req, res, next) => {
  const { name, type, location, pricePerDay, seats, transmission, description, image, availability } = req.body;

  const errors = [];

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    errors.push('name must be a non-empty string');
  }

  if (type !== undefined && (typeof type !== 'string' || type.trim() === '')) {
    errors.push('type must be a non-empty string');
  }

  if (location !== undefined && (typeof location !== 'string' || location.trim() === '')) {
    errors.push('location must be a non-empty string');
  }

  if (pricePerDay !== undefined && (typeof pricePerDay !== 'number' || pricePerDay < 0)) {
    errors.push('pricePerDay must be a non-negative number');
  }

  if (seats !== undefined && (typeof seats !== 'number' || seats < 1)) {
    errors.push('seats must be a positive number');
  }

  if (transmission !== undefined && (typeof transmission !== 'string' || !['Manual', 'Automatic'].includes(transmission))) {
    errors.push('transmission must be either "Manual" or "Automatic"');
  }

  if (availability !== undefined && (typeof availability !== 'string' || !['Available', 'Unavailable'].includes(availability))) {
    errors.push('availability must be either "Available" or "Unavailable"');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// Review Validation
const validateCreateReview = (req, res, next) => {
  const { carId, bookingId, rating, comment } = req.body;

  const errors = [];

  if (!carId || typeof carId !== 'string' || carId.trim() === '') {
    errors.push('carId is required and must be a non-empty string');
  }

  if (!bookingId || typeof bookingId !== 'string' || bookingId.trim() === '') {
    errors.push('bookingId is required and must be a non-empty string');
  }

  if (rating === undefined || rating === null) {
    errors.push('rating is required');
  } else if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    errors.push('rating must be a number between 1 and 5');
  }

  if (comment !== undefined && typeof comment !== 'string') {
    errors.push('comment must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// Booking Validation
const validateCreateBooking = (req, res, next) => {
  const { carId, pickupDate, returnDate, pickupLocation, dropoffLocation } = req.body;

  const errors = [];

  if (!carId || typeof carId !== 'string' || carId.trim() === '') {
    errors.push('carId is required and must be a non-empty string');
  }

  if (!pickupDate || typeof pickupDate !== 'string') {
    errors.push('pickupDate is required and must be a valid date string');
  } else {
    const pickup = new Date(pickupDate);
    if (isNaN(pickup.getTime())) {
      errors.push('pickupDate must be a valid date format (YYYY-MM-DD)');
    } else if (pickup < new Date()) {
      errors.push('pickupDate cannot be in the past');
    }
  }

  if (!returnDate || typeof returnDate !== 'string') {
    errors.push('returnDate is required and must be a valid date string');
  } else {
    const returnD = new Date(returnDate);
    if (isNaN(returnD.getTime())) {
      errors.push('returnDate must be a valid date format (YYYY-MM-DD)');
    } else if (pickupDate && returnD <= new Date(pickupDate)) {
      errors.push('returnDate must be after pickupDate');
    }
  }

  if (!pickupLocation || typeof pickupLocation !== 'string' || pickupLocation.trim() === '') {
    errors.push('pickupLocation is required and must be a non-empty string');
  }

  if (!dropoffLocation || typeof dropoffLocation !== 'string' || dropoffLocation.trim() === '') {
    errors.push('dropoffLocation is required and must be a non-empty string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

const validateUpdateBooking = (req, res, next) => {
  const { pickupDate, returnDate, pickupLocation, dropoffLocation, bookingStatus } = req.body;

  const errors = [];

  if (pickupDate !== undefined && typeof pickupDate !== 'string') {
    errors.push('pickupDate must be a valid date string');
  } else if (pickupDate) {
    const pickup = new Date(pickupDate);
    if (isNaN(pickup.getTime())) {
      errors.push('pickupDate must be a valid date format (YYYY-MM-DD)');
    }
  }

  if (returnDate !== undefined && typeof returnDate !== 'string') {
    errors.push('returnDate must be a valid date string');
  } else if (returnDate) {
    const returnD = new Date(returnDate);
    if (isNaN(returnD.getTime())) {
      errors.push('returnDate must be a valid date format (YYYY-MM-DD)');
    }
  }

  if (pickupLocation !== undefined && (typeof pickupLocation !== 'string' || pickupLocation.trim() === '')) {
    errors.push('pickupLocation must be a non-empty string');
  }

  if (dropoffLocation !== undefined && (typeof dropoffLocation !== 'string' || dropoffLocation.trim() === '')) {
    errors.push('dropoffLocation must be a non-empty string');
  }

  if (bookingStatus !== undefined && !['pending', 'confirmed', 'cancelled', 'completed'].includes(bookingStatus)) {
    errors.push('bookingStatus must be one of: pending, confirmed, cancelled, completed');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// Auth Validation
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('name is required and must be a non-empty string');
  }

  if (!email || typeof email !== 'string') {
    errors.push('email is required and must be a valid email');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('email must be a valid email address');
    }
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('password is required and must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = {
  validateCreateCar,
  validateUpdateCar,
  validateCreateReview,
  validateCreateBooking,
  validateUpdateBooking,
  validateRegister,
  validateLogin,
};
