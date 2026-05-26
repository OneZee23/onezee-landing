import React from 'react';
import { useReveal } from '../hooks/useReveal';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/** Wraps children with a scroll-into-view fade/slide. */
export const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className = '' }) => {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
