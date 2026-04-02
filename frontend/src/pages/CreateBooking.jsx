import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const CreateBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationOptions = [
    'Brisbane',
    'Gold Coast',
    'Brisbane Airport',
  ];
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    returnDate: '',
    totalPrice: '',
    bookingStatus: 'pending',
    carId: searchParams.get('carId') || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post(
        '/api/bookings',
        {
          ...formData,
          totalPrice: Number(formData.totalPrice),
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      alert('Booking created successfully.');
      navigate('/bookings');
    } catch (error) {
      alert('Failed to create booking.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link to="/cars" className="text-purple-600 hover:underline">
            ← Back to Browse Cars
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create Booking
            </h1>
            <p className="text-gray-500 mb-8">
              Enter your trip details to confirm the booking.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location
                </label>
                <select
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  <option value="">Select pickup location</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dropoff Location
                </label>
                <select
                  name="dropoffLocation"
                  value={formData.dropoffLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  <option value="">Select dropoff location</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Price
                  </label>
                  <input
                    type="number"
                    name="totalPrice"
                    placeholder="Enter total price"
                    value={formData.totalPrice}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car ID
                  </label>
                  <input
                    type="text"
                    name="carId"
                    value={formData.carId}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-500 text-white py-3 rounded-full font-medium hover:bg-purple-600 transition"
              >
                Confirm Booking
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 h-fit">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Booking Summary
            </h2>

            <div className="space-y-4 text-gray-700">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Pickup Location</p>
                <p className="font-semibold">
                  {formData.pickupLocation || 'Not selected'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Dropoff Location</p>
                <p className="font-semibold">
                  {formData.dropoffLocation || 'Not selected'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Pickup Date</p>
                <p className="font-semibold">
                  {formData.pickupDate || 'Not selected'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Return Date</p>
                <p className="font-semibold">
                  {formData.returnDate || 'Not selected'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="font-semibold">
                  {formData.totalPrice ? `$${formData.totalPrice}` : 'Not entered'}
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600">Status</p>
                <p className="font-semibold text-green-700 capitalize">
                  {formData.bookingStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;