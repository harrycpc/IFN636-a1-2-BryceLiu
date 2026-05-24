const chai = require('chai');
const sinon = require('sinon');

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerUser, loginUser, getProfile, updateUserProfile } = require('../controllers/authController');

const expect = chai.expect;

afterEach(() => sinon.restore());

describe('RegisterUser Function Test', () => {
  it('should register a new user', async () => {
    const req = { body: { name: 'A', email: 'a@e.com', password: 'pass' } };
    const created = { id: 'u1', name: 'A', email: 'a@e.com', role: 'user' };
    sinon.stub(User, 'findOne').resolves(null);
    sinon.stub(User, 'create').resolves(created);
    sinon.stub(jwt, 'sign').returns('token');
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await registerUser(req, res);
    expect(res.status.calledWith(201)).to.be.true;
  });

  it('should return 400 if user exists', async () => {
    const req = { body: { email: 'a@e.com' } };
    sinon.stub(User, 'findOne').resolves({ id: 'u1' });
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await registerUser(req, res);
    expect(res.status.calledWith(400)).to.be.true;
  });
});

describe('LoginUser Function Test', () => {
  it('should login valid user', async () => {
    const password = 'pass';
    const hashed = await bcrypt.hash(password, 1);
    const user = { id: 'u1', email: 'a@e.com', password: hashed, name: 'A', role: 'user' };
    sinon.stub(User, 'findOne').resolves(user);
    sinon.stub(bcrypt, 'compare').resolves(true);
    sinon.stub(jwt, 'sign').returns('token');
    const req = { body: { email: 'a@e.com', password } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await loginUser(req, res);
    expect(res.json.called).to.be.true;
  });

  it('should return 401 for invalid credentials', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    const req = { body: { email: 'no@e.com', password: 'x' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await loginUser(req, res);
    expect(res.status.calledWith(401)).to.be.true;
  });
});

describe('GetProfile Function Test', () => {
  it('should return user profile', async () => {
    const user = { id: 'u1', name: 'A', email: 'a@e.com', university: 'U', address: 'Addr', role: 'user' };
    sinon.stub(User, 'findById').resolves(user);
    const req = { user: { id: 'u1' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await getProfile(req, res);
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.called).to.be.true;
  });

  it('should return 404 if user not found', async () => {
    sinon.stub(User, 'findById').resolves(null);
    const req = { user: { id: 'no' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await getProfile(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });
});

describe('UpdateUserProfile Function Test', () => {
  it('should update user profile', async () => {
    const user = { id: 'u1', name: 'A', email: 'a@e.com', university: '', address: '', save: async function() { return this; } };
    sinon.stub(User, 'findById').resolves(user);
    const req = { user: { id: 'u1' }, body: { name: 'B', university: 'U' } };
    sinon.stub(jwt, 'sign').returns('token');
    const res = { json: sinon.stub() };
    await updateUserProfile(req, res);
    expect(res.json.called).to.be.true;
  });

  it('should return 404 if user not found', async () => {
    sinon.stub(User, 'findById').resolves(null);
    const req = { user: { id: 'no' }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await updateUserProfile(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });
});


