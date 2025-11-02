import React from 'react';

export function Dialog({ children, open, onOpenChange }) {
  // very small stub: render children unconditionally
  return <div>{children}</div>;
}

export function DialogContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function DialogHeader({ children }) {
  return <div>{children}</div>;
}

export function DialogTitle({ children, className = '' }) {
  return <h3 className={className}>{children}</h3>;
}

export function DialogFooter({ children }) {
  return <div className="mt-4 flex justify-end gap-2">{children}</div>;
}

export default Dialog;
