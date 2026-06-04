import React from 'react';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Marks a block for the scroll-reveal fade-in. The homepage is rendered to
 * static HTML (no hydration), so visibility is toggled by the framework-independent
 * reveal script in BaseLayout.astro — this stays a plain element with no state.
 */
export const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className = '' }) => (
  <div className={`reveal ${className}`.trim()} style={{ transitionDelay: `${delay}ms` }}>
    {children}
  </div>
);
