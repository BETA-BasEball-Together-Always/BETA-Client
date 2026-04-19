import { useState, useEffect, useRef } from "react";
import { useSignupDraftStore } from "../stores/useSignupDraftStore";

const HYDRATE_RETRY_CHECK_MS = 1500;

export function useSignupDraftPersistHydrated() {
  const [hydrated, setHydrated] = useState(() =>
    useSignupDraftStore.persist.hasHydrated(),
  );
  const didAnnounceRef = useRef(false);

  useEffect(() => {
    didAnnounceRef.current = false;
    let cancelled = false;

    const announce = () => {
      if (cancelled || didAnnounceRef.current) return;
      didAnnounceRef.current = true;
      queueMicrotask(() => {
        if (cancelled) return;
        setHydrated(true);
      });
    };

    if (useSignupDraftStore.persist.hasHydrated()) {
      announce();
      return () => {
        cancelled = true;
      };
    }

    const unsub = useSignupDraftStore.persist.onFinishHydration(() => {
      announce();
    });

    const retryTimer = setTimeout(() => {
      if (cancelled) return;
      if (!useSignupDraftStore.persist.hasHydrated()) {
        useSignupDraftStore.persist.rehydrate();
      }
    }, HYDRATE_RETRY_CHECK_MS);

    return () => {
      cancelled = true;
      unsub();
      clearTimeout(retryTimer);
    };
  }, []);

  return hydrated;
}
