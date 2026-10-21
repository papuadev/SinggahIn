import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { FormField } from '../../../components/molecules/FormField';
import { Input } from '../../../components/atoms/Input';

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  registration: any;
  autoComplete?: string;
}

function PasswordEyeBtn({ show, label, onToggle }: { show: boolean; label: string; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="hover:text-gray-600 focus:outline-none" aria-label={show ? `Sembunyikan ${label.toLowerCase()}` : `Lihat ${label.toLowerCase()}`}>
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}

export function PasswordFieldInput({ id, label, placeholder, error, disabled, registration, autoComplete }: PasswordFieldProps): React.JSX.Element {
  const [show, setShow] = useState(false);
  const rightIcon = <PasswordEyeBtn show={show} label={label} onToggle={() => setShow((p) => !p)} />;
  return (
    <FormField label={label} required error={error} htmlFor={id}>
      <Input id={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} placeholder={placeholder} leftIcon={<Lock className="w-4 h-4" />} hasError={!!error} disabled={disabled} rightIcon={rightIcon} {...registration} />
    </FormField>
  );
}
