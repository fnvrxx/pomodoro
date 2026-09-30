import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";

interface AppDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}

export function AppDialog({ open, onClose, title, children, wide = false, className = "" }: AppDialogProps) {
  const previousFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={next => { if (!next) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop fixed inset-0 z-40" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={() => { previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
          onCloseAutoFocus={event => {
            if (previousFocus.current?.isConnected) {
              event.preventDefault();
              previousFocus.current.focus();
            }
          }}
          className={`dialog-panel fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] ${wide ? "max-w-xl" : "max-w-md"} max-h-[min(90vh,820px)] overflow-y-auto p-5 sm:p-7 ${className}`}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <Dialog.Title className="section-heading">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="header-action !w-10 !h-10 !p-0 shrink-0" aria-label="Tutup dialog">
                <X size={18} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
