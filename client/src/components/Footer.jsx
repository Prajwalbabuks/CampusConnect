import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, GraduationCap, MapPin, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  return (
    <footer className="bg-[#161513] border-t border-[#3A362F] py-14 text-stone-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Column with Clean Typographic Wordmark */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight">
                NIE <span className="text-[#F2A900] font-serif italic text-xl ml-0.5">CampusConnect</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900]" />
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Official centralized event discovery and seat reservation platform for <strong className="text-white">National Institute of Engineering</strong>, Mysuru.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <MapPin className="w-3.5 h-3.5 text-[#F2A900] shrink-0" />
              <span>Mysuru, Karnataka, India</span>
            </div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#211F1B] text-[#F2A900] text-[11px] font-mono border border-[#3A362F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#247A56]" />
              <span>Institutional Single Sign-On</span>
            </div>
          </div>

          {/* Collegiate Discovery */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 font-mono">
              Collegiate Discovery
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/events" className="hover:text-[#F2A900] transition-colors">
                  Upcoming NIE Events
                </Link>
              </li>
              <li>
                <Link to="/#guidelines" className="hover:text-[#F2A900] transition-colors">
                  Participation Guidelines
                </Link>
              </li>
              {!isAdmin && (
                <>
                  <li>
                    <Link to="/register" className="hover:text-[#F2A900] transition-colors">
                      Student Registration
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-registrations" className="hover:text-[#F2A900] transition-colors">
                      My Event Passes
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Administration Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 font-mono">
              Faculty & Senate
            </h4>
            <ul className="space-y-2.5 text-xs">
              {isAdmin ? (
                <>
                  <li>
                    <Link to="/admin" className="hover:text-[#F2A900] transition-colors">
                      Operations Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/events" className="hover:text-[#F2A900] transition-colors">
                      Manage Events & Rosters
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="hover:text-[#F2A900] transition-colors">
                      Convenor Dossier
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login?redirect=/admin" className="hover:text-[#F2A900] transition-colors">
                      Staff Portal Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/#guidelines" className="hover:text-[#F2A900] transition-colors">
                      Academic Senate Protocols
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* System Rules */}
          <div>
            <Link to="/#guidelines" className="group block">
              <h4 className="text-xs font-bold text-white group-hover:text-[#F2A900] transition-colors uppercase tracking-wider mb-3.5 font-mono flex items-center gap-1.5">
                <span>Campus Guidelines</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#F2A900]" />
              </h4>
            </Link>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F2A900] shrink-0" />
                <span>Strict Institutional Email Verification</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F2A900] shrink-0" />
                <span>One Seat Per Registered USN</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F2A900] shrink-0" />
                <span>Instant Seat Release Protocol</span>
              </li>
              <li className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-[#F2A900] shrink-0" />
                <span>Full-Stack Development Project</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#3A362F] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>© 2026 NIE CampusConnect · National Institute of Engineering, Mysuru.</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-stone-400">Collegiate System v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
