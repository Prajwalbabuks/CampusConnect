import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  to,
  as: Component,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A900]/40 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer tracking-tight';

  const variants = {
    primary:
      'bg-[#F2A900] text-[#171715] font-semibold hover:bg-[#DB9600] active:bg-[#C28500] shadow-xs border border-[#DB9600]/80 shadow-[0_2px_8px_rgba(242,169,0,0.25)]',
    secondary:
      'bg-white text-[#171715] hover:bg-[#F5F2EA] active:bg-[#EBE6DA] border border-[#E5E0D6] shadow-editorial hover:border-[#D5CEBE]',
    dark:
      'bg-[#211F1B] text-white hover:bg-[#2A2723] active:bg-[#161513] border border-[#3A362F] shadow-xs',
    outline:
      'bg-transparent text-[#171715] hover:bg-[#F5F2EA] active:bg-[#EBE6DA] border border-[#D5CEBE]',
    'outline-dark':
      'bg-transparent text-[#F5F2EA] hover:bg-[#211F1B] hover:text-white border border-[#3A362F]',
    ghost:
      'bg-transparent text-[#57534E] hover:text-[#171715] hover:bg-[#F5F2EA]',
    'ghost-dark':
      'bg-transparent text-stone-300 hover:text-white hover:bg-[#211F1B]/90',
    destructive:
      'bg-[#B9473D] text-white hover:bg-[#A33D34] active:bg-[#8F332B] shadow-xs',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8.5 font-medium',
    md: 'text-sm px-4.5 py-2 gap-2 h-10 font-medium',
    lg: 'text-base px-6 py-2.5 gap-2.5 h-11.5 font-semibold',
  };

  const combinedClasses = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  const content = (
    <>
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        Icon && <Icon className="w-4 h-4 text-current shrink-0" strokeWidth={1.8} />
      )}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses} onClick={onClick} {...props}>
        {content}
      </Link>
    );
  }

  if (Component) {
    return (
      <Component className={combinedClasses} onClick={onClick} {...props}>
        {content}
      </Component>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={combinedClasses}
      {...props}
    >
      {content}
    </button>
  );
}
