import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Landmark,
  Upload, MessageSquare, Menu, X, Sun, Moon,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/categories', label: 'Categories', icon: PieChart },
  { to: '/fuliza', label: 'Fuliza', icon: Landmark },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/chat', label: 'AI Chat', icon: MessageSquare },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <>
      {/* Mobile header */}
      <div className="mobile-header">
        <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer' }}>
          <Menu size={22} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>💸 MPESA Tracker</span>
        <button className="theme-toggle" onClick={toggle}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Overlay */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="logo-section">
          <h1>
            💸 <span className="accent">MPESA</span> Tracker
          </h1>
        </div>

        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setOpen(false)}
            >
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggle} style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span style={{ fontSize: 13, color: 'var(--color-sidebar-text)' }}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
