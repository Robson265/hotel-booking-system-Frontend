import { useAuth } from '../context/AuthContext';

export default function LogoutButton() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      await logout();
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      <span>Logout</span>
      {user && <span className="user-email">({user.email})</span>}
    </button>
  );
}