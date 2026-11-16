import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trash2, ArrowRight, AlertCircle, QrCode, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { registrationApi } from '../services/api';
import { getCategoryColor, formatEventDate, formatEventTime } from '../utils/eventUi';

export default function MyRegistrationsPage() {
  const { user } = useAuth();

  // NOTE: Admin access control is handled by the StudentRoute wrapper in App.jsx.
  // Do NOT early-return before the hooks below — conditional hook order crashes
  // React when the role changes while this page is mounted.

  const [registrations, setRegistrations] = useState([]);
  const [cancelModalEvent, setCancelModalEvent] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await registrationApi.getMyRegistrations();
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load your passes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const confirmCancel = async () => {
    if (!cancelModalEvent || cancelling) return;
    setCancelling(true);
    try {
      await registrationApi.cancelRegistration(cancelModalEvent._id);
      setRegistrations((prev) => prev.filter((r) => r.event._id !== cancelModalEvent._id));
    } catch (err) {
      setError(err.message || 'Could not release the seat. Please try again.');
    } finally {
      setCancelModalEvent(null);
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-[#E5E0D6] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8F5F00] uppercase tracking-wider mb-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900]" />
              <span>NIE Student Pass Registry</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171715] font-serif">
              My Event Passes
            </h1>
            <p className="mt-1 text-sm text-[#57534E]">
              Confirmed digital hall admission passes and verified seat allocations for {user?.name || 'student'}.
            </p>
          </div>
          <Button to="/events" variant="primary" size="sm" icon={ArrowRight}>
            Browse More Events
          </Button>
        </motion.div>

        {/* Registrations List with Ticket Pass Layout */}
        {loading ? (
          <div className="space-y-6" aria-busy="true">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-44 rounded-3xl bg-white border border-[#E5E0D6] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white border border-[#E5E0D6] rounded-3xl p-8 shadow-editorial">
            <AlertCircle className="w-10 h-10 text-[#B9473D] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#171715] font-serif">Couldn't load your passes</h3>
            <p className="mt-1.5 text-xs text-[#57534E] max-w-sm mx-auto">{error}</p>
            <Button variant="secondary" size="sm" className="mt-5" onClick={loadRegistrations}>
              Retry
            </Button>
          </div>
        ) : registrations.length > 0 ? (
          <div className="space-y-6">
            {registrations.map(({ _id, event, registeredAt, ticketCode }, idx) => {
              const formattedDate = formatEventDate(event.date);
              const formattedTime = formatEventTime(event);

              return (
                <motion.div
                  key={_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="rounded-3xl border border-[#E5E0D6] bg-white shadow-editorial overflow-hidden flex flex-col md:flex-row hover:border-[#D5CEBE] transition-all"
                >
                  {/* Left Ticket Stub / Details */}
                  <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant={getCategoryColor(event.category)}>{event.category}</Badge>
                        <Badge variant="success" dot>Confirmed Seat</Badge>
                        <span className="text-[11px] font-mono text-[#77736A]">
                          Allocated: {new Date(registeredAt).toLocaleDateString()}
                        </span>
                      </div>

                      <Link to={`/events/${event._id}`}>
                        <h3 className="text-xl sm:text-2xl font-bold text-[#171715] hover:text-[#DB9600] transition-colors font-serif break-words">
                          {event.title}
                        </h3>
                      </Link>

                      <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-[#57534E]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#8F5F00]" />
                          <span className="font-mono tabular-nums">{formattedDate} · {formattedTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#8F5F00]" />
                          <span className="font-medium truncate max-w-xs">{event.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E5E0D6] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#77736A]">
                      <span>USN: <strong className="text-[#171715]">{user?.usn || 'Verified'}</strong></span>
                      <span>Section: <strong className="text-[#8F5F00]">{user?.section || 'Section A'}</strong></span>
                      <span>Pass: <strong className="text-[#171715]">{ticketCode}</strong></span>
                    </div>
                  </div>

                  {/* Right Stub: QR Admission and Actions */}
                  <div className="md:w-64 bg-[#FCFBF7] border-t md:border-t-0 md:border-l border-dashed border-[#E5E0D6] p-6 flex flex-col items-center justify-between text-center gap-4">
                    <div className="w-full flex flex-col items-center">
                      <div className="p-3 bg-white rounded-2xl border border-[#E5E0D6] shadow-xs mb-2">
                        <QrCode className="w-20 h-20 text-[#171715]" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#77736A]">
                        Scan at Hall Gate
                      </span>
                    </div>

                    <div className="w-full flex items-center justify-center gap-2">
                      <Button
                        to={`/events/${event._id}`}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                      >
                        Details
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setCancelModalEvent(event)}
                      >
                        Release
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-[#E5E0D6] rounded-3xl p-8 shadow-editorial">
            <Ticket className="w-12 h-12 text-[#D5CEBE] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#171715] font-serif">
              No active event passes found
            </h3>
            <p className="mt-1 text-xs text-[#57534E] max-w-sm mx-auto">
              You haven't reserved seats for any upcoming events yet. Explore our collegiate catalog to reserve your first pass.
            </p>
            <Button to="/events" variant="primary" size="sm" className="mt-5">
              Explore Event Catalog
            </Button>
          </div>
        )}

        {/* Cancellation Confirmation Dialog with Motion */}
        <AnimatePresence>
          {cancelModalEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-2xl bg-white border border-[#E5E0D6] p-6 text-[#171715] shadow-2xl"
              >
                <div className="flex items-center gap-3 text-[#B9473D] mb-3">
                  <div className="p-2 rounded-xl bg-[#FDF0EE] border border-[#B9473D]/30">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#171715] font-serif">
                    Release Reserved Pass?
                  </h3>
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  Are you sure you want to release your seat for <strong className="text-[#171715]">{cancelModalEvent.title}</strong>? Your reservation will be immediately returned to the open campus roster.
                </p>
                <div className="mt-6 flex items-center justify-end gap-2.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={cancelling}
                    onClick={() => setCancelModalEvent(null)}
                  >
                    Keep Pass
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    isLoading={cancelling}
                    disabled={cancelling}
                    onClick={confirmCancel}
                  >
                    Confirm Release
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
