import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Filter, ShieldCheck, QrCode, UserCheck, RefreshCw, Sparkles, BookOpen, AlertOctagon } from 'lucide-react';
import EventCard from './ui/EventCard';
import Button from './ui/Button';
import { eventApi } from '../services/api';
import { CATEGORY_FILTERS } from '../services/catalog';

export default function FeaturedEvents() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchEvents() {
      try {
        const liveEvents = await eventApi.getEvents();
        if (isMounted) setEvents(Array.isArray(liveEvents) ? liveEvents : []);
      } catch {
        // Render the empty state instead of fabricated events
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredEvents = selectedCategory === 'All'
    ? events.slice(0, 3)
    : events.filter((e) => e.category === selectedCategory).slice(0, 3);

  const getCategoryActiveStyle = (cat) => {
    switch (cat.toLowerCase()) {
      case 'all': return 'bg-[#F2A900] text-[#171715] font-bold border-[#F2A900] shadow-sm';
      case 'technical': return 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm';
      case 'workshop': return 'bg-purple-600 text-white font-bold border-purple-500 shadow-sm';
      case 'cultural': return 'bg-[#DB9600] text-[#171715] font-bold border-[#DB9600] shadow-sm';
      case 'sports': return 'bg-[#247A56] text-white font-bold border-[#247A56] shadow-sm';
      case 'seminar': return 'bg-cyan-600 text-white font-bold border-cyan-500 shadow-sm';
      default: return 'bg-[#F2A900] text-[#171715] font-bold border-[#F2A900]';
    }
  };

  const guidelines = [
    {
      section: '§01',
      group: 'Part I · Identity & Eligibility Governance',
      icon: UserCheck,
      title: 'Institutional Single Sign-On & Roster Reconciliation',
      desc: 'All event reservations are validated against official National Institute of Engineering student rosters. One account per verified student, strictly authenticated via institutional email.',
      restriction: 'Mandatory: Verified active academic standing required for laboratory & auditorium bookings.',
      tag: 'Identity Verification',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
    {
      section: '§02',
      group: 'Part I · Identity & Eligibility Governance',
      icon: ShieldCheck,
      title: 'Atomic One Seat Per USN Concurrency Lock',
      desc: 'To prevent duplicate bookings, seat hoarding, or bot scripts, our concurrency lock restricts registrations to exactly one active pass per verified USN per event.',
      restriction: 'Enforced Constraint: Duplicate reservations under differing aliases with matching USN are blocked at the database level.',
      tag: 'Fair Allocation',
      badgeColor: 'text-[#F2A900] bg-[#F2A900]/10 border-[#F2A900]/30',
    },
    {
      section: '§03',
      group: 'Part II · Gate Admission & Capacity Stewardship',
      icon: QrCode,
      title: 'Cryptographic Dynamic QR Hall Admission',
      desc: 'Your digital pass contains a cryptographically signed QR code. Present it at the hall or laboratory entrance for rapid handheld scanning alongside your physical NIE College ID card.',
      restriction: 'Physical Security: Screenshots and forwarded static tickets are rejected by the handheld gate reader.',
      tag: 'Contactless Entry',
      badgeColor: 'text-[#247A56] bg-[#247A56]/10 border-[#247A56]/30',
    },
    {
      section: '§04',
      group: 'Part II · Gate Admission & Capacity Stewardship',
      icon: RefreshCw,
      title: 'Zero Wastage Instant Seat Release Protocol',
      desc: 'Can’t make it? Cancel up to 2 hours prior to scheduled start time to immediately return your seat to waiting classmates across campus.',
      restriction: 'Collegiate Courtesy: Unexcused absences without cancellation may result in automatic 14-day reservation hold for high-demand symposiums.',
      tag: 'Zero Wastage',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
  ];

  return (
    <section className="relative py-24 bg-[#141311] text-white border-b border-[#3A362F] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#3A362F] bg-[#211F1B] text-[#F2A900] text-xs font-mono mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NIE Curated Calendar</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Featured NIE Events
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-stone-300 max-w-xl">
              High-demand technical workshops, national symposiums, and student showcases at National Institute of Engineering.
            </p>
          </div>

          <Button to="/events" variant="primary" size="md" icon={ArrowRight}>
            See All {events.length} Events
          </Button>
        </motion.div>

        {/* Category Filter Pills (Modern Segmented Control) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex flex-wrap items-center gap-2 mb-10 p-2 rounded-2xl bg-[#211F1B] border border-[#3A362F] backdrop-blur-md"
        >
          <span className="text-xs font-mono font-medium text-stone-400 px-3 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#F2A900]" />
            Category:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_FILTERS.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl border font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? getCategoryActiveStyle(cat)
                      : 'bg-[#161513] text-stone-300 border-[#3A362F] hover:border-[#F2A900]/40 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Events Grid with Motion Entrance & Perfect Equal Heights */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24 items-stretch" aria-busy="true">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-[#211F1B] border border-[#3A362F] animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="mb-24 rounded-3xl border border-dashed border-[#3A362F] bg-[#1B1916]/60 p-12 text-center">
            <Sparkles className="w-8 h-8 text-[#F2A900] mx-auto mb-3 opacity-60" />
            <p className="text-sm font-semibold text-white">
              {events.length === 0
                ? 'No events published yet'
                : 'No events in this category right now'}
            </p>
            <p className="mt-1.5 text-xs text-stone-400">
              {events.length === 0
                ? 'Check back soon — listings appear here as departments publish them.'
                : 'Try a different category, or browse the full catalog.'}
            </p>
            {events.length === 0 && (
              <Button to="/events" variant="outline-dark" size="sm" className="mt-5">
                Open Catalog
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24 items-stretch">
            {filteredEvents.map((event, idx) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
                className="h-full flex flex-col"
              >
                <EventCard event={event} dark={true} featured={idx === 0 && selectedCategory === 'All'} className="h-full" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Section Divider */}
        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3A362F]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#161513] px-4 text-xs font-mono text-[#F2A900] uppercase tracking-widest font-semibold">
              Official Institutional Guidelines
            </span>
          </div>
        </div>

        {/* Campus Guidelines Handbook Section (Target of #guidelines) */}
        <div id="guidelines" className="scroll-mt-28 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#3A362F] bg-[#211F1B] text-[#F2A900] text-xs font-mono mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>NIE Institutional Policies</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Campus Guidelines &amp; Reservation Policies
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-300">
              Official collegiate handbook governing student participation, seat reservations, and physical laboratory entrance across National Institute of Engineering halls.
            </p>
          </motion.div>

          {/* Institutional Handbook Layout with Numbered Sections & Architectural Rules (Avoiding repetitive cards) */}
          <div className="rounded-3xl border border-[#3A362F] bg-[#211F1B]/90 backdrop-blur-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-[#161513] border-b border-[#3A362F] flex flex-wrap items-center justify-between text-xs font-mono text-stone-400 gap-2">
              <span className="text-[#F2A900] font-semibold">NIE ACADEMIC SENATE DOCUMENT · REF: CC-POL-2026</span>
              <span>Mysuru Campus Intranet</span>
            </div>

            <div className="divide-y divide-[#3A362F]">
              {guidelines.map((guide, idx) => {
                const Icon = guide.icon;
                return (
                  <motion.div
                    key={guide.section}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: idx * 0.08 }}
                    className="p-6 sm:p-8 hover:bg-[#1E1C18] transition-colors"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Section Identification & Group Header */}
                      <div className="lg:col-span-3 flex lg:flex-col items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-2xl sm:text-3xl font-bold text-[#F2A900]">
                            {guide.section}
                          </span>
                          <div className={`p-2 rounded-xl border ${guide.badgeColor}`}>
                            <Icon className="w-5 h-5" strokeWidth={1.8} />
                          </div>
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 bg-[#161513] px-2.5 py-1 rounded border border-[#3A362F]">
                          {guide.tag}
                        </span>
                      </div>

                      {/* Content & Reading Width */}
                      <div className="lg:col-span-9 space-y-3">
                        <div className="text-[11px] font-mono text-[#77736A] uppercase tracking-wider">
                          {guide.group}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white font-sans leading-snug">
                          {guide.title}
                        </h3>
                        <p className="text-sm text-stone-300 leading-relaxed font-normal max-w-3xl">
                          {guide.desc}
                        </p>

                        {/* Callout Rule / Emphasis for Important Restrictions */}
                        <div className="mt-3 p-3.5 rounded-xl bg-[#161513] border border-[#3A362F] flex items-start gap-2.5 text-xs text-stone-300">
                          <AlertOctagon className="w-4 h-4 text-[#F2A900] shrink-0 mt-0.5" />
                          <span className="text-stone-300">{guide.restriction}</span>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="px-6 py-4 bg-[#161513] border-t border-[#3A362F] flex flex-wrap items-center justify-between text-xs font-mono text-stone-400 gap-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#247A56]" />
                <span>Enforced at Campus Gates & Laboratories · Active for Academic Year 2026</span>
              </span>
              <span className="text-stone-500">National Institute of Engineering, Mysuru</span>
            </div>
          </div>
        </div>

        {/* High-Impact Institutional CTA Banner for NIE Staff & Convenors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl bg-[#211F1B] border border-[#3A362F] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden bg-editorial-dark"
        >
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161513] text-[#F2A900] text-xs font-mono border border-[#3A362F]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NIE Faculty & Club Convenors</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans leading-tight">
                Are you hosting a campus event or departmental workshop?
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                Faculty coordinators and student club leads can sign in with their institutional credentials to publish event schedules, monitor real-time hall capacities, and export attendee rosters.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button to="/login?redirect=/admin" variant="primary" size="lg">
                Staff Admin Portal
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
