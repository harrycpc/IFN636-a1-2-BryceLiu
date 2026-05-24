import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name: '',
  type: '',
  location: '',
  pricePerDay: '',
  availability: 'Available',
  seats: 5,
  transmission: 'Automatic',
  description: '',
  image: '/images/default-car.png',
};

const locationOptions = [
  'Brisbane',
  'Gold Coast',
  'Brisbane Airport',
];

const transmissionOptions = ['Automatic', 'Manual'];

const ManageCars = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCarId = searchParams.get('editCarId');
  const isEditing = Boolean(editCarId);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    const fetchCar = async () => {
      if (!editCarId) {
        setFormData(emptyForm);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/cars/${editCarId}`);
        const car = response.data;

        setFormData({
          name: car.name || '',
          type: car.type || '',
          location: car.location || '',
          pricePerDay: car.pricePerDay || '',
          availability: car.availability || 'Available',
          seats: car.seats || 5,
          transmission: car.transmission || 'Automatic',
          description: car.description || '',
          image: car.image || '/images/default-car.png',
        });
      } catch (error) {
        alert('Failed to load car information.');
        navigate('/cars');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [editCarId, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      pricePerDay: Number(formData.pricePerDay),
      seats: Number(formData.seats),
    };

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      if (isEditing) {
        await axiosInstance.put(`/api/cars/${editCarId}`, payload, config);
        alert('Car information updated successfully.');
      } else {
        await axiosInstance.post('/api/cars', payload, config);
        alert('Car added successfully.');
      }

      navigate('/cars');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save car.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-500">Loading car information...</p>
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
            Back to Browse Cars
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {isEditing ? 'Update Car' : 'Add Car'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 mb-8 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <input name="type" value={formData.type} onChange={handleChange} placeholder="Type" className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50" required>
              <option value="">Select location</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price per day</label>
            <input name="pricePerDay" type="number" min="0" value={formData.pricePerDay} onChange={handleChange} placeholder="Price per day" className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seats</label>
            <input name="seats" type="number" min="1" value={formData.seats} onChange={handleChange} placeholder="Seats" className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
            <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50">
              {transmissionOptions.map((transmission) => (
                <option key={transmission} value={transmission}>
                  {transmission}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <select name="availability" value={formData.availability} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50">
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Car image</label>
            <div className="flex items-center gap-4">
              <div className="w-28 h-20 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                <img
                  src={formData.image || '/images/default-car.png'}
                  alt={formData.name || 'Car preview'}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <label className="inline-flex items-center justify-center bg-gray-200 text-gray-700 px-5 py-3 rounded-full font-medium hover:bg-gray-300 transition cursor-pointer">
                Upload Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50" rows="4" />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="bg-purple-500 text-white px-5 py-3 rounded-full font-medium hover:bg-purple-600 transition">
              {isEditing ? 'Update Car' : 'Add Car'}
            </button>
            <Link to="/cars" className="bg-gray-200 text-gray-700 px-5 py-3 rounded-full font-medium hover:bg-gray-300 transition">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageCars;
