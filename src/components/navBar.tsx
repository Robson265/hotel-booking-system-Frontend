/**
 * src/components/Navbar.tsx
 *
 * Uses CSS classes from globals.css (Section 12 — Navbar).
 * Zero inline styles — all visual decisions live in the stylesheet.
 *
 * Features:
 *  - Sticky top bar, brand logo
 *  - Desktop nav links with gold active underline  (.nav-link / .nav-link.active)
 *  - Vertical divider + "Admin" label before admin links
 *  - Avatar pill that opens a dropdown  (.nav-avatar-btn / .nav-dropdown)
 *  - Admin role badge inside dropdown header
 *  - Mobile hamburger  (.navbar-hamburger) + slide-down panel  (.navbar-mobile)
 *  - Unauthenticated: Login link + Register CTA button
 */

import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Icons ─────────────────────────────────────────────────────────────────────

function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={`nav-chevron${open ? ' open' : ''}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? (
        <>
          <line x1="18" y1="6"  x2="6"  y2="18" />
          <line x1="6"  y1="6"  x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6"  x2="21" y2="6"  />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  );
}

// ── Nav link helper — applies CSS class via className ─────────────────────────
function navLinkClass({ isActive }: { isActive: boolean }) {
  return `nav-link${isActive ? ' active' : ''}`;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    : '';

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function closeAll() {
    setMobileOpen(false);
    setDropdownOpen(false);
  }

  function handleLogout() {
    logout();
    navigate('/login');
    closeAll();
  }

  // Link definitions
  const customerLinks = [
    { to: '/hotels',      label: 'Hotels' },
    { to: '/my-bookings', label: 'My Bookings' },
    { to: '/reviews',     label: 'Reviews' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/hotels',    label: 'Manage Hotels' },
    { to: '/admin/bookings',  label: 'Manage Bookings' },
    { to: '/admin/users',     label: 'Manage Users' },
  ];

  // ── Avatar circle (shared between desktop + mobile) ───────────────────────
  const AvatarCircle = () => (
    <div className="nav-avatar-circle">
      {user?.avatarUrl
        ? <img src={user.avatarUrl} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials}
    </div>
  );

  return (
    <nav className="navbar">
      {/* ── Inner container ────────────────────────────────────────────────── */}
      <div className="navbar-inner">

        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeAll}>
          Stay<em>Ease</em>
        </Link>

        {/* ── Desktop nav ──────────────────────────────────────────────────── */}

<div className="navbar-links desktop-nav">
  {user ? (
    <>
      {/* Customer links */}
      {customerLinks.map(({ to, label }) => (
        <NavLink key={to} to={to} className={navLinkClass} onClick={closeAll}>
          {label}
        </NavLink>
      ))}

      {/* Admin section */}
      {isAdmin && (
        <>
          <span className="nav-divider" aria-hidden="true" />
          <span className="nav-admin-label">
            <ShieldIcon /> Admin
          </span>
          {adminLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={navLinkClass} onClick={closeAll}>
              {label}
            </NavLink>
          ))}
        </>
      )}

      {/* Avatar dropdown (now without logout inside) */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          className="nav-avatar-btn"
          onClick={() => setDropdownOpen(o => !o)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label="User menu"
        >
          <AvatarCircle />
          <span className="nav-avatar-name">{user.firstName}</span>
          <ChevronIcon open={dropdownOpen} />
        </button>

        {dropdownOpen && (
          <div className="nav-dropdown" role="menu">
            {/* Header */}
            <div className="nav-dropdown-header">
              <p className="name">{user.firstName} {user.lastName}</p>
              <p className="email">{user.email}</p>
              {isAdmin && (
                <span className="badge badge-admin" style={{ marginTop: 8 }}>
                  <ShieldIcon /> Admin
                </span>
              )}
            </div>

            {/* Links - removed logout from here */}
            <div className="nav-dropdown-body">
              <NavLink to="/my-bookings" className={({ isActive }) =>
                `nav-dropdown-item${isActive ? ' active' : ''}`}
                onClick={closeAll} role="menuitem">
                My Bookings
              </NavLink>
              <NavLink to="/reviews" className={({ isActive }) =>
                `nav-dropdown-item${isActive ? ' active' : ''}`}
                onClick={closeAll} role="menuitem">
                My Reviews
              </NavLink>

              {isAdmin && (
                <>
                  <hr className="nav-dropdown-sep" />
                  {adminLinks.map(({ to, label }) => (
                    <NavLink key={to} to={to}
                      className={({ isActive }) =>
                        `nav-dropdown-item admin${isActive ? ' active' : ''}`}
                      onClick={closeAll} role="menuitem">
                      <ShieldIcon /> {label}
                    </NavLink>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Separate visible logout button */}
      <button className="nav-logout-btn" onClick={handleLogout} aria-label="Logout">
        <LogoutIcon /> Logout
      </button>
    </>
  ) : (
    <>
      <NavLink to="/login" className={navLinkClass}>Login</NavLink>
      <Link to="/register" className="btn btn-gold btn-sm">Register</Link>
    </>
  )}
</div>

        {/* ── Hamburger (mobile) ────────────────────────────────────────────── */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <HamburgerIcon open={mobileOpen} />
        </button>
      </div>

      {/* ── Mobile menu panel ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="navbar-mobile" id="mobile-menu" role="navigation" aria-label="Mobile menu">
          {user ? (
            <>
              {/* User info */}
              <div className="navbar-mobile-user">
                <div className="nav-avatar-circle" style={{ width: 42, height: 42, fontSize: '.875rem' }}>
                  {user.avatarUrl
                    ? <img src={user.avatarUrl} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--clr-navy)', fontSize: '.9375rem' }}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p style={{ fontSize: '.8125rem', color: 'var(--clr-text-muted)' }}>{user.email}</p>
                </div>
              </div>

              {/* Customer links */}
              {customerLinks.map(({ to, label }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) => `navbar-mobile-link${isActive ? ' active' : ''}`}
                  onClick={closeAll}>
                  {label}
                </NavLink>
              ))}

              {/* Admin links */}
              {isAdmin && (
                <>
                  <p className="navbar-mobile-section-label">
                    <ShieldIcon /> Admin
                  </p>
                  {adminLinks.map(({ to, label }) => (
                    <NavLink key={to} to={to}
                      className={({ isActive }) => `navbar-mobile-link${isActive ? ' active' : ''}`}
                      onClick={closeAll}>
                      <ShieldIcon /> {label}
                    </NavLink>
                  ))}
                </>
              )}

              <button className="navbar-mobile-logout" onClick={handleLogout}>
                <LogoutIcon /> &nbsp;Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Link to="/login"    className="btn btn-outline btn-full" onClick={closeAll}>Login</Link>
              <Link to="/register" className="btn btn-gold btn-full"    onClick={closeAll}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
