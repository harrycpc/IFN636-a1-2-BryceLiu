import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];

const ManageBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get('/api/bookings/admin/all', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBookings(response.data);
      } catch (error) {
        alert('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleStatusChange = async (bookingId, bookingStatus) => {
    try {
      const response = await axiosInstance.patch(
        `/api/bookings/${bookingId}/status`,
        { bookingStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setBookings((prev) =>
        prev.map((booking) => (booking._id === bookingId ? response.data : booking))
      );
    } catch (error) {
      alert('Failed to update booking status.');
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Not available';
    return new Date(value).toLocaleDateString('en-AU');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Bookings</h1>

        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-sm text-gray-500">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Car</th>
                    <th className="p-4">Dates</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="border-t border-gray-100">
                      <td className="p-4">
                        <p className="font-medium text-gray-800">{booking.userId?.name || 'Unknown user'}</p>
                        <p className="text-sm text-gray-500">{booking.userId?.email}</p>
                      </td>
                      <td className="p-4 text-gray-700">{booking.carId?.name || 'Unknown car'}</td>
                      <td className="p-4 text-gray-600">
                        {formatDate(booking.pickupDate)} to {formatDate(booking.returnDate)}
                      </td>
                      <td className="p-4 font-medium text-gray-800">${booking.totalPrice}</td>
                      <td className="p-4">
                        <select
                          value={booking.bookingStatus}
                          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                          className="px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 capitalize"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
