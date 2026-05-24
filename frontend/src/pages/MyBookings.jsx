import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import { fmt$, fmtDate, daysBetween } from '../utils/format';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [reviewedBookings, setReviewedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${user.token}` };
        const [bookingsResponse, reviewsResponse] = await Promise.all([
          axiosInstance.get('/api/bookings', { headers }),
          axiosInstance.get('/api/reviews/my', { headers }),
        ]);
        const reviewedIds = reviewsResponse.data.map((r) =>
          String(r.bookingId)
        );
        setReviewedBookings(reviewedIds);
        const sorted = [...bookingsResponse.data].sort(
          (a, b) =>
            new Date(b.createdAt || b.pickupDate) -
            new Date(a.createdAt || a.pickupDate)
        );
        setBookings(sorted);
      } catch (error) {
        alert('Failed to fetch bookings.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await axiosInstance.delete(`/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (error) {
      alert('Failed to cancel booking.');
    }
  };

  const handleReviewSubmitted = (bookingId) => {
    setReviewedBookings((prev) => [...prev, bookingId]);
  };

  const myBookings = useMemo(() => bookings, [bookings]);

  if (loading) {
    return (
      <main className="container trips-shell">
        <div className="empty-card">
          <h3 className="h-display">Loading your bookings…</h3>
        </div>
      </main>
    );
  }

  if (myBookings.length === 0) {
    return (
      <main className="container trips-shell">
        <div className="trips-head">
          <div>
            <h1 className="h-display trips-title">My Bookings</h1>
            <p className="trips-sub">
              View and manage your booking records.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary-sm"
            onClick={() => navigate('/cars')}
          >
            Book Another Car
          </button>
        </div>
        <div className="empty-card">
          <h3 className="h-display">No bookings found</h3>
          <p>You have not created any bookings yet.</p>
          <button
            type="button"
            className="btn-primary"
            style={{ maxWidth: 200, marginTop: 16 }}
            onClick={() => navigate('/cars')}
          >
            Browse Cars
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container trips-shell">
      <div className="trips-head">
        <div>
          <h1 className="h-display trips-title">My Bookings</h1>
          <p className="trips-sub">View and manage your booking records.</p>
        </div>
        <button
          type="button"
          className="btn-primary-sm"
          onClick={() => navigate('/cars')}
        >
          Book Another Car
        </button>
      </div>

      <div className="trip-list">
        {myBookings.map((b) => {
          const car = b.carId || {};
          const days = daysBetween(b.pickupDate, b.returnDate);
          const alreadyReviewed = reviewedBookings.includes(b._id);
          return (
            <article key={b._id} className="trip">
              <div className="trip-car">
                <img src={car.image} alt={car.name || 'Car'} />
                <div>
                  <h3>{car.name || 'Car Name'}</h3>
                  <p className="trip-type">{car.type || 'Vehicle'}</p>
                  <div className="trip-pills">
                    <span className="pill subtle">
                      {car.location || 'Location not set'}
                    </span>
                    <span className="pill subtle">
                      {fmt$(car.pricePerDay || 0)}/day
                    </span>
                  </div>
                </div>
              </div>

              <div className="trip-grid">
                <div className="cell">
                  <div className="k">Pickup</div>
                  <div className="v">{b.pickupLocation}</div>
                </div>
                <div className="cell">
                  <div className="k">Dropoff</div>
                  <div className="v">{b.dropoffLocation}</div>
                </div>
                <div className="cell">
                  <div className="k">Pickup Date</div>
                  <div className="v">{fmtDate(b.pickupDate)}</div>
                </div>
                <div className="cell">
                  <div className="k">Return Date</div>
                  <div className="v">{fmtDate(b.returnDate)}</div>
                </div>
                <div className="cell full">
                  <div className="k">Rental Duration</div>
                  <div className="v">
                    {days} day{days !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="trip-side">
                <div className="trip-total">
                  <span className="k">Total Price</span>
                  <span className="v">{fmt$(b.totalPrice)}</span>
                </div>
                <span className={'status-pill ' + b.bookingStatus}>
                  {b.bookingStatus}
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(`/bookings/edit/${b._id}`)}
                >
                  Edit Booking
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => handleCancel(b._id)}
                >
                  Cancel Booking
                </button>
              </div>

              {b.bookingStatus === 'completed' && !alreadyReviewed && (
                <ReviewForm
                  booking={b}
                  onSubmitted={handleReviewSubmitted}
                />
              )}
              {alreadyReviewed && (
                <p className="trip-reviewed">
                  ✓ Review submitted for this booking.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
};

export default MyBookings;
