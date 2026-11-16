import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) {
  const variants = {
    default: 'bg-[#F5F2EA] text-[#57534E] border-[#E5E0D6]',
    primary: 'bg-[#F2A900]/15 text-[#F2A900] border-[#F2A900]/40',
    amber: 'bg-[#F2A900]/15 text-[#F2A900] border-[#F2A900]/40',
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    violet: 'bg-purple-50 text-purple-900 border-purple-200',
    emerald: 'bg-[#EAF4EE] text-[#1E6B4B] border-[#247A56]/30',
    cyan: 'bg-cyan-50 text-cyan-900 border-cyan-200',
    rose: 'bg-[#FDF0EE] text-[#9E352C] border-[#B9473D]/30',
    dark: 'bg-[#2A2723] text-[#F5F2EA] border-[#3A362F]',
    success: 'bg-[#EAF4EE] text-[#1E6B4B] border-[#247A56]/30',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    danger: 'bg-[#FDF0EE] text-[#9E352C] border-[#B9473D]/30',
  };

  const dotColors = {
    default: 'bg-[#77736A]',
    primary: 'bg-[#F2A900]',
    amber: 'bg-[#F2A900]',
    blue: 'bg-blue-600',
    violet: 'bg-purple-600',
    emerald: 'bg-[#247A56]',
    cyan: 'bg-cyan-600',
    rose: 'bg-[#B9473D]',
    dark: 'bg-[#F2A900]',
    success: 'bg-[#247A56]',
    warning: 'bg-[#F2A900]',
    danger: 'bg-[#B9473D]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-mono',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border tracking-tight whitespace-nowrap shrink-0 ${
        variants[variant] || variants.default
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotColors[variant] || dotColors.default
          }`}
        />
      )}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}
