import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import AdminShell from '../components/AdminShell';
import { fmt$, fmtDateShort } from '../utils/format';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [carsRes, bookingsRes] = await Promise.all([
          axiosInstance.get('/api/cars'),
          axiosInstance.get('/api/bookings/admin/all', { headers }),
        ]);
        setCars(carsRes.data);
        setBookings(bookingsRes.data);
      } catch (error) {
        alert('Failed to load admin dashboard.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetch();
  }, [user]);

  const stats = useMemo(() => {
    const activeBookings = bookings.filter((b) =>
      ['pending', 'confirmed'].includes(b.bookingStatus)
    ).length;
    const totalRevenue = bookings
      .filter((b) => b.bookingStatus !== 'cancelled')
      .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
    return {
      totalCars: cars.length,
      activeBookings,
      totalRevenue,
    };
  }, [cars, bookings]);

  return (
    <AdminShell>
      <div className="admin-head">
        <div>
          <h1 className="h-display">Admin Dashboard</h1>
          <p className="sub">Monitor fleet and booking activity.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn-primary-sm"
            onClick={() => navigate('/admin/cars')}
          >
            Manage Cars
          </button>
          <button
            type="button"
            className="btn-secondary-sm"
            onClick={() => navigate('/admin/bookings')}
          >
            Manage Bookings
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-card">
          <h3 className="h-display">Loading admin data…</h3>
        </div>
      ) : (
        <>
          <div className="admin-stats">
            <div className="admin-stat">
              <div className="k">Total Cars</div>
              <div className="v">{stats.totalCars}</div>
            </div>
            <div className="admin-stat">
              <div className="k">Active Bookings</div>
              <div className="v">{stats.activeBookings}</div>
            </div>
            <div className="admin-stat">
              <div className="k">Total Revenue</div>
              <div className="v">{fmt$(stats.totalRevenue)}</div>
            </div>
          </div>

          <section className="profile-card admin-recent">
            <h3>Recent bookings</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Dates</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => {
                  const u = b.userId || {};
                  const c = b.carId || {};
                  return (
                    <tr key={b._id}>
                      <td>
                        <div className="who-cell">
                          <span className="avatar">
                            {(u.name || '?')[0]}
                          </span>
                          <div>
                            <b>{u.name || 'Unknown user'}</b>
                            <span>{u.email || ''}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="car-cell">
                          <img src={c.image} alt="" />
                          <div className="car-name">
                            <b>{c.name || 'Unknown car'}</b>
                            <span>{c.type}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--ink-soft)' }}>
                        {fmtDateShort(b.pickupDate)} – {fmtDateShort(b.returnDate)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {fmt$(b.totalPrice)}
                      </td>
                      <td>
                        <span className={'status-pill ' + b.bookingStatus}>
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: 48,
                        textAlign: 'center',
                        color: 'var(--ink-soft)',
                      }}
                    >
                      No bookings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </AdminShell>
  );
};

export default AdminDashboard;
