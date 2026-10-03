import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';

export interface RoomListEmptySearchProps {
  query: string;
  onReset: () => void;
}

function EmptySearchIcon(): React.JSX.Element {
  return (
    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
      <SearchX className="w-6 h-6" />
    </div>
  );
}

function EmptySearchText({ query }: { query: string }): React.JSX.Element {
  return (
    <>
      <h4 className="text-sm font-bold text-gray-900 mb-1">Tipe Kamar Tidak Ditemukan</h4>
      <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
        Tidak ada tipe kamar yang cocok dengan &quot;{query}&quot;.
      </p>
    </>
  );
}

function ResetButton({ onReset }: { onReset: () => void }): React.JSX.Element {
  return (
    <Button
      type="button" variant="outline" size="sm" onClick={onReset}
      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
    >
      Bersihkan Pencarian
    </Button>
  );
}

export function RoomListEmptySearch({ query, onReset }: RoomListEmptySearchProps): React.JSX.Element {
  return (
    <div className="text-center py-10 px-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
      <EmptySearchIcon />
      <EmptySearchText query={query} />
      <ResetButton onReset={onReset} />
    </div>
  );
}
