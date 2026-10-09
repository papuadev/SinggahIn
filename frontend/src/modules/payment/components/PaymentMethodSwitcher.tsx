import React from 'react';
import { Building2, CreditCard, Loader2, AlertCircle } from 'lucide-react';

export interface PaymentMethodSwitcherProps {
  currentMethod: 'MANUAL_TRANSFER' | 'PAYMENT_GATEWAY';
  isSwitching: boolean;
  switchError?: string | null;
  onSwitch: (method: 'MANUAL_TRANSFER' | 'PAYMENT_GATEWAY') => void;
}

function SwitcherOption({ id, label, icon: Icon, active, disabled, onClick }: any) {
  const activeCls = 'border-primary-600 bg-primary-50 text-primary-900 font-bold ring-2 ring-primary-500';
  const inactiveCls = 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50';
  const cls = active ? activeCls : inactiveCls;
  return (
    <button
      type="button"
      disabled={disabled || active}
      onClick={() => onClick(id)}
      className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm transition-all flex-1 text-left ${cls} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
      <span className="truncate">{label}</span>
    </button>
  );
}

function SwitcherErrorAlert({ error }: { error: string }) {
  return (
    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{error}</span>
    </div>
  );
}

export function PaymentMethodSwitcher(props: PaymentMethodSwitcherProps): React.JSX.Element {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pilih Metode Pembayaran</p>
        {props.isSwitching && (
          <span className="text-xs text-primary-600 flex items-center gap-1 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengubah metode...
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <SwitcherOption
          id="MANUAL_TRANSFER" label="Transfer Bank Manual" icon={Building2}
          active={props.currentMethod === 'MANUAL_TRANSFER'} disabled={props.isSwitching} onClick={props.onSwitch}
        />
        <SwitcherOption
          id="PAYMENT_GATEWAY" label="Pembayaran Otomatis" icon={CreditCard}
          active={props.currentMethod === 'PAYMENT_GATEWAY'} disabled={props.isSwitching} onClick={props.onSwitch}
        />

      </div>
      {props.switchError && <SwitcherErrorAlert error={props.switchError} />}
    </div>
  );
}
