import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import Badge from './Badge';
import { useAuth } from '../../context/AuthContext';
import { getSeatsInfo, formatEventTime } from '../../utils/eventUi';

export default function EventCard({ event, dark = false, featured = false, className = '' }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  if (!event) return null;

  // NaN-safe date block (invalid dates previously rendered "Invalid Date")
  const eventDate = new Date(event.date);
  const isDateValid = !isNaN(eventDate.getTime());
  const month = isDateValid ? eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase() : 'TBA';
  const day = isDateValid ? eventDate.getDate().toString().padStart(2, '0') : '--';
  // Stored `time` field is canonical ("10:00 AM"); falls back to the date time
  const time = formatEventTime(event);

  const { isFull, seatsLeft, fillPercentage, registered, capacity } = getSeatsInfo(event);

  const getCategoryTheme = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'technical':
        return {
          border: 'border-l-blue-500',
          badge: 'blue',
          dateBg: dark ? 'bg-blue-950/70 text-blue-300 border-blue-800/60' : 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'workshop':
        return {
          border: 'border-l-purple-500',
          badge: 'violet',
          dateBg: dark ? 'bg-purple-950/70 text-purple-300 border-purple-800/60' : 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'cultural':
        return {
          border: 'border-l-[#F2A900]',
          badge: 'amber',
          dateBg: dark ? 'bg-[#F2A900]/15 text-[#F2A900] border-[#F2A900]/30' : 'bg-amber-50 text-amber-900 border-amber-200',
        };
      case 'sports':
        return {
          border: 'border-l-[#247A56]',
          badge: 'emerald',
          dateBg: dark ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60' : 'bg-[#EAF4EE] text-[#1E6B4B] border-[#247A56]/30',
        };
      case 'seminar':
        return {
          border: 'border-l-cyan-600',
          badge: 'cyan',
          dateBg: dark ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60' : 'bg-cyan-50 text-cyan-900 border-cyan-200',
        };
      default:
        return {
          border: 'border-l-[#77736A]',
          badge: 'default',
          dateBg: dark ? 'bg-[#2A2723] text-stone-300 border-[#3A362F]' : 'bg-[#F5F2EA] text-[#57534E] border-[#E5E0D6]',
        };
    }
  };

  const theme = getCategoryTheme(event.category);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`group relative flex flex-col justify-between h-full rounded-2xl border border-l-4 ${theme.border} p-6 transition-all duration-300 ${
        dark
          ? 'bg-[#211F1B]/90 border-[#3A362F] text-white shadow-xl shadow-black/20 hover:border-[#F2A900]/50 hover:shadow-2xl'
          : 'bg-white border-[#E5E0D6] shadow-editorial hover:shadow-editorial-hover hover:border-[#D5CEBE]'
      } ${className}`}
    >
      <div className="flex-1 flex flex-col">
        {/* Top Header: Date Block + Category Badge + Seat Availability */}
        <div className="flex items-start justify-between gap-2.5 min-h-[48px]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`flex flex-col items-center justify-center rounded-xl border px-2.5 py-1 text-center min-w-[50px] shrink-0 ${theme.dateBg}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono leading-none">{month}</span>
              <span className="text-base font-bold font-mono leading-tight tabular-nums mt-0.5">{day}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <Badge variant={theme.badge} size="sm">
                {event.category}
              </Badge>
              {event.departmentCode && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                  dark ? 'bg-[#161513] text-stone-300 border-[#3A362F]' : 'bg-[#F5F2EA] text-[#57534E] border-[#E5E0D6]'
                }`}>
                  {event.departmentCode}
                </span>
              )}
              {featured && (
                <span className="text-[10px] font-mono uppercase text-[#F2A900] bg-[#F2A900]/10 border border-[#F2A900]/30 px-2 py-0.5 rounded shrink-0 font-medium">
                  ★ Headliner
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 whitespace-nowrap pl-1">
            {isFull ? (
              <Badge variant="danger" dot size="sm">Hall Full</Badge>
            ) : seatsLeft <= 15 ? (
              <Badge variant="warning" dot size="sm">{seatsLeft} seats left</Badge>
            ) : (
              <Badge variant="success" dot size="sm">Seats Open</Badge>
            )}
          </div>
        </div>

        {/* Title & Description with guaranteed alignment */}
        <div className="mt-4 flex-1 flex flex-col">
          <Link
            to={`/events/${event._id}`}
            className={`transition-colors ${dark ? 'group-hover:text-[#F2A900]' : 'group-hover:text-[#DB9600]'}`}
          >
            <h3 className={`font-bold leading-snug tracking-tight line-clamp-2 text-base sm:text-lg min-h-[3.25rem] ${dark ? 'text-white' : 'text-[#171715]'}`}>
              {event.title}
            </h3>
          </Link>
          <p className={`mt-2 text-xs leading-relaxed line-clamp-2 min-h-[2.5rem] ${dark ? 'text-stone-300' : 'text-[#57534E]'}`}>
            {event.description}
          </p>
        </div>

        {/* Schedule & Venue Metadata */}
        <div className={`mt-4 space-y-2 border-t pt-3.5 text-xs mt-auto ${dark ? 'border-[#3A362F] text-stone-400' : 'border-[#E5E0D6] text-[#77736A]'}`}>
          <div className="flex items-center gap-2">
            <Calendar className={`w-3.5 h-3.5 shrink-0 ${dark ? 'text-[#F2A900]' : 'text-[#8F5F00]'}`} strokeWidth={1.8} />
            <span className={`font-mono tabular-nums ${dark ? 'text-stone-200' : 'text-[#171715]'}`}>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className={`w-3.5 h-3.5 shrink-0 ${dark ? 'text-[#F2A900]' : 'text-[#8F5F00]'}`} strokeWidth={1.8} />
            <span className={`truncate font-medium ${dark ? 'text-stone-300' : 'text-[#171715]'}`}>{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Capacity Bar + Direct Action */}
      <div className={`mt-5 border-t pt-4 shrink-0 ${dark ? 'border-[#3A362F]' : 'border-[#E5E0D6]'}`}>
        <div className={`flex items-center justify-between text-xs mb-2 ${dark ? 'text-stone-400' : 'text-[#77736A]'}`}>
          <span className={`flex items-center gap-1.5 font-mono text-[11px] tabular-nums ${dark ? 'text-stone-300' : 'text-[#171715]'}`}>
            <Users className="w-3.5 h-3.5 text-[#77736A]" />
            {registered} / {capacity} seats
          </span>
          <span className="font-mono text-[11px] tabular-nums font-semibold">
            {fillPercentage}% filled
          </span>
        </div>

        <div className={`h-1.5 w-full rounded-full overflow-hidden ${dark ? 'bg-[#161513] border border-[#3A362F]' : 'bg-[#E5E0D6]'}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isFull ? 'bg-[#B9473D]' : fillPercentage > 85 ? 'bg-[#F2A900]' : dark ? 'bg-[#F2A900]' : 'bg-[#171715]'
            }`}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className={`text-[11px] font-mono ${dark ? 'text-stone-500' : 'text-[#77736A]'}`}>
            REF: {event._id}
          </span>
          <Link
            to={`/events/${event._id}`}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              dark
                ? 'text-[#F5F2EA] group-hover:text-[#F2A900]'
                : 'text-[#171715] group-hover:text-[#DB9600]'
            }`}
          >
            <span>{isAdmin ? 'View Event & Roster' : 'View event & reserve'}</span>
            <ArrowUpRight
              className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                dark ? 'text-[#F2A900]' : 'text-[#171715] group-hover:text-[#DB9600]'
              }`}
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
