import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import { fmt$ } from '../utils/format';

const CarDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [pricingInfo, setPricingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const [carResponse, reviewsResponse] = await Promise.all([
          axiosInstance.get(`/api/cars/${id}`),
          axiosInstance.get(`/api/reviews/car/${id}`),
        ]);
        // fetch public pricing rules for display
        const pricingResponse = await axiosInstance.get('/api/pricing/public');

        setCar(carResponse.data);
        setReviews(reviewsResponse.data);
        setPricingInfo(pricingResponse.data);
      } catch (error) {
        setCar(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axiosInstance.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const remaining = reviews.filter((r) => r._id !== reviewId);
      setReviews(remaining);
      setCar((prev) => {
        if (!prev) return prev;
        const reviewCount = remaining.length;
        const averageRating = reviewCount
          ? Number(
              (
                remaining.reduce((sum, r) => sum + Number(r.rating), 0) /
                reviewCount
              ).toFixed(1)
            )
          : 0;
        return { ...prev, reviewCount, averageRating };
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete review.');
    }
  };

  if (loading) {
    return (
      <main className="container">
        <div className="empty-card">
          <h3 className="h-display">Loading…</h3>
        </div>
      </main>
    );
  }

  if (!car) {
    return (
      <main className="container">
        <div className="empty-card">
          <h3 className="h-display">Car not found.</h3>
          <Link to="/cars" className="btn-link">
            ← Back to Browse Cars
          </Link>
        </div>
      </main>
    );
  }

  const unavailable = car.availability === 'Unavailable';

  return (
    <main className="container detail-shell">
      <button className="back-link" onClick={() => navigate('/cars')}>
        <Icon name="arrow-left" size={16} stroke={2} /> Back to Browse Cars
      </button>

      <div className="detail-grid">
        <div className="detail-media">
          <img src={car.image} alt={car.name} />
        </div>

        <div className="detail-info">
          <div className="detail-card">
            <h1 className="h-display detail-title">{car.name}</h1>
            <p className="detail-type">{car.type}</p>
            <p className="detail-rating">
              {car.reviewCount > 0 ? (
                <>
                  Rating: <b>{Number(car.averageRating).toFixed(1)}/5</b> · from{' '}
                  {car.reviewCount} review{car.reviewCount !== 1 ? 's' : ''}
                </>
              ) : (
                <>No reviews yet</>
              )}
            </p>

            <div className="spec-grid">
              <div className="spec">
                <div className="k">Location</div>
                <div className="v">{car.location}</div>
              </div>
              <div className="spec">
                <div className="k">Price per day</div>
                <div className="v">{fmt$(car.pricePerDay)}</div>
              </div>
              <div className="spec">
                <div className="k">Seats</div>
                <div className="v">{car.seats}</div>
              </div>
              <div className="spec">
                <div className="k">Transmission</div>
                <div className="v">{car.transmission}</div>
              </div>
            </div>

            <div className="detail-desc">
              <div className="k">Description</div>
              <p>{car.description || 'No description provided.'}</p>
            </div>
          </div>

          {pricingInfo && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Pricing Info</h2>

                <p className="text-gray-700 mb-2">Base price: <span
                    className="font-semibold">${car.pricePerDay}/day</span></p>
                <p className="text-gray-700 mb-2">Weekend surcharge
                  (Fri–Sun): <span>{pricingInfo.weekendSurchargeRate}%</span></p>

                <div className="mb-2">
                  <p className="text-gray-700 mb-2">Long-stay discounts:</p>
                  {pricingInfo.longStayRules.length === 0 ? (
                      <p className="text-gray-500">No long-stay discounts configured.</p>
                  ) : (
                      <ul className="text-gray-700 list-disc list-inside">
                        {pricingInfo.longStayRules.map((r) => (
                            <li key={r._id}>{r.minDays}+ days: {r.discountRate}%</li>
                        ))}
                      </ul>
                  )}
                </div>
              </div>
          )}

          <div className="detail-card book-cta">
            <div className="book-cta-head">
              <h2 className="h-display">Booking Summary</h2>
              <span
                className={'card-avail ' + (unavailable ? 'is-off' : 'is-on')}
              >
                <span className="dot"></span>
                {car.availability}
              </span>
            </div>
            <p>
              {isAdmin
                ? 'This car can be updated from the admin fleet management page.'
                : unavailable
                ? 'This car is currently unavailable for booking.'
                : 'This car is ready for booking. Continue to the booking page to enter pickup and return details.'}
            </p>
            {isAdmin ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate(`/admin/cars?editCarId=${car._id}`)}
              >
                Modify Car Info
              </button>
            ) : unavailable ? (
              <button type="button" className="btn-primary" disabled>
                Unavailable
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  navigate(`/bookings/create?carId=${car._id}`)
                }
              >
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="detail-card reviews-card">
        <h2 className="h-display reviews-title">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="reviews-empty">
            No reviews have been posted for this car.
          </p>
        ) : (
          <ul className="review-list">
            {reviews.map((r) => (
              <li className="review" key={r._id}>
                <header>
                  <div className="who">
                    <span className="avatar">
                      {(r.userId?.name || 'C')[0]}
                    </span>
                    <b>{r.userId?.name || 'Customer'}</b>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="rating-pill">{r.rating}/5</span>
                    {r.userId?._id === user?.id && (
                      <button
                        type="button"
                        className="btn-ghost-sm"
                        onClick={() => handleDeleteReview(r._id)}
                      >
                        <Icon name="trash" size={12} stroke={2} /> Delete
                      </button>
                    )}
                  </div>
                </header>
                <p>{r.comment || 'No comment provided.'}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default CarDetails;
