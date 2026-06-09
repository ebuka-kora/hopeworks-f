import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PillButton } from './PillButton';
import { ModalMotion } from './motion/ModalMotion';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <ModalMotion
      open={open}
      onClose={onCancel}
      zIndex="210"
      contentClassName="relative w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4"
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 p-2 rounded-xl ${
            variant === 'danger' ? 'bg-orange-50 text-[#B24724]' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-1 min-w-0">
          <h2 id="confirm-dialog-title" className="text-sm font-semibold text-slate-900">
            {title}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <PillButton
          type="button"
          variant="muted"
          caps={false}
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 px-4 text-xs"
        >
          {cancelLabel}
        </PillButton>
        <PillButton
          type="button"
          variant={variant === 'danger' ? 'danger' : 'primary'}
          caps={false}
          onClick={onConfirm}
          loading={loading}
          className="flex-1 py-2.5 px-4 text-xs"
        >
          {confirmLabel}
        </PillButton>
      </div>
    </ModalMotion>
  );
};
