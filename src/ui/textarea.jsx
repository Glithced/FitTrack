import React from 'react';

export function Textarea(props) {
  const { className = '', ...rest } = props;
  return <textarea className={`px-3 py-2 border rounded-md ${className}`} {...rest} />;
}

export default Textarea;
