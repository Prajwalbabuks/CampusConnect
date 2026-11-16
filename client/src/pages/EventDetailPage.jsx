import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft, CheckCircle2, ShieldAlert, Lock, ArrowRight, Ticket, ShieldCheck, AlertCircle, Building2, Users, Edit, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { eventApi, registrationApi } from '../services/api';
import { getCategoryColor, formatEventDateLong, formatEventTime, getSeatsInfo } from '../utils/eventUi';

export default function EventDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadEventData = React.useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    setLoadError('');
    setActionError('');
    try {
      const data = await eventApi.getEventById(id);
      setEvent(data || null);
      if (!data) setNotFound(true);
      if (isAuthenticated && user?.role === 'student') {
        const myPasses = await registrationApi.getMyRegistrations();
        if (Array.isArray(myPasses)) {
          const hasPass = myPasses.some((p) => (p.event?._id || p.event) === id);
          setIsRegistered(hasPass);
        }
      }
    } catch (err) {
      if (err.status === 404) setNotFound(true);
      else setLoadError(err.message || 'Failed to load this event');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, user]);

  React.useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  const formattedDate = formatEventDateLong(event?.date);
  const formattedTime = formatEventTime(event);
  // Server-maintained counter is the single source of truth — the old
  // `registeredCount + (isRegistered ? 1 : 0)` arithmetic double-counted seats
  // right after a successful registration.
  const seatsLeft = event ? getSeatsInfo(event).seatsLeft : 0;
  const isFull = event ? getSeatsInfo(event).isFull : false;
  const fillPercentage = event ? getSeatsInfo(event).fillPercentage : 0;

  const handleRegister = async () => {
    if (!isAuthenticated || !event) return;
    setLoading(true);
    setActionError('');
    try {
      await registrationApi.registerForEvent(event._id);
      setIsRegistered(true);
      // Refetch so the capacity gauge reflects the server's real counter
      const fresh = await eventApi.getEventById(event._id);
      if (fresh) setEvent(fresh);
    } catch (err) {
      // Show the real server reason (hall full, already registered, …) instead
      // of silently displaying "Seat Confirmed" on failure.
      setActionError(err.message || 'Could not reserve your seat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!event) return;
    setLoading(true);
    setActionError('');
    try {
      await registrationApi.cancelRegistration(event._id);
      setIsRegistered(false);
      setShowCancelModal(false);
      const fresh = await eventApi.getEventById(event._id);
      if (fresh) setEvent(fresh);
    } catch (err) {
      setActionError(err.message || 'Could not release your seat. Please try again.');
      setShowCancelModal(false);
    } finally {
      setLoading(false);
    }
  };

  const retryLoad = () => loadEventData();

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-[#B9473D] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#171715] font-serif">Campus event not found</h1>
            <p className="mt-2 text-sm text-[#57534E]">
              This event may have been removed or the link is incorrect. REF: {id}
            </p>
            <Button to="/events" variant="primary" size="md" className="mt-6">
              Back to Events Catalog
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading && !event) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="h-64 rounded-3xl bg-white border border-[#E5E0D6] animate-pulse" aria-busy="true" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-[#B9473D] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#171715] font-serif">Couldn't load this event</h1>
            <p className="mt-2 text-sm text-[#57534E]">{loadError}</p>
            <Button variant="secondary" size="md" className="mt-6" onClick={retryLoad}>
              Retry
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#57534E] hover:text-[#171715] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events Catalog</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Editorial Details Column (8 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-8 rounded-3xl border border-[#E5E0D6] bg-white p-7 sm:p-10 shadow-editorial space-y-8"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={getCategoryColor(event.category)}>{event.category}</Badge>
                {event.department && (
                  <Badge variant="default" size="sm">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-[#8F5F00]" />
                      <span>{event.department}</span>
                    </span>
                  </Badge>
                )}
                <span className="text-xs font-mono text-[#77736A]">REF: {event._id}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171715] font-serif leading-tight break-words">
                {event.title}
              </h1>
            </div>

            {/* Quick Metadata Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-[#E5E0D6] py-5 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-[#8F5F00] border border-amber-200 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-[#171715] font-mono uppercase text-[10px] tracking-wider">Date</p>
                  <p className="font-medium text-[#57534E] mt-0.5">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-[#171715] font-mono uppercase text-[10px] tracking-wider">Time</p>
                  <p className="font-mono text-[#57534E] mt-0.5 tabular-nums">{formattedTime} onwards</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#1E6B4B] border border-[#247A56]/30 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-[#171715] font-mono uppercase text-[10px] tracking-wider">Campus Venue</p>
                  <p className="font-medium text-[#57534E] mt-0.5 truncate">{event.venue}</p>
                </div>
              </div>
            </div>

            {/* Event Description Content */}
            <div className="space-y-4 text-sm sm:text-base text-[#57534E] leading-relaxed">
              <h2 className="text-xl font-bold text-[#171715] font-serif">
                About this Event
              </h2>
              <p className="break-words">{event.description}</p>
              <p>
                This session is formally endorsed by the NIE Academic Senate. Registered students receive verifiable attendance credit logged to their departmental docket, access to code repositories, and laboratory workstation seating.
              </p>
            </div>

            {/* Institutional Participation / Convenor Rules */}
            {user?.role === 'admin' ? (
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#171715] font-semibold text-sm">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#8F5F00]" />
                  <h3>Collegiate Convenor & Attendance Verification Protocol</h3>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-xs text-[#57534E]">
                  <li>
                    <strong>Venue Gate Verification:</strong> Validate student attendance by searching the student's USN or checking their signed cryptographic QR pass against the official roster.
                  </li>
                  <li>
                    <strong>Capacity Regulation:</strong> If safety limits or seating arrangements change, update the hall quota via the Event Editor before admission closes.
                  </li>
                  <li>
                    <strong>Academic Credit Log:</strong> Verified attendees are automatically credited in the NIE Senate departmental database upon concluding the session.
                  </li>
                </ul>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#FCFBF7] border border-[#E5E0D6] p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#171715] font-semibold text-sm">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#F2A900]" />
                  <h3>National Institute of Engineering Participation Rules</h3>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-xs text-[#57534E]">
                  <li>
                    <strong>Atomic Concurrency Lock:</strong> Exactly one seat reservation per student, strictly mapped to your institutional email and USN.
                  </li>
                  <li>
                    <strong>Dynamic Digital Pass:</strong> Entry requires presenting your signed QR pass from the "My Passes" section alongside your physical NIE College ID card.
                  </li>
                  <li>
                    <strong>Seat Release Protocol:</strong> If unable to attend, please cancel your reservation at least 2 hours in advance to release the seat to your peers.
                  </li>
                </ul>
              </div>
            )}

          </motion.div>

          {/* Sticky Reservation / Administrative Panel Column (4 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="rounded-3xl border border-[#3A362F] bg-[#211F1B] p-6 sm:p-7 text-white shadow-2xl sticky top-24">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#3A362F] mb-5">
                <div className="flex items-center gap-2">
                  {user?.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-[#F2A900]" />
                  ) : (
                    <Ticket className="w-4 h-4 text-[#F2A900]" />
                  )}
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                    {user?.role === 'admin' ? 'Admin Purview' : 'Seat Reservation'}
                  </h3>
                </div>
                {user?.role === 'admin' ? (
                  <Badge variant="amber" dot size="sm">
                    Convenor Mode
                  </Badge>
                ) : (
                  <Badge variant={isFull ? 'danger' : 'success'} dot size="sm">
                    {isFull ? 'Hall Full' : 'Open'}
                  </Badge>
                )}
              </div>

              {/* Capacity Fill Gauge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-400">
                    {user?.role === 'admin' ? 'Total Enrolled / Quota' : 'Hall Allocation'}
                  </span>
                  <span className="text-white font-bold tabular-nums">
                    {event.registeredCount} / {event.capacity} seats
                  </span>
                </div>

                <div className="h-2 w-full bg-[#161513] rounded-full overflow-hidden border border-[#3A362F]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFull ? 'bg-[#B9473D]' : 'bg-[#F2A900] shadow-[0_0_8px_rgba(242,169,0,0.5)]'
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 pt-1">
                  <span>Remaining: {seatsLeft}</span>
                  <span className="text-[#F2A900] font-semibold">{fillPercentage}% filled</span>
                </div>
              </div>

              {/* Action Area Gated by Auth & Role */}
              <div className="mt-6 pt-6 border-t border-[#3A362F]">
                {actionError && (
                  <div className="mb-3 p-3 rounded-xl bg-[#B9473D]/10 border border-[#B9473D]/30 text-[11px] text-[#F1A9A0] flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{actionError}</span>
                  </div>
                )}
                {user?.role === 'admin' ? (
                  /* Administrator Controls */
                  <div className="space-y-3">
                    <div className="bg-[#161513] p-3.5 rounded-2xl border border-[#3A362F] mb-3 text-xs font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Convenor:</span>
                        <span className="text-white font-semibold truncate max-w-[150px]">{user?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Senate Body:</span>
                        <span className="text-[#F2A900] font-semibold">{user?.department || 'Academic Senate'}</span>
                      </div>
                    </div>

                    <Button
                      to={`/admin/events/${event._id}/participants`}
                      variant="primary"
                      size="md"
                      className="w-full"
                      icon={Users}
                    >
                      View Attendance & Roster
                    </Button>
                    <Button
                      to={`/admin/events/edit/${event._id}`}
                      variant="outline-dark"
                      size="md"
                      className="w-full"
                      icon={Edit}
                    >
                      Edit Event Details
                    </Button>

                    <p className="text-[10px] text-center text-stone-400 pt-2 font-mono">
                      Institutional Admin Privileges Active · Student pass issuance disabled
                    </p>
                  </div>
                ) : !isAuthenticated ? (
                  /* Unauthenticated State: Clearly prompts institutional sign in */
                  <div className="space-y-4 bg-[#161513] p-4.5 rounded-2xl border border-[#3A362F]">
                    <div className="flex items-start gap-2.5 text-xs">
                      <Lock className="w-4 h-4 text-[#F2A900] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">Institutional Sign In Required</p>
                        <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                          Seat reservation is reserved for verified NIE students. Sign in with your institutional credentials to secure your seat.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <Button
                        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                        variant="primary"
                        size="md"
                        className="w-full"
                      >
                        Sign In to Register
                      </Button>
                      <Button
                        to={`/register?redirect=${encodeURIComponent(location.pathname)}`}
                        variant="outline-dark"
                        size="md"
                        className="w-full"
                      >
                        Create Student Account
                      </Button>
                    </div>
                  </div>
                ) : isRegistered ? (
                  /* Authenticated Student & Seat Reserved */
                  <div className="space-y-4 bg-[#161513] p-4.5 rounded-2xl border border-[#247A56]/40">
                    <div className="flex items-center gap-2.5 text-xs text-[#247A56]">
                      <CheckCircle2 className="w-4.5 h-4.5 text-[#247A56] shrink-0" />
                      <span className="font-semibold text-white">Seat Confirmed & Allocated</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#211F1B] border border-[#3A362F] text-xs font-mono space-y-1.5">
                      <div className="flex justify-between text-stone-400">
                        <span>Student USN:</span>
                        <span className="text-white font-bold">{user?.usn || 'Enrolled'}</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Section:</span>
                        <span className="text-[#F2A900] font-bold">{user?.section || 'Section A'}</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Pass Status:</span>
                        <span className="text-[#247A56] font-bold">QR Active</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <Button
                        to="/my-registrations"
                        variant="primary"
                        size="md"
                        className="w-full"
                        icon={Ticket}
                      >
                        View My Digital Passes
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowCancelModal(true)}
                      >
                        Cancel My Seat Reservation
                      </Button>
                    </div>
                  </div>
                ) : isFull ? (
                  /* Hall Full */
                  <div className="space-y-3 bg-[#161513] p-4 rounded-xl border border-[#B9473D]/40">
                    <div className="flex items-center gap-2 text-xs text-[#B9473D]">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span className="font-semibold">Maximum capacity reached</span>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      All seats are currently booked. Check back if a classmate releases their reservation.
                    </p>
                    <Button variant="dark" size="md" disabled className="w-full">
                      Event Capacity Full
                    </Button>
                  </div>
                ) : (
                  /* Authenticated Student & Can Register */
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={loading}
                      onClick={handleRegister}
                      icon={ArrowRight}
                    >
                      Confirm Seat Reservation
                    </Button>
                    <div className="text-center">
                      <p className="text-[11px] text-stone-400 font-mono">
                        USN: <span className="text-white font-semibold">{user?.usn || user?.name}</span> ({user?.section || 'Section A'})
                      </p>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        Instant digital pass issuance with cryptographic QR
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </motion.div>

        </div>

        {/* Cancellation Confirmation Dialog */}
        <AnimatePresence>
          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-2xl bg-[#211F1B] border border-[#3A362F] p-6 text-white shadow-2xl"
              >
                <div className="flex items-center gap-3 text-[#B9473D] mb-4">
                  <div className="p-2 rounded-xl bg-[#B9473D]/10 border border-[#B9473D]/30">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white font-serif">
                    Release Reserved Seat?
                  </h3>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  Are you sure you want to cancel your reservation for <strong className="text-white">{event.title}</strong>? Your seat will be immediately released back to the open pool for other NIE students.
                </p>

                <div className="mt-6 flex items-center justify-end gap-2.5">
                  <Button
                    variant="outline-dark"
                    size="sm"
                    disabled={loading}
                    onClick={() => setShowCancelModal(false)}
                  >
                    Keep Reservation
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    isLoading={loading}
                    disabled={loading}
                    onClick={handleCancel}
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
