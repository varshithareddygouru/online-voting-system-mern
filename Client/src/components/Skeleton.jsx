import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="p-6 rounded-2xl glass-card animate-pulse space-y-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center pt-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
      </div>
    </div>
  );
};

export const SkeletonTable = () => {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4 py-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
};
