import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const spinnerElement = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-brand-200 dark:border-brand-900/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
        Processing securely...
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 dark:bg-slate-950/50 backdrop-blur-md">
        <div className="p-6 rounded-2xl glass-card shadow-2xl flex items-center justify-center min-w-[200px]">
          {spinnerElement}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 w-full h-full">
      {spinnerElement}
    </div>
  );
};

export default Loader;
