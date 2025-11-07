import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AllListings from './pages/AllListings';
import PropertyDetail from './pages/PropertyDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import AdminLogin from './components/Auth/AdminLogin';
import AdminPanel from './components/Dashboard/AdminPanel';
import UserPanel from './components/Dashboard/UserPanel';
import { AuthProvider, RequireAuth, RequireRole } from './auth/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<AllListings />} />
        <Route path="/property/:slug" element={<PropertyDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/dashboard" element={<RequireAuth><UserPanel /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><RequireRole role="admin"><AdminPanel /></RequireRole></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
