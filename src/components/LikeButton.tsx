import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

/**
 * A small "like" island for blog posts. The server (/api/like) is the source of
 * truth: GET returns the current count + whether this client (by IP) already
 * liked; clicking toggles via POST/DELETE. If the likes backend is disabled
 * (no Redis), the button quietly hides — the post still reads fine.
 */
export default function LikeButton({ postId }: { postId: string }): React.ReactElement | null {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState(false);
  // Once the user clicks, the in-flight mount GET must not overwrite the toggled
  // state (it could land later with a pre-click snapshot and revert the like).
  const interacted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/like?postId=${encodeURIComponent(postId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || interacted.current) return;
        setLikes(typeof d.likes === 'number' ? d.likes : 0);
        setLiked(!!d.liked);
        setEnabled(d.enabled !== false);
      })
      .catch(() => {
        if (!cancelled && !interacted.current) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const onClick = useCallback(async () => {
    if (busy) return;
    interacted.current = true;
    setBusy(true);
    const next = !liked; // toggle: like or un-like
    // Optimistic update.
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    try {
      const res = await fetch('/api/like', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const d = await res.json();
      if (d.enabled === false) setEnabled(false);
      if (typeof d.likes === 'number') setLikes(d.likes);
      if (typeof d.liked === 'boolean') setLiked(d.liked);
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
