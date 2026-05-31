import React from 'react';
import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel
}: {
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string,
  onConfirm: () => void,
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1A2233] rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-white/20"
      >
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
          <Trash2 className="w-8 h-8 text-red-500" />
        </div>

        <h3 className="text-2xl font-black uppercase tracking-tight text-[#141414] mb-2">{title}</h3>
        <p className="text-sm text-[#8A99AA] leading-relaxed mb-8">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-4 px-6 rounded-2xl font-bold bg-[#FFFFFF]/5 text-[#141414] hover:bg-[#FFFFFF]/8 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 px-6 rounded-2xl font-bold bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
