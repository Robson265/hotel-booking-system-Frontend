import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../src/components/navBar';
import ProtectedRoute from '../src/components/ProtectedRoute';

// Pages
import Register from '../src/pages/register';
import Login from '../src/pages/login';
import Hotels from '../src/pages/Hotels';
import Rooms from '../src/pages/rooms';
import Booking from '../src/pages/booking';
import Payment from '../src/pages/payment';
import MyBookings from '../src/pages/MyBookings';
import Reviews from '../src/pages/reviews';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './components/ResendVerification';
import CheckEmail from './pages/CheckEmail';
import AdminDashboard from '../src/pages/Admin/adminDashboard';
import AdminLogin from './pages/Admin/adminiLogin';
import AddHotel from '../src/pages/Admin/addHotel';
import ManageHotels from '../src/pages/Admin/ManageHotels';

export default function App() {
  return (
    <BrowserRouter>
      {/* Navbar is visible on every page */}
      <Navbar />

      <Routes>
        {/* ── Public routes (no authentication needed) ─────────────────── */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/check-email" element={<CheckEmail />} />
        
        {/* Public hotel viewing - anyone can see hotels */}
        <Route path="/hotels" element={<Hotels />} />
        
        {/* Admin login is public */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ── Admin protected routes (require admin authentication) ────── */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/hotels" element={<ManageHotels />} />
          <Route path="/admin/hotels/add" element={<AddHotel />} />
          <Route path="/admin/hotels/edit/:id" element={<AddHotel />} />
        </Route>

        {/* ── Customer protected routes (require authentication) ───────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/hotels/:hotelId/rooms" element={<Rooms />} />
          <Route path="/booking/:roomId" element={<Booking />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/reviews" element={<Reviews />} />
        </Route>

        {/* ── Fallback: redirect to hotels ────────────────────────────── */}
        <Route path="*" element={<Navigate to="/hotels" replace />} />
      </Routes>
    </BrowserRouter>
  );
}