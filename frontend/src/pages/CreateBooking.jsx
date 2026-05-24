import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import { fmt$, fmtDate, daysBetween } from '../utils/format';
import { LOCATIONS } from '../utils/constants';

const CreateBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const today = new Date().toISOString().slice(0, 10);

  const carId = searchParams.get('carId') || '';
  const [selectedCar, setSelectedCar] = useState(null);

  const [form, setForm] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    returnDate: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!carId) return;
    const fetchCar = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/cars/${carId}`);
        setSelectedCar(data);
      } catch (error) {
        console.error('Failed to load car details:', error);
      }
    };
    fetchCar();
  }, [carId]);

  const days = useMemo(
    () => daysBetween(form.pickupDate, form.returnDate),
    [form.pickupDate, form.returnDate]
  );
  const totalPrice = days * Number(selectedCar?.pricePerDay || 0);

  const canSubmit =
    form.pickupLocation &&
    form.dropoffLocation &&
    form.pickupDate &&
    form.returnDate &&
    days > 0 &&
    carId;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await axiosInstance.post(
        '/api/bookings',
        {
          carId,
          pickupLocation: form.pickupLocation,
          dropoffLocation: form.dropoffLocation,
          pickupDate: form.pickupDate,
          returnDate: form.returnDate,
          totalPrice: Number(totalPrice),
          bookingStatus: 'pending',
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert('Booking created successfully.');
      navigate('/bookings');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create booking.');
    }
  };

  if (!selectedCar) {
    return (
      <main className="container">
        <button className="back-link" onClick={() => navigate('/cars')}>
          <Icon name="arrow-left" size={16} stroke={2} /> Back to Browse Cars
        </button>
        <div className="empty-card">
          <h3 className="h-display">Loading…</h3>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <button className="back-link" onClick={() => navigate('/cars')}>
        <Icon name="arrow-left" size={16} stroke={2} /> Back to Browse Cars
      </button>

      <div className="confirm-shell">
        <form className="detail-card" onSubmit={submit} noValidate>
          <h1 className="h-display confirm-title">Create Booking</h1>
          <p className="confirm-sub">
            Enter your trip details to confirm the booking.
          </p>

          <div className="selected-car">
            <img src={selectedCar.image} alt={selectedCar.name} />
            <div>
              <h2>{selectedCar.name}</h2>
              <div className="row">
                <span>Type</span>
                <b>{selectedCar.type}</b>
              </div>
              <div className="row">
                <span>Price per day</span>
                <b>{fmt$(selectedCar.pricePerDay)}</b>
              </div>
              <div className="row">
                <span>Seats</span>
                <b>{selectedCar.seats}</b>
              </div>
              <div className="row">
                <span>Transmission</span>
                <b>{selectedCar.transmission}</b>
              </div>
            </div>
          </div>

          <div className="field-stack">
            <label>Pickup Location</label>
            <select
              className="input"
              value={form.pickupLocation}
              onChange={(e) => set('pickupLocation', e.target.value)}
            >
              <option value="">Select pickup location</option>
              {LOCATIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="field-stack">
            <label>Dropoff Location</label>
            <select
              className="input"
              value={form.dropoffLocation}
              onChange={(e) => set('dropoffLocation', e.target.value)}
            >
              <option value="">Select dropoff location</option>
              {LOCATIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="field-grid">
            <div className="field-stack">
              <label>Pickup Date</label>
              <input
                className="input"
                type="date"
                min={today}
                value={form.pickupDate}
                onChange={(e) => set('pickupDate', e.target.value)}
              />
            </div>
            <div className="field-stack">
              <label>Return Date</label>
              <input
                className="input"
                type="date"
                min={form.pickupDate || today}
                value={form.returnDate}
                onChange={(e) => set('returnDate', e.target.value)}
              />
            </div>
          </div>

          <div className="field-grid">
            <div className="field-stack">
              <label>Rental Days</label>
              <input className="input is-readonly" value={days} readOnly />
            </div>
            <div className="field-stack">
              <label>Total Price</label>
              <input
                className="input is-readonly"
                value={totalPrice ? fmt$(totalPrice) : '—'}
                readOnly
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={!canSubmit}>
            Confirm Booking
          </button>
        </form>

        <aside className="summary-card">
          <h2 className="h-display">Booking Summary</h2>
          <img
            className="summary-img"
            src={selectedCar.image}
            alt={selectedCar.name}
          />
          <div className="summary-grid">
            <div className="row">
              <span>Seats</span>
              <b>{selectedCar.seats}</b>
            </div>
            <div className="row">
              <span>Transmission</span>
              <b>{selectedCar.transmission}</b>
            </div>
            <div className="row">
              <span>Pickup Location</span>
              <b>{form.pickupLocation || 'Not selected'}</b>
            </div>
            <div className="row">
              <span>Dropoff Location</span>
              <b>{form.dropoffLocation || 'Not selected'}</b>
            </div>
            <div className="row">
              <span>Pickup Date</span>
              <b>
                {form.pickupDate ? fmtDate(form.pickupDate) : 'Not selected'}
              </b>
            </div>
            <div className="row">
              <span>Return Date</span>
              <b>
                {form.returnDate ? fmtDate(form.returnDate) : 'Not selected'}
              </b>
            </div>
            <div className="row">
              <span>Rental Days</span>
              <b>{days || 'Not calculated'}</b>
            </div>
            <div className="row">
              <span>Price Per Day</span>
              <b>{fmt$(selectedCar.pricePerDay)}</b>
            </div>
            <div className="row total">
              <span>Total Price</span>
              <b>{totalPrice ? fmt$(totalPrice) : 'Not calculated'}</b>
            </div>
            <div className="row status">
              <span>Status</span>
              <span className="status-pill pending">pending</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CreateBooking;
