import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { ScrollToTop } from '../ScrollToTop';

describe('ScrollToTop Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('scrolls window to top (0, 0) on route change when no hash is present', () => {
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;

    render(
      <MemoryRouter initialEntries={['/about']}>
        <ScrollToTop />
      </MemoryRouter>
    );

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  });

  it('scrolls into element smoothly when hash is present and element exists', () => {
    const scrollIntoViewMock = vi.fn();
    const fakeElement = document.createElement('div');
    fakeElement.id = 'rekomendasi';
    fakeElement.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(fakeElement);

    render(
      <MemoryRouter initialEntries={['/#rekomendasi']}>
        <ScrollToTop />
      </MemoryRouter>
    );

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(fakeElement);
  });

  it('does not scroll window when only search query parameters change on the same pathname', () => {
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;

    function TestComponent() {
      const [, setSearchParams] = useSearchParams();
      return <button onClick={() => setSearchParams({ checkIn: '2026-10-15' })}>Pilih Tanggal</button>;
    }

    const { getByRole } = render(
      <MemoryRouter initialEntries={['/properties/clprop123']}>
        <ScrollToTop />
        <TestComponent />
      </MemoryRouter>
    );

    // Initial mount on route triggers scrollTo once
    expect(scrollToMock).toHaveBeenCalledTimes(1);

    // User clicks date button changing only query params (?checkIn=2026-10-15)
    fireEvent.click(getByRole('button', { name: /Pilih Tanggal/i }));

    // scrollTo should NOT be called again because pathname did not change
    expect(scrollToMock).toHaveBeenCalledTimes(1);
  });
});
