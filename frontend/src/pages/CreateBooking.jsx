import { useState, useEffect, useMemo } from 'react';
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

  const [selectedCar, setSelectedCar] = useState(null);
  const [loadingCar, setLoadingCar] = useState(false);

  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    returnDate: '',
    totalPrice: 0,
    bookingStatus: 'pending',
    carId: searchParams.get('carId') || '',
  });

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!formData.carId) return;

      try {
        setLoadingCar(true);
        const { data } = await axiosInstance.get(`/api/cars/${formData.carId}`);
        setSelectedCar(data);
      } catch (error) {
        console.error('Failed to load car details:', error);
      } finally {
        setLoadingCar(false);
      }
    };

    fetchCarDetails();
  }, [formData.carId]);

  const dailyPrice = useMemo(() => {
    return Number(selectedCar?.pricePerDay || selectedCar?.price || 0);
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    if (!formData.carId) {
      alert('Car ID is missing.');
      return;
    }

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
      console.error(error);
      alert('Failed to create booking.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

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

            {selectedCar && (
              <div className="mb-6 bg-purple-50 border border-purple-100 rounded-2xl p-5 flex gap-4 items-center">
                <div className="w-28 h-20 bg-white rounded-xl overflow-hidden border border-purple-100 flex items-center justify-center">
                  <img
                    src={selectedCar.image || '/images/default-car.png'}
                    alt={selectedCar.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div>
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
                  <p className="text-gray-700">
                    <span className="font-medium">Seats:</span> {selectedCar.seats}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Transmission:</span> {selectedCar.transmission}
                  </p>
                </div>
              </div>
            )}

            {loadingCar && (
              <div className="mb-6 text-sm text-gray-500">
                Loading car details...
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
                    name="totalPrice"
                    value={formData.totalPrice}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
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

            {selectedCar && (
              <div className="mb-6">
                <div className="w-full h-64 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedCar.image || '/images/default-car.png'}
                    alt={selectedCar.name}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 text-gray-700">
              {selectedCar && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Seats</p>
                    <p className="font-semibold">{selectedCar.seats}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Transmission</p>
                    <p className="font-semibold">{selectedCar.transmission}</p>
                  </div>
                </div>
              )}

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

export default CreateBooking;
