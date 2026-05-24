const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");

const bookingFacade = require("../facades/bookingServiceFacade");
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");

const expect = chai.expect;

describe("Booking Controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("createBooking", () => {
    it("should create a new booking successfully", async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId().toString(), role: "user" },
        body: {
          pickupLocation: "Brisbane Airport",
          dropoffLocation: "Gold Coast",
          pickupDate: "2026-04-10",
          returnDate: "2026-04-12",
          totalPrice: 180,
          bookingStatus: "pending",
          carId: new mongoose.Types.ObjectId().toString(),
        },
      };

      const createdBooking = {
        _id: new mongoose.Types.ObjectId(),
        ...req.body,
        userId: req.user.id,
      };

      sinon.stub(bookingFacade, "book").resolves(createdBooking);

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await createBooking(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(createdBooking)).to.be.true;
    });

    it("should return 500 if an error occurs during booking creation", async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId().toString(), role: "user" },
        body: {
          pickupLocation: "Brisbane Airport",
          dropoffLocation: "Gold Coast",
          pickupDate: "2026-04-10",
          returnDate: "2026-04-12",
          totalPrice: 180,
          bookingStatus: "pending",
          carId: new mongoose.Types.ObjectId().toString(),
        },
      };

      sinon.stub(bookingFacade, "book").rejects(new Error("Database error"));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await createBooking(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: "Database error" })).to.be.true;
    });
  });

  describe("getBookings", () => {
    it("should return all bookings for the current user", async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      const req = {
        user: { id: userId },
      };

      const bookings = [
        {
          _id: new mongoose.Types.ObjectId(),
          pickupLocation: "Brisbane",
          userId,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          pickupLocation: "Gold Coast",
          userId,
        },
      ];

      sinon.stub(bookingFacade, "getUserBookings").resolves(bookings);

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await getBookings(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(bookings)).to.be.true;
    });

    it("should return 500 if an error occurs while fetching bookings", async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      const req = {
        user: { id: userId },
      };

      sinon.stub(bookingFacade, "getUserBookings").rejects(new Error("Database error"));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await getBookings(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: "Database error" })).to.be.true;
    });
  });

  describe("getBookingById", () => {
    it("should return a booking if found and belongs to the current user", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const booking = {
        _id: bookingId,
        pickupLocation: "Brisbane",
        userId,
      };

      const req = {
        params: { id: bookingId },
        user: { id: userId },
      };

      sinon.stub(bookingFacade, "getBookingById").resolves(booking);

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await getBookingById(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(booking)).to.be.true;
    });

    it("should return 404 if booking is not found", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const req = {
        params: { id: bookingId },
        user: { id: userId },
      };

      sinon.stub(bookingFacade, "getBookingById").rejects(new Error("Booking not found"));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await getBookingById(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "Booking not found" })).to.be.true;
    });

    it("should return 403 if booking does not belong to the current user", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const req = {
        params: { id: bookingId },
        user: { id: userId },
      };

      sinon.stub(bookingFacade, "getBookingById").rejects(new Error("Access denied"));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await getBookingById(req, res);

      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ message: "Access denied" })).to.be.true;
    });

    it("should return 500 if an error occurs while fetching booking by id", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const req = {
        params: { id: bookingId },
        user: { id: userId },
      };

      sinon.stub(bookingFacade, "getBookingById").rejects(new Error("Database error"));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await getBookingById(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: "Database error" })).to.be.true;
    });
  });

  describe("updateBooking", () => {
    it("should update a booking successfully if it belongs to the current user", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const updatedBooking = {
        _id: bookingId,
        pickupLocation: "Updated Location",
        userId,
      };

      const req = {
        params: { id: bookingId },
        user: { id: userId },
        body: { pickupLocation: "Updated Location" },
      };

      sinon.stub(bookingFacade, "updateBooking").resolves(updatedBooking);

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await updateBooking(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(updatedBooking)).to.be.true;
    });

    it("should return 404 if booking to update is not found", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const req = {
        params: { id: bookingId },
        user: { id: userId },
        body: { pickupLocation: "Updated Location" },
      };

      sinon.stub(bookingFacade, "updateBooking").rejects(new Error("Booking not found"));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await updateBooking(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "Booking not found" })).to.be.true;
    });

    it("should return 403 if booking to update does not belong to the current user", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const req = {
        params: { id: bookingId },
        user: { id: userId },
        body: { pickupLocation: "Updated Location" },
      };

      sinon.stub(bookingFacade, "updateBooking").rejects(new Error("Access denied"));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await updateBooking(req, res);

      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ message: "Access denied" })).to.be.true;
    });

    it("should return 500 if an error occurs while updating booking", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const req = {
        params: { id: bookingId },
        user: { id: userId },
        body: { pickupLocation: "Updated Location" },
      };

      sinon.stub(bookingFacade, "updateBooking").rejects(new Error("Database error"));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await updateBooking(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: "Database error" })).to.be.true;
    });
  });

  describe("deleteBooking", () => {
    it("should delete a booking successfully if it belongs to the current user", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const req = {
        params: { id: bookingId },
        user: { id: userId },
      };

      sinon.stub(bookingFacade, "deleteBooking").resolves({ message: "Booking deleted successfully" });

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await deleteBooking(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Booking deleted successfully" })).to.be.true;
    });

    it("should return 404 if booking to delete is not found", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const req = {
        params: { id: bookingId },
        user: { id: userId },
      };

      sinon.stub(bookingFacade, "deleteBooking").rejects(new Error("Booking not found"));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await deleteBooking(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "Booking not found" })).to.be.true;
    });

    it("should return 403 if booking to delete does not belong to the current user", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const req = {
        params: { id: bookingId },
        user: { id: userId },
      };

      sinon.stub(bookingFacade, "deleteBooking").rejects(new Error("Access denied"));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await deleteBooking(req, res);

      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ message: "Access denied" })).to.be.true;
    });

    it("should return 500 if an error occurs while deleting booking", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const req = {
        params: { id: bookingId },
        user: { id: userId },
      };

      sinon.stub(bookingFacade, "deleteBooking").rejects(new Error("Database error"));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await deleteBooking(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: "Database error" })).to.be.true;
    });
  });
});
