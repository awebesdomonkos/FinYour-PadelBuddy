import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Modal/drawer keyboard behaviour: Escape closes, Tab stays inside the dialog,
// focus moves into the dialog on open and returns to the trigger on close.
export function useDialogA11y<T extends HTMLElement = HTMLDivElement>(onClose: () => void, active = true) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!active) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = ref.current;
    if (node && !node.contains(document.activeElement)) {
      const first = node.querySelector<HTMLElement>('[data-autofocus]') || node.querySelector<HTMLElement>(FOCUSABLE);
      (first || node).focus({ preventScroll: true });
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const root = ref.current;
      if (!root) return;
      // Only the top-most dialog reacts when dialogs are stacked.
      const dialogs = document.querySelectorAll('[data-dialog-root]');
      if (dialogs.length && dialogs[dialogs.length - 1] !== root) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items: HTMLElement[] = Array.prototype.slice.call(root.querySelectorAll(FOCUSABLE))
        .filter((el: HTMLElement) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus({ preventScroll: true });
    };
  }, [active]);

  // Spread onto the dialog panel: <div {...dialogProps}>
  const dialogProps = { ref, role: 'dialog' as const, 'aria-modal': true, tabIndex: -1, 'data-dialog-root': '' };
  return { ref, dialogProps };
}
