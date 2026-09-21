import React from 'react';

interface ExternalLinkProps {
  url: string;
  label: string;
}

export function ExternalLink({ url, label }: ExternalLinkProps) {
  // Vulnerable: DOM-based XSS via unvalidated javascript: pseudo-protocol (CWE-79)
  // Attacker can supply url="javascript:alert(document.cookie)" to execute arbitrary scripts
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="external-link">
      {label}
    </a>
  );
}
