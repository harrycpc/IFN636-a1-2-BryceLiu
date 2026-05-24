import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Brand from '../components/Brand';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => {
    setFormData((f) => ({ ...f, [k]: v }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter your email and password.');
      return;
    }
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate(response.data.role === 'admin' ? '/admin' : '/cars');
    } catch (err) {
      const serverMessage =
        err.response?.data?.errors?.join(', ') ||
        err.response?.data?.message;
      setError(serverMessage || err.message || 'Login failed.');
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-brandline">
            <Brand />
          </div>

          <h1 className="h-display">Login</h1>
          <p className="sub">
            Sign in to continue to the Car Rental Booking System.
          </p>

          <form onSubmit={handleSubmit} noValidate>
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
              Login
            </button>
          </form>

          <p className="auth-foot">
            Don't have an account?{' '}
            <Link to="/register">Sign up</Link>
          </p>
          <p className="auth-hint">
            Demo: <code>test@test.com</code> (user) ·{' '}
            <code>admin@admin.com</code> (admin)
          </p>
        </div>
      </section>

      <aside className="auth-side">
        <div className="auth-side-pattern" aria-hidden="true"></div>
        <div className="auth-side-content">
          <p className="kicker">Car Rental Booking</p>
          <div className="auth-marquee">
            Pick a car. Pick a city. <em>Pick up the keys.</em>
          </div>
          <div className="auth-quote">
            <p>
              "Booked at 9am, on the road by 11. The friendliest car rental in
              Brisbane I've used."
            </p>
            <b>— Daniel P. · Brisbane</b>
          </div>
        </div>
      </aside>
    </main>
  );
};

export default Login;
