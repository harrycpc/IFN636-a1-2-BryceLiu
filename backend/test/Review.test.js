const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Review = require('../models/Review');
const { createReview, getMyReviews, getReviewsByCar, deleteReview } = require('../controllers/reviewController');

const expect = chai.expect;

afterEach(() => sinon.restore());

describe('CreateReview Function Test', () => {
  it('should forbid admin from creating review', async () => {
    const req = { user: { id: 'u1', role: 'admin' }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await createReview(req, res);
    expect(res.status.calledWith(403)).to.be.true;
  });

  it('should return 404 if booking not found', async () => {
    const req = { user: { id: 'u1', role: 'user' }, body: { bookingId: 'b1', carId: 'c1' } };
    sinon.stub(Booking, 'findById').resolves(null);
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await createReview(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });

  it('should return 403 if booking does not belong to user', async () => {
    const booking = { userId: new mongoose.Types.ObjectId(), carId: new mongoose.Types.ObjectId(), bookingStatus: 'completed' };
    sinon.stub(Booking, 'findById').resolves(booking);
    const req = { user: { id: 'other' }, body: { bookingId: 'b1', carId: booking.carId.toString() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await createReview(req, res);
    expect(res.status.calledWith(403)).to.be.true;
  });

  it('should return 400 if car mismatch', async () => {
    const booking = { userId: mongoose.Types.ObjectId().toString(), carId: new mongoose.Types.ObjectId(), bookingStatus: 'completed' };
    sinon.stub(Booking, 'findById').resolves(booking);
    const req = { user: { id: booking.userId.toString() }, body: { bookingId: 'b1', carId: 'different' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await createReview(req, res);
    expect(res.status.calledWith(400)).to.be.true;
  });

  it('should return 400 if booking not completed', async () => {
    const booking = { userId: mongoose.Types.ObjectId().toString(), carId: mongoose.Types.ObjectId(), bookingStatus: 'pending' };
    sinon.stub(Booking, 'findById').resolves(booking);
    const req = { user: { id: booking.userId.toString() }, body: { bookingId: 'b1', carId: booking.carId.toString() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await createReview(req, res);
    expect(res.status.calledWith(400)).to.be.true;
  });

  it('should return 400 if existing review found', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const booking = { userId, carId: new mongoose.Types.ObjectId(), bookingStatus: 'completed' };
    sinon.stub(Booking, 'findById').resolves(booking);
    sinon.stub(Review, 'findOne').resolves({ _id: 'r1' });
    const req = { user: { id: userId }, body: { bookingId: 'b1', carId: booking.carId.toString() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await createReview(req, res);
    expect(res.status.calledWith(400)).to.be.true;
  });

  it('should create review and update car summary', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const booking = { userId, carId: new mongoose.Types.ObjectId(), bookingStatus: 'completed' };
    sinon.stub(Booking, 'findById').resolves(booking);
    sinon.stub(Review, 'findOne').resolves(null);
    const created = { _id: 'r1', carId: booking.carId, bookingId: 'b1', rating: 5, comment: 'good', userId };
    // mimic mongoose document.populate returning the populated document
    const reviewDoc = Object.assign(created, { populate: async () => created });
    sinon.stub(Review, 'create').resolves(reviewDoc);
    // stub aggregation used by updateCarRatingSummary to avoid DB calls
    sinon.stub(Review, 'aggregate').resolves([]);
    sinon.stub(Car, 'findByIdAndUpdate').resolves();

    const req = { user: { id: userId }, body: { bookingId: 'b1', carId: booking.carId.toString(), rating: 5, comment: 'good' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await createReview(req, res);
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.called).to.be.true;
  });
});

describe('GetMyReviews Function Test', () => {
  it('should return reviews for current user', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const req = { user: { id: userId } };
    const reviews = [{ _id: 'r1' }];
    sinon.stub(Review, 'find').returns({ populate: () => ({ sort: () => Promise.resolve(reviews) }) });
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await getMyReviews(req, res);
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(reviews)).to.be.true;
  });

  it('should return 500 on error', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    sinon.stub(Review, 'find').throws(new Error('DB error'));
    const req = { user: { id: userId } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await getMyReviews(req, res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

describe('GetReviewsByCar Function Test', () => {
  it('should return reviews for a car', async () => {
    const carId = new mongoose.Types.ObjectId().toString();
    const req = { params: { carId } };
    sinon.stub(Review, 'find').returns({ populate: () => ({ sort: () => Promise.resolve([{ _id: 'r1' }]) }) });
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await getReviewsByCar(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('should return 500 on error', async () => {
    const carId = new mongoose.Types.ObjectId().toString();
    sinon.stub(Review, 'find').throws(new Error('DB error'));
    const req = { params: { carId } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await getReviewsByCar(req, res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

describe('DeleteReview Function Test', () => {
  it('should delete review successfully', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const review = { _id: 'r1', userId, carId: new mongoose.Types.ObjectId() };
    sinon.stub(Review, 'findById').resolves(review);
    sinon.stub(Review, 'findByIdAndDelete').resolves();
    // stub aggregation used by updateCarRatingSummary
    sinon.stub(Review, 'aggregate').resolves([]);
    sinon.stub(Car, 'findByIdAndUpdate').resolves();
    const req = { params: { id: 'r1' }, user: { id: userId } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await deleteReview(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('should return 404 if review not found', async () => {
    sinon.stub(Review, 'findById').resolves(null);
    const req = { params: { id: 'r1' }, user: { id: 'u1' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await deleteReview(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });

  it('should return 403 if not owner', async () => {
    const review = { _id: 'r1', userId: new mongoose.Types.ObjectId().toString() };
    sinon.stub(Review, 'findById').resolves(review);
    const req = { params: { id: 'r1' }, user: { id: 'other' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await deleteReview(req, res);
    expect(res.status.calledWith(403)).to.be.true;
  });

  it('should return 500 on error', async () => {
    sinon.stub(Review, 'findById').rejects(new Error('DB error'));
    const req = { params: { id: 'r1' }, user: { id: 'u1' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await deleteReview(req, res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});


