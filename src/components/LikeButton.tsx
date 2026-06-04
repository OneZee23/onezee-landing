import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from './Icon';

/**
 * A small "like" island for blog posts. Reads the current count from /api/like
 * on mount and increments on click. One like per browser (localStorage) backed
 * by a server-side one-per-IP guard. If the likes backend is disabled (no Redis),
 * the button quietly hides — the post still reads fine.
 */
export default function LikeButton({ postId }: { postId: string }): React.ReactElement | null {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(`liked:${postId}`) === '1');
    } catch {
      /* private mode / storage blocked — ignore */
    }
    let cancelled = false;
    fetch(`/api/like?postId=${encodeURIComponent(postId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setLikes(typeof d.likes === 'number' ? d.likes : 0);
        setEnabled(d.enabled !== false);
      })
      .catch(() => !cancelled && setEnabled(false));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const onClick = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const next = !liked; // toggle: like or un-like
    // Optimistic update.
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    try {
      if (next) localStorage.setItem(`liked:${postId}`, '1');
      else localStorage.removeItem(`liked:${postId}`);
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch('/api/like', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const d = await res.json();
      if (d.enabled === false) setEnabled(false);
      if (typeof d.likes === 'number') setLikes(d.likes);
    } catch {
      /* keep the optimistic count */
    } finally {
      setBusy(false);
    }
  }, [busy, liked, postId]);

  if (!enabled) return null;

  return (
    <button
      type="button"
      className={`like${liked ? ' like--on' : ''}`}
      onClick={onClick}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? 'Remove your like' : 'Like this post'}
    >
      <span className="like__heart" aria-hidden="true">
        <Icon name={liked ? 'heart' : 'heart-outline'} size={15} />
      </span>
      <span className="like__count">{likes}</span>
    </button>
  );
}
