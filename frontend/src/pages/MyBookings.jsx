import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [reviewedBookings, setReviewedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);

        const headers = {
          Authorization: `Bearer ${user.token}`,
        };

        const [bookingsResponse, reviewsResponse] = await Promise.all([
          axiosInstance.get('/api/bookings', { headers }),
          axiosInstance.get('/api/reviews/my', { headers }),
        ]);

        const response = bookingsResponse;
        const reviewedBookingIds = reviewsResponse.data.map((review) =>
          String(review.bookingId)
        );

        setReviewedBookings(reviewedBookingIds);

        const sortedBookings = [...response.data].sort(
          (a, b) => new Date(b.createdAt || b.pickupDate) - new Date(a.createdAt || a.pickupDate)
        );

        setBookings(sortedBookings);
      } catch (error) {
        alert('Failed to fetch bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (id) => {
    try {
      await axiosInstance.delete(`/api/bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setBookings((prev) => prev.filter((booking) => booking._id !== id));
      alert('Booking cancelled successfully.');
    } catch (error) {
      alert('Failed to cancel booking.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';

    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRentalDays = (pickupDate, returnDate) => {
    if (!pickupDate || !returnDate) return 0;

    const start = new Date(`${pickupDate.slice(0, 10)}T00:00:00`);
    const end = new Date(`${returnDate.slice(0, 10)}T00:00:00`);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusClasses = (status) => {
    const value = String(status || '').toLowerCase();

    if (value === 'pending') {
      return 'bg-amber-100 text-amber-700';
    }
    if (value === 'confirmed') {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (value === 'cancelled') {
      return 'bg-red-100 text-red-700';
    }

    return 'bg-gray-100 text-gray-700';
  };

  const handleReviewSubmitted = (bookingId) => {
    setReviewedBookings((prev) => [...prev, bookingId]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
            <p className="text-gray-500 mt-1">
              View and manage your booking records
            </p>
          </div>

          <Link
            to="/cars"
            className="inline-flex items-center justify-center bg-purple-500 text-white px-5 py-3 rounded-full font-medium hover:bg-purple-600 transition"
          >
            Book Another Car
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-500">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No bookings found
            </h2>
            <p className="text-gray-500 mb-6">
              You have not created any bookings yet.
            </p>
            <Link
              to="/cars"
              className="inline-flex items-center justify-center bg-purple-500 text-white px-5 py-3 rounded-full font-medium hover:bg-purple-600 transition"
            >
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const rentalDays = getRentalDays(
                booking.pickupDate,
                booking.returnDate
              );

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                >
                  <div className="grid lg:grid-cols-[220px_1fr_190px] gap-5 items-center">
                    <div className="flex flex-col gap-3">
                      <div className="w-full h-32 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                        <img
                          src={booking.carId?.image || '/images/default-car.png'}
                          alt={booking.carId?.name || 'Car'}
                          className="w-full h-full object-contain p-3"
                        />
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {booking.carId?.name || 'Car Name'}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {booking.carId?.type || 'Vehicle'}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                            {booking.carId?.location || 'Location not set'}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                            ${booking.carId?.pricePerDay || 0}/day
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Pickup</p>
                        <p className="font-semibold text-gray-800">
                          {booking.pickupLocation}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Dropoff</p>
                        <p className="font-semibold text-gray-800">
                          {booking.dropoffLocation}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Pickup Date</p>
                        <p className="font-semibold text-gray-800">
                          {formatDate(booking.pickupDate)}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Return Date</p>
                        <p className="font-semibold text-gray-800">
                          {formatDate(booking.returnDate)}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                        <p className="text-sm text-gray-500 mb-1">Rental Duration</p>
                        <p className="font-semibold text-gray-800">
                          {rentalDays} day{rentalDays !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <div className="text-left lg:text-right">
                        <p className="text-sm text-gray-500">Total Price</p>
                        <p className="text-3xl font-bold text-gray-800">
                          ${booking.totalPrice}
                        </p>
                      </div>

                      <span
                        className={`inline-flex justify-center items-center px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusClasses(
                          booking.bookingStatus
                        )}`}
                      >
                        {booking.bookingStatus}
                      </span>

                      <Link
                        to={`/bookings/edit/${booking._id}`}
                        className="w-full lg:w-auto text-center bg-blue-500 text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-600 transition"
                      >
                        Edit Booking
                      </Link>

                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="w-full lg:w-auto bg-red-500 text-white px-5 py-2.5 rounded-full font-medium hover:bg-red-600 transition"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </div>

                  {booking.bookingStatus === 'completed' && !reviewedBookings.includes(booking._id) && (
                    <ReviewForm booking={booking} onSubmitted={handleReviewSubmitted} />
                  )}

                  {reviewedBookings.includes(booking._id) && (
                    <p className="mt-4 border-t border-gray-100 pt-4 text-sm text-green-700">
                      Review submitted for this booking.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
