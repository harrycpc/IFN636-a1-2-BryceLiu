import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const CarDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  const getAvailabilityClasses = (availability) => {
    return availability === 'Available'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setReviews((prev) => prev.filter((review) => review._id !== reviewId));
      setCar((prev) => {
        if (!prev) return prev;

        const remainingReviews = reviews.filter((review) => review._id !== reviewId);
        const reviewCount = remainingReviews.length;
        const averageRating = reviewCount
          ? Number((remainingReviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviewCount).toFixed(1))
          : 0;

        return {
          ...prev,
          reviewCount,
          averageRating,
        };
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete review.');
    }
  };

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const [carResponse, reviewsResponse] = await Promise.all([
          axiosInstance.get(`/api/cars/${id}`),
          axiosInstance.get(`/api/reviews/car/${id}`),
        ]);

        setCar(carResponse.data);
        setReviews(reviewsResponse.data);
      } catch (error) {
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800">Car not found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link to="/cars" className="text-purple-600 hover:underline">
            ← Back to Browse Cars
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="car-detail-image">
              <img src={car.image} alt={car.name} className="car-detail-img" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{car.name}</h1>
              <p className="text-gray-500 mb-6">{car.type}</p>
              <p className="text-sm text-gray-600 mb-6">
                Rating:{' '}
                <span className="font-semibold text-gray-800">
                  {car.reviewCount ? `${car.averageRating}/5` : 'No reviews yet'}
                </span>
                {car.reviewCount ? ` from ${car.reviewCount} review${car.reviewCount !== 1 ? 's' : ''}` : ''}
              </p>

              <div className="grid grid-cols-2 gap-4 text-gray-700 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{car.location}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Price per day</p>
                  <p className="font-semibold">${car.pricePerDay}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Seats</p>
                  <p className="font-semibold">{car.seats}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Transmission</p>
                  <p className="font-semibold">{car.transmission}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-700 leading-7">{car.description}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Booking Summary</h2>
                <span className={`text-sm px-3 py-1 rounded-full ${getAvailabilityClasses(car.availability)}`}>
                  {car.availability}
                </span>
              </div>

              <p className="text-gray-600 mb-6">
                {isAdmin
                  ? 'This car can be updated from the admin fleet management page.'
                  : 'This car is ready for booking. Continue to the booking page to enter pickup and return details.'}
              </p>

              {isAdmin ? (
                <Link
                  to={`/admin/cars?editCarId=${car._id}`}
                  className="inline-block w-full text-center bg-purple-500 text-white px-5 py-3 rounded-full font-medium hover:bg-purple-600 transition"
                >
                  Modify Car Info
                </Link>
              ) : car.availability === 'Available' ? (
                <Link
                  to={`/bookings/create?carId=${car._id}`}
                  className="inline-block w-full text-center bg-purple-500 text-white px-5 py-3 rounded-full font-medium hover:bg-purple-600 transition"
                >
                  Book Now
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full text-center bg-gray-100 text-gray-400 px-5 py-3 rounded-full font-medium cursor-not-allowed"
                >
                  Unavailable
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Reviews</h2>

              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews have been posted for this car.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="font-semibold text-gray-800">
                          {review.userId?.name || 'Customer'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                            {review.rating}/5
                          </span>
                          {review.userId?._id === user?.id && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-sm bg-red-50 text-red-700 px-3 py-1 rounded-full hover:bg-red-100 transition"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 leading-7">
                        {review.comment || 'No comment provided.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
