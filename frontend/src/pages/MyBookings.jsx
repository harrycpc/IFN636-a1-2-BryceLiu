import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get('/api/bookings', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        setBookings(response.data);
      } catch (error) {
        alert('Failed to fetch bookings.');
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

      setBookings(bookings.filter((booking) => booking._id !== id));
      alert('Booking cancelled successfully.');
    } catch (error) {
      alert('Failed to cancel booking.');
    }
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
            to="/bookings/create"
            className="inline-block bg-purple-500 text-white px-5 py-3 rounded-full font-medium hover:bg-purple-600 transition"
          >
            Create New Booking
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No bookings found
            </h2>
            <p className="text-gray-500 mb-6">
              You have not created any bookings yet.
            </p>
            <Link
              to="/cars"
              className="inline-block bg-purple-500 text-white px-5 py-3 rounded-full font-medium hover:bg-purple-600 transition"
            >
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="grid lg:grid-cols-3 gap-6 items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center text-3xl">
                      🚗
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        Booking Record
                      </h2>
                      <p className="text-gray-500 text-sm">
                        Car: {booking.carId?.name || booking.carId?._id || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>Pickup:</strong> {booking.pickupLocation}
                    </p>
                    <p>
                      <strong>Dropoff:</strong> {booking.dropoffLocation}
                    </p>
                    <p>
                      <strong>Pickup Date:</strong>{' '}
                      {booking.pickupDate?.slice(0, 10)}
                    </p>
                    <p>
                      <strong>Return Date:</strong>{' '}
                      {booking.returnDate?.slice(0, 10)}
                    </p>
                  </div>

                  <div className="flex flex-col lg:items-end gap-4">
                    <div className="text-left lg:text-right">
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="text-2xl font-bold text-gray-800">
                        ${booking.totalPrice}
                      </p>
                    </div>

                    <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium capitalize">
                      {booking.bookingStatus}
                    </span>

                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="bg-red-400 text-white px-5 py-2.5 rounded-full font-medium hover:bg-red-500 transition"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;