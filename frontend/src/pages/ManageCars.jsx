import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import AdminShell from '../components/AdminShell';
import Icon from '../components/Icon';
import { fmt$ } from '../utils/format';
import {
  LOCATIONS,
  TRANSMISSIONS,
  AVAILABILITIES,
} from '../utils/constants';

const blankCar = {
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

const ManageCars = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const editCarId = searchParams.get('editCarId');
  const isEditing = Boolean(editCarId);

  const [cars, setCars] = useState([]);
  const [form, setForm] = useState(blankCar);
  const [loading, setLoading] = useState(true);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Load the full fleet for the table
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axiosInstance.get('/api/cars');
        setCars(response.data);
      } catch (error) {
        alert('Failed to load fleet.');
      }
    };
    fetchCars();
  }, []);

  // Load the editing car (or blank for add mode)
  useEffect(() => {
    const fetchCar = async () => {
      if (!editCarId) {
        setForm(blankCar);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/cars/${editCarId}`);
        const car = response.data;
        setForm({
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
        setSearchParams({});
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [editCarId, setSearchParams]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set('image', reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.type || !form.location || !form.pricePerDay) {
      alert('Please fill in name, type, location and price.');
      return;
    }
    const payload = {
      ...form,
      pricePerDay: Number(form.pricePerDay),
      seats: Number(form.seats),
    };
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      if (isEditing) {
        const { data } = await axiosInstance.put(
          `/api/cars/${editCarId}`,
          payload,
          config
        );
        setCars((prev) => prev.map((c) => (c._id === editCarId ? data : c)));
      } else {
        const { data } = await axiosInstance.post(
          '/api/cars',
          payload,
          config
        );
        setCars((prev) => [data, ...prev]);
      }
      setSearchParams({});
      setForm(blankCar);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save car.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    try {
      await axiosInstance.delete(`/api/cars/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCars((prev) => prev.filter((c) => c._id !== id));
      if (editCarId === id) setSearchParams({});
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete car.');
    }
  };

  return (
    <AdminShell>
      <div className="admin-head" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1 className="h-display">{isEditing ? 'Update Car' : 'Add Car'}</h1>
          <p className="sub">
            {isEditing
              ? `Editing ${form.name || 'car'}`
              : 'Add a new car to the fleet.'}
          </p>
        </div>
        {isEditing && (
          <button
            type="button"
            className="btn-secondary-sm"
            onClick={() => setSearchParams({})}
          >
            + Add new instead
          </button>
        )}
        <form
          onSubmit={handleSubmit}
          className="car-form profile-card"
          style={{ flexBasis: '100%' }}
        >
          {loading ? (
            <p className="sub">Loading…</p>
          ) : (
            <>
              <div className="field-grid">
                <div className="field-stack">
                  <label>Name</label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Name"
                    required
                  />
                </div>
                <div className="field-stack">
                  <label>Type</label>
                  <input
                    className="input"
                    value={form.type}
                    onChange={(e) => set('type', e.target.value)}
                    placeholder="Sedan, SUV…"
                    required
                  />
                </div>
              </div>

              <div className="field-grid">
                <div className="field-stack">
                  <label>Location</label>
                  <select
                    className="input"
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    required
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="field-stack">
                  <label>Price per day (AUD)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.pricePerDay}
                    onChange={(e) => set('pricePerDay', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field-grid">
                <div className="field-stack">
                  <label>Seats</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={form.seats}
                    onChange={(e) => set('seats', e.target.value)}
                  />
                </div>
                <div className="field-stack">
                  <label>Transmission</label>
                  <select
                    className="input"
                    value={form.transmission}
                    onChange={(e) => set('transmission', e.target.value)}
                  >
                    {TRANSMISSIONS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field-grid">
                <div className="field-stack">
                  <label>Availability</label>
                  <select
                    className="input"
                    value={form.availability}
                    onChange={(e) => set('availability', e.target.value)}
                  >
                    {AVAILABILITIES.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div className="field-stack">
                  <label>Car image</label>
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 96,
                        height: 64,
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                        overflow: 'hidden',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={form.image || '/images/default-car.png'}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                    <label
                      className="btn-secondary-sm"
                      style={{ cursor: 'pointer' }}
                    >
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="field-stack">
                <label>Description</label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Description"
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ maxWidth: 200 }}
                >
                  {isEditing ? 'Update Car' : 'Add Car'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/admin')}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 24,
          fontWeight: 400,
          margin: '32px 0 12px',
        }}
      >
        Fleet ({cars.length})
      </h3>
      <p className="sub" style={{ marginBottom: 16 }}>
        Click a row to edit, or use the delete button to remove a car.
      </p>
      <div className="profile-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Car</th>
              <th>Location</th>
              <th>Seats / Transmission</th>
              <th>Price/day</th>
              <th>Availability</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cars.map((c) => (
              <tr
                key={c._id}
                style={{ cursor: 'pointer' }}
                onClick={() => setSearchParams({ editCarId: c._id })}
              >
                <td>
                  <div className="car-cell">
                    <img src={c.image} alt="" />
                    <div className="car-name">
                      <b>{c.name}</b>
                      <span>{c.type}</span>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--ink-soft)' }}>{c.location}</td>
                <td style={{ color: 'var(--ink-soft)' }}>
                  {c.seats} · {c.transmission}
                </td>
                <td style={{ fontWeight: 600 }}>{fmt$(c.pricePerDay)}</td>
                <td>
                  <span
                    className={
                      'card-avail compact ' +
                      (c.availability === 'Unavailable' ? 'is-off' : 'is-on')
                    }
                  >
                    <span className="dot"></span>
                    {c.availability}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="row-btn danger"
                    onClick={() => handleDelete(c._id)}
                    aria-label="Delete"
                  >
                    <Icon name="trash" size={14} stroke={2} />
                  </button>
                </td>
              </tr>
            ))}
            {cars.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 48,
                    textAlign: 'center',
                    color: 'var(--ink-soft)',
                  }}
                >
                  No cars in the fleet yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
};

export default ManageCars;
