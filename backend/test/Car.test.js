const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const Car = require('../models/Car');
const { getCars, getCarById, createCar, updateCar, deleteCar } = require('../controllers/carController');

const expect = chai.expect;

afterEach(() => sinon.restore());

describe('GetCars Function Test', () => {
  it('should return list of cars', async () => {
    const cars = [{ _id: new mongoose.Types.ObjectId(), name: 'X' }];
    sinon.stub(Car, 'find').resolves(cars);
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await getCars({}, res);
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(cars)).to.be.true;
  });

  it('should return 500 on error', async () => {
    sinon.stub(Car, 'find').rejects(new Error('DB error'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await getCars({}, res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

describe('GetCarById Function Test', () => {
  it('should return car if found', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const car = { _id: id, name: 'X' };
    sinon.stub(Car, 'findById').resolves(car);
    const req = { params: { id } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await getCarById(req, res);
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(car)).to.be.true;
  });

  it('should return 404 if not found', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    sinon.stub(Car, 'findById').resolves(null);
    const req = { params: { id } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await getCarById(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });

  it('should return 500 on error', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    sinon.stub(Car, 'findById').rejects(new Error('DB error'));
    const req = { params: { id } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await getCarById(req, res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

describe('CreateCar Function Test', () => {
  it('should create car', async () => {
    const body = { name: 'New' };
    const created = { _id: new mongoose.Types.ObjectId(), ...body };
    sinon.stub(Car, 'create').resolves(created);
    const req = { body };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await createCar(req, res);
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(created)).to.be.true;
  });

  it('should return 400 on validation error', async () => {
    sinon.stub(Car, 'create').rejects(new Error('Validation error'));
    const req = { body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await createCar(req, res);
    expect(res.status.calledWith(400)).to.be.true;
  });
});

describe('UpdateCar Function Test', () => {
  it('should update car successfully', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const req = { params: { id }, body: { name: 'U' } };
    const car = { _id: id };
    sinon.stub(Car, 'findById').resolves(car);
    const updated = { _id: id, name: 'U' };
    sinon.stub(Car, 'findByIdAndUpdate').resolves(updated);
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await updateCar(req, res);
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(updated)).to.be.true;
  });

  it('should return 404 when car not found', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    sinon.stub(Car, 'findById').resolves(null);
    const req = { params: { id }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await updateCar(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });

  it('should return 400 on validation error', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    sinon.stub(Car, 'findById').resolves({ _id: id });
    sinon.stub(Car, 'findByIdAndUpdate').rejects(new Error('Validation error'));
    const req = { params: { id }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await updateCar(req, res);
    expect(res.status.calledWith(400)).to.be.true;
  });
});

describe('DeleteCar Function Test', () => {
  it('should delete car successfully', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    sinon.stub(Car, 'findById').resolves({ _id: id });
    sinon.stub(Car, 'findByIdAndDelete').resolves();
    const req = { params: { id } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await deleteCar(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('should return 404 if car not found', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    sinon.stub(Car, 'findById').resolves(null);
    const req = { params: { id } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await deleteCar(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });

  it('should return 500 on error', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    sinon.stub(Car, 'findById').rejects(new Error('DB error'));
    const req = { params: { id } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await deleteCar(req, res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

describe('ExternalCarAdapter Function Test', () => {
  it('should adapt external car data to internal schema', async () => {
    const { ExternalCarAdapter, MockExternalCarData } = require('../adapters/externalCarAdapter');

    const external = new MockExternalCarData();
    const adapter = new ExternalCarAdapter(external);

    const adapted = await adapter.getAdaptedCars();

    expect(adapted).to.be.an('array').with.lengthOf(1);
    const car = adapted[0];

    expect(car).to.include({
      name: 'Toyota Corolla',
      type: 'Sedan',
      location: 'Brisbane',
      pricePerDay: 75,
      seats: 5,
      transmission: 'Automatic',
      availability: 'Available',
      description: 'Fuel efficient city car',
    });
  });
});

