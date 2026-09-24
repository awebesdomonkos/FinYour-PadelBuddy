import React from 'react';
import { useDialogA11y } from '../hooks/useDialogA11y.ts';

// Wraps inline-rendered drawer/modal markup with dialog semantics, Escape-to-close and a focus trap.
export default function DialogPanel({ onClose, labelledBy, className = '', children }: {
  onClose: () => void,
  labelledBy: string,
  className?: string,
  children: React.ReactNode
}) {
  const { dialogProps } = useDialogA11y(onClose);
  return (
    <div {...dialogProps} aria-labelledby={labelledBy} className={`outline-none ${className}`}>
      {children}
    </div>
  );
}
