const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const bookingFacade = require('../facades/bookingServiceFacade');
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getAllBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');

const expect = chai.expect;

// Booking controller function tests
// Each describe block targets one exported controller function and follows the
// naming convention: <FunctionName> Function Test

afterEach(() => sinon.restore());

describe('CreateBooking Function Test', () => {
  it('should create a new booking successfully', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId().toString(), role: 'user' },
      body: {
        carId: new mongoose.Types.ObjectId().toString(),
        pickupLocation: 'A',
        dropoffLocation: 'B',
        pickupDate: '2026-05-01',
        returnDate: '2026-05-02',
      },
    };

    const createdBooking = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };
    sinon.stub(bookingFacade, 'book').resolves(createdBooking);

    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await createBooking(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdBooking)).to.be.true;
  });

  it('should return 403 if admin tries to create booking', async () => {
    const req = { user: { id: 'u1', role: 'admin' }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await createBooking(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: 'Admins cannot create bookings' })).to.be.true;
  });

  it('should return 500 if an error occurs during booking creation', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId().toString(), role: 'user' },
      body: { carId: new mongoose.Types.ObjectId().toString() },
    };
    sinon.stub(bookingFacade, 'book').rejects(new Error('Database error'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await createBooking(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Database error' })).to.be.true;
  });
});

describe('GetBookings Function Test', () => {
  it('should return all bookings for the current user', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const req = { user: { id: userId } };
    const bookings = [ { _id: new mongoose.Types.ObjectId(), userId }, { _id: new mongoose.Types.ObjectId(), userId } ];

    sinon.stub(bookingFacade, 'getUserBookings').resolves(bookings);
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await getBookings(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(bookings)).to.be.true;
  });

  it('should return 500 if an error occurs while fetching bookings', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const req = { user: { id: userId } };
    sinon.stub(bookingFacade, 'getUserBookings').rejects(new Error('Database error'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await getBookings(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Database error' })).to.be.true;
  });
});

describe('GetBookingById Function Test', () => {
  it('should return a booking if found and belongs to the current user', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const bookingId = new mongoose.Types.ObjectId().toString();
    const booking = { _id: bookingId, pickupLocation: 'A', userId };
    const req = { params: { id: bookingId }, user: { id: userId } };

    sinon.stub(bookingFacade, 'getBookingById').resolves(booking);
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await getBookingById(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(booking)).to.be.true;
  });

  it('should return 404 if booking is not found', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const bookingId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: bookingId }, user: { id: userId } };

    sinon.stub(bookingFacade, 'getBookingById').rejects(new Error('Booking not found'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await getBookingById(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Booking not found' })).to.be.true;
  });

  it('should return 403 if booking does not belong to the current user', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const bookingId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: bookingId }, user: { id: userId } };

    sinon.stub(bookingFacade, 'getBookingById').rejects(new Error('Access denied'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await getBookingById(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: 'Access denied' })).to.be.true;
  });

  it('should return 500 if an error occurs while fetching booking by id', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const bookingId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: bookingId }, user: { id: userId } };

    sinon.stub(bookingFacade, 'getBookingById').rejects(new Error('Database error'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await getBookingById(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Database error' })).to.be.true;
  });
});

describe('UpdateBooking Function Test', () => {
  it('should update a booking successfully if it belongs to the current user', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const bookingId = new mongoose.Types.ObjectId().toString();
    const updatedBooking = { _id: bookingId, pickupLocation: 'Updated Location', userId };
    const req = { params: { id: bookingId }, user: { id: userId }, body: { pickupLocation: 'Updated Location' } };

    sinon.stub(bookingFacade, 'updateBooking').resolves(updatedBooking);
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await updateBooking(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(updatedBooking)).to.be.true;
  });

  it('should return 404 if booking to update is not found', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const bookingId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: bookingId }, user: { id: userId }, body: { pickupLocation: 'Updated Location' } };

    sinon.stub(bookingFacade, 'updateBooking').rejects(new Error('Booking not found'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await updateBooking(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Booking not found' })).to.be.true;
  });

  it('should return 403 if booking to update does not belong to the current user', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const bookingId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: bookingId }, user: { id: userId }, body: { pickupLocation: 'Updated Location' } };

    sinon.stub(bookingFacade, 'updateBooking').rejects(new Error('Access denied'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await updateBooking(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: 'Access denied' })).to.be.true;
  });

  it('should return 500 if an error occurs while updating booking', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const bookingId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: bookingId }, user: { id: userId }, body: { pickupLocation: 'Updated Location' } };

    sinon.stub(bookingFacade, 'updateBooking').rejects(new Error('Database error'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await updateBooking(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Database error' })).to.be.true;
  });
});

describe('DeleteBooking Function Test', () => {
  it('should delete a booking successfully if it belongs to the current user', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const bookingId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: bookingId }, user: { id: userId } };

    sinon.stub(bookingFacade, 'deleteBooking').resolves({ message: 'Booking deleted successfully' });
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await deleteBooking(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'Booking deleted successfully' })).to.be.true;
  });

  it('should return 404 if booking to delete is not found', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const bookingId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: bookingId }, user: { id: userId } };

    sinon.stub(bookingFacade, 'deleteBooking').rejects(new Error('Booking not found'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await deleteBooking(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Booking not found' })).to.be.true;
  });

  it('should return 403 if booking to delete does not belong to the current user', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const bookingId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: bookingId }, user: { id: userId } };

    sinon.stub(bookingFacade, 'deleteBooking').rejects(new Error('Access denied'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await deleteBooking(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: 'Access denied' })).to.be.true;
  });

  it('should return 500 if an error occurs while deleting booking', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const bookingId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: bookingId }, user: { id: userId } };

    sinon.stub(bookingFacade, 'deleteBooking').rejects(new Error('Database error'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await deleteBooking(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Database error' })).to.be.true;
  });
});

describe('GetAllBookings Function Test', () => {
  it('should return all bookings (admin)', async () => {
    const req = {};
    const bookings = [ { _id: new mongoose.Types.ObjectId() } ];
    sinon.stub(bookingFacade, 'getAllBookings').resolves(bookings);
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await getAllBookings(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(bookings)).to.be.true;
  });

  it('should return 500 on error', async () => {
    sinon.stub(bookingFacade, 'getAllBookings').rejects(new Error('DB error'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await getAllBookings({}, res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

describe('UpdateBookingStatus Function Test', () => {
  it('should update booking status successfully', async () => {
    const bookingId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: bookingId }, body: { bookingStatus: 'completed' } };
    const updated = { _id: bookingId, bookingStatus: 'completed' };
    sinon.stub(bookingFacade, 'updateBookingStatus').resolves(updated);
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await updateBookingStatus(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(updated)).to.be.true;
  });

  it('should return 500 on error', async () => {
    const bookingId = new mongoose.Types.ObjectId().toString();
    sinon.stub(bookingFacade, 'updateBookingStatus').rejects(new Error('DB error'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await updateBookingStatus({ params: { id: bookingId }, body: { bookingStatus: 'confirmed' } }, res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

