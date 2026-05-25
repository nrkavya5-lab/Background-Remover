import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/batch', label: 'Batch' },
  { to: '/passport', label: 'Passport' },
  { to: '/product', label: 'Product' },
  { to: '/thumbnail', label: 'Thumbnail' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
          <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="6" />
            <path d="M16 6c-4 0-8 2-8 8v2c0 2 1.5 4 4 5v-3c0-2 2-4 4-4s4 2 4 4v3c2.5-1 4-3 4-5v-2c0-6-4-8-8-8z" fill="#fff" />
            <circle cx="16" cy="15" r="3" fill="#fff" />
          </svg>
          BG Remover
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleDark} className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" title="Toggle dark mode">
            {dark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                {user.name}
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="px-2 py-1 text-xs rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">Admin</Link>
              )}
              <button onClick={() => { logout(); navigate('/'); }} className="px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-600">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Login</Link>
              <Link to="/register" className="px-3 py-1.5 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600">Register</Link>
            </div>
          )}

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-3 space-y-1 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
