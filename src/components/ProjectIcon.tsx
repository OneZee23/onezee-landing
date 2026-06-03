import React, { useState } from 'react';

interface ProjectIconProps {
  src?: string;
  name: string;
  href?: string; // when set, the icon becomes a link to the project's home
}

/** App-style icon with a monogram fallback; clickable when href is provided. */
export const ProjectIcon: React.FC<ProjectIconProps> = ({ src, name, href }) => {
  const [failed, setFailed] = useState(false);
  const initial = name.replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase();

  const visual =
    !src || failed ? (
      <span className="proj-icon proj-icon--mono">{initial}</span>
    ) : (
      <img
        className="proj-icon"
        src={src}
        alt=""
        width={44}
        height={44}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );

  if (href) {
    return (
      <a
        className="proj-icon-slot"
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Open ${name}`}
      >
        {visual}
      </a>
    );
  }

  return (
    <span className="proj-icon-slot" aria-hidden="true">
      {visual}
    </span>
  );
};
