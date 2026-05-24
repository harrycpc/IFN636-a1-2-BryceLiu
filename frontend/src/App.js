import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseCars from './pages/BrowseCars';
import CarDetails from './pages/CarDetails';
import CreateBooking from './pages/CreateBooking';
import EditBooking from './pages/EditBooking';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ManageCars from './pages/ManageCars';
import ManageBookings from './pages/ManageBookings';
import { useAuth } from './context/AuthContext';

const Shell = ({ children }) => {
  const { pathname } = useLocation();
  // Auth pages use a full-screen split layout — no top nav, no footer.
  // Admin pages have their own sidebar — no top nav (but keep footer hidden too).
  const hideChrome =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/admin');
  const hideFooter = hideChrome;
  return (
    <div className="app-shell">
      {!hideChrome && <Navbar />}
      {children}
      {!hideFooter && <Footer />}
    </div>
  );
};

function App() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Router>
      <Shell>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to={user ? (isAdmin ? '/admin' : '/cars') : '/login'}
                replace
              />
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={isAdmin ? '/admin' : '/cars'} replace />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to={isAdmin ? '/admin' : '/cars'} replace />
              ) : (
                <Register />
              )
            }
          />

          <Route
            path="/cars"
            element={user ? <BrowseCars /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/cars/:id"
            element={user ? <CarDetails /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/bookings"
            element={user ? <MyBookings /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/bookings/create"
            element={
              user ? <CreateBooking /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/bookings/edit/:id"
            element={
              user ? <EditBooking /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin"
            element={
              isAdmin ? (
                <AdminDashboard />
              ) : (
                <Navigate to={user ? '/cars' : '/login'} replace />
              )
            }
          />
          <Route
            path="/admin/cars"
            element={
              isAdmin ? (
                <ManageCars />
              ) : (
                <Navigate to={user ? '/cars' : '/login'} replace />
              )
            }
          />
          <Route
            path="/admin/bookings"
            element={
              isAdmin ? (
                <ManageBookings />
              ) : (
                <Navigate to={user ? '/cars' : '/login'} replace />
              )
            }
          />
        </Routes>
      </Shell>
    </Router>
  );
}

export default App;
