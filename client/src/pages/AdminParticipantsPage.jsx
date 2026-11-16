import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle2, Download, Users, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import AdminNav from '../components/AdminNav';
import Footer from '../components/Footer';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { adminApi, eventApi } from '../services/api';
import { getCategoryColor, formatEventDate, getSeatsInfo } from '../utils/eventUi';

// Escapes a value for CSV output. Cells beginning with =, +, - or @ are
// interpreted as spreadsheet formulas by Excel/Sheets — a student name like
// "=HYPERLINK(...)" would execute on open. Prefixing with an apostrophe
// neutralizes that, and quotes are doubled per RFC 4180.
function csvCell(value) {
  const str = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

export default function AdminParticipantsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [participants, setParticipants] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    setError('');
    try {
      const [evData, partData] = await Promise.all([
        eventApi.getEventById(id),
        adminApi.getEventParticipants(id),
      ]);

      if (!evData) {
        setNotFound(true);
        return;
      }
      setEvent(evData);
      setParticipants(partData && Array.isArray(partData.participants) ? partData.participants : []);
    } catch (err) {
      if (err.status === 404) setNotFound(true);
      else setError(err.message || 'Failed to load the attendance roster');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleAttendance = async (student) => {
    const regId = student.registrationId || student._id || student.id;
    if (!regId || actionLoadingId) return;
    setActionLoadingId(regId);

    // Optimistic local update so the row reacts instantly
    const isPresent = student.status === 'Checked In';
    setParticipants((prev) =>
      prev.map((p) => {
        const pid = p.registrationId || p._id || p.id;
        if (pid !== regId) return p;
        return { ...p, status: isPresent ? 'Confirmed' : 'Checked In' };
      })
    );

    try {
      const res = await adminApi.toggleCheckIn(regId);
      // The server's returned status/timestamp is authoritative — local clock
      // values were previously written into the roster even when the server
      // stored a different (or failed) check-in time.
      const updated = res?.data;
      setParticipants((prev) =>
        prev.map((p) => {
          const pid = p.registrationId || p._id || p.id;
          if (pid !== regId) return p;
          return {
            ...p,
            status: updated?.status || p.status,
            checkedInAt: updated ? updated.checkedInAt ?? null : p.checkedInAt,
          };
        })
      );
    } catch (err) {
      // Roll back: refetch the authoritative roster so no row shows a check-in
      // the server rejected. (The old code kept the fabricated state forever.)
      setError(err.message || 'Could not update attendance. Please try again.');
      try {
        const fresh = await adminApi.getEventParticipants(id);
        if (fresh && Array.isArray(fresh.participants)) setParticipants(fresh.participants);
      } catch {
        // Refetch failed too — the error banner stays visible
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const checkedInCount = participants.filter((p) => p.status === 'Checked In').length;

  const filtered = participants.filter((p) => {
    const queryLower = query.toLowerCase();
    const matchesQuery =
      (p.name || '').toLowerCase().includes(queryLower) ||
      (p.email || '').toLowerCase().includes(queryLower) ||
      (p.usn || '').toLowerCase().includes(queryLower) ||
      (p.section || '').toLowerCase().includes(queryLower) ||
      (p.branch || p.department || '').toLowerCase().includes(queryLower);

    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Checked In' && p.status === 'Checked In') ||
      (filterStatus === 'Confirmed' && p.status === 'Confirmed');

    return matchesQuery && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['#', 'Name', 'USN', 'Branch', 'Section', 'Email', 'Registration Time', 'Status', 'CheckIn Time'];
    const rows = participants.map((p, idx) => [
      idx + 1,
      csvCell(p.name),
      csvCell(p.usn),
      csvCell(p.branch || p.department),
      csvCell(p.section),
      csvCell(p.email),
      csvCell(p.registeredAt ? new Date(p.registeredAt).toLocaleString() : ''),
      csvCell(p.status || 'Confirmed'),
      csvCell(p.checkedInAt || 'N/A'),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    // BOM so Excel detects UTF-8 (student names with Unicode chars previously
    // rendered as mojibake), and a Blob URL instead of a data URI (the data
    // URI form breaks on large rosters and in some browsers).
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(event?.title || 'Event').replace(/[^\w-]+/g, '_')}_NIE_Attendance.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  if (loading && !event) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
        <AdminNav />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-44 rounded-3xl bg-white border border-[#E5E0D6] animate-pulse mb-8" aria-busy="true" />
          <div className="h-96 rounded-3xl bg-white border border-[#E5E0D6] animate-pulse" aria-busy="true" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
        <AdminNav />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-[#B9473D] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#171715] font-serif">Couldn't load the roster</h1>
            <p className="mt-2 text-sm text-[#57534E]">{error}</p>
            <Button variant="secondary" size="md" className="mt-6" onClick={loadData}>
              Retry
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const seats = getSeatsInfo(event);
  const formattedEventDate = formatEventDate(event.date);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
      <AdminNav />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#57534E] hover:text-[#171715] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Link>
        </div>

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

        {/* Event Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[#E5E0D6] bg-white p-6 sm:p-8 shadow-editorial mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getCategoryColor(event.category)}>{event.category}</Badge>
              <span className="text-xs font-mono text-[#77736A]">REF: {event._id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171715] font-serif">
              {event.title}
            </h1>
            <p className="mt-1 text-xs text-[#57534E]">
              Venue: <strong className="text-[#171715]">{event.venue}</strong> · Date: <span className="font-mono tabular-nums text-[#171715]">{formattedEventDate}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 border-t md:border-t-0 md:border-l border-[#E5E0D6] pt-4 md:pt-0 md:pl-8 shrink-0">
            <div>
              <p className="text-[11px] font-semibold text-[#77736A] uppercase tracking-wider font-mono">Enrolled Attendees</p>
              <p className="text-3xl font-bold font-mono text-[#171715] tabular-nums mt-0.5">
                {participants.length} <span className="text-base text-[#77736A] font-normal">/ {seats.capacity}</span>
              </p>
              <p className="text-xs text-[#1E6B4B] font-semibold mt-0.5 font-mono">
                {seats.seatsLeft} seats remaining
              </p>
            </div>

            <div className="border-l border-[#E5E0D6] pl-6 hidden sm:block">
              <p className="text-[11px] font-semibold text-[#77736A] uppercase tracking-wider font-mono">Gate Check-In</p>
              <p className="text-2xl font-bold font-mono text-[#247A56] tabular-nums mt-0.5">
                {checkedInCount} / {participants.length}
              </p>
              <p className="text-xs text-stone-500 font-mono">
                {participants.length > 0 ? Math.round((checkedInCount / participants.length) * 100) : 0}% present
              </p>
            </div>

            <div className="w-full sm:w-auto pt-2 sm:pt-0">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                disabled={participants.length === 0}
                onClick={handleExportCSV}
              >
                Export CSV Roster
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Attendee Roster Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-[#E5E0D6] bg-white shadow-editorial overflow-hidden"
        >
          
          <div className="p-6 border-b border-[#E5E0D6] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#171715] font-serif">
                Registered NIE Student Attendance Roster
              </h2>
              <p className="text-xs text-[#57534E]">
                Official student entries parsed by USN, department, and verified attendance status
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#F5F2EA] p-1 rounded-xl border border-[#E5E0D6] text-xs font-mono">
                {['All', 'Checked In', 'Confirmed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      filterStatus === status
                        ? 'bg-white text-[#171715] shadow-xs font-bold'
                        : 'text-[#77736A] hover:text-[#171715]'
                    }`}
                  >
                    {status === 'Checked In' ? 'Present' : status === 'Confirmed' ? 'Pending' : 'All'}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#77736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student, USN, section..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#57534E]">
                <Users className="w-8 h-8 text-[#77736A] mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-sm text-[#171715]">No participants registered yet</p>
                <p className="mt-1 text-stone-500">When students register for this event, their official dossier will appear here for gate verification.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FCFBF7] text-[#77736A] border-b border-[#E5E0D6] font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5 w-12 text-center">#</th>
                    <th className="px-6 py-3.5">Student Name</th>
                    <th className="px-6 py-3.5">USN</th>
                    <th className="px-6 py-3.5">Branch</th>
                    <th className="px-6 py-3.5 text-center">Section</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Registration Time</th>
                    <th className="px-6 py-3.5">Attendance Status</th>
                    <th className="px-6 py-3.5 text-right sticky right-0 bg-[#FCFBF7] shadow-[-6px_0_10px_rgba(0,0,0,0.03)] z-10">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D6]/60">
                  {filtered.map((student, idx) => {
                    const sId = student.registrationId || student._id || student.id;
                    const isActing = actionLoadingId === sId;

                    return (
                      <tr key={sId || idx} className="hover:bg-[#FCFBF7] transition-colors group">
                        <td className="px-6 py-4 text-center font-mono text-[#77736A] tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 font-bold text-[#171715]">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-[#171715]">
                          {student.usn}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F5F2EA] text-[#57534E] border border-[#E5E0D6]">
                            {student.branch || student.department || 'ENGG'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-amber-50 text-[#8F5F00] border border-amber-200">
                            {student.section || 'A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[#57534E]">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 font-mono text-[#77736A] tabular-nums">
                          {student.registeredAt ? new Date(student.registeredAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {student.status === 'Checked In' ? (
                            <Badge variant="success" dot size="sm">
                              Present ({student.checkedInAt || 'Verified'})
                            </Badge>
                          ) : (
                            <Badge variant="amber" dot size="sm">
                              Pending Arrival
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right sticky right-0 bg-white group-hover:bg-[#FCFBF7] shadow-[-6px_0_10px_rgba(0,0,0,0.03)] z-10">
                          <button
                            onClick={() => toggleAttendance(student)}
                            disabled={isActing}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                              student.status === 'Checked In'
                                ? 'bg-emerald-50 text-[#1E6B4B] border-emerald-200 hover:bg-emerald-100 shadow-xs'
                                : 'bg-white text-[#171715] border-[#E5E0D6] hover:bg-[#F5F2EA] hover:border-[#8F5F00]'
                            } ${isActing ? 'opacity-50 cursor-wait' : ''}`}
                            title={student.status === 'Checked In' ? 'Click to mark as absent' : 'Click to verify entry'}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${student.status === 'Checked In' ? 'text-[#247A56]' : 'text-stone-400'}`} />
                            <span>{student.status === 'Checked In' ? 'Verified' : 'Verify Entry'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </motion.div>

      </main>
      <Footer />
    </div>
  );
}
