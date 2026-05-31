import React from 'react';
import { motion } from 'motion/react';

export default function NavBtn({ active, icon, label, onClick, isSpecial = false }: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isSpecial?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center transition-all duration-300 relative py-1 focus:outline-none group"
    >
      {active && !isSpecial && (
        <motion.div
          layoutId="navPill"
          className="absolute inset-x-1 top-0 bottom-0 rounded-xl bg-[#00E676]/10"
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        />
      )}
      <div className={`relative z-10 transition-all duration-300 ${
        active && !isSpecial
          ? 'scale-110 text-[#00E676]'
          : 'text-[#4A5568] group-hover:text-[#8A99AA]'
      }`}>
        {icon}
      </div>
      <span className={`relative z-10 text-[9px] font-black uppercase tracking-tighter mt-1 truncate w-full text-center transition-all ${
        active ? 'text-[#00E676]' : 'text-[#4A5568] group-hover:text-[#8A99AA]'
      }`}>
        {label}
      </span>
    </button>
  );
}
