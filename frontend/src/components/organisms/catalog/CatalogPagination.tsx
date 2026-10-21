import React from 'react';
import { Pagination } from '../../molecules/Pagination';

export interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
}

export function CatalogPagination({ page, totalPages, totalItems, onPageChange }: CatalogPaginationProps): React.JSX.Element | null {
  return <Pagination page={page} totalPages={totalPages} totalItems={totalItems} itemLabel="properti" onPageChange={onPageChange} className="mt-10" />;
}
