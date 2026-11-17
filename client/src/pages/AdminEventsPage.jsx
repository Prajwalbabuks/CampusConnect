import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Users, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminNav from '../components/AdminNav';
import Footer from '../components/Footer';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { adminApi, eventApi } from '../services/api';
import { CATEGORY_FILTERS } from '../services/catalog';
import { formatEventDate, getCategoryColor } from '../utils/eventUi';

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.getMyEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filtered = events.filter((e) => {
    const matchesCat = category === 'All' || e.category?.toLowerCase() === category.toLowerCase();
    const matchesQuery =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleDelete = async () => {
    if (!deleteEvent) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await eventApi.deleteEvent(deleteEvent._id);
      setEvents((prev) => prev.filter((e) => e._id !== deleteEvent._id));
      setDeleteEvent(null);
    } catch (err) {
      // Surface the real failure — the old code silently removed the event
      // from local state even when the server rejected the delete.
      setDeleteError(err.message || 'Delete failed. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
      <AdminNav />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-[#E5E0D6] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8F5F00] uppercase tracking-wider mb-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900]" />
              <span>Event Administration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171715] font-serif">
              Manage Events
            </h1>
            <p className="mt-1 text-sm text-[#57534E]">
              Full administrative catalog. Publish, modify logistics, or monitor participant rosters.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <Button to="/admin/events/new" variant="primary" size="sm" icon={Plus}>
              Create Event
            </Button>
            <div className="font-mono text-xs text-[#8F5F00] bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl shadow-xs tabular-nums font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F2A900]" />
              <span>{events.length} Listings</span>
            </div>
          </div>
        </motion.div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#77736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by title or campus hall..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors shadow-editorial"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors border cursor-pointer ${
                  category === cat
                    ? 'bg-[#171715] text-white border-[#171715]'
                    : 'bg-white text-[#57534E] border-[#E5E0D6] hover:bg-[#FCFBF7]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Load Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#FDF0EE] border border-[#B9473D]/30 text-[#9E352C] text-xs flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B9473D]" />
              <span>{error}</span>
            </span>
            <Button variant="secondary" size="sm" onClick={fetchEvents}>
              Retry
            </Button>
          </div>
        )}

        {/* Management Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[#E5E0D6] bg-white shadow-editorial overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FCFBF7] text-[#77736A] border-b border-[#E5E0D6] font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Title & Category</th>
                  <th className="px-6 py-3.5">Scheduled Date</th>
                  <th className="px-6 py-3.5">Campus Venue</th>
                  <th className="px-6 py-3.5">Registered / Capacity</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D6]/60">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#77736A]">
                      Loading listings…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#77736A]">
                      No event listings match the current filters.
                    </td>
                  </tr>
                )}
                {filtered.map((event) => {
                  const formattedDate = formatEventDate(event.date);
                  const fillPercentage = event.capacity
                    ? Math.round(((event.registeredCount || 0) / event.capacity) * 100)
                    : 0;

                  return (
                    <tr key={event._id} className="hover:bg-[#FCFBF7] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#171715] text-sm">{event.title}</div>
                        <div className="mt-1">
                          <Badge variant={getCategoryColor(event.category)} size="sm">{event.category}</Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[#57534E] tabular-nums">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4 text-[#57534E] truncate max-w-[180px]">
                        {event.venue}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#171715] tabular-nums">
                            {event.registeredCount || 0} / {event.capacity}
                          </span>
                          <span className="font-mono text-[11px] text-[#77736A]">
                            ({fillPercentage}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/admin/events/${event._id}/participants`}
                          className="inline-flex items-center gap-1.5 font-medium text-[#171715] hover:text-[#8F5F00] px-3 py-1.5 rounded-lg border border-[#E5E0D6] bg-white hover:bg-[#F5F2EA] transition-colors"
                          title="View attendee roster"
                        >
                          <Users className="w-3.5 h-3.5 text-[#77736A]" />
                          <span>Attendees ({event.registeredCount || 0})</span>
                        </Link>
                        <Link
                          to={`/admin/events/edit/${event._id}`}
                          className="inline-flex items-center p-2 text-[#57534E] hover:text-[#171715] rounded-lg hover:bg-[#F5F2EA] transition-colors"
                          title="Edit event details"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteEvent(event)}
                          className="inline-flex items-center p-2 text-[#B9473D] hover:text-[#8F332B] rounded-lg hover:bg-[#FDF0EE] transition-colors cursor-pointer"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-2xl bg-white border border-[#E5E0D6] p-6 text-[#171715] shadow-2xl"
              >
                <div className="flex items-center gap-3 text-[#B9473D] mb-3">
                  <div className="p-2 rounded-xl bg-[#FDF0EE] border border-[#B9473D]/30">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#171715] font-serif">
                    Delete Event Listing?
                  </h3>
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-[#171715]">{deleteEvent.title}</strong>? All registered student rosters for this event will be cascade-cancelled.
                </p>
                {deleteError && (
                  <p className="mt-2 text-xs text-[#B9473D] font-mono">{deleteError}</p>
                )}
                <div className="mt-6 flex items-center justify-end gap-2.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => setDeleteEvent(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    isLoading={isDeleting}
                    onClick={handleDelete}
                  >
                    Confirm Delete
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
      <Footer />
    </div>
  );
}
