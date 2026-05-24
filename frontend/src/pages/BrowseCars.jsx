import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import CarCard from '../components/CarCard';
import Icon from '../components/Icon';

const BrowseCars = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState('');
  const isAdmin = user?.role === 'admin';

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

  const filteredCars = useMemo(() => {
    if (!search) return cars;
    const q = search.toLowerCase();
    return cars.filter((c) => c.name.toLowerCase().includes(q));
  }, [cars, search]);

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    try {
      await axiosInstance.delete(`/api/cars/${carId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCars((prev) => prev.filter((c) => c._id !== carId));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete car.');
    }
  };

  return (
    <main className="container browse-shell">
      <header className="browse-head">
        <div>
          <h1 className="h-display browse-title">Browse Cars</h1>
          <p className="browse-sub">Find the right car for your trip.</p>
        </div>
        <div className="browse-controls">
          {isAdmin && (
            <button
              type="button"
              className="btn-primary-sm"
              onClick={() => navigate('/admin/cars')}
            >
              <Icon name="plus" size={14} stroke={2.4} /> Add Car
            </button>
          )}
          <label className="search-input" aria-label="Search cars">
            <Icon name="search" size={16} stroke={2} />
            <input
              type="text"
              placeholder="Search cars by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </header>

      <div className="car-grid">
        {filteredCars.map((c) => (
          <CarCard
            key={c._id}
            car={c}
            isAdmin={isAdmin}
            onOpen={() =>
              navigate(
                isAdmin ? `/admin/cars?editCarId=${c._id}` : `/cars/${c._id}`
              )
            }
            onDelete={handleDeleteCar}
          />
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="empty-card">
          <h3 className="h-display">No cars found.</h3>
          <p>Try a different search term.</p>
        </div>
      )}
    </main>
  );
};

export default BrowseCars;
