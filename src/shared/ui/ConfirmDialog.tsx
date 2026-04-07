'use client';

import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@piar-digital-app/shared/lib/cx';
import { Button } from '@piar-digital-app/shared/ui/Button';
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
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const { accentClassName, badgeClassName, iconContainerClassName, confirmVariant, badgeLabel } = toneConfig[tone];
  const hasBody = Boolean(description || bullets?.length || checkbox || children);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const container = document.createElement('div');
    container.setAttribute('data-piar-dialog-root', '');
    setPortalContainer(container);

    return () => {
      container.remove();
    };
  }, []);

  useEffect(() => {
    if (!open || !portalContainer) {
      return;
    }

    document.body.appendChild(portalContainer);
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const siblingElements = Array.from(document.body.children)
      .filter((element): element is HTMLElement => element !== portalContainer);
    const originalSiblingState = siblingElements.map((element) => ({
      element,
      ariaHidden: element.getAttribute('aria-hidden'),
      inert: Boolean((element as HTMLElement & { inert?: boolean }).inert),
    }));

    for (const sibling of siblingElements) {
      sibling.setAttribute('aria-hidden', 'true');
      (sibling as HTMLElement & { inert?: boolean }).inert = true;
    }

    const focusInitialTarget = () => {
      const focusTargets = {
        cancel: cancelButtonRef.current,
        confirm: confirmButtonRef.current,
        auxiliary: auxiliaryButtonRef.current,
      } as const;
      const preferredTarget = focusTargets[initialFocus];
      if (preferredTarget) {
        preferredTarget.focus();
        return;
      }

      cancelButtonRef.current?.focus();
      if (document.activeElement === cancelButtonRef.current) {
        return;
      }

      confirmButtonRef.current?.focus();
      if (document.activeElement === confirmButtonRef.current) {
        return;
      }

      auxiliaryButtonRef.current?.focus();
    };

    const getFocusableElements = (): HTMLElement[] => {
      if (!dialogRef.current) {
        return [];
      }

      return Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('aria-hidden'));
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !cancelDisabled) {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey && activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    focusInitialTarget();
    if (!dialogRef.current?.contains(document.activeElement)) {
      requestAnimationFrame(focusInitialTarget);
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      for (const { element, ariaHidden, inert } of originalSiblingState) {
        if (ariaHidden === null) {
          element.removeAttribute('aria-hidden');
        } else {
          element.setAttribute('aria-hidden', ariaHidden);
        }
        (element as HTMLElement & { inert?: boolean }).inert = inert;
      }
      portalContainer.remove();
      previousFocusRef.current?.focus();
    };
  }, [cancelDisabled, initialFocus, onCancel, open, portalContainer]);

  if (!open || !portalContainer) {
    return null;
  }

  const handleBackdropClick = () => {
    if (!cancelDisabled) {
      onCancel();
    }
  };

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
