import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import Button from './ui/Button';
import SpotlightCard from './reactbits/SpotlightCard';
import { useAuth } from '../context/AuthContext';
import { formatEventTime, getSeatsInfo } from '../utils/eventUi';

export default function FeaturedSpotlightCard({ events = [] }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const currentEvent = events[activeIdx] || events[0];

  // Auto-advance spotlight card every 5 seconds (pauses when hovered)
  useEffect(() => {
    if (isPaused || events.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveIdx((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, events.length]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setActiveIdx((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % events.length;
      }
      return (prev - 1 + events.length) % events.length;
    });
  };

  if (!currentEvent) return null;

  // NaN-safe date rendering (invalid dates previously showed "Invalid Date")
  const eventDate = new Date(currentEvent.date);
  const isDateValid = !isNaN(eventDate.getTime());
  const month = isDateValid ? eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase() : 'TBA';
  const day = isDateValid ? eventDate.getDate().toString().padStart(2, '0') : '--';
  const year = isDateValid ? eventDate.getFullYear() : '';
  // Stored `time` field is canonical; falls back to the date time only if absent
  const formattedTime = formatEventTime(currentEvent);
  const { fillPercentage, seatsLeft } = getSeatsInfo(currentEvent);

  // Directional slide variants
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 32 : -32,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? -32 : 32,
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <SpotlightCard
      dark={true}
      spotlightColor="rgba(242, 169, 0, 0.12)"
      borderColor="rgba(242, 169, 0, 0.35)"
      className="p-6 sm:p-8 rounded-3xl bg-[#1A1916]/95 border border-[#3A362F] shadow-2xl backdrop-blur-xl w-full flex flex-col justify-between"
    >
      {/* Card Header: Live Tag & Elegant Stepper */}
      <div className="flex items-center justify-between pb-4 border-b border-[#3A362F]/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F2A900] animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2A900] font-semibold">
            Spotlight
          </span>
          <span className="text-stone-600">·</span>
          <span className="text-[11px] font-mono text-stone-300 capitalize font-medium">
            {currentEvent.category}
          </span>
        </div>

        {/* Minimalist Round Stepper */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-stone-400 tabular-nums">
            <span className="text-white font-bold">{activeIdx + 1}</span> / {events.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => paginate(-1)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-[#24221E] text-stone-400 hover:text-white hover:bg-[#322F2A] border border-[#3A362F] transition-all cursor-pointer"
              aria-label="Previous event"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-[#24221E] text-stone-400 hover:text-white hover:bg-[#322F2A] border border-[#3A362F] transition-all cursor-pointer"
              aria-label="Next event"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Track with Locked Proportions */}
      <div
        className="relative overflow-hidden py-4 min-h-[250px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentEvent._id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-3.5"
          >
            {/* Clean Metadata Line */}
            <div className="flex items-center gap-2 text-xs font-mono text-stone-400 flex-wrap">
              <span className="text-[#F2A900] font-semibold font-mono">
                {month} {day}, {year}
              </span>
              <span className="text-stone-600">•</span>
              <span>{formattedTime}</span>
              {currentEvent.departmentCode && (
                <>
                  <span className="text-stone-600">•</span>
                  <span className="px-2 py-0.5 rounded bg-[#24221E] border border-[#3A362F] text-stone-200 text-[10px] font-semibold">
                    {currentEvent.departmentCode}
                  </span>
                </>
              )}
            </div>

            {/* Title: Confident, readable editorial headline */}
            <h3 className="text-2xl font-bold text-white tracking-tight leading-snug line-clamp-2 min-h-[3.5rem]">
              {currentEvent.title}
            </h3>

            {/* Description: 2 lines with comfortable leading */}
            <p className="text-xs sm:text-sm text-stone-300 line-clamp-2 leading-relaxed">
              {currentEvent.description}
            </p>

            {/* Venue Location */}
            <div className="flex items-center gap-2 text-xs text-stone-400 pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#F2A900] shrink-0" />
              <span className="truncate">{currentEvent.venue}</span>
            </div>

            {/* Seat Availability & Action Row */}
            <div className="pt-3 border-t border-[#3A362F]/70 flex items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-[120px]">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className={`w-1.5 h-1.5 rounded-full ${seatsLeft <= 15 ? 'bg-[#F2A900]' : 'bg-[#247A56]'}`} />
                  <span className="text-white font-medium">{seatsLeft} seats left</span>
                </div>
                <div className="h-1.5 w-28 bg-[#24221E] rounded-full overflow-hidden border border-[#3A362F]">
                  <div
                    className="h-full bg-[#F2A900] rounded-full transition-all duration-300"
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>

              <Button
                to={`/events/${currentEvent._id}`}
                variant="primary"
                size="md"
                icon={ArrowRight}
                className="shrink-0"
              >
                {isAdmin ? 'View Event & Roster' : 'Reserve Seat'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Discrete Progress Indicator */}
      <div className="pt-3 border-t border-[#3A362F]/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          {events.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > activeIdx ? 1 : -1);
                setActiveIdx(idx);
              }}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                activeIdx === idx
                  ? 'w-6 bg-[#F2A900]'
                  : 'w-1.5 bg-[#3A362F] hover:bg-stone-500'
              }`}
              aria-label={`Event ${idx + 1}`}
            />
          ))}
        </div>

        <span className="text-[10px] font-mono text-stone-400">
          Auto-advances · Hover to pause
        </span>
      </div>
    </SpotlightCard>
  );
}
