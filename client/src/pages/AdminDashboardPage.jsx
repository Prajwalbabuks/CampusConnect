import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Award, Percent, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import AdminNav from '../components/AdminNav';
import Footer from '../components/Footer';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { adminApi } from '../services/api';
import { formatEventDate, getCategoryColor } from '../utils/eventUi';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalEvents: 0, upcomingEvents: 0, totalRegistrations: 0, averageFillRate: '0%' });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, eventsData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getMyEvents(),
      ]);
      if (statsData) setStats(statsData);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
      <AdminNav />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-[#E5E0D6] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8F5F00] uppercase tracking-wider mb-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900]" />
              <span>NIE Operational Senate</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171715] font-serif">
              {user?.isSuperAdmin ? 'Seed Admin Dashboard' : 'Operations Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-[#57534E]">
              Real-time monitoring of National Institute of Engineering hall capacities, listings, and participant rosters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="font-mono text-xs text-[#1E6B4B] bg-[#EAF4EE] border border-[#247A56]/30 px-3.5 py-2 rounded-xl shadow-xs tabular-nums font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#247A56] animate-pulse" />
              <span>Senate System Active</span>
            </div>
          </div>
        </motion.div>

        {user?.isSuperAdmin === true && (
          <Link
            to="/admin/users"
            className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#D8C27E] bg-[#FFF8E3] p-5 shadow-xs transition hover:border-[#B88A1A] hover:shadow-sm"
          >
            <span className="flex items-start gap-3">
              <span className="rounded-xl bg-[#F2A900]/20 p-2.5 text-[#8F5F00]"><ShieldCheck className="h-5 w-5" /></span>
              <span>
                <span className="block font-semibold text-[#171715]">Centralized User Management</span>
                <span className="mt-1 block text-sm text-[#57534E]">Review accounts, manage admin roles, and enable or disable access.</span>
              </span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8F5F00]">Open management <ArrowRight className="h-4 w-4" /></span>
          </Link>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#FDF0EE] border border-[#B9473D]/30 text-[#9E352C] text-xs flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B9473D]" />
              <span>{error}</span>
            </span>
            <Button variant="secondary" size="sm" onClick={loadData}>
              Retry
            </Button>
          </div>
        )}

        {/* 4 KPI Metrics with distinct accents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Events"
            value={stats.totalEvents ?? 0}
            subtext="Published this academic year"
            icon={Calendar}
            accentColor="blue"
          />
          <StatCard
            label="Open for Registration"
            value={stats.upcomingEvents ?? 0}
            subtext="Available in public catalog"
            icon={Award}
            accentColor="amber"
          />
          <StatCard
            label="Total Registrations"
            value={(stats.totalRegistrations ?? 0).toLocaleString()}
            subtext="Students across all events"
            icon={Users}
            accentColor="emerald"
          />
          <StatCard
            label="Avg. Capacity Filled"
            value={stats.averageFillRate || '0%'}
            subtext="Seat efficiency rate"
            icon={Percent}
            accentColor="violet"
          />
        </div>

        {/* Recent Events Table Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-[#E5E0D6] bg-white shadow-editorial overflow-hidden"
        >
          <div className="p-6 border-b border-[#E5E0D6] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#171715] font-serif">
                Upcoming Academic & Cultural Events
              </h2>
              <p className="text-xs text-[#57534E]">
                Monitor real-time student registrations and venue quotas
              </p>
            </div>
            <Button to="/admin/events" variant="secondary" size="sm" icon={ArrowRight}>
              View All Events
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FCFBF7] text-[#77736A] border-b border-[#E5E0D6] font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Event Title</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Scheduled Date</th>
                  <th className="px-6 py-3.5">Venue</th>
                  <th className="px-6 py-3.5">Capacity</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D6]/60">
                {loading && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-[#77736A]">Loading your events...</td></tr>
                )}
                {!loading && events.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-[#77736A]">You have not created any events yet.</td></tr>
                )}
                {events.slice(0, 5).map((event) => {
                  const formattedDate = formatEventDate(event.date);
                  const fillPercentage = event.capacity
                    ? Math.round(((event.registeredCount || 0) / event.capacity) * 100)
                    : 0;

                  return (
                    <tr key={event._id} className="hover:bg-[#FCFBF7] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#171715] max-w-xs truncate">
                        {event.title}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getCategoryColor(event.category)} size="sm">{event.category}</Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-[#57534E] tabular-nums">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4 text-[#57534E] truncate max-w-[180px]">
                        {event.venue}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#171715] tabular-nums font-semibold">
                            {event.registeredCount || 0} / {event.capacity}
                          </span>
                          <span className="font-mono text-[10px] text-[#77736A]">
                            ({fillPercentage}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/admin/events/${event._id}/participants`}
                          className="inline-flex items-center gap-1.5 font-semibold text-[#8F5F00] hover:text-[#734D00] px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 hover:bg-amber-100 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Attendees ({event.registeredCount || 0})</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

      </main>
      <Footer />
    </div>
  );
}
