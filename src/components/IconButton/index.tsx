import React from 'react';

interface IconButtonProps {
  icon: React.ReactNode;
  onClick: (event: React.MouseEvent) => void;
  label: string;
  isActive?: boolean;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, onClick, label, isActive, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={`
        relative group flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full
        border border-white/10 backdrop-blur-md
        shadow-[0_4px_12px_rgba(0,0,0,0.1)]
        transition-all duration-300 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
        ${isActive
          ? 'bg-white/25 text-white scale-105 border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
          : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] active:scale-95 active:translate-y-0'}
        ${className}
      `}
    >
      <span className="relative z-10">
        {icon}
      </span>
    </button>
  );
};

export default IconButton;
