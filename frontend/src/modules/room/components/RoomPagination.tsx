import React from 'react';
import { Pagination } from '../../../components/molecules/Pagination';

export interface RoomPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (newPage: number) => void;
}

export function RoomPagination(props: RoomPaginationProps): React.JSX.Element | null {
  return (
    <Pagination
      page={props.page}
      totalPages={props.totalPages}
      totalItems={props.totalItems}
      pageSize={props.pageSize}
      itemLabel="tipe kamar"
      onPageChange={props.onPageChange}
      className="pt-3 border-t border-gray-100"
    />
  );
}
