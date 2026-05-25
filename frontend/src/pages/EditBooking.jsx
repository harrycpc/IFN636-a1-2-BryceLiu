import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import { fmt$, fmtDate, daysBetween } from '../utils/format';
import { getPublicPricing } from '../api/pricingApi';
import { calculateTotalPrice } from '../utils/pricing';
import { LOCATIONS } from '../utils/constants';

const EditBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const today = new Date().toISOString().slice(0, 10);

  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [booking, setBooking] = useState(null);

  const [form, setForm] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    returnDate: '',
    bookingStatus: 'pending',
    carId: '',
  });
  // pricing info from public rules (total + breakdown)
  const [priceInfo, setPriceInfo] = useState({ totalPrice: 0, breakdown: null });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const carData = data.carId || null;
        setBooking(data);
        setSelectedCar(carData);
        setForm({
          pickupLocation: data.pickupLocation || '',
          dropoffLocation: data.dropoffLocation || '',
          pickupDate: data.pickupDate ? String(data.pickupDate).slice(0, 10) : '',
          returnDate: data.returnDate ? String(data.returnDate).slice(0, 10) : '',
          bookingStatus: data.bookingStatus || 'pending',
          carId: carData?._id || data.carId || '',
        });
      } catch (error) {
        alert('Failed to load booking details.');
        navigate('/bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, user, navigate]);

  const days = useMemo(
    () => daysBetween(form.pickupDate, form.returnDate),
    [form.pickupDate, form.returnDate]
  );
  const dailyPrice = Number(selectedCar?.pricePerDay || 0);
  const totalPrice = priceInfo?.totalPrice || days * dailyPrice;

  // update pricing breakdown when dates or selectedCar change
  useEffect(() => {
    const updatePricing = async () => {
      const fallback = days * dailyPrice;
      if (!form.pickupDate || !form.returnDate) {
        setPriceInfo({ totalPrice: fallback, breakdown: null });
        return;
      }

      try {
        const pricing = await getPublicPricing();
        const calc = calculateTotalPrice(dailyPrice, form.pickupDate, form.returnDate, pricing.longStayRules, pricing.weekendSurchargeRate);
        setPriceInfo({ totalPrice: calc.total, breakdown: calc.breakdown });
      } catch (err) {
        setPriceInfo({ totalPrice: fallback, breakdown: null });
      }
    };

    updatePricing();
  }, [form.pickupDate, form.returnDate, dailyPrice, days]);

  const submit = async (e) => {
    e.preventDefault();
    if (days <= 0) {
      alert('Return date must be after pickup date.');
      return;
    }
    try {
      await axiosInstance.put(
        `/api/bookings/${id}`,
        {
          pickupLocation: form.pickupLocation,
          dropoffLocation: form.dropoffLocation,
          pickupDate: form.pickupDate,
          returnDate: form.returnDate,
          totalPrice: Number(totalPrice),
          bookingStatus: form.bookingStatus,
          carId: form.carId,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert('Booking updated successfully.');
      navigate('/bookings');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update booking.');
    }
  };

  if (loading) {
    return (
      <main className="container">
        <div className="empty-card">
          <h3 className="h-display">Loading booking details…</h3>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <button className="back-link" onClick={() => navigate('/bookings')}>
        <Icon name="arrow-left" size={16} stroke={2} /> Back to My Bookings
      </button>

      <div className="confirm-shell">
        <form className="detail-card" onSubmit={submit}>
          <h1 className="h-display confirm-title">Edit Booking</h1>
          <p className="confirm-sub">
            Update your pickup, dropoff or dates.
          </p>

          {selectedCar && (
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
                  <span>Status</span>
                  <b style={{ textTransform: 'capitalize' }}>
                    {booking?.bookingStatus}
                  </b>
                </div>
              </div>
            </div>
          )}

          <div className="field-stack">
            <label>Pickup Location</label>
            <select
              className="input"
              value={form.pickupLocation}
              onChange={(e) => set('pickupLocation', e.target.value)}
            >
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

          <button
            type="submit"
            className="btn-primary"
            disabled={days === 0}
          >
            Save Changes
          </button>
        </form>

        <aside className="summary-card">
          <h2 className="h-display">Updated Summary</h2>
          {selectedCar && (
            <img
              className="summary-img"
              src={selectedCar.image}
              alt={selectedCar.name}
            />
          )}
          <div className="summary-grid">
            <div className="row">
              <span>Pickup</span>
              <b>{form.pickupLocation}</b>
            </div>
            <div className="row">
              <span>Dropoff</span>
              <b>{form.dropoffLocation}</b>
            </div>
            <div className="row">
              <span>Pickup Date</span>
              <b>{form.pickupDate ? fmtDate(form.pickupDate) : '—'}</b>
            </div>
            <div className="row">
              <span>Return Date</span>
              <b>{form.returnDate ? fmtDate(form.returnDate) : '—'}</b>
            </div>
            <div className="row">
              <span>Rental Days</span>
              <b>{days}</b>
            </div>
            {/* Price breakdown: show components first, then Total Price row */}
            {(() => {
              const _breakdown = priceInfo?.breakdown || null;
              const hasSurcharge = Boolean(_breakdown && Number(_breakdown.weekend?.surcharge || 0) > 0);
              const hasDiscount = Boolean(_breakdown && Number(_breakdown.discount?.amount || 0) > 0);
              const showBreakdown = Boolean(_breakdown && (hasSurcharge || hasDiscount));

              return (
                <>
                  {showBreakdown && (
                    <>
                      <div className="row breakdown-start">
                        <span>Base</span>
                        <b>{fmt$(_breakdown.base)}</b>
                      </div>

                      {hasSurcharge && (
                        <div className="row">
                          <span>Weekend surcharge ({_breakdown.weekend.rate}%)</span>
                          <b>+ {fmt$(_breakdown.weekend.surcharge)}</b>
                        </div>
                      )}

                      {hasDiscount && (
                        <div className="row">
                          <span>Long-stay discount ({_breakdown.discount.rate}%)</span>
                          <b>- {fmt$(_breakdown.discount.amount)}</b>
                        </div>
                      )}
                    </>
                  )}

                  <div className={showBreakdown ? 'row breakdown-total' : 'row total'}>
                    <span>Total Price</span>
                    <b>{fmt$(totalPrice)}</b>
                  </div>
                </>
              );
            })()}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default EditBooking;
