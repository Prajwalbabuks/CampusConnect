import React from 'react';

export default function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  accentColor = 'amber',
  className = '',
}) {
  const accentBorders = {
    amber: 'border-l-[#F2A900]',
    emerald: 'border-l-[#247A56]',
    blue: 'border-l-blue-600',
    violet: 'border-l-purple-600',
    cyan: 'border-l-cyan-600',
  };

  const accentIcons = {
    amber: 'bg-[#F2A900]/10 text-[#8F5F00] border-[#F2A900]/30',
    emerald: 'bg-[#EAF4EE] text-[#1E6B4B] border-[#247A56]/30',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    violet: 'bg-purple-50 text-purple-700 border-purple-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  const borderClass = accentBorders[accentColor] || accentBorders.amber;
  const iconClass = accentIcons[accentColor] || accentIcons.amber;

  return (
    <div
      className={`p-5 rounded-2xl border border-[#E5E0D6] border-l-4 ${borderClass} bg-white shadow-editorial hover:shadow-editorial-hover transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-[#77736A] uppercase tracking-wider font-mono">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold font-mono tracking-tight text-[#171715] tabular-nums">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${iconClass}`}>
            <Icon className="w-4.5 h-4.5" strokeWidth={1.8} />
          </div>
        )}
      </div>
      {subtext && (
        <div className="mt-4 flex items-center text-xs text-[#77736A] gap-2 pt-2.5 border-t border-[#E5E0D6]/70">
          {trend && (
            <span className="font-semibold text-[#1E6B4B] font-mono tabular-nums bg-[#EAF4EE] px-1.5 py-0.5 rounded text-[11px]">
              {trend}
            </span>
          )}
          <span className="truncate">{subtext}</span>
        </div>
      )}
    </div>
  );
}
