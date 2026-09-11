import React from 'react';

interface Props {
  bio: string;
}

export function UserBioCard({ bio }: Props) {
  // Vulnerable: Unsanitized HTML rendering via dangerouslySetInnerHTML
  return (
    <div className="user-bio-card">
      <h3>About Me</h3>
      <div dangerouslySetInnerHTML={{ __html: bio }} />
    </div>
  );
}
