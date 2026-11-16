import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, ArrowLeft, LayoutDashboard, ListFilter, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';

export default function AdminNav() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const links = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Manage Events', href: '/admin/events', icon: ListFilter },
  ];

  const isCreating = location.pathname === '/admin/events/new';

  return (
    <header className="sticky top-3.5 z-40 w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto transition-all">
      <div className="rounded-2xl border border-[#3A362F] bg-[#161513]/95 backdrop-blur-xl shadow-floating-nav px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Brand Identity & Public Catalog Return */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/events"
            className="text-stone-400 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-[#211F1B] flex items-center gap-1.5 text-xs font-medium"
            title="Return to Public Events Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Public Catalog</span>
          </Link>
          <div className="h-4 w-px bg-[#3A362F] hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base tracking-tight text-white font-serif">
              NIE <span className="text-[#F2A900] italic font-normal text-lg sm:text-xl ml-0.5">Admin Console</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900]" />
          </div>
        </div>

        {/* Center: Navigation Tabs with Single Active Indicator */}
        <nav className="hidden sm:flex items-center gap-1 bg-[#211F1B]/80 p-1 rounded-xl border border-[#3A362F]">
          {links.map(({ label, href, icon: Icon }) => {
            const isActive = location.pathname === href;
            return (
              <Link
                key={label}
                to={href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-[#171715] font-semibold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="adminNavTab"
                    className="absolute inset-0 bg-[#F2A900] rounded-lg -z-10 shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Action & Identity Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {!isCreating && (
            <Button to="/admin/events/new" variant="primary" size="sm" icon={Plus}>
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">New</span>
            </Button>
          )}

          <Link
            to="/profile"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#211F1B] border border-[#3A362F] hover:border-[#F2A900]/40 transition-colors text-xs text-stone-200"
            title="View Administrative Dossier"
          >
            <span className="w-5.5 h-5.5 rounded-full bg-[#F2A900] text-[#171715] font-bold font-mono text-[10px] flex items-center justify-center">
              AD
            </span>
            <span className="hidden lg:inline font-semibold max-w-[110px] truncate text-white">
              {user?.name || 'Convenor'}
            </span>
          </Link>

          <button
            onClick={logout}
            className="p-1.5 text-stone-400 hover:text-[#B9473D] rounded-lg hover:bg-[#211F1B] transition-colors cursor-pointer"
            title="Sign out from Admin Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
