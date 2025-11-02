import React from 'react';

export function Progress({ value = 0, className = '' }) {
  return (
    <div className={`w-full bg-slate-200 rounded ${className}`}>
      <div
        className="h-2 bg-blue-600 rounded"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export default Progress;
