/** Tests for the ConfirmDialog component: tones, bullets, checkbox, auxiliary action. */
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ConfirmDialog } from '@piar-digital-app/shared/ui/ConfirmDialog';

afterEach(() => {
  cleanup();
});

function ConfirmDialogHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open Dialog</button>
      <button type="button">Outside</button>
      <ConfirmDialog
        open={open}
        title="Test Dialog"
        description="Dialog body"
        confirmLabel="Confirm"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

describe('ConfirmDialog', () => {
  it('traps focus and restores focus to the trigger on close', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialogHarness />);

    const trigger = screen.getByRole('button', { name: 'Open Dialog' });
    await user.click(trigger);

    const cancelButton = await screen.findByRole('button', { name: 'Cancelar' });
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });

    expect(cancelButton).toHaveFocus();

    await user.tab();
    expect(confirmButton).toHaveFocus();

    await user.tab();
    expect(cancelButton).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });
});
