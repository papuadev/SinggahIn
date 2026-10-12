import React from 'react';
import { Pagination } from '../../../components/molecules/Pagination';

export interface RoomPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (newPage: number) => void;
}

export function RoomPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: RoomPaginationProps): React.JSX.Element | null {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      itemLabel="tipe kamar"
      onPageChange={onPageChange}
      className="pt-3 border-t border-gray-100"
    />
  );
}
