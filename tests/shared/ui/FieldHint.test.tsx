/** Tests for the FieldHint live region. */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FieldHint } from '@piar-digital-app/shared/ui/FieldHint';

afterEach(() => {
  cleanup();
});

describe('FieldHint', () => {
  it('renders nothing when the message is null', () => {
    const { container } = render(<FieldHint message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the message in a live region when provided', () => {
    render(<FieldHint message="El campo Nombres no puede estar vacío." />);

    const hint = screen.getByText('El campo Nombres no puede estar vacío.');
    expect(hint).toHaveAttribute('role', 'status');
  });
});
