import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [carsResponse, bookingsResponse] = await Promise.all([
          axiosInstance.get('/api/cars'),
          axiosInstance.get('/api/bookings/admin/all', { headers }),
        ]);

        setCars(carsResponse.data);
        setBookings(bookingsResponse.data);
      } catch (error) {
        alert('Failed to load admin dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const stats = useMemo(() => {
    const activeBookings = bookings.filter((booking) =>
      ['pending', 'confirmed'].includes(booking.bookingStatus)
    ).length;
    const totalRevenue = bookings
      .filter((booking) => booking.bookingStatus !== 'cancelled')
      .reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);

    return {
      totalCars: cars.length,
      activeBookings,
      totalRevenue,
    };
  }, [cars, bookings]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor fleet and booking activity</p>
          </div>

          <div className="flex gap-3">
            <Link to="/cars" className="bg-purple-500 text-white px-5 py-3 rounded-full font-medium hover:bg-purple-600 transition">
              Manage Cars
            </Link>
            <Link to="/admin/bookings" className="bg-white text-purple-700 px-5 py-3 rounded-full font-medium border border-purple-100 hover:bg-purple-50 transition">
              Manage Bookings
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-500">Loading admin data...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Total Cars</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">{stats.totalCars}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Active Bookings</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">{stats.activeBookings}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">${stats.totalRevenue}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
