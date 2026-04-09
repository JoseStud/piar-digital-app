import '@testing-library/jest-dom/vitest';
import { useRef, useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { useModalDialog } from '@piar-digital-app/shared/ui/useModalDialog';

afterEach(() => {
  cleanup();
});

function UseModalDialogHarness() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const auxiliaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const { portalContainer, handleBackdropClick } = useModalDialog({
    open,
    onCancel: () => setOpen(false),
    dialogRef,
    focusTargets: {
      cancel: cancelButtonRef,
      confirm: confirmButtonRef,
      auxiliary: auxiliaryButtonRef,
    },
  });

  return (
    <>
      <div>
        <button type="button" onClick={() => setOpen(true)}>Open Dialog</button>
        <div>Outside Content</div>
      </div>
      {open && portalContainer ? createPortal(
        <div>
          <button type="button" data-testid="backdrop" onClick={handleBackdropClick}>
            Backdrop
          </button>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Hook Dialog">
            <button type="button" ref={cancelButtonRef}>Cancel</button>
            <button type="button" ref={confirmButtonRef}>Confirm</button>
            <button type="button" ref={auxiliaryButtonRef}>Auxiliary</button>
          </div>
        </div>,
        portalContainer,
      ) : null}
    </>
  );
}

describe('useModalDialog', () => {
  it('hides siblings, traps focus, and restores focus when closed', async () => {
    const user = userEvent.setup();
    render(<UseModalDialogHarness />);

    const trigger = screen.getByRole('button', { name: 'Open Dialog' });

    await user.click(trigger);

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    const dialogRoot = document.querySelector('[data-piar-dialog-root]');
    const hiddenSibling = Array.from(document.body.children)
      .find((element) => element !== dialogRoot);

    expect(hiddenSibling).not.toBeUndefined();
    expect(hiddenSibling).toHaveAttribute('aria-hidden', 'true');
    expect((hiddenSibling as HTMLDivElement & { inert?: boolean }).inert).toBe(true);
    expect(cancelButton).toHaveFocus();

    await user.tab();
    expect(confirmButton).toHaveFocus();

    await user.click(screen.getByTestId('backdrop'));

    expect(hiddenSibling).not.toHaveAttribute('aria-hidden');
    expect((hiddenSibling as HTMLDivElement & { inert?: boolean }).inert).toBe(false);
    expect(trigger).toHaveFocus();
  });
});
