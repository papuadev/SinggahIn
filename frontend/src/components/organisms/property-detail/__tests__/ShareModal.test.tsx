import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ShareModal } from '../ShareModal';

describe('ShareModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Villa Nuansa Asri Dago',
    url: 'https://singgahin.biz.id/properties/clprop123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'open').mockImplementation(() => null);
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('does not render when isOpen is false', () => {
    render(<ShareModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders all required share channels and title when open', () => {
    render(<ShareModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Bagikan Properti')).toBeInTheDocument();
    expect(screen.getByText('Villa Nuansa Asri Dago')).toBeInTheDocument();
    expect(screen.getByLabelText('Bagikan ke WhatsApp')).toBeInTheDocument();
    expect(screen.getByLabelText('Bagikan ke Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Bagikan ke Twitter / X')).toBeInTheDocument();
    expect(screen.getByLabelText('Bagikan ke Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Bagikan ke Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Salin tautan')).toBeInTheDocument();
  });

  it('opens WhatsApp share link when clicked', () => {
    render(<ShareModal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Bagikan ke WhatsApp'));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('api.whatsapp.com/send'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('opens Facebook share link when clicked', () => {
    render(<ShareModal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Bagikan ke Facebook'));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer/sharer.php'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('opens Twitter share link when clicked', () => {
    render(<ShareModal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Bagikan ke Twitter / X'));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('opens Email mailto link when clicked', () => {
    render(<ShareModal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Bagikan ke Email'));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('mailto:'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('copies URL and opens Instagram when clicked', async () => {
    render(<ShareModal {...defaultProps} />);
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Bagikan ke Instagram'));
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.url);
  });

  it('copies URL to clipboard when Salin button is clicked', async () => {
    render(<ShareModal {...defaultProps} />);
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Salin tautan'));
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.url);
  });

  it('calls onClose when close button is clicked', () => {
    render(<ShareModal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Tutup modal'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
