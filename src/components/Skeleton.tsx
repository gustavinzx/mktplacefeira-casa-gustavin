import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export function Skeleton({ className = '', width, height, circle = false }: SkeletonProps) {
  const style = {
    width: width,
    height: height,
    borderRadius: circle ? '50%' : undefined,
  };

  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded-md ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 w-full bg-white shadow-sm flex flex-col gap-3">
      <Skeleton height={140} className="w-full rounded-xl" />
      <Skeleton height={20} className="w-3/4 mt-2" />
      <Skeleton height={16} className="w-1/2" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton height={24} className="w-1/3 rounded-full" />
        <Skeleton height={32} className="w-1/4 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 w-full p-4 border-b border-gray-50">
      <Skeleton circle width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton height={16} className="w-1/3" />
        <Skeleton height={12} className="w-1/4" />
      </div>
      <Skeleton height={32} className="w-24 rounded-full" />
    </div>
  );
}
