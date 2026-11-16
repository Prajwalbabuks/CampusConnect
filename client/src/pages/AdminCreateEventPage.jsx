import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import AdminNav from '../components/AdminNav';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import { eventApi } from '../services/api';
import { EVENT_CATEGORIES, EVENT_DEPARTMENTS } from '../services/catalog';
import { toLocalNoonISO } from '../utils/eventUi';

export default function AdminCreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleDepartmentChange = (e) => {
    const selected = EVENT_DEPARTMENTS.find((d) => d.name === e.target.value);
    setFormData((prev) => ({
      ...prev,
      department: e.target.value,
      departmentCode: selected?.code || 'CSE',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Anchor date-only form input to local noon — UTC-midnight parsing made
      // every event display one day earlier for users ahead of UTC (IST).
      await eventApi.createEvent({
        ...formData,
        capacity: Number(formData.capacity),
        date: toLocalNoonISO(formData.date),
      });
      navigate('/admin/events');
    } catch (err) {
      // Surface the real server error and keep the form filled — the old code
      // navigated away as if the event had been published even on failure.
      setError(err.message || 'Publishing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="border-b border-[#E5E0D6] pb-5 mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8F5F00] uppercase tracking-wider mb-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900]" />
              <span>Collegiate Publishing Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171715] font-serif">
              Create New Event Listing
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              Publish an institutional event to the public collegiate catalogue with real-time seat quota tracking.
            </p>
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
                placeholder="e.g. Annual Autonomous Robotics Hackathon"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors"
              />
            </div>

            {/* Category & Capacity Row */}
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
                <label className="block text-xs font-semibold text-[#171715] mb-1.5 font-mono">
                  Maximum Seat Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 100"
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
                  Scheduled Date *
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
                  Start Time *
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
                  NIE Venue / Room *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder="e.g. Sir M. Visvesvaraya Auditorium"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors"
                />
              </div>
            </div>

            {/* Host Department (previously missing — events created here were
                invisible under every department filter except "All") */}
            <div>
              <label className="block text-xs font-semibold text-[#171715] mb-1.5 font-mono">
                Host Department *
              </label>
              <select
                value={formData.department}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors cursor-pointer"
              >
                {EVENT_DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.name}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#171715] mb-1.5 font-mono">
                Full Event Description *
              </label>
              <textarea
                rows={4}
                required
                minLength={10}
                maxLength={2000}
                placeholder="Outline schedule, keynote speaker credentials, prerequisites, and workshop syllabus..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="border-t border-[#E5E0D6] pt-6 flex items-center justify-end gap-3">
              <Button to="/admin/events" variant="secondary" size="md">
                Discard
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={loading} icon={Plus}>
                Publish Event
              </Button>
            </div>

          </form>

        </motion.div>

      </main>
      <Footer />
    </div>
  );
}
