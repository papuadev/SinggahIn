import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
});
