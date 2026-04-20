import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useSignupDraftStore } from "../stores/useSignupDraftStore";

const HYDRATE_RETRY_CHECK_MS = 500;

export function useSignupDraftPersistHydrated() {
  const [hydrated, setHydrated] = useState(() =>
    useSignupDraftStore.persist.hasHydrated(),
  );
  const didAnnounceRef = useRef(false);

  /** sessionBootstrap에서 이미 rehydrate 된 경우, 다음 프레임에서 곧바로 true */
  useLayoutEffect(() => {
    if (useSignupDraftStore.persist.hasHydrated()) {
      setHydrated(true);
    }
  }, []);

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

    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      if (useSignupDraftStore.persist.hasHydrated()) {
        announce();
      }
    });

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
      cancelAnimationFrame(raf);
      unsub();
      clearTimeout(retryTimer);
    };
  }, []);

  return hydrated;
}
