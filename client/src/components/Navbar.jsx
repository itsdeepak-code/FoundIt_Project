import { LayoutDashboard, LogOut, Menu, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Logo from './Logo.jsx';
import Button from './ui/Button.jsx';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    // Leave protected pages first, so they don't redirect to /login when the user disappears.
    navigate('/');
    await logout();
    toast.success('You have been logged out.');
  };

  const links = (
    <>
      <NavLink to="/items" end className={linkClass}>
        Browse items
      </NavLink>
      {user && (
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="hidden items-center gap-1 md:flex">{links}</div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button to="/items/new" size="sm" icon={Plus}>
                Report item
              </Button>
              <span className="ml-2 hidden text-sm text-slate-500 lg:inline">Hi, {user.name.split(' ')[0]}</span>
              <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button to="/register" size="sm">
                Sign up
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {menuOpen && (
        // Any click on a link or button inside the menu also closes it.
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="flex flex-col gap-1">{links}</div>
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
            {user ? (
              <>
                <p className="px-1 text-sm text-slate-500">Signed in as {user.email}</p>
                <Button to="/items/new" icon={Plus}>
                  Report item
                </Button>
                <Button to="/dashboard" variant="secondary" icon={LayoutDashboard}>
                  My dashboard
                </Button>
                <Button variant="ghost" icon={LogOut} onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button to="/register">Sign up</Button>
                <Button to="/login" variant="secondary">
                  Log in
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
