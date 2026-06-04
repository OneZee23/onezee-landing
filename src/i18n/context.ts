import { createContext, useContext } from 'react';
import type { Locale, SiteContent } from '../content/site';

interface SiteCtx {
  c: SiteContent;
  lang: Locale;
}

export const SiteContext = createContext<SiteCtx | null>(null);

/** Homepage content + locale for the current render. */
export function useSite(): SiteCtx {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within <SiteContext.Provider>');
  return ctx;
}
