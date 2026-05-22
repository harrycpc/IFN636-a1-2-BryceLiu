import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName =
    user?.name || user?.username || user?.email || 'User';
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          to={user ? '/cars' : '/login'}
          className="text-2xl font-bold text-gray-800"
        >
          Car Rental Booking System
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/cars"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                Browse Cars
              </Link>

              <Link
                to={user.role === 'admin' ? '/admin/bookings' : '/bookings'}
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                {user.role === 'admin' ? 'Manage Bookings' : 'My Bookings'}
              </Link>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-purple-600 font-medium"
                >
                  Admin
                </Link>
              )}

              <span
                className={`text-sm px-3 py-2 rounded-full ${
                  isAdmin
                    ? 'text-purple-700 bg-purple-100 border border-purple-200'
                    : 'text-gray-500 bg-gray-100'
                }`}
              >
                Hi, {displayName}
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-400 text-white px-4 py-2 rounded-full font-medium hover:bg-red-500 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-purple-500 text-white px-4 py-2 rounded-full font-medium hover:bg-purple-600 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
