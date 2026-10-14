import React from 'react';

function SkeletonGallery() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-80 sm:h-96">
      <div className="md:col-span-2 bg-gray-200 rounded-2xl h-full" />
      <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-3">
        <div className="bg-gray-200 rounded-2xl h-full" />
        <div className="bg-gray-200 rounded-2xl h-full" />
        <div className="bg-gray-200 rounded-2xl h-full" />
        <div className="bg-gray-200 rounded-2xl h-full" />
      </div>
    </div>
  );
}

function SkeletonBody() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="h-32 bg-gray-200 rounded-2xl" />
        <div className="h-44 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
      <div className="hidden lg:block h-72 bg-gray-200 rounded-2xl" />
    </div>
  );
}

export function PropertyDetailSkeleton(): React.JSX.Element {
  return (
    <div role="status" aria-label="Memuat detail properti" className="flex flex-col gap-6 animate-pulse max-w-7xl mx-auto py-4">
      <div className="h-6 w-48 bg-gray-200 rounded-md" />
      <div className="h-10 w-3/4 bg-gray-200 rounded-lg" />
      <div className="h-5 w-1/3 bg-gray-200 rounded-md" />
      <SkeletonGallery />
      <SkeletonBody />
    </div>
  );
}
