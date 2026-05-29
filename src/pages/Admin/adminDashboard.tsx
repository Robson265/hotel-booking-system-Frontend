import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ hotels: 0, bookings: 0, users: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h3>StayEase Admin</h3>
        <nav>
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/admin/hotels"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Manage Hotels
          </NavLink>
          <NavLink 
            to="/admin/hotels/add"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Add Hotel
          </NavLink>
          <NavLink 
            to="/admin/bookings"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Bookings
          </NavLink>
          <NavLink 
            to="/admin/users"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Users
          </NavLink>
          <Link to="/" onClick={() => localStorage.removeItem('accessToken')}>
            Logout
          </Link>
        </nav>
      </aside>
      
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}