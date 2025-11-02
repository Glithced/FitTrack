import React from 'react';

export function Input(props) {
  const { className = '', ...rest } = props;
  return <input className={`px-3 py-2 border rounded-md ${className}`} {...rest} />;
}

export default Input;
