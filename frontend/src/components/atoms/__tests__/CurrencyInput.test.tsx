import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyInput } from '../CurrencyInput';

function ControlledWrapper({ initial }: { initial?: number }) {
  const [val, setVal] = useState<number | undefined>(initial);
  return (
    <div>
      <CurrencyInput
        aria-label="Harga Kamar"
        value={val}
        onValueChange={setVal}
        prefix="Rp"
      />
      <span data-testid="raw-val">{String(val)}</span>
    </div>
  );
}

describe('CurrencyInput Component', () => {
  it('formats initial numeric value with dot separators', () => {
    render(<ControlledWrapper initial={100000} />);
    const input = screen.getByLabelText('Harga Kamar');
    expect(input).toHaveValue('100.000');
    expect(screen.getByTestId('raw-val')).toHaveTextContent('100000');
  });

  it('formats live user entry with dot separators while typing', () => {
    render(<ControlledWrapper />);
    const input = screen.getByLabelText('Harga Kamar');

    fireEvent.change(input, { target: { value: '350000' } });
    expect(input).toHaveValue('350.000');
    expect(screen.getByTestId('raw-val')).toHaveTextContent('350000');

    fireEvent.change(input, { target: { value: '1500000' } });
    expect(input).toHaveValue('1.500.000');
    expect(screen.getByTestId('raw-val')).toHaveTextContent('1500000');
  });

  it('strips non-numeric characters and formats valid digits', () => {
    render(<ControlledWrapper />);
    const input = screen.getByLabelText('Harga Kamar');

    fireEvent.change(input, { target: { value: 'Rp 50.000abc' } });
    expect(input).toHaveValue('50.000');
    expect(screen.getByTestId('raw-val')).toHaveTextContent('50000');
  });

  it('clears value when input is emptied', () => {
    render(<ControlledWrapper initial={100000} />);
    const input = screen.getByLabelText('Harga Kamar');

    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue('');
    expect(screen.getByTestId('raw-val')).toHaveTextContent('undefined');
  });

  it('handles negative values when allowNegative is enabled', () => {
    const onValueChange = vi.fn();
    render(
      <CurrencyInput
        aria-label="Diskon"
        allowNegative={true}
        onValueChange={onValueChange}
      />
    );
    const input = screen.getByLabelText('Diskon');

    fireEvent.change(input, { target: { value: '-25000' } });
    expect(input).toHaveValue('-25.000');
    expect(onValueChange).toHaveBeenCalledWith(-25000);
  });

  it('renders prefix badge', () => {
    render(<CurrencyInput aria-label="Tarif" prefix="Rp" />);
    expect(screen.getByText('Rp')).toBeInTheDocument();
  });
});
