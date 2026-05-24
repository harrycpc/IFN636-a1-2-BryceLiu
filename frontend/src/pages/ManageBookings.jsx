import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import AdminShell from '../components/AdminShell';
import Icon from '../components/Icon';
import { fmt$, fmtDateShort } from '../utils/format';
import { BOOKING_STATUSES } from '../utils/constants';

const ManageBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axiosInstance.get(
          '/api/bookings/admin/all',
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setBookings(response.data);
      } catch (error) {
        alert('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetch();
  }, [user]);

  const handleStatusChange = async (id, bookingStatus) => {
    try {
      const response = await axiosInstance.patch(
        `/api/bookings/${id}/status`,
        { bookingStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? response.data : b))
      );
    } catch (error) {
      alert('Failed to update booking status.');
    }
  };

  const filtered = useMemo(() => {
    let list = bookings;
    if (filter !== 'all')
      list = list.filter((b) => b.bookingStatus === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((b) => {
        const u = b.userId || {};
        const c = b.carId || {};
        return (
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (c.name || '').toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [bookings, filter, search]);

  const counts = useMemo(() => {
    const map = { all: bookings.length };
    BOOKING_STATUSES.forEach((s) => {
      map[s] = bookings.filter((b) => b.bookingStatus === s).length;
    });
    return map;
  }, [bookings]);

  return (
    <AdminShell>
      <div className="admin-head">
        <div>
          <h1 className="h-display">Manage Bookings</h1>
          <p className="sub">
            Review and update reservation statuses across the fleet.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="empty-card">
          <h3 className="h-display">Loading bookings…</h3>
        </div>
      ) : (
        <>
          <div className="admin-toolbar">
            <div className="seg-tabs">
              {['all', ...BOOKING_STATUSES].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={'seg-tab' + (filter === s ? ' is-active' : '')}
                  onClick={() => setFilter(s)}
                >
                  <span className="cap">{s}</span>
                  <span className="seg-count">{counts[s] || 0}</span>
                </button>
              ))}
            </div>
            <label className="search-input">
              <Icon name="search" size={16} stroke={2} />
              <input
                type="text"
                placeholder="Search customer or car"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>

          <div className="profile-card" style={{ padding: 0 }}>
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
                {filtered.map((b) => {
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
                        {fmtDateShort(b.pickupDate)} to{' '}
                        {fmtDateShort(b.returnDate)}
                      </td>
                      <td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {fmt$(b.totalPrice)}
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={b.bookingStatus}
                          onChange={(e) =>
                            handleStatusChange(b._id, e.target.value)
                          }
                        >
                          {BOOKING_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s[0].toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: 48,
                        textAlign: 'center',
                        color: 'var(--ink-soft)',
                      }}
                    >
                      No bookings match those filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminShell>
  );
};

export default ManageBookings;
