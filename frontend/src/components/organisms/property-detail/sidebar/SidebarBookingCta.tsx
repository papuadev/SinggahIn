import { Link } from 'react-router-dom';
import { Button } from '../../../atoms/Button';

function LoginPrompt() {
  return (
    <p className="text-xs text-center text-gray-500 leading-relaxed">
      Silahkan login sebagai user untuk mengaktifkan fitur ini.{' '}
      <Link
        to="/login?role=USER"
        className="font-semibold text-primary-600 hover:text-primary-700 underline"
      >
        Login
      </Link>
    </p>
  );
}

export function SidebarBookingCta({
  onClick,
  hasDates,
  isAuthenticated,
}: {
  onClick: () => void;
  hasDates: boolean;
  isAuthenticated: boolean;
}) {
  const buttonText = !isAuthenticated || hasDates ? 'Pesan Sekarang' : 'Pilih Tanggal Menginap';
  return (
    <div className="mt-4 space-y-2">
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={onClick}
        disabled={!isAuthenticated}
        className="w-full font-bold shadow-md shadow-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonText}
      </Button>
      {!isAuthenticated && <LoginPrompt />}
    </div>
  );
}
