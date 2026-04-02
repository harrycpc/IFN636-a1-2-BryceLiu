import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/cars');
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-purple-100 to-purple-200 p-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome Back
          </h1>
          <p className="text-gray-700 text-lg leading-8">
            Sign in to browse available cars, view details, and manage your bookings
            more easily.
          </p>

          <div className="mt-8 bg-white/70 rounded-2xl p-6">
            <p className="text-sm text-gray-500 mb-2">Car Rental Booking System</p>
            <p className="text-gray-700">
              Simple booking process, clean interface, and convenient access to your car rental information.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Login
            </h2>
            <p className="text-gray-500 text-center mb-8">
              Enter your account details to continue
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-500 text-white py-3 rounded-full font-medium hover:bg-purple-600 transition"
              >
                Login
              </button>
            </form>

            <p className="text-center text-gray-500 mt-6">
              Don’t have an account?{' '}
              <Link to="/register" className="text-purple-600 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;