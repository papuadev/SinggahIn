import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DestinationInput } from '../DestinationInput';
import { propertyApi } from '../../../../modules/property/services/property.api';

vi.mock('../../../../modules/property/services/property.api', () => ({
  propertyApi: {
    searchGeocode: vi.fn(),
  },
}));

function ControlledDestinationInput({ initial = '', onSelect }: { initial?: string; onSelect?: (v: string) => void }) {
  const [val, setVal] = useState(initial);
  return (
    <DestinationInput
      value={val}
      onChange={(newVal) => {
        setVal(newVal);
        onSelect?.(newVal);
      }}
    />
  );
}

describe('DestinationInput Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input with placeholder and label', () => {
    render(<ControlledDestinationInput />);
    expect(screen.getByPlaceholderText(/Mau menginap di mana/i)).toBeInTheDocument();
    expect(screen.getByText('Kota atau Destinasi')).toBeInTheDocument();
  });

  it('fetches geocode suggestions and displays them on input change', async () => {
    vi.mocked(propertyApi.searchGeocode).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [{ city: 'Bandung', formattedAddress: 'Bandung, Jawa Barat', latitude: -6.9, longitude: 107.6 }],
    });

    render(<ControlledDestinationInput />);
    const input = screen.getByPlaceholderText(/Mau menginap di mana/i);
    fireEvent.change(input, { target: { value: 'Ban' } });

    await waitFor(() => {
      expect(propertyApi.searchGeocode).toHaveBeenCalledWith('Ban', 5);
    });
    expect(await screen.findByText('Bandung, Jawa Barat')).toBeInTheDocument();
  });

  it('closes dropdown on Escape key press for WCAG 2.1 accessibility', async () => {
    vi.mocked(propertyApi.searchGeocode).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [{ city: 'Bandung', formattedAddress: 'Bandung, Jawa Barat', latitude: -6.9, longitude: 107.6 }],
    });

    render(<ControlledDestinationInput />);
    const input = screen.getByPlaceholderText(/Mau menginap di mana/i);
    fireEvent.change(input, { target: { value: 'Ban' } });

    const suggestion = await screen.findByText('Bandung, Jawa Barat');
    expect(suggestion).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByText('Bandung, Jawa Barat')).not.toBeInTheDocument();
  });

  it('closes dropdown on outside click', async () => {
    vi.mocked(propertyApi.searchGeocode).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [{ city: 'Bandung', formattedAddress: 'Bandung, Jawa Barat', latitude: -6.9, longitude: 107.6 }],
    });

    render(
      <div>
        <span data-testid="outside">Outside area</span>
        <ControlledDestinationInput />
      </div>
    );
    const input = screen.getByPlaceholderText(/Mau menginap di mana/i);
    fireEvent.change(input, { target: { value: 'Ban' } });

    expect(await screen.findByText('Bandung, Jawa Barat')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('Bandung, Jawa Barat')).not.toBeInTheDocument();
  });

  it('selects suggestion and triggers onChange', async () => {
    vi.mocked(propertyApi.searchGeocode).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [{ city: 'Surabaya', formattedAddress: 'Surabaya, Jawa Timur', latitude: -7.25, longitude: 112.75 }],
    });
    const mockOnSelect = vi.fn();
    render(<ControlledDestinationInput onSelect={mockOnSelect} />);
    const input = screen.getByPlaceholderText(/Mau menginap di mana/i);
    fireEvent.change(input, { target: { value: 'Sur' } });

    const item = await screen.findByText('Surabaya, Jawa Timur');
    fireEvent.click(item);

    expect(mockOnSelect).toHaveBeenCalledWith('Surabaya');
    expect(screen.queryByText('Surabaya, Jawa Timur')).not.toBeInTheDocument();
  });
});
