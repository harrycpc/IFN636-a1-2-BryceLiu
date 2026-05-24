import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Brand from '../components/Brand';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const set = (k, v) => {
    setFormData((f) => ({ ...f, [k]: v }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      setError('Enter a valid email.');
      return;
    }
    try {
      await axiosInstance.post('/api/auth/register', formData);
      alert('Registration successful. Please log in.');
      navigate('/login');
    } catch (err) {
      const serverMessage =
        err.response?.data?.errors?.join(', ') ||
        err.response?.data?.message;
      setError(serverMessage || err.message || 'Registration failed.');
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-brandline">
            <Brand />
          </div>

          <h1 className="h-display">Sign Up</h1>
          <p className="sub">Create your account to start using the system.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-stack">
              <label>Name</label>
              <input
                className="input"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            <div className="field-stack">
              <label>Email</label>
              <input
                className="input"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>
            <div className="field-stack">
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => set('password', e.target.value)}
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: 8 }}
            >
              Sign Up
            </button>
          </form>

          <p className="auth-foot">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </section>

      <aside className="auth-side">
        <div className="auth-side-pattern" aria-hidden="true"></div>
        <div className="auth-side-content">
          <p className="kicker">Car Rental Booking</p>
          <div className="auth-marquee">
            Join a community of <em>students and renters.</em>
          </div>
          <div className="auth-quote">
            <p>
              "Two minutes to register, and I had keys in my hand by lunch."
            </p>
            <b>— Mei T. · Brisbane</b>
          </div>
        </div>
      </aside>
    </main>
  );
};

export default Register;
