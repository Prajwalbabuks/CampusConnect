import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Ticket
} from 'lucide-react';
import Button from './ui/Button';
import PatternWaves from './reactbits/PatternWaves';
import Magnet from './reactbits/Magnet';
import FeaturedSpotlightCard from './FeaturedSpotlightCard';
import { eventApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Staggered cinematic text entrance variants defined statically
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const heroPillVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const heroHeadlineVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

const heroSubtitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const heroButtonVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const heroTrustVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroSection() {
  // Start empty and render live data only — no fabricated fallback events.
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchEvents() {
      try {
        const liveEvents = await eventApi.getEvents();
        if (isMounted && Array.isArray(liveEvents)) {
          setEvents(liveEvents);
        }
      } catch {
        // Spotlight simply renders empty while the backend is unreachable;
        // fake events previously filled this space and looked identical to
        // real listings.
      }
    }
    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const featured = events.slice(0, 4);
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <section className="relative overflow-hidden bg-[#12110F] text-white pt-28 pb-20 md:pt-36 md:pb-28 border-b border-[#3A362F]">
      {/* React Bits PatternWaves Background Component */}
      <div className="absolute inset-0 pointer-events-auto opacity-75 overflow-hidden">
        <PatternWaves
          color="#F2A900"
          backgroundColor="#12110F"
          preset="silk"
          pattern="dot"
          wave="silk"
          spacing={9}
          markSize={0.9}
          depth={0.85}
          shine={0.9}
          contrast={1.25}
          speed={0.3}
          scale={1}
          direction={25}
          opacity={0.85}
          fade="edges"
          fadeSize={0.4}
          interactive={true}
          cursorSize={55}
          cursorStrength={0.7}
          className="w-full h-full"
        />
      </div>

      {/* Directional subtle dark vignettes for optimal text contrast */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#12110F] via-[#12110F]/85 to-transparent lg:w-3/5" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#12110F]/65 via-transparent to-[#12110F]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Column: Direct Institutional Headline & Staggered Cinematic Text Entrance */}
          <motion.div
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-6 pt-2"
          >
            {/* Institutional Eyebrow Pill */}
            <motion.div variants={heroPillVariants}>
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#3A362F] bg-[#211F1B]/90 text-stone-200 text-xs font-mono font-medium shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#F2A900] shadow-[0_0_8px_#F2A900]" />
                <span>National Institute of Engineering · Est. 1946 · Mysuru</span>
              </div>
            </motion.div>

            {/* Headline with Clean Authoritative Typography & Smooth De-blur Entrance */}
            <motion.div variants={heroHeadlineVariants}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                NIE Campus Events &amp; <span className="text-[#F2A900]">Seat Reservations</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.div variants={heroSubtitleVariants}>
              <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-xl font-normal">
                The centralized event discovery and seat reservation platform for students, faculty, and convenors across all engineering and cultural departments at NIE.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={heroButtonVariants}>
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Magnet magnetStrength={0.15}>
                  <Button to="/events" size="lg" variant="primary" icon={ArrowRight}>
                    Explore NIE Events
                  </Button>
                </Magnet>
                {isAdmin ? (
                  <Button to="/admin" size="lg" variant="outline-dark" icon={ShieldCheck}>
                    Admin Console
                  </Button>
                ) : isAuthenticated ? (
                  <Button to="/my-registrations" size="lg" variant="outline-dark" icon={Ticket}>
                    My Event Passes
                  </Button>
                ) : (
                  <Button to="/register" size="lg" variant="outline-dark">
                    Student Registration
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Trust Signals Strip */}
            <motion.div variants={heroTrustVariants}>
              <div className="pt-7 border-t border-[#3A362F] flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-medium text-stone-400">
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F2A900] shrink-0" />
                  <span>Verified Institutional Access</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F2A900] shrink-0" />
                  <span>One Seat Per USN</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F2A900] shrink-0" />
                  <span>Instant Seat Release</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Sliding Featured Event Spotlight Card (Self-Contained & Height-Locked) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: 'easeOut' }}
            className="lg:col-span-5 w-full"
          >
            <FeaturedSpotlightCard events={featured} />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
