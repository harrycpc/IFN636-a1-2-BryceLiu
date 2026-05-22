import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseCars from './pages/BrowseCars';
import CarDetails from './pages/CarDetails';
import CreateBooking from './pages/CreateBooking';
import EditBooking from './pages/EditBooking';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import ManageCars from './pages/ManageCars';
import ManageBookings from './pages/ManageBookings';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={user ? (isAdmin ? "/admin" : "/cars") : "/login"} replace />} />
        <Route path="/login" element={user ? <Navigate to={isAdmin ? "/admin" : "/cars"} replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={isAdmin ? "/admin" : "/cars"} replace /> : <Register />} />

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
          element={user ? <CreateBooking /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/bookings/edit/:id"
          element={user ? <EditBooking /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin"
          element={isAdmin ? <AdminDashboard /> : <Navigate to={user ? "/cars" : "/login"} replace />}
        />
        <Route
          path="/admin/cars"
          element={isAdmin ? <ManageCars /> : <Navigate to={user ? "/cars" : "/login"} replace />}
        />
        <Route
          path="/admin/bookings"
          element={isAdmin ? <ManageBookings /> : <Navigate to={user ? "/cars" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
