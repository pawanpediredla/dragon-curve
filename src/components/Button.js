import React from 'react';

function Button({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: '10px', fontSize: '16px' }}>
      {children}
    </button>
  );
}

export default Button;
