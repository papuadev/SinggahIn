import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from '../FormField';
import { RoleSelector } from '../RoleSelector';
import { Modal } from '../Modal';

describe('Atomic Design Molecules', () => {
  it('renders FormField with label, error message, and child', () => {
    render(
      <FormField label="Email" error="Email wajib diisi" required>
        <input data-testid="field-input" />
      </FormField>
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Email wajib diisi')).toBeInTheDocument();
    expect(screen.getByTestId('field-input')).toBeInTheDocument();
  });

  it('renders FormField with hint when no error exists', () => {
    render(
      <FormField label="Email" hint="Gunakan email aktif">
        <input data-testid="field-input" />
      </FormField>
    );
    expect(screen.getByText('Gunakan email aktif')).toBeInTheDocument();
  });

  it('renders RoleSelector and switches selection on click', () => {
    const handleChange = vi.fn();
    render(<RoleSelector value="USER" onChange={handleChange} />);
    const tenantButton = screen.getByRole('button', { name: /Pemilik \(Tenant\)/i });
    fireEvent.click(tenantButton);
    expect(handleChange).toHaveBeenCalledWith('TENANT');
  });

  it('renders Modal with title, content, and close action', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Judul Modal">
        <div>Isi Konten Modal</div>
      </Modal>
    );
    expect(screen.getByText('Judul Modal')).toBeInTheDocument();
    expect(screen.getByText('Isi Konten Modal')).toBeInTheDocument();
    const closeBtn = screen.getByRole('button', { name: /Tutup/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
