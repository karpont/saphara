"use client";

import { useState, useCallback } from "react";

/**
 * Takip sistemi hook'u. Optimistik gunceller, hata olursa geri alir.
 * Uretimde POST /follow ve DELETE /follow uc noktalarina baglanir.
 */
export function useFollow(initialFollowing: boolean, initialCount: number) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const toggle = useCallback(async (targetId: string) => {
    const next = !following;
    // optimistik
    setFollowing(next);
    setCount((c) => c + (next ? 1 : -1));
    setPending(true);
    try {
      const res = await fetch(`/api/follow/${targetId}`, { method: next ? "POST" : "DELETE" });
      if (!res.ok) throw new Error("istek basarisiz");
    } catch {
      // geri al
      setFollowing(!next);
      setCount((c) => c + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  }, [following]);

  return { following, count, pending, toggle };
}
