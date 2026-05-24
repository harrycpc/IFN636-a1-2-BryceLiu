import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    university: '',
    address: '',
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [profileRes, bookingsRes] = await Promise.all([
          axiosInstance.get('/api/auth/profile', { headers }),
          axiosInstance
            .get('/api/bookings', { headers })
            .catch(() => ({ data: [] })),
        ]);
        setForm({
          name: profileRes.data.name || '',
          email: profileRes.data.email || '',
          university: profileRes.data.university || '',
          address: profileRes.data.address || '',
        });
        setBookings(bookingsRes.data || []);
      } catch (error) {
        alert('Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put('/api/auth/profile', form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2400);
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    }
  };

  const trips = bookings.length;
  const completed = bookings.filter(
    (b) => b.bookingStatus === 'completed'
  ).length;
  const initial = (form.name || user?.name || '?')[0]?.toUpperCase() || '?';

  if (loading) {
    return (
      <main className="container profile-shell">
        <div className="empty-card">
          <h3 className="h-display">Loading…</h3>
        </div>
      </main>
    );
  }

  return (
    <main className="container profile-shell">
      <aside className="profile-side">
        <div className="profile-card">
          <div className="avatar-xl">{initial}</div>
          <h2>{form.name || 'Your Profile'}</h2>
          <p className="profile-email">{form.email || '—'}</p>
        </div>
        <div className="profile-card">
          <h3>At a glance</h3>
          <div className="profile-stat">
            <span className="k">Total bookings</span>
            <span className="v">{trips}</span>
          </div>
          <div className="profile-stat">
            <span className="k">Completed</span>
            <span className="v">{completed}</span>
          </div>
          <div className="profile-stat">
            <span className="k">Role</span>
            <span className="v" style={{ textTransform: 'capitalize' }}>
              {user?.role || 'user'}
            </span>
          </div>
        </div>
      </aside>

      <section className="profile-main">
        <h1 className="h-display">Your Profile</h1>
        <p className="sub">Keep your account details up to date.</p>

        <form onSubmit={handleSubmit}>
          <div className="profile-card">
            <h3>Account</h3>
            <div className="field-stack">
              <label>Name</label>
              <input
                className="input"
                placeholder="Name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            <div className="field-stack">
              <label>Email</label>
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>
          </div>

          <div className="profile-card">
            <h3>Details</h3>
            <div className="field-stack">
              <label>University</label>
              <input
                className="input"
                placeholder="University"
                value={form.university}
                onChange={(e) => set('university', e.target.value)}
              />
            </div>
            <div className="field-stack">
              <label>Address</label>
              <input
                className="input"
                placeholder="Address"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
              />
            </div>
          </div>

          <div
            style={{ display: 'flex', alignItems: 'center', gap: 16 }}
          >
            <button
              type="submit"
              className="btn-primary"
              style={{ maxWidth: 220 }}
            >
              Update Profile
            </button>
            {savedAt && (
              <span
                style={{
                  color: 'oklch(0.5 0.16 150)',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                ✓ Saved
              </span>
            )}
          </div>
        </form>
      </section>
    </main>
  );
};

export default Profile;
