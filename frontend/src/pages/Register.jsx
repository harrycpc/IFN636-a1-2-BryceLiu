import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/auth/register', formData);
      alert('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-purple-100 to-purple-200 p-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Create Account
          </h1>
          <p className="text-gray-700 text-lg leading-8">
            Register to explore available cars, create bookings, and manage your rental records in one place.
          </p>

          <div className="mt-8 bg-white/70 rounded-2xl p-6">
            <p className="text-sm text-gray-500 mb-2">Quick and Simple</p>
            <p className="text-gray-700">
              Create your account in a few steps and start using the booking system immediately.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Register
            </h2>
            <p className="text-gray-500 text-center mb-8">
              Create your account to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

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
                Register
              </button>
            </form>

            <p className="text-center text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 font-medium hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;