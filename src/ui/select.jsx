import React from 'react';

export function Select({ children, value, onValueChange, className = '' }) {
  // Basic <select> wrapper — other files expect compound components but this minimal version
  return (
    <select
      value={value}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      className={`px-3 py-2 border rounded ${className}`}
    >
      {children}
    </select>
  );
}

export function SelectTrigger({ children }) {
  return <>{children}</>;
}

export function SelectValue() {
  return null;
}

export function SelectContent({ children }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}

export default Select;
