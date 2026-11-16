import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Cpu, Palette, Trophy, Lightbulb, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { EVENT_DEPARTMENTS } from '../services/catalog';

// Display styling for each canonical department code. Codes come from the
// shared catalog (same registry the API filters use), so a strip link can
// never drift out of sync with the server's dept filter again.
const DEPT_STYLES = {
  CSE: { label: 'Computer Science', icon: Terminal, color: 'text-blue-400', border: 'hover:border-blue-500/40 hover:bg-blue-500/10' },
  ISE: { label: 'Information Science', icon: Cpu, color: 'text-purple-400', border: 'hover:border-purple-500/40 hover:bg-purple-500/10' },
  ECE: { label: 'Electronics & Comm', icon: Lightbulb, color: 'text-[#F2A900]', border: 'hover:border-[#F2A900]/40 hover:bg-[#F2A900]/10' },
  EEE: { label: 'Electrical & Electronics', icon: Zap, color: 'text-orange-400', border: 'hover:border-orange-500/40 hover:bg-orange-500/10' },
  AIML: { label: 'AI & Machine Learning', icon: Sparkles, color: 'text-cyan-400', border: 'hover:border-cyan-500/40 hover:bg-cyan-500/10' },
  ME: { label: 'Mechanical', icon: Trophy, color: 'text-[#247A56]', border: 'hover:border-[#247A56]/40 hover:bg-[#247A56]/10' },
  CV: { label: 'Civil', icon: Trophy, color: 'text-lime-400', border: 'hover:border-lime-500/40 hover:bg-lime-500/10' },
  CUL: { label: 'Cultural Senate', icon: Palette, color: 'text-rose-400', border: 'hover:border-rose-500/40 hover:bg-rose-500/10' },
  PED: { label: 'Athletics', icon: Trophy, color: 'text-emerald-400', border: 'hover:border-emerald-500/40 hover:bg-emerald-500/10' },
};

const DEFAULT_STYLE = { label: null, icon: Sparkles, color: 'text-[#F2A900]', border: 'hover:border-[#F2A900]/40 hover:bg-[#F2A900]/10' };

export default function DepartmentStrip() {
  const departments = EVENT_DEPARTMENTS.map((d) => ({
    ...d,
    name: DEPT_STYLES[d.code]?.label || d.name,
    ...(DEPT_STYLES[d.code] || DEFAULT_STYLE),
  }));

  return (
    <div className="py-7 bg-[#1A1815] border-b border-[#3A362F]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-mono">
            Explore Events by Academic Department & Collegiate Senate
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#F2A900] hover:text-[#DB9600] transition-colors self-start sm:self-auto"
          >
            <span>All Departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-center">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <Link
                key={dept.name}
                to={`/events?dept=${encodeURIComponent(dept.code)}`}
                className={`group flex items-center justify-between py-2.5 px-3 rounded-xl border border-[#3A362F] bg-[#211F1B] ${dept.border} transition-all duration-200 text-stone-200 hover:text-white cursor-pointer shadow-xs`}
                title={`Filter events for ${dept.name} (${dept.code})`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`w-3.5 h-3.5 ${dept.color} shrink-0`} strokeWidth={2} />
                  <span className="text-xs font-medium truncate">{dept.name}</span>
                </div>
                <span className={`text-[10px] font-mono ml-1.5 px-1.5 py-0.5 rounded bg-[#161513] border border-[#3A362F] text-[#F2A900] group-hover:border-[#F2A900]/40 transition-colors shrink-0`}>
                  {dept.code}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
