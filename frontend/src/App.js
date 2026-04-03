import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseCars from './pages/BrowseCars';
import CarDetails from './pages/CarDetails';
import CreateBooking from './pages/CreateBooking';
import EditBooking from './pages/EditBooking';
import MyBookings from './pages/MyBookings';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/cars" : "/login"} replace />} />
        <Route path="/login" element={user ? <Navigate to="/cars" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/cars" replace /> : <Register />} />

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
      </Routes>
    </Router>
  );
}

export default App;