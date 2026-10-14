import React from 'react';
import { Outlet } from 'react-router-dom';
import { TenantSidebar } from './TenantSidebar';

export function TenantLayout(): React.JSX.Element {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8">
      <TenantSidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl">
        <Outlet />
      </div>
    </div>
  );
}
