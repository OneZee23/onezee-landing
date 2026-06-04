import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';

// Russian plural: 1 просмотр / 2 просмотра / 5 просмотров.
function ruPlural(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'просмотр';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'просмотра';
  return 'просмотров';
}

/**
 * Auto-incrementing view counter. On mount it records one view (once per browser
 * session) and shows the total. Reuses /api/view (Redis + in-memory fallback);
 * if the backend is disabled it just stays hidden.
 */
export default function ViewCounter({ postId, lang }: { postId: string; lang: 'ru' | 'en' }): React.ReactElement | null {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sessionKey = `viewed:${postId}`;
    let alreadyCounted = false;
    try {
      alreadyCounted = sessionStorage.getItem(sessionKey) === '1';
    } catch {
      /* storage blocked — treat as not counted */
    }

    (async () => {
      try {
        const res = alreadyCounted
          ? await fetch(`/api/view?postId=${encodeURIComponent(postId)}`)
          : await fetch('/api/view', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ postId }),
            });
        const data = await res.json();
        if (!alreadyCounted) {
          try {
            sessionStorage.setItem(sessionKey, '1');
          } catch {
            /* ignore */
          }
        }
        if (!cancelled && typeof data.views === 'number') setViews(data.views);
      } catch {
        /* leave hidden */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (views == null) return null;
  const label = lang === 'ru' ? ruPlural(views) : views === 1 ? 'view' : 'views';
  return (
    <span className="post__views">
      <Icon name="eye" size={15} />
      {views} {label}
    </span>
  );
}
