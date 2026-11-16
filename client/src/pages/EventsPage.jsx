import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Lock, CalendarDays, ArrowRight, X, Building2, Filter, Plus, ShieldCheck, ListFilter, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/ui/EventCard';
import Button from '../components/ui/Button';
import { CATEGORY_FILTERS, DEPARTMENT_FILTERS } from '../services/catalog';
import { useAuth } from '../context/AuthContext';
import { eventApi } from '../services/api';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDept = searchParams.get('dept') || 'All';
  const selectedCategory = searchParams.get('category') || 'All';
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventApi.getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Update URL params when filters change (Single source of truth via searchParams)
  const handleCategoryChange = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') newParams.delete('category');
    else newParams.set('category', cat);
    setSearchParams(newParams);
  };

  const handleDeptChange = (deptCode) => {
    const newParams = new URLSearchParams(searchParams);
    if (deptCode === 'All') newParams.delete('dept');
    else newParams.set('dept', deptCode);
    setSearchParams(newParams);
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  // Full public access to discover all events
  const filteredEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesDept = selectedDept === 'All' || event.departmentCode === selectedDept;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.department && event.department.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesDept && matchesSearch;
  });

  const getCategoryActiveStyle = (cat) => {
    switch (cat.toLowerCase()) {
      case 'all': return 'bg-[#171715] text-white border-[#171715] shadow-xs';
      case 'technical': return 'bg-blue-700 text-white border-blue-700 shadow-xs';
      case 'workshop': return 'bg-purple-700 text-white border-purple-700 shadow-xs';
      case 'cultural': return 'bg-[#DB9600] text-[#171715] font-bold border-[#DB9600] shadow-xs';
      case 'sports': return 'bg-[#247A56] text-white border-[#247A56] shadow-xs';
      case 'seminar': return 'bg-cyan-700 text-white border-cyan-700 shadow-xs';
      default: return 'bg-[#F2A900] text-[#171715] border-[#F2A900]';
    }
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedDept !== 'All';

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">

        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="border-b border-[#E5E0D6] pb-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#8F5F00] uppercase tracking-wider mb-2 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900]" />
                <span>National Institute of Engineering · Collegiate Catalogue</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#171715] font-serif">
                NIE Events Catalog
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#57534E] max-w-2xl leading-relaxed">
                {user?.role === 'admin'
                  ? `Administrator Purview: Logged in as ${user?.name} (${user?.department || 'Academic & Event Senate'}). Oversee campus event listings, hall capacity utilization, and verified student rosters.`
                  : isAuthenticated
                  ? `Logged in as ${user?.name} (${user?.section || user?.usn}). Filter and reserve seats across all departmental symposia.`
                  : 'Centralized registry of technical symposiums, workshops, and student festivals across all NIE departments.'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {user?.role === 'admin' ? (
                <Button to="/admin/events" variant="primary" size="sm" icon={ListFilter}>
                  Manage All Listings
                </Button>
              ) : isAuthenticated ? (
                <div className="font-mono text-xs text-[#1E6B4B] bg-[#EAF4EE] border border-[#247A56]/30 px-3.5 py-2 rounded-xl shadow-xs tabular-nums font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#247A56] animate-pulse" />
                  <span>Institutional Access Verified · {events.length} Events Listed</span>
                </div>
              ) : (
                <div className="font-mono text-xs text-[#8F5F00] bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl shadow-xs tabular-nums font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F2A900]" />
                  <span>Public Collegiate Catalog · {events.length} Open Events</span>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-[#77736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search event title, hall, department, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors shadow-editorial"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Department Quick Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-[#77736A] flex items-center gap-1.5 shrink-0">
                <Building2 className="w-3.5 h-3.5 text-[#F2A900]" />
                <span className="hidden sm:inline">Department:</span>
              </span>
              <select
                value={selectedDept}
                onChange={(e) => handleDeptChange(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl font-medium bg-white text-[#171715] border border-[#E5E0D6] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors cursor-pointer shadow-editorial"
              >
                {DEPARTMENT_FILTERS.map((dept) => (
                  <option key={dept.code} value={dept.code}>
                    {dept.name} {dept.code !== 'All' ? `(${dept.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Pills (Horizontal Segmented Control) */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-mono font-medium text-[#77736A] flex items-center gap-1.5 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#F2A900]" />
              <span className="hidden sm:inline">Category:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                    selectedCategory === cat
                      ? getCategoryActiveStyle(cat)
                      : 'bg-white text-[#57534E] border-[#E5E0D6] hover:bg-[#FCFBF7] hover:border-[#D5CEBE]'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filter Indicators & Summary */}
          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-[#77736A] font-mono gap-2 pt-2 border-t border-[#E5E0D6]/60">
            <div className="flex flex-wrap items-center gap-2">
              <span>
                Showing {filteredEvents.length} of {events.length} campus events
              </span>
              {selectedDept !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-[#8F5F00] border border-amber-200">
                  <span>Dept: {selectedDept}</span>
                  <button onClick={() => handleDeptChange('All')} className="hover:text-black cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#211F1B] text-white border border-[#3A362F]">
                  <span>Cat: {selectedCategory}</span>
                  <button onClick={() => handleCategoryChange('All')} className="hover:text-[#F2A900] cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="text-[#8F5F00] hover:text-[#734D00] hover:underline font-semibold cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Results Grid with Mixed-Width Editorial Layout */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-[#E5E0D6] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white border border-[#E5E0D6] rounded-2xl p-8 shadow-editorial">
            <AlertCircle className="w-10 h-10 text-[#B9473D] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#171715] font-serif">Couldn't load the event catalog</h3>
            <p className="mt-1.5 text-xs text-[#57534E] max-w-sm mx-auto">{error}</p>
            <Button variant="secondary" size="sm" className="mt-5" onClick={loadEvents}>
              Retry
            </Button>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredEvents.map((event, idx) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className={`h-full flex flex-col ${idx === 0 && selectedCategory === 'All' && selectedDept === 'All' && !searchQuery ? 'md:col-span-2' : ''}`}
              >
                <EventCard
                  event={event}
                  className="h-full"
                  featured={idx === 0 && selectedCategory === 'All' && selectedDept === 'All' && !searchQuery}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-[#E5E0D6] rounded-2xl p-8 shadow-editorial">
            <CalendarDays className="w-12 h-12 text-[#D5CEBE] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#171715] font-serif">
              No matching campus events found
            </h3>
            <p className="mt-1.5 text-xs text-[#57534E] max-w-sm mx-auto">
              We couldn't find any events matching your current filter criteria. Try resetting your search terms or selecting another department.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-5"
              onClick={handleClearAllFilters}
            >
              Reset All Filters
            </Button>
          </div>
        )}

        {/* Institutional Registration Callout Banner for Unauthenticated Students */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 rounded-3xl bg-[#211F1B] border border-[#3A362F] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden bg-editorial-dark"
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161513] text-[#F2A900] text-xs font-mono border border-[#3A362F]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verified Student Seat Reservation</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif leading-tight">
                  Reserve your place at upcoming NIE events
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed">
                  Sign in with your institutional credentials to secure seats, obtain cryptographic QR hall admission passes, and earn verified academic attendance credits.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button to="/login?redirect=/events" variant="outline-dark" size="lg">
                  Sign In with Institutional ID
                </Button>
                <Button to="/register?redirect=/events" variant="primary" size="lg" icon={ArrowRight}>
                  Create Student Account
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Administrator Quick Action Banner */}
        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 rounded-3xl bg-[#211F1B] border border-[#3A362F] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden bg-editorial-dark"
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161513] text-[#F2A900] text-xs font-mono border border-[#3A362F]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Collegiate Event Governance & Rosters</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif leading-tight">
                  Schedule a symposium or manage attendance rosters
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed">
                  Have an upcoming technical workshop or academic symposium? Publish new listings, adjust venue quotas, and monitor real-time student registrations.
                </p>
              </div>

              <div className="shrink-0">
                <Button to="/admin/events/new" variant="primary" size="lg" icon={Plus}>
                  Publish New Event Listing
                </Button>
              </div>
            </div>
          </motion.div>
        )}

      </main>
      <Footer />
    </div>
  );
}
