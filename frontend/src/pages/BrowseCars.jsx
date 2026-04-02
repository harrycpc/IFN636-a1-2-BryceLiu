import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';

const BrowseCars = () => {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axiosInstance.get('/api/cars');
        setCars(response.data);
      } catch (error) {
        alert('Failed to fetch cars.');
      }
    };

    fetchCars();
  }, []);

  const filteredCars = cars.filter((car) =>
    car.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Browse Cars</h1>
            <p className="text-gray-500 mt-1">
              Find the right car for your trip
            </p>
          </div>

          <input
            type="text"
            placeholder="Search cars"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <div
              key={car._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              <div className="car-image-section">
                <img src={car.image} alt={car.name} className="car-image" />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{car.name}</h2>
                    <p className="text-sm text-gray-500">{car.type}</p>
                  </div>
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {car.availability}
                  </span>
                </div>

                <div className="space-y-2 text-gray-600 mb-5">
                  <p><strong>Location:</strong> {car.location}</p>
                  <p><strong>Seats:</strong> {car.seats}</p>
                  <p><strong>Price:</strong> ${car.pricePerDay}/day</p>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/cars/${car._id}`}
                    className="flex-1 text-center bg-purple-500 text-white px-4 py-2.5 rounded-full font-medium hover:bg-purple-600 transition"
                  >
                    View Details
                  </Link>

                  <Link
                    to={`/bookings/create?carId=${car._id}`}
                    className="flex-1 text-center bg-purple-100 text-purple-700 px-4 py-2.5 rounded-full font-medium hover:bg-purple-200 transition"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 shadow-sm">
            No cars found.
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCars;