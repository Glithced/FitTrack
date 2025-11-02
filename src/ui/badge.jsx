import React from 'react';

export function Badge({ children, className }) {
  return (
    <span className={`inline-block px-3 py-1 bg-gray-200 rounded-full text-sm ${className || ''}`}>
      {children}
    </span>
  );
}
