import { useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';

const AdminShell = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path, exact = false) =>
    exact ? pathname === path : pathname.startsWith(path);

  const link = (path, label, iconName, exact = false) => (
    <button
      type="button"
      className={
        'admin-nav-link' + (isActive(path, exact) ? ' is-active' : '')
      }
      onClick={() => navigate(path)}
    >
      <Icon name={iconName} size={16} stroke={2} /> {label}
    </button>
  );

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-side-brand">
          <span className="brand-mark" aria-hidden="true"></span>
          <div>
            <p className="kicker">Admin</p>
            <b>Car Rental Booking</b>
          </div>
        </div>
        <div className="nav-section">Overview</div>
        {link('/admin', 'Dashboard', 'grid', true)}
        <div className="nav-section">Operations</div>
        {link('/admin/bookings', 'Manage Bookings', 'calendar')}
        {link('/admin/cars', 'Manage Cars', 'key')}
        {link('/admin/pricing', 'Pricing Settings', 'tag')}
        {link('/cars', 'Browse Cars', 'search')}
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
};

export default AdminShell;
