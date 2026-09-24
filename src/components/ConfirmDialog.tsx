import React from 'react';
import { motion } from 'motion/react';
import { Trash2, LogOut } from 'lucide-react';
import { useDialogA11y } from '../hooks/useDialogA11y.ts';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  icon = 'delete'
}: {
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string,
  onConfirm: () => void,
  onCancel: () => void,
  icon?: 'delete' | 'leave'
}) {
  const { dialogProps } = useDialogA11y(onCancel);
  const Icon = icon === 'leave' ? LogOut : Trash2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { e.stopPropagation(); onCancel(); }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        {...dialogProps}
        role="alertdialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-white/20 outline-none"
      >
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-red-500" aria-hidden="true" />
        </div>

        <h3 id="confirm-dialog-title" className="text-2xl font-black uppercase tracking-tight text-[#141414] mb-2">{title}</h3>
        <p id="confirm-dialog-message" className="text-sm text-[#141414]/70 leading-relaxed mb-8">{message}</p>

        <div className="flex gap-3">
          <button
            type="button"
            data-autofocus
            onClick={onCancel}
            className="flex-1 py-4 px-6 rounded-2xl font-bold bg-[#141414]/5 text-[#141414] hover:bg-[#141414]/10 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-4 px-6 rounded-2xl font-bold bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
