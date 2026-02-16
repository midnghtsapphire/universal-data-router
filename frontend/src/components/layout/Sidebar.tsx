import { NavLink } from 'react-router-dom';
import { useStore } from '../../context/store';
import {
  LayoutDashboard,
  FolderOpen,
  Plug,
  GitBranch,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', description: 'Overview and stats' },
  { to: '/files', icon: FolderOpen, label: 'Files', description: 'Browse all files' },
  { to: '/sources', icon: Plug, label: 'Sources', description: 'Connected services' },
  { to: '/rules', icon: GitBranch, label: 'Rules', description: 'Routing rules' },
  { to: '/search', icon: Search, label: 'Search', description: 'Find files' },
  { to: '/settings', icon: Settings, label: 'Settings', description: 'Preferences' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useStore();

  return (
    <aside
      role="navigation"
      aria-label="Main navigation sidebar"
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } hidden md:flex flex-col`}
      style={{
        background: 'linear-gradient(180deg, rgba(20,18,15,0.95) 0%, rgba(10,9,8,0.98) 100%)',
        borderRight: '1px solid rgba(184,176,163,0.08)',
      }}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-charcoal-800/50">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #b89420, #d4ad2e)' }}
          aria-hidden="true"
        >
          <Leaf className="w-5 h-5 text-charcoal-950" />
        </div>
        {sidebarOpen && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-gradient-gold">Data Router</h1>
            <p className="text-[10px] text-charcoal-300">by GlowStarLabs</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gold-500/15 text-gold-300'
                  : 'text-charcoal-200 hover:bg-charcoal-800/40 hover:text-earth-200'
              }`
            }
            title={item.description}
            aria-label={`${item.label} — ${item.description}`}
          >
            <item.icon
              className="w-5 h-5 flex-shrink-0"
              aria-hidden="true"
            />
            {sidebarOpen && (
              <span className="text-sm font-medium animate-fade-in">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-charcoal-800/50">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-charcoal-300 hover:bg-charcoal-800/40 hover:text-earth-200 transition-all"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs">Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </aside>
  );
}
