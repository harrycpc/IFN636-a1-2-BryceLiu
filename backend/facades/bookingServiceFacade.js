const Car = require('../models/Car');
const Booking = require('../models/Booking');
const pricingCalculator = require('../pricing/priceCalculator');

class BookingServiceFacade {
    /**
     * Create a new booking
     * Validates car availability, calculates price, creates booking, and updates car status
     */
    async book(userId, carId, pickupDate, returnDate, pickupLocation, dropoffLocation) {
        // Step 1: check car exists and is available
        const car = await Car.findById(carId);
        if (!car) throw new Error('Car not found');
        if (car.availability !== 'Available') throw new Error('Car is not available');

        // Step 2: calculate total price using pricing pricingCalculator
        const pricingResult = await pricingCalculator.calculatePrice({ car, pickupDate, returnDate });
        const totalPrice = pricingResult.total;

        // Step 3: create the booking
        const booking = await Booking.create({
            userId, carId, pickupDate, returnDate,
            pickupLocation, dropoffLocation,
            totalPrice, bookingStatus: 'pending'
        });

        // Step 4: mark car unavailable
        await Car.findByIdAndUpdate(carId, { availability: 'Unavailable' });

        return booking;
    }

    /**
     * Retrieve all bookings for a specific user
     */
    async getUserBookings(userId) {
        const bookings = await Booking.find({ userId }).populate("carId");
        return bookings;
    }

    /**
     * Retrieve all bookings in the system (admin operation)
     */
    async getAllBookings() {
        const bookings = await Booking.find({})
            .populate("carId")
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        return bookings;
    }

    /**
     * Retrieve a specific booking by ID with authorization check
     */
    async getBookingById(bookingId, userId) {
        const booking = await Booking.findById(bookingId).populate("carId");
        if (!booking) throw new Error('Booking not found');
        if (booking.userId.toString() !== userId) throw new Error('Access denied');
        return booking;
    }

    /**
     * Update booking details
     */
    async updateBooking(bookingId, userId, updateData) {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error('Booking not found');
        if (booking.userId.toString() !== userId) throw new Error('Access denied');

        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, updateData, {
            new: true,
            runValidators: true
        });
        return updatedBooking;
    }

    /**
     * Update booking status with validation
     */
    async updateBookingStatus(bookingId, bookingStatus) {
        const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];
        if (!allowedStatuses.includes(bookingStatus)) {
            throw new Error('Invalid booking status');
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error('Booking not found');

        booking.bookingStatus = bookingStatus;
        const updatedBooking = await booking.save();
        await updatedBooking.populate("carId");
        await updatedBooking.populate("userId", "name email");

        return updatedBooking;
    }

    /**
     * Delete/cancel a booking and restore car availability
     */
    async deleteBooking(bookingId, userId) {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error('Booking not found');
        if (booking.userId.toString() !== userId) throw new Error('Access denied');

        await Booking.findByIdAndDelete(bookingId);
        // Restore car availability when booking is deleted
        await Car.findByIdAndUpdate(booking.carId, { availability: 'Available' });

        return { message: 'Booking deleted successfully' };
    }
}

module.exports = new BookingServiceFacade();