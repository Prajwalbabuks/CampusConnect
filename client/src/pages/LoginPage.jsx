import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { login, isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/events', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await login(cleanEmail, password);
      setLoading(false);

      if (loggedUser?.role === 'admin') {
        if (redirectPath && !redirectPath.includes('/my-registrations') && !redirectPath.includes('/register')) {
          navigate(redirectPath);
        } else {
          navigate('/admin');
        }
      } else if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate('/events');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed. Please verify your email and password.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F5F2EA] px-4 py-12 text-[#171715]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-3">
            <span className="text-2xl font-bold tracking-tight text-[#171715] group-hover:text-[#DB9600] transition-colors">
              NIE <span className="font-serif italic text-[#F2A900] text-3xl font-normal ml-0.5">CampusConnect</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F2A900]" />
          </Link>
          <h1 className="text-2xl font-bold text-[#171715] tracking-tight font-serif">
            Sign In to CampusConnect
          </h1>
          <p className="mt-1.5 text-xs text-[#57534E]">
            {redirectPath
              ? 'Sign in to confirm your event reservation and manage passes'
              : 'Official collegiate event portal for National Institute of Engineering, Mysuru'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-[#E5E0D6] bg-white p-7 sm:p-9 shadow-editorial">
          <form onSubmit={handleLogin} className="space-y-4.5">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#FDF0EE] border border-[#B9473D]/30 text-[#9E352C] text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#B9473D] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#171715] mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#77736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. name@nie.ac.in or personal email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#171715] font-mono">
                  Password
                </label>
                <span className="text-[11px] text-[#77736A] font-mono">Min 6 characters</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#77736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FCFBF7] border border-[#E5E0D6] rounded-xl text-[#171715] placeholder-[#77736A] focus:outline-none focus:ring-2 focus:ring-[#F2A900]/30 focus:border-[#F2A900] transition-colors font-mono"
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3"
              isLoading={loading}
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          {/* Role info callout */}
          <div className="mt-6 pt-5 border-t border-[#E5E0D6] flex items-start gap-2.5 text-xs text-[#57534E]">
            <ShieldCheck className="w-4 h-4 text-[#F2A900] shrink-0 mt-0.5" />
            <span>
              Students can register for college events and view verified passes. Administrators have access to publish listings and conduct gate check-in.
            </span>
          </div>
        </div>

        {/* Footer links */}
        <p className="mt-6 text-center text-xs text-[#57534E]">
          New NIE student without an account?{' '}
          <Link
            to={redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : '/register'}
            className="font-bold text-[#8F5F00] hover:text-[#734D00] underline"
          >
            Create student account
          </Link>
        </p>

      </motion.div>
    </div>
  );
}
