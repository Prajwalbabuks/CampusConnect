import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import AdminNav from '../components/AdminNav';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import { eventApi } from '../services/api';
import { EVENT_CATEGORIES, EVENT_DEPARTMENTS } from '../services/catalog';
import { toLocalNoonISO, toDateInputValue } from '../utils/eventUi';

export default function AdminEditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [eventMeta, setEventMeta] = useState({ registeredCount: 0 });

  const [formData, setFormData] = useState({
    title: '',
    category: 'Technical',
    date: '',
    time: '10:00',
    venue: '',
    capacity: 100,
    department: 'Computer Science & Engineering',
    departmentCode: 'CSE',
    description: '',
  });

  const fetchEventDetails = useCallback(async () => {
    setFetching(true);
    setNotFound(false);
    setError('');
    try {
      const event = await eventApi.getEventById(id);
      if (!event) {
        setNotFound(true);
        return;
      }
      setEventMeta({ registeredCount: event.registeredCount || 0 });
      setFormData({
        title: event.title || '',
        category: event.category || 'Technical',
        date: toDateInputValue(event.date),
        time: event.time || '10:00',
        venue: event.venue || '',
        capacity: event.capacity || 100,
        department: event.department || 'Computer Science & Engineering',
        departmentCode: event.departmentCode || 'CSE',
        description: event.description || '',
      });
    } catch (err) {
      if (err.status === 404) setNotFound(true);
      else setError(err.message || 'Failed to load this event');
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const handleDepartmentChange = (e) => {
    const selected = EVENT_DEPARTMENTS.find((d) => d.name === e.target.value);
    setFormData((prev) => ({
      ...prev,
      department: e.target.value,
      departmentCode: selected?.code || prev.departmentCode,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await eventApi.updateEvent(id, {
        ...formData,
        capacity: Number(formData.capacity),
        date: toLocalNoonISO(formData.date),
      });
      navigate('/admin/events');
    } catch (err) {
      // Stay on the form and show the real server error (e.g. capacity below
      // the number of seats already booked) instead of navigating away as if
      // the save succeeded.
      setError(err.message || 'Saving failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
        <AdminNav />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-[#B9473D] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#171715] font-serif">Event not found</h1>
            <p className="mt-2 text-sm text-[#57534E]">
              This listing may have been removed. REF: {id}
            </p>
            <Button to="/admin/events" variant="primary" size="md" className="mt-6">
              Back to All Events
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
        <AdminNav />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-96 rounded-3xl bg-white border border-[#E5E0D6] animate-pulse" aria-busy="true" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
      <AdminNav />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#57534E] hover:text-[#171715] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[#E5E0D6] bg-white p-7 sm:p-10 shadow-editorial"
        >
          <div className="border-b border-[#E5E0D6] pb-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8F5F00] uppercase tracking-wider mb-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900]" />
                <span>Event Editor</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171715] font-serif">
                Edit Event Listing
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
                Modify schedule, campus venue, or adjust available seating quotas.
              </p>
            </div>
            <span className="font-mono text-xs text-[#77736A] bg-[#F5F2EA] px-3 py-1 rounded-lg border border-[#E5E0D6] self-start sm:self-auto">
              REF: {id}
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#FDF0EE] border border-[#B9473D]/30 text-[#9E352C] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B9473D]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#171715] mb-1.5 font-mono">
                Event Title *
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={120}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors"
              />
            </div>

            {/* Category & Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#171715] mb-1.5 font-mono">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors cursor-pointer"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#171715] font-mono">
                    Maximum Capacity *
                  </label>
                  <span className="text-[11px] font-mono text-[#8F5F00]">
                    Min {eventMeta.registeredCount} (currently allocated)
                  </span>
                </div>
                <input
                  type="number"
                  min={eventMeta.registeredCount}
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors font-mono tabular-nums"
                />
              </div>
            </div>

            {/* Date, Time & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#171715] mb-1.5 font-mono">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171715] mb-1.5 font-mono">
                  Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171715] mb-1.5 font-mono">
                  Campus Venue *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={120}
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors"
                />
              </div>
            </div>

            {/* Host Department */}
            <div>
              <label className="block text-xs font-semibold text-[#171715] mb-1.5 font-mono">
                Host Department *
              </label>
              <select
                value={formData.department}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors cursor-pointer"
              >
                {(() => {
                  // Keep the stored department selectable even if it isn't in the
                  // canonical list (e.g. Cultural Troupe / Athletics).
                  const options = EVENT_DEPARTMENTS.some((d) => d.name === formData.department)
                    ? EVENT_DEPARTMENTS
                    : [{ name: formData.department, code: formData.departmentCode }, ...EVENT_DEPARTMENTS];
                  return options.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ));
                })()}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#171715] mb-1.5 font-mono">
                Event Description *
              </label>
              <textarea
                rows={4}
                required
                minLength={10}
                maxLength={2000}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors"
              />
            </div>

            {/* Submit */}
            <div className="border-t border-[#E5E0D6] pt-6 flex items-center justify-end gap-3">
              <Button to="/admin/events" variant="secondary" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={loading} icon={Save}>
                Save Changes
              </Button>
            </div>

          </form>

        </motion.div>

      </main>
      <Footer />
    </div>
  );
}
