'use client';

import { useEffect, useRef, useState } from 'react';

type ModalFocusTarget = 'cancel' | 'confirm' | 'auxiliary';
type ElementRef<T extends HTMLElement = HTMLElement> = { current: T | null };

interface UseModalDialogOptions {
  open: boolean;
  onCancel: () => void;
  cancelDisabled?: boolean;
  initialFocus?: ModalFocusTarget;
  dialogRef: ElementRef<HTMLDivElement>;
  focusTargets: Record<ModalFocusTarget, ElementRef<HTMLButtonElement>>;
}

interface HiddenSiblingState {
  element: HTMLElement;
  ariaHidden: string | null;
  inert: boolean;
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('aria-hidden'));
}

function hideSiblingElements(portalContainer: HTMLElement): () => void {
  const siblingElements = Array.from(document.body.children)
    .filter((element): element is HTMLElement => element !== portalContainer);
  const originalSiblingState: HiddenSiblingState[] = siblingElements.map((element) => ({
    element,
    ariaHidden: element.getAttribute('aria-hidden'),
    inert: Boolean((element as HTMLElement & { inert?: boolean }).inert),
  }));

  for (const sibling of siblingElements) {
    sibling.setAttribute('aria-hidden', 'true');
    (sibling as HTMLElement & { inert?: boolean }).inert = true;
  }

  return () => {
    for (const { element, ariaHidden, inert } of originalSiblingState) {
      if (ariaHidden === null) {
        element.removeAttribute('aria-hidden');
      } else {
        element.setAttribute('aria-hidden', ariaHidden);
      }

      (element as HTMLElement & { inert?: boolean }).inert = inert;
    }
  };
}

/** Shared modal lifecycle: portal mount, inert siblings, focus trap, and focus restoration. */
export function useModalDialog({
  open,
  onCancel,
  cancelDisabled = false,
  initialFocus = 'cancel',
  dialogRef,
  focusTargets,
}: UseModalDialogOptions) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const { cancel: cancelButtonRef, confirm: confirmButtonRef, auxiliary: auxiliaryButtonRef } = focusTargets;
  const initialFocusRef = initialFocus === 'confirm'
    ? confirmButtonRef
    : initialFocus === 'auxiliary'
      ? auxiliaryButtonRef
      : cancelButtonRef;

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
    const restoreSiblings = hideSiblingElements(portalContainer);

    const focusInitialTarget = () => {
      const orderedTargets = [
        initialFocusRef,
        cancelButtonRef,
        confirmButtonRef,
        auxiliaryButtonRef,
      ];

      const attemptedTargets = new Set<HTMLElement>();
      for (const targetRef of orderedTargets) {
        const target = targetRef.current;
        if (!target || attemptedTargets.has(target)) {
          continue;
        }

        attemptedTargets.add(target);
        target.focus();
        if (document.activeElement === target) {
          return;
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !cancelDisabled) {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);
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
    };

    focusInitialTarget();
    const focusFrame = !dialogRef.current?.contains(document.activeElement)
      ? window.requestAnimationFrame(focusInitialTarget)
      : null;
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (focusFrame !== null) {
        window.cancelAnimationFrame(focusFrame);
      }
      restoreSiblings();
      portalContainer.remove();
      previousFocusRef.current?.focus();
    };
  }, [
    auxiliaryButtonRef,
    cancelButtonRef,
    cancelDisabled,
    confirmButtonRef,
    dialogRef,
    initialFocusRef,
    initialFocus,
    onCancel,
    open,
    portalContainer,
  ]);

  const handleBackdropClick = () => {
    if (!cancelDisabled) {
      onCancel();
    }
  };

  return {
    portalContainer,
    handleBackdropClick,
  };
}
