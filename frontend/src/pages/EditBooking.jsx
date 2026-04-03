import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const EditBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const locationOptions = [
    'Brisbane',
    'Gold Coast',
    'Brisbane Airport',
  ];

  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);

  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    returnDate: '',
    totalPrice: 0,
    bookingStatus: 'pending',
    carId: '',
  });

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);

        const { data } = await axiosInstance.get(`/api/bookings/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const carData = data.carId || null;

        setSelectedCar(carData);

        setFormData({
          pickupLocation: data.pickupLocation || '',
          dropoffLocation: data.dropoffLocation || '',
          pickupDate: data.pickupDate ? data.pickupDate.slice(0, 10) : '',
          returnDate: data.returnDate ? data.returnDate.slice(0, 10) : '',
          totalPrice: data.totalPrice || 0,
          bookingStatus: data.bookingStatus || 'pending',
          carId: carData?._id || data.carId || '',
        });
      } catch (error) {
        console.error('Failed to load booking details:', error);
        alert('Failed to load booking details.');
        navigate('/bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, user, navigate]);

  const dailyPrice = useMemo(() => {
    return Number(selectedCar?.pricePerDay || 0);
  }, [selectedCar]);

  const rentalDays = useMemo(() => {
    if (!formData.pickupDate || !formData.returnDate) return 0;

    const pickup = new Date(`${formData.pickupDate}T00:00:00`);
    const dropoff = new Date(`${formData.returnDate}T00:00:00`);

    const diffTime = dropoff - pickup;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }, [formData.pickupDate, formData.returnDate]);

  useEffect(() => {
    const calculatedTotal = rentalDays * dailyPrice;

    setFormData((prev) => ({
      ...prev,
      totalPrice: calculatedTotal,
    }));
  }, [rentalDays, dailyPrice]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pickupLocation || !formData.dropoffLocation) {
      alert('Please select both pickup and dropoff locations.');
      return;
    }

    if (!formData.pickupDate || !formData.returnDate) {
      alert('Please select both pickup and return dates.');
      return;
    }

    if (rentalDays <= 0) {
      alert('Return date must be after pickup date.');
      return;
    }

    try {
      await axiosInstance.put(
        `/api/bookings/${id}`,
        {
          pickupLocation: formData.pickupLocation,
          dropoffLocation: formData.dropoffLocation,
          pickupDate: formData.pickupDate,
          returnDate: formData.returnDate,
          totalPrice: Number(formData.totalPrice),
          bookingStatus: formData.bookingStatus,
          carId: formData.carId,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      alert('Booking updated successfully.');
      navigate('/bookings');
    } catch (error) {
      console.error(error);
      alert('Failed to update booking.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-500">
            Loading booking details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/bookings" className="text-purple-600 hover:underline">
            ← Back to My Bookings
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Edit Booking
            </h1>
            <p className="text-gray-500 mb-8">
              Update your trip details and save the changes.
            </p>

            {selectedCar && (
              <div className="mb-6 bg-purple-50 border border-purple-100 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Selected Car
                </h2>
                <p className="text-gray-700">
                  <span className="font-medium">Car:</span>{' '}
                  {selectedCar.name} ({selectedCar.type})
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Price per day:</span> ${dailyPrice}
                </p>
              </div>
            )}

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
                    min={today}
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
                    min={formData.pickupDate || today}
                    value={formData.returnDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Days
                  </label>
                  <input
                    type="number"
                    value={rentalDays}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Price
                  </label>
                  <input
                    type="number"
                    value={formData.totalPrice}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-500 text-white py-3 rounded-full font-medium hover:bg-purple-600 transition"
              >
                Save Changes
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 h-fit">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Updated Summary
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
                <p className="text-sm text-gray-500">Rental Days</p>
                <p className="font-semibold">
                  {rentalDays || 'Not calculated'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Price Per Day</p>
                <p className="font-semibold">
                  {dailyPrice ? `$${dailyPrice}` : 'Not available'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="font-semibold">
                  {formData.totalPrice ? `$${formData.totalPrice}` : 'Not calculated'}
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

export default EditBooking;