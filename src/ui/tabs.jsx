import React from 'react';

export function Tabs({ children, value, onValueChange }) {
  return <div>{children}</div>;
}

export function TabsList({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ value, children }) {
  // This is a lightweight stub — real behaviour isn't required for now
  return <button type="button">{children}</button>;
}

export default Tabs;
