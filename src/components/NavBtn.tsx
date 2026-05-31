import React from 'react';
import { motion } from 'motion/react';

export default function NavBtn({ active, icon, label, onClick, isSpecial = false }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void, isSpecial?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 relative py-1 focus:outline-none group`}
    >
      <div className={`transition-all duration-300 ${active && !isSpecial ? 'scale-110 opacity-100 text-[#141414]' : 'opacity-40 text-[#141414] group-hover:opacity-60'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 truncate w-full text-center transition-all ${active ? 'text-[#141414] opacity-100' : 'text-[#141414] opacity-30'}`}>{label}</span>
      {active && !isSpecial && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute -bottom-1 w-6 h-0.5 bg-[#141414] rounded-full"
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        />
      )}
    </button>
  );
}
