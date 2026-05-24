import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';
import Icon from './Icon';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isAdmin = user?.role === 'admin';
  const displayName = user?.name || user?.username || user?.email || 'User';
  const initial = displayName[0]?.toUpperCase() || '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) =>
    pathname === path || pathname.startsWith(path + '/');

  const link = (to, label, exact = false) => (
    <button
      type="button"
      className={
        'nav-link' +
        ((exact ? pathname === to : isActive(to)) ? ' is-active' : '')
      }
      onClick={() => navigate(to)}
    >
      {label}
    </button>
  );

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Brand onClick={() => navigate(user ? '/cars' : '/login')} />

        <nav className="nav-right">
          {user ? (
            <>
              {link('/cars', 'Browse Cars')}
              {isAdmin
                ? link('/admin/bookings', 'Manage Bookings')
                : link('/bookings', 'My Bookings')}
              {isAdmin && link('/admin', 'Admin', true)}
              <button
                type="button"
                className={
                  'nav-link' + (pathname === '/profile' ? ' is-active' : '')
                }
                onClick={() => navigate('/profile')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                aria-label="Profile"
              >
                <span className={'avatar' + (isAdmin ? ' is-admin' : '')}>
                  {initial}
                </span>
                <span className="nav-name">
                  Hi, {displayName.split(' ')[0]}
                </span>
              </button>
              <button
                type="button"
                className="btn-ghost-sm"
                onClick={handleLogout}
              >
                <Icon name="logout" size={14} stroke={2} /> Logout
              </button>
            </>
          ) : (
            <>
              {link('/login', 'Login')}
              <button
                type="button"
                className="btn-primary-sm"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
