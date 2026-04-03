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
                to="/bookings"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                My Bookings
              </Link>

              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
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