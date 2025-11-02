import React from 'react';

export function Label({ children, className = '' }) {
  return <label className={`block text-sm font-medium text-slate-700 ${className}`}>{children}</label>;
}

export default Label;
