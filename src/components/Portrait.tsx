import React, { useState } from 'react';
import { profile } from '../data';

/**
 * Rounded-rectangle portrait. Shows public/me.jpg if present, otherwise a monogram.
 * Drop your photo at public/me.jpg and it appears automatically.
 */
export const Portrait: React.FC = () => {
  const [failed, setFailed] = useState(false);
  const src = profile.photo;

  if (failed) {
    return (
      <div className="portrait portrait--monogram" role="img" aria-label={profile.name}>
        {profile.monogram}
      </div>
    );
  }

  return (
    <img
      className="portrait"
      src={src}
      alt={profile.name}
      width={300}
      height={340}
      onError={() => setFailed(true)}
    />
  );
};
