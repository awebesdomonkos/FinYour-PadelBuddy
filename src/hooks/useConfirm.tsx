import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import ConfirmDialog from '../components/ConfirmDialog.tsx';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  icon?: 'delete' | 'leave';
};

// Promise-based replacement for window.confirm():
//   const [confirm, confirmDialog] = useConfirm();
//   if (await confirm({...})) doIt();
//   ...render {confirmDialog} somewhere in the component.
export function useConfirm(): [(opts: ConfirmOptions) => Promise<boolean>, React.ReactNode] {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => new Promise<boolean>(resolve => {
    resolverRef.current?.(false);
    resolverRef.current = resolve;
    setOpts(o);
  }), []);

  const settle = (ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setOpts(null);
  };

  // Portalled so a transformed/translucent ancestor (e.g. a past GameCard) can't affect the overlay.
  const dialog = typeof document === 'undefined' ? null : createPortal(
    <AnimatePresence>
      {opts && (
        <ConfirmDialog
          title={opts.title}
          message={opts.message}
          confirmLabel={opts.confirmLabel}
          cancelLabel={opts.cancelLabel}
          icon={opts.icon}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      )}
    </AnimatePresence>,
    document.body
  );

  return [confirm, dialog];
}
