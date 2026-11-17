import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, Phone, GraduationCap } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { EVENT_DEPARTMENTS } from '../services/catalog';

// Student branches only — CUL/PED host campus events but are not student
// enrolment branches, so they are excluded from the registration dossier.
const DEPARTMENTS = EVENT_DEPARTMENTS.filter((d) => !['CUL', 'PED'].includes(d.code));

const YEARS = [
  { label: '1st Year (Sem 1 & 2)', year: '1st Year', sem: '1st/2nd Sem', defaultBatch: '2026' },
  { label: '2nd Year (Sem 3 & 4)', year: '2nd Year', sem: '3rd/4th Sem', defaultBatch: '2025' },
  { label: '3rd Year (Sem 5 & 6)', year: '3rd Year', sem: '5th/6th Sem', defaultBatch: '2024' },
  { label: '4th Year (Sem 7 & 8)', year: '4th Year', sem: '7th/8th Sem', defaultBatch: '2023' },
];

const SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D'];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    usn: '',
    department: 'Computer Science & Engineering',
    branchCode: 'CSE',
    year: '2nd Year',
    semester: '3rd/4th Sem',
    section: 'Section A',
    batch: '2025',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { register, isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/events', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleDepartmentChange = (e) => {
    const selectedDept = DEPARTMENTS.find(d => d.name === e.target.value);
    setFormData(prev => ({
      ...prev,
      department: e.target.value,
      branchCode: selectedDept?.code || 'CSE',
    }));
  };

  const handleYearChange = (e) => {
    const selected = YEARS.find(y => y.year === e.target.value);
    setFormData(prev => ({
      ...prev,
      year: e.target.value,
      semester: selected?.sem || 'Sem 1',
      batch: selected?.defaultBatch || '2025',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
      setError('Please provide a valid institutional or personal email address.');
      return;
    }

    const cleanUsn = formData.usn.trim().toUpperCase();
    if (!cleanUsn || cleanUsn.length < 7) {
      setError('Please provide a valid University Seat Number (e.g. 4NI23CS045).');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        usn: cleanUsn,
        department: formData.department,
        branchCode: formData.branchCode,
        year: formData.year,
        semester: formData.semester,
        section: formData.section,
        batch: formData.batch,
        password: formData.password,
      });

      setLoading(false);
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate('/events');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F5F2EA] px-4 py-12 text-[#171715]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-2xl"
      >
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-3">
            <span className="text-2xl font-bold tracking-tight text-[#171715] group-hover:text-[#DB9600] transition-colors">
              NIE <span className="font-serif italic text-[#F2A900] text-3xl font-normal ml-0.5">CampusConnect</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F2A900]" />
          </Link>
          <h1 className="text-3xl font-bold text-[#171715] tracking-tight font-serif">
            Student Onboarding & Registration
          </h1>
          <p className="mt-1.5 text-xs text-[#57534E]">
            Create your permanent student dossier. Your details will be automatically attached to event seat bookings and digital admission passes.
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-[#E5E0D6] bg-white p-7 sm:p-10 shadow-editorial">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#FDF0EE] border border-[#B9473D]/30 text-[#9E352C] text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#B9473D] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Personal & Contact */}
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#8F5F00] uppercase tracking-wider mb-3 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900]" />
                <span>1. Personal & Contact Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171715] mb-1 font-mono">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#77736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arun Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171715] mb-1 font-mono">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#77736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. arunkumar@nie.ac.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#171715] mb-1 font-mono">
                    Mobile / Phone Number (Optional for Event SMS/Updates)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#77736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: NIE Academic Information */}
            <div className="pt-2 border-t border-[#E5E0D6]/60">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#8F5F00] uppercase tracking-wider mb-3 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900]" />
                <span>2. NIE Academic Dossier</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171715] mb-1 font-mono">
                    University Seat Number (USN) *
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-[#77736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 4NI23CS045"
                      value={formData.usn}
                      onChange={(e) => setFormData({ ...formData, usn: e.target.value.toUpperCase() })}
                      className="w-full pl-10 pr-3.5 py-2 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors font-mono uppercase font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171715] mb-1 font-mono">
                    Class Section *
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors cursor-pointer font-mono font-medium"
                  >
                    {SECTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#171715] mb-1 font-mono">
                    Engineering Department / Branch *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.department}
                      onChange={handleDepartmentChange}
                      className="w-full px-3.5 py-2 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors cursor-pointer"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d.code} value={d.name}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171715] mb-1 font-mono">
                    Year of Study *
                  </label>
                  <select
                    value={formData.year}
                    onChange={handleYearChange}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors cursor-pointer font-mono"
                  >
                    {YEARS.map(y => (
                      <option key={y.year} value={y.year}>{y.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171715] mb-1 font-mono">
                    Graduation Batch Year
                  </label>
                  <input
                    type="text"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors font-mono tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Security Credentials */}
            <div className="pt-2 border-t border-[#E5E0D6]/60">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#8F5F00] uppercase tracking-wider mb-3 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900]" />
                <span>3. Account Security Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171715] mb-1 font-mono">
                    Password (Min 6 chars) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#77736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736A] hover:text-[#171715] cursor-pointer"
                      tabIndex={-1}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171715] mb-1 font-mono">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#77736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-2 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736A] hover:text-[#171715] cursor-pointer"
                      tabIndex={-1}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              icon={ArrowRight}
            >
              Complete Registration & Create Dossier
            </Button>
          </form>

          {/* Institutional verification footer */}
          <div className="mt-6 pt-4 border-t border-[#E5E0D6] flex items-start gap-2.5 text-xs text-[#57534E]">
            <ShieldCheck className="w-4 h-4 text-[#1E6B4B] shrink-0 mt-0.5" />
            <span>
              All student dossiers are registered under National Institute of Engineering, Mysuru. One seat per verified USN across campus events.
            </span>
          </div>
        </div>

        {/* Sign in link */}
        <p className="mt-6 text-center text-xs text-[#57534E]">
          Already have an account?{' '}
          <Link
            to={redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login'}
            className="font-bold text-[#8F5F00] hover:text-[#734D00] underline"
          >
            Sign in to CampusConnect
          </Link>
        </p>

      </motion.div>
    </div>
  );
}
