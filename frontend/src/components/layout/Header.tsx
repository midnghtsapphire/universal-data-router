import { useStore } from '../../context/store';
import { Menu, Bell, User, LogOut, Leaf } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, logout, toggleSidebar } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      role="banner"
      aria-label="Application header"
      className="sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between"
      style={{
        background: 'rgba(10, 9, 8, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(184,176,163,0.06)',
      }}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 rounded-lg text-charcoal-300 hover:text-earth-200 hover:bg-charcoal-800/40"
        aria-label="Toggle navigation menu"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Mobile logo */}
      <div className="md:hidden flex items-center gap-2">
        <Leaf className="w-5 h-5 text-gold-400" aria-hidden="true" />
        <span className="text-sm font-bold text-gradient-gold">Data Router</span>
      </div>

      {/* Spacer */}
      <div className="hidden md:block" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="p-2 rounded-lg text-charcoal-300 hover:text-earth-200 hover:bg-charcoal-800/40 relative"
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-ember-500"
            aria-label="You have unread notifications"
          />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-charcoal-800/40 transition-all"
            aria-label="User menu"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={`${user.display_name || user.email}'s avatar`}
                className="w-7 h-7 rounded-full"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center bg-gold-500/20"
                aria-hidden="true"
              >
                <User className="w-4 h-4 text-gold-400" />
              </div>
            )}
            <span className="hidden sm:block text-sm text-charcoal-200">
              {user?.display_name || user?.email || 'User'}
            </span>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 glass-panel-sm py-2 animate-slide-up"
              role="menu"
              aria-label="User actions"
            >
              <div className="px-4 py-2 border-b border-charcoal-800/50">
                <p className="text-xs text-charcoal-300">Signed in as</p>
                <p className="text-sm text-earth-200 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-ember-300 hover:bg-ember-500/10 transition-all"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
