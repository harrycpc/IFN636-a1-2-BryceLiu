import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';

const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await axiosInstance.get(`/api/cars/${id}`);
        setCar(response.data);
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
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                  {car.availability}
                </span>
              </div>

              <p className="text-gray-600 mb-6">
                This car is ready for booking. Continue to the booking page to enter pickup and return details.
              </p>

              <Link
                to={`/bookings/create?carId=${car._id}`}
                className="inline-block w-full text-center bg-purple-500 text-white px-5 py-3 rounded-full font-medium hover:bg-purple-600 transition"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;