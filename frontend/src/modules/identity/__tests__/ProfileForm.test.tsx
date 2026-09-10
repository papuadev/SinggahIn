import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileForm } from '../components/ProfileForm';
import { User } from '../../../types/auth.types';

const mockUser: User = {
  id: 'usr-123',
  email: 'rian@example.com',
  name: 'Rian Pratama',
  role: 'USER',
  avatarUrl: null,
  phoneNumber: '08123456789',
};

describe('ProfileForm Organism', () => {
  it('renders user details correctly', () => {
    const handleUpdate = vi.fn();
    const handleAvatar = vi.fn();

    render(
      <ProfileForm
        user={mockUser}
        onUpdateProfile={handleUpdate}
        onUploadAvatar={handleAvatar}
      />
    );

    expect(screen.getByDisplayValue('rian@example.com')).toBeDisabled();
    expect(screen.getByDisplayValue('Rian Pratama')).toBeInTheDocument();
    expect(screen.getByDisplayValue('08123456789')).toBeInTheDocument();
  });

  it('submits updated profile when fields are changed', async () => {
    const handleUpdate = vi.fn().mockResolvedValue(undefined);
    const handleAvatar = vi.fn();

    render(
      <ProfileForm
        user={mockUser}
        onUpdateProfile={handleUpdate}
        onUploadAvatar={handleAvatar}
      />
    );

    const nameInput = screen.getByLabelText(/Nama Lengkap/i);
    fireEvent.change(nameInput, { target: { value: 'Rian Pratama Baru' } });

    const submitBtn = screen.getByRole('button', { name: /Simpan Perubahan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalledWith({
        name: 'Rian Pratama Baru',
        phoneNumber: '08123456789',
      });
    });
  });

  it('displays validation error if name is too short', async () => {
    const handleUpdate = vi.fn();
    const handleAvatar = vi.fn();

    render(
      <ProfileForm
        user={mockUser}
        onUpdateProfile={handleUpdate}
        onUploadAvatar={handleAvatar}
      />
    );

    const nameInput = screen.getByLabelText(/Nama Lengkap/i);
    fireEvent.change(nameInput, { target: { value: 'A' } });

    const submitBtn = screen.getByRole('button', { name: /Simpan Perubahan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Nama minimal 2 karakter')).toBeInTheDocument();
    });
    expect(handleUpdate).not.toHaveBeenCalled();
  });
});
