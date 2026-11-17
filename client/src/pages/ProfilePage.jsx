import React, { useState, useEffect } from 'react';
import { Award, Calendar, ShieldCheck, ArrowRight, Users } from 'lucide-react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { registrationApi, adminApi } from '../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [passCount, setPassCount] = useState(0);
  const [adminStats, setAdminStats] = useState({ totalEvents: 0, totalRegistrations: 0 });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        if (isAdmin) {
          const stats = await adminApi.getDashboardStats();
          if (isMounted && stats) {
            setAdminStats(stats);
          }
        } else {
          const passes = await registrationApi.getMyRegistrations();
          if (isMounted && Array.isArray(passes)) {
            setPassCount(passes.length);
          }
        }
      } catch (err) {
        console.warn('[ProfilePage] Stats load error:', err);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const studentName = user?.name || (isAdmin ? 'NIE Event Convenor' : 'Student');
  const studentEmail = user?.email || '';
  const studentUsn = user?.usn || 'N/A';
  const studentDepartment = user?.department || (isAdmin ? 'Academic & Event Senate' : 'Engineering Department');
  const studentSection = user?.section || 'Section A';
  const studentBatch = user?.batch || '2024';
  const studentPhone = user?.phone || '';
  const studentYear = user?.year || '2nd Year';
  const studentSem = user?.semester || '4th Semester';

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-[#E5E0D6] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8F5F00] uppercase tracking-wider mb-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900]" />
              <span>{isAdmin ? 'NIE Administration Dossier' : 'NIE Student Dossier'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171715] font-serif">
              {isAdmin ? 'Administrative Profile' : 'Institutional Student Profile'}
            </h1>
            <p className="mt-1 text-sm text-[#57534E]">
              {isAdmin
                ? 'National Institute of Engineering Event Administration and Governance Authority.'
                : 'National Institute of Engineering verified academic profile and digital pass credentials.'}
            </p>
          </div>

          {isAdmin ? (
            <Button to="/admin" variant="primary" size="sm" icon={ShieldCheck}>
              Admin Console
            </Button>
          ) : (
            <Button to="/my-registrations" variant="primary" size="sm" icon={ArrowRight}>
              View Active Passes ({passCount})
            </Button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Identity Dossier Card (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-5 rounded-3xl border border-[#E5E0D6] bg-white p-7 sm:p-8 shadow-editorial text-center space-y-5"
          >
            <div className="w-24 h-24 rounded-full bg-[#F2A900]/15 border-2 border-[#F2A900] text-[#171715] font-bold text-3xl flex items-center justify-center mx-auto shadow-xs font-mono">
              {isAdmin ? 'AD' : studentName.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#171715] font-serif">{studentName}</h2>
              <p className="text-xs text-[#57534E] font-mono font-medium mt-0.5">{studentEmail}</p>
            </div>
            
            <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
              {isAdmin ? (
                <>
                  <Badge variant="amber" dot>Verified Institutional Administrator</Badge>
                  <span className="text-xs font-mono font-bold text-[#8F5F00] px-3 py-1 rounded-lg bg-amber-50 border border-amber-200">
                    Faculty Senate
                  </span>
                </>
              ) : (
                <>
                  <Badge variant="amber" dot>Verified NIE Student</Badge>
                  <span className="text-xs font-mono font-bold text-[#8F5F00] px-3 py-1 rounded-lg bg-amber-50 border border-amber-200">
                    {studentSection}
                  </span>
                </>
              )}
            </div>

            <div className="border-t border-[#E5E0D6] pt-5 text-xs text-[#57534E] space-y-3 text-left">
              {isAdmin ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[#77736A] font-medium">Administrative Role:</span>
                    <span className="font-mono text-[#171715] font-bold">Collegiate Convenor</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#77736A] font-medium">Institution:</span>
                    <span className="text-[#171715] font-semibold text-right">National Institute of Engineering</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#77736A] font-medium">Senate Department:</span>
                    <span className="text-[#171715] font-medium text-right">{studentDepartment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#77736A] font-medium">Campus Location:</span>
                    <span className="text-[#171715] font-medium">Mysuru, Karnataka</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[#77736A] font-medium">University Seat No (USN):</span>
                    <span className="font-mono text-[#171715] font-bold text-sm bg-[#FCFBF7] px-2.5 py-0.5 rounded border border-[#E5E0D6]">
                      {studentUsn}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#77736A] font-medium">Department:</span>
                    <span className="text-[#171715] font-semibold text-right">{studentDepartment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#77736A] font-medium">Class Section:</span>
                    <span className="font-mono text-[#8F5F00] font-bold bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                      {studentSection}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#77736A] font-medium">Academic Year:</span>
                    <span className="text-[#171715] font-medium">{studentYear} ({studentSem})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#77736A] font-medium">Graduation Batch:</span>
                    <span className="font-mono text-[#171715] font-medium">{studentBatch}</span>
                  </div>
                  {studentPhone && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#77736A] font-medium">Mobile Contact:</span>
                      <span className="font-mono text-[#171715]">{studentPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[#77736A] font-medium">Institution:</span>
                    <span className="text-[#171715] font-semibold text-right">National Institute of Engineering</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats & Activity (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-7 space-y-6"
          >
            {isAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                  label="Events Supervised"
                  value={adminStats.totalEvents || 0}
                  subtext="Published campus symposiums"
                  icon={Calendar}
                  accentColor="amber"
                />
                <StatCard
                  label="Total Registrations"
                  value={(adminStats.totalRegistrations || 0).toLocaleString()}
                  subtext="Enrolled students across NIE"
                  icon={Users}
                  trend="Active"
                  accentColor="emerald"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                  label="Registered Event Passes"
                  value={passCount}
                  subtext="Confirmed seats across NIE events"
                  icon={Calendar}
                  accentColor="amber"
                />
                <StatCard
                  label="Attendance Status"
                  value={passCount > 0 ? 'Active' : 'Unregistered'}
                  subtext="Synchronized with cloud database"
                  icon={Award}
                  trend="Live"
                  accentColor="emerald"
                />
              </div>
            )}

            <div className="rounded-3xl border border-[#E5E0D6] bg-white p-7 shadow-editorial space-y-4">
              <div className="flex items-center gap-2.5 text-[#171715] font-bold text-base font-serif">
                <ShieldCheck className="w-5 h-5 text-[#F2A900]" />
                <h3>{isAdmin ? 'Collegiate Governance & Attendance Architecture' : 'Institutional Credentials & Gate Verification'}</h3>
              </div>
              {isAdmin ? (
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                  As an event convenor for the <strong>National Institute of Engineering</strong>, your institutional account holds administrative authority over symposium publications, venue hall capacities, and student attendance rosters. Attendance check-ins logged at the venue gate automatically sync to the cloud database.
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                  Your student dossier is linked directly to your USN (<strong>{studentUsn}</strong>) and <strong>{studentDepartment}</strong>. When you register for any event in the catalog, your seat is atomically reserved, and your digital ticket code is minted. Present your digital pass or QR badge at the hall entrance for verification by event organizers.
                </p>
              )}
              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#1E6B4B]">
                <span className="w-2 h-2 rounded-full bg-[#247A56]" />
                <span>Cloud MongoDB Atlas Connected · National Institute of Engineering, Mysuru</span>
              </div>
            </div>
          </motion.div>

        </div>

      </main>
      <Footer />
    </div>
  );
}
