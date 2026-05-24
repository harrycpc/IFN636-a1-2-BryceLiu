const bookingFacade = require('../facades/bookingServiceFacade');

// Create booking
const createBooking = async (req, res) => {
    try {
        if (req.user.role === "admin") {
          return res.status(403).json({ message: "Admins cannot create bookings" });
        }
        const { carId, pickupDate, returnDate, pickupLocation, dropoffLocation } = req.body;
        const booking = await bookingFacade.book(
            req.user.id, carId, pickupDate, returnDate, pickupLocation, dropoffLocation
        );
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all bookings for current user
const getBookings = async (req, res) => {
    try {
        const bookings = await bookingFacade.getUserBookings(req.user.id);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all bookings (admin operation)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingFacade.getAllBookings();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get booking by ID
const getBookingById = async (req, res) => {
    try {
        const booking = await bookingFacade.getBookingById(req.params.id, req.user.id);
        res.status(200).json(booking);
    } catch (error) {
        if (error.message === 'Access denied') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Booking not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Update booking
const updateBooking = async (req, res) => {
    try {
        const updatedBooking = await bookingFacade.updateBooking(req.params.id, req.user.id, req.body);
        res.status(200).json(updatedBooking);
    } catch (error) {
        if (error.message === 'Access denied') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Booking not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Delete booking
const deleteBooking = async (req, res) => {
    try {
        const result = await bookingFacade.deleteBooking(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Access denied') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Booking not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const { bookingStatus } = req.body;
        const updatedBooking = await bookingFacade.updateBookingStatus(req.params.id, bookingStatus);
        res.status(200).json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getBookings,
    getAllBookings,
    getBookingById,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
};