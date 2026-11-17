import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, UserCheck, Menu, X, LogOut, Ticket, ChevronRight } from 'lucide-react';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGuidelinesClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('guidelines');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    }
  };

  const navLinks = [
    { label: 'Explore Events', href: '/events' },
    { label: 'Campus Guidelines', href: '/#guidelines', onClick: handleGuidelinesClick },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-3.5 inset-x-0 z-50 pointer-events-none w-full px-3.5 sm:px-6 lg:px-8 max-w-6xl mx-auto transition-all duration-300 ${
        isScrolled ? 'top-2.5' : 'top-3.5'
      }`}
    >
      <div
        className={`pointer-events-auto rounded-2xl border transition-all duration-300 px-4 sm:px-6 flex items-center justify-between ${
          isScrolled
            ? 'h-14 bg-[#161513]/95 border-[#3A362F] shadow-floating-nav backdrop-blur-xl'
            : 'h-16 bg-[#211F1B]/90 border-[#3A362F]/80 shadow-floating-nav backdrop-blur-md'
        }`}
      >
        {/* Left: Typographic Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-[#F2A900] transition-colors">
              NIE <span className="text-[#F2A900] font-serif italic font-normal text-xl sm:text-2xl ml-0.5">CampusConnect</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900] animate-pulse" />
          </div>
        </Link>

        {/* Center: Desktop Navigation Links with Animated Active Indicator */}
        <nav className="hidden md:flex items-center gap-1 relative bg-[#161513]/60 p-1 rounded-xl border border-[#3A362F]/60">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/#guidelines'
                ? location.pathname === '/' && location.hash === '#guidelines'
                : location.pathname === link.href;

            return (
              <Link
                key={link.label}
                to={link.href}
                onClick={link.onClick}
                className={`relative text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 z-10 ${
                  isActive ? 'text-[#171715] font-semibold' : 'text-stone-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-[#F2A900] rounded-lg -z-10 shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Auth Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              {isAdmin ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161513] border border-[#3A362F] hover:border-[#F2A900]/40 transition-colors text-xs text-stone-200"
                    title="Administrative Convenor Profile"
                  >
                    <span className="w-5.5 h-5.5 rounded-full bg-[#F2A900] text-[#171715] font-bold font-mono text-[10px] flex items-center justify-center">
                      AD
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold max-w-[120px] truncate leading-tight text-white">{user?.name}</span>
                      <span className="text-[9px] font-mono text-[#F2A900] uppercase tracking-wider">Faculty Admin</span>
                    </div>
                  </Link>

                  <Button to="/admin" variant="primary" size="sm" icon={ShieldCheck}>
                    Admin Console
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/my-registrations"
                    className="flex items-center gap-1.5 text-xs font-medium text-stone-300 hover:text-[#F2A900] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#2A2723]"
                  >
                    <Ticket className="w-3.5 h-3.5 text-[#F2A900]" />
                    <span>My Passes</span>
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161513] border border-[#3A362F] hover:border-[#F2A900]/40 transition-colors text-xs text-stone-200"
                    title="View Institutional Profile"
                  >
                    <span className="w-5.5 h-5.5 rounded-full bg-[#F2A900] text-[#171715] font-bold font-mono text-[10px] flex items-center justify-center">
                      {user?.name?.slice(0, 2).toUpperCase() || 'NI'}
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold max-w-[100px] truncate leading-tight text-white">{user?.name}</span>
                      <span className="text-[9px] font-mono text-[#F2A900]">{user?.section || user?.usn}</span>
                    </div>
                  </Link>
                </>
              )}

              <button
                onClick={logout}
                className="p-1.5 text-stone-400 hover:text-[#B9473D] rounded-lg hover:bg-[#2A2723] transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Button to="/login" variant="ghost-dark" size="sm" icon={UserCheck}>
                Sign In
              </Button>
              <Button to="/register" variant="primary" size="sm">
                Student Register
              </Button>
              <div className="h-4 w-px bg-[#3A362F] mx-1" />
              <Button to="/login?redirect=/admin" variant="outline-dark" size="sm" icon={ShieldCheck}>
                Staff Portal
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger / Close Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-[#2A2723] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Panel with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-auto md:hidden mt-2.5 rounded-2xl border border-[#3A362F] bg-[#161513]/95 backdrop-blur-2xl p-4.5 space-y-4 shadow-2xl"
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={(e) => {
                    if (link.onClick) link.onClick(e);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-[#2A2723] hover:text-[#F2A900] transition-colors"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </Link>
              ))}
            </div>

            <div className="border-t border-[#3A362F] pt-3.5 space-y-2.5">
              {isAuthenticated ? (
                isAdmin ? (
                  <>
                    <div className="px-3 py-2.5 rounded-xl bg-[#211F1B] border border-[#3A362F] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">{user?.name}</p>
                        <p className="text-[10px] font-mono text-[#F2A900]">{user?.department || 'Academic & Event Senate'}</p>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#F2A900] bg-[#161513] px-2 py-0.5 rounded border border-[#3A362F] font-bold">
                        Admin
                      </span>
                    </div>

                    <Button
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      variant="primary"
                      size="md"
                      className="w-full"
                      icon={ShieldCheck}
                    >
                      Admin Console
                    </Button>
                    <Button
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      variant="outline-dark"
                      size="md"
                      className="w-full"
                    >
                      Administrative Dossier
                    </Button>
                    <Button
                      variant="destructive"
                      size="md"
                      className="w-full"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 rounded-xl bg-[#211F1B] border border-[#3A362F] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">{user?.name}</p>
                        <p className="text-[10px] font-mono text-[#F2A900]">{user?.section || user?.department}</p>
                      </div>
                      <span className="font-mono text-xs text-stone-400">{user?.usn}</span>
                    </div>

                    <Button
                      to="/my-registrations"
                      onClick={() => setMobileMenuOpen(false)}
                      variant="outline-dark"
                      size="md"
                      className="w-full"
                      icon={Ticket}
                    >
                      My Event Passes
                    </Button>
                    <Button
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      variant="outline-dark"
                      size="md"
                      className="w-full"
                    >
                      Institutional Profile
                    </Button>
                    <Button
                      variant="destructive"
                      size="md"
                      className="w-full"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                )
              ) : (
                <>
                  <Button
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    variant="outline-dark"
                    size="md"
                    className="w-full"
                  >
                    Sign In with Institutional ID
                  </Button>
                  <Button
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    variant="primary"
                    size="md"
                    className="w-full"
                  >
                    Student Register
                  </Button>
                  <Button
                    to="/login?redirect=/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    variant="outline-dark"
                    size="md"
                    className="w-full"
                    icon={ShieldCheck}
                  >
                    Staff Portal
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
