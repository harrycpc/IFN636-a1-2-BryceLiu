import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { getPublicPricing } from '../api/pricingApi';
import { calculateTotalPrice } from '../utils/pricing';
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

  // Single source of truth for form inputs + price data
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    returnDate: '',
    // price fields (populated by pricing API)
    totalPrice: 0,
    breakdown: null,
  });
  // Helper to update single-field on formData
  const set = (k, v) => setFormData((f) => ({ ...f, [k]: v }));

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
    () => daysBetween(formData.pickupDate, formData.returnDate),
    [formData.pickupDate, formData.returnDate]
  );

  const dailyPrice = useMemo(() => {
    return Number(selectedCar?.pricePerDay || selectedCar?.price || 0);
  }, [selectedCar]);

  useEffect(() => {
    const updateTotalPrice = async () => {
      const fallbackTotal = days * dailyPrice;

      // fetch public pricing rules once and compute breakdown for display
      try {
        const pricing = await getPublicPricing();
        // compute total price using current dates
        const calc = calculateTotalPrice(dailyPrice, formData.pickupDate, formData.returnDate, pricing.longStayRules, pricing.weekendSurchargeRate);
        // Preserve other form fields while writing calculated total and breakdown
        setFormData((prev) => ({...prev, totalPrice: calc.total, breakdown: calc.breakdown}));
      } catch (err) {
        // fallback to basic calculation
        setFormData((prev) => ({...prev, totalPrice: fallbackTotal}));
      }
    };

    updateTotalPrice();
    // include pickupDate/returnDate explicitly to satisfy react-hooks/exhaustive-deps
  }, [days, dailyPrice, formData.pickupDate, formData.returnDate]);

  const canSubmit =
    formData.pickupLocation &&
    formData.dropoffLocation &&
    formData.pickupDate &&
    formData.returnDate &&
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
          pickupLocation: formData.pickupLocation,
          dropoffLocation: formData.dropoffLocation,
          pickupDate: formData.pickupDate,
          returnDate: formData.returnDate,
          // prefer the calculated total if available, otherwise fall back to base total
          totalPrice: Number(formData.totalPrice),
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

  // breakdown visibility helpers: only show breakdown if there's any surcharge or discount
  const _breakdown = formData.breakdown || null;
  const hasSurcharge = Boolean(_breakdown && Number(_breakdown.weekend?.surcharge || 0) > 0);
  const hasDiscount = Boolean(_breakdown && Number(_breakdown.discount?.amount || 0) > 0);
  const showBreakdown = Boolean(_breakdown && (hasSurcharge || hasDiscount));

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
              value={formData.pickupLocation}
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
              value={formData.dropoffLocation}
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
                value={formData.pickupDate}
                onChange={(e) => set('pickupDate', e.target.value)}
              />
            </div>
            <div className="field-stack">
              <label>Return Date</label>
              <input
                className="input"
                type="date"
                min={formData.pickupDate || today}
                value={formData.returnDate}
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
                  // show authoritative total without extra rounding/formatting
                  value={formData.totalPrice ? fmt$(formData.totalPrice) : '—'}
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

              {/* price breakdown card removed from here - breakdown now shown inside Total Price row */}

            <div className="row">
              <span>Pickup Location</span>
              <b>{formData.pickupLocation || 'Not selected'}</b>
            </div>
            <div className="row">
              <span>Dropoff Location</span>
              <b>{formData.dropoffLocation || 'Not selected'}</b>
            </div>
            <div className="row">
              <span>Pickup Date</span>
              <b>
                {formData.pickupDate ? fmtDate(formData.pickupDate) : 'Not selected'}
              </b>
            </div>
            <div className="row">
              <span>Return Date</span>
              <b>
                {formData.returnDate ? fmtDate(formData.returnDate) : 'Not selected'}
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

            {/* Price breakdown: show components first, then Total Price row */}
            {showBreakdown && (
                <>
                  {/* Always show base when any surcharge/discount present */}
                  <div className="row breakdown-start">
                    <span>Base</span>
                    <b>{fmt$(_breakdown.base)}</b>
                  </div>

                  {/* Conditionally show weekend surcharge only when > 0 */}
                  {hasSurcharge && (
                      <div className="row">
                        <span>Weekend surcharge ({_breakdown.weekend.rate}%)</span>
                        <b>+ {fmt$(_breakdown.weekend.surcharge)}</b>
                      </div>
                  )}

                  {/* Conditionally show long-stay discount only when > 0 */}
                  {hasDiscount && (
                      <div className="row">
                        <span>Long-stay discount ({_breakdown.discount.rate}%)</span>
                        <b>- {fmt$(_breakdown.discount.amount)}</b>
                      </div>
                  )}
                </>
            )}

            <div className={showBreakdown ? "row breakdown-total" : "row total"}>
              <span>Total Price</span>
              <div>
                <b>{formData.totalPrice ? fmt$(formData.totalPrice) : 'Not calculated'}</b>
              </div>
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
