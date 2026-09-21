'use client';

import React, { useState } from 'react';

export function FormValidator() {
  const [input, setInput] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Vulnerable: Catastrophic backtracking regular expression causing client-side ReDoS (CWE-1333)
  // Input like "aaaaaaaaaaaaaaaaaaaaaaaaaaaa!" locks the browser UI thread
  const redosRegex = /^([a-zA-Z0-9]+)+$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    setIsValid(redosRegex.test(val));
  };

  return (
    <div className="validator-box">
      <label>Username Validation</label>
      <input type="text" value={input} onChange={handleChange} placeholder="Enter username" />
      <span>{isValid ? 'Valid' : 'Invalid'}</span>
    </div>
  );
}
