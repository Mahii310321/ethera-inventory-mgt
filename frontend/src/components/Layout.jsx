import React from 'react';
import { Boxes, ClipboardList, LayoutDashboard, Package, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
];

export function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">IM</span>
          <div>
            <strong>Inventory MGT</strong>
            <span>Operations</span>
          </div>
        </div>
        <nav className="nav-list">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-area">
        <Outlet />
      </main>
    </div>
  );
}
