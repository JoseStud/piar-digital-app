/** Modal confirm dialog with optional bullets, optional checkbox, optional auxiliary action button. Used by the form clear flow, the PDF export warning, and others. */
'use client';

import { ReactNode, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@piar-digital-app/shared/lib/cx';
import { Button } from '@piar-digital-app/shared/ui/Button';
import { useModalDialog } from '@piar-digital-app/shared/ui/useModalDialog';
import { InfoIcon, WarningIcon } from '@piar-digital-app/shared/ui/icons/DialogIcons';

type ConfirmDialogTone = 'info' | 'danger';
type ConfirmDialogRole = 'dialog' | 'alertdialog';

interface ConfirmDialogAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface ConfirmDialogCheckbox {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface ConfirmDialogProps {
  open: boolean;
  role?: ConfirmDialogRole;
  tone?: ConfirmDialogTone;
  title: string;
  description?: string;
  bullets?: string[];
  cancelLabel?: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
  auxiliaryAction?: ConfirmDialogAction;
  checkbox?: ConfirmDialogCheckbox;
  initialFocus?: 'cancel' | 'confirm' | 'auxiliary';
  children?: ReactNode;
}

const toneConfig: Record<ConfirmDialogTone, {
  accentClassName: string;
  badgeClassName: string;
  iconContainerClassName: string;
  confirmVariant: 'primary' | 'danger';
  badgeLabel: string;
}> = {
  info: {
    accentClassName: 'bg-action/40',
    badgeClassName: 'bg-action-subtle text-action',
    iconContainerClassName: 'bg-action-subtle text-action',
    confirmVariant: 'primary',
    badgeLabel: 'Aviso',
  },
  danger: {
    accentClassName: 'bg-error/35',
    badgeClassName: 'bg-error-container text-on-error-container',
    iconContainerClassName: 'bg-error-container text-on-error-container',
    confirmVariant: 'danger',
    badgeLabel: 'Accion delicada',
  },
};

/** Renders the accessible confirm dialog used across the workflow. */
export function ConfirmDialog({
  open,
  role = 'alertdialog',
  tone = 'info',
  title,
  description,
  bullets,
  cancelLabel = 'Cancelar',
  confirmLabel,
  onCancel,
  onConfirm,
  confirmDisabled = false,
  cancelDisabled = false,
  auxiliaryAction,
  checkbox,
  initialFocus = 'cancel',
  children,
}: ConfirmDialogProps) {
  const titleId = useId();
  const bodyId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const auxiliaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const { accentClassName, badgeClassName, iconContainerClassName, confirmVariant, badgeLabel } = toneConfig[tone];
  const hasBody = Boolean(description || bullets?.length || checkbox || children);
  const { portalContainer, handleBackdropClick } = useModalDialog({
    open,
    onCancel,
    cancelDisabled,
    initialFocus,
    dialogRef,
    focusTargets: {
      cancel: cancelButtonRef,
      confirm: confirmButtonRef,
      auxiliary: auxiliaryButtonRef,
    },
  });

  if (!open || !portalContainer) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/35 px-4 py-6 backdrop-blur-[2px]">
      <div
        aria-hidden="true"
        className="absolute inset-0 cursor-default"
        onClick={handleBackdropClick}
      />
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={hasBody ? bodyId : undefined}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-[28px] border border-border-warm bg-surface-container-lowest shadow-soft-2"
      >
        <div className={cx('h-1.5 w-full', accentClassName)} />
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className={cx('mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full', iconContainerClassName)}>
              {tone === 'danger' ? (
                <WarningIcon />
              ) : (
                <InfoIcon />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-4 text-left">
              <span className={cx('inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]', badgeClassName)}>
                {badgeLabel}
              </span>
              <div id={bodyId} className="space-y-3">
                <div className="space-y-2">
                  <h2 id={titleId} className="typ-title text-xl text-on-surface">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-sm leading-6 text-on-surface-variant">
                      {description}
                    </p>
                  )}
                </div>
                {bullets && bullets.length > 0 ? (
                  <ul className="space-y-2 text-sm leading-6 text-on-surface-variant">
                    {bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {children}
                {checkbox ? (
                  <label className="flex items-start gap-3 rounded-xl border border-border-warm/70 bg-surface-container-low px-3 py-3 text-sm text-on-surface">
                    <input
                      type="checkbox"
                      checked={checkbox.checked}
                      onChange={(event) => checkbox.onChange(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border-warm text-action focus:ring-action"
                    />
                    <span>{checkbox.label}</span>
                  </label>
                ) : null}
              </div>
            </div>
          </div>

          <div className="border-t border-border-warm/70 pt-4">
            {auxiliaryAction ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  ref={auxiliaryButtonRef}
                  variant="ghost"
                  onClick={auxiliaryAction.onClick}
                  disabled={auxiliaryAction.disabled}
                  className="justify-center sm:justify-start"
                >
                  {auxiliaryAction.loading ? `${auxiliaryAction.label}...` : auxiliaryAction.label}
                </Button>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <Button
                    ref={cancelButtonRef}
                    variant="ghost"
                    onClick={onCancel}
                    disabled={cancelDisabled}
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    ref={confirmButtonRef}
                    variant={confirmVariant}
                    onClick={onConfirm}
                    disabled={confirmDisabled}
                  >
                    {confirmLabel}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  ref={cancelButtonRef}
                  variant="ghost"
                  onClick={onCancel}
                  disabled={cancelDisabled}
                >
                  {cancelLabel}
                </Button>
                <Button
                  ref={confirmButtonRef}
                  variant={confirmVariant}
                  onClick={onConfirm}
                  disabled={confirmDisabled}
                >
                  {confirmLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    portalContainer,
  );
}
