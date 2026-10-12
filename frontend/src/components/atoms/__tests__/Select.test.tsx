import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from '../Select';

describe('Select Atom Component', () => {
  it('renders select with options and handles value change', () => {
    const handleChange = vi.fn();
    render(
      <Select aria-label="Pilih opsi" onChange={handleChange} defaultValue="opt2">
        <option value="opt1">Opsi 1</option>
        <option value="opt2">Opsi 2</option>
      </Select>
    );

    const select = screen.getByRole('combobox', { name: 'Pilih opsi' });
    expect(select).toHaveValue('opt2');

    fireEvent.change(select, { target: { value: 'opt1' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveValue('opt1');
  });

  it('renders with error styles when hasError is true', () => {
    render(
      <Select hasError aria-label="Select with error">
        <option value="1">1</option>
      </Select>
    );
    const select = screen.getByRole('combobox', { name: 'Select with error' });
    expect(select.className).toContain('border-red-500');
  });

  it('renders with small size styles when size is sm', () => {
    render(
      <Select size="sm" aria-label="Small select">
        <option value="1">1</option>
      </Select>
    );
    const select = screen.getByRole('combobox', { name: 'Small select' });
    expect(select.className).toContain('text-xs');
    expect(select.className).toContain('py-1.5');
  });

  it('renders with left icon and custom right icon', () => {
    render(
      <Select
        aria-label="Icon select"
        leftIcon={<span data-testid="left-icon">Left</span>}
        rightIcon={<span data-testid="custom-right">Custom</span>}
      >
        <option value="1">1</option>
      </Select>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('custom-right')).toBeInTheDocument();
  });

  it('forwards ref properly', () => {
    const ref = React.createRef<HTMLSelectElement>();
    render(
      <Select ref={ref} aria-label="Ref select">
        <option value="test">Test</option>
      </Select>
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    expect(ref.current?.value).toBe('test');
  });

  it('opens custom dropdown menu list on click and selects option', () => {
    const handleChange = vi.fn();
    render(
      <Select aria-label="Kategori" onChange={handleChange} defaultValue="">
        <option value="">-- Pilih Kategori --</option>
        <option value="cat-1">Apartemen</option>
        <option value="cat-2">Villa</option>
      </Select>
    );

    const select = screen.getByRole('combobox', { name: 'Kategori' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.mouseDown(select);
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    const villaOption = listbox.querySelector('li:last-child')!;
    expect(villaOption.textContent).toContain('Villa');
    fireEvent.click(villaOption);

    expect(handleChange).toHaveBeenCalled();
    expect(select).toHaveValue('cat-2');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

