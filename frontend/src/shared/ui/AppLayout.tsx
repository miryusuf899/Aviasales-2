import { LogOut, Menu, Plane, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/api/AuthContext';
import { initials } from '@/shared/lib/formatters';

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const close = () => setOpen(false);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate('/')}>
          <span className="brand__icon">
            <Plane size={17} />
          </span>
          <span>
            Sky<span>Book</span>
          </span>
        </button>

        <nav className={`topbar__nav ${open ? 'is-open' : ''}`}>
          <NavLink to="/" onClick={close}>Flights</NavLink>
          <NavLink to="/dashboard" onClick={close}>My Bookings</NavLink>
          <a href="/#about" onClick={close}>About</a>
          <a href="/#contact" onClick={close}>Contact</a>
        </nav>

        <div className="topbar__actions">
          {isAuthenticated && user ? (
            <>
              <button className="user-chip" onClick={() => navigate('/dashboard')}>
                <span>{initials(user.first_name, user.last_name, user.email)}</span>
                <strong>{user.first_name || user.email.split('@')[0]}</strong>
              </button>
              <button className="icon-btn" aria-label="Log out" onClick={logout}>
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <button className="nav-login" onClick={() => navigate('/login')}>Login</button>
              <button className="nav-register" onClick={() => navigate('/register')}>Register</button>
            </>
          )}
          <button className="mobile-menu" aria-label="Open menu" onClick={() => setOpen((v) => !v)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
