import { useEffect, useState } from "react";
import { Image } from "react-native";

// Cache to avoid calling Image.getSize repeatedly for same uri.
const aspectRatioCache = new Map();
const inFlight = new Map();

function getCacheKey(uri) {
  // If uri includes cache-busting query params, keep it as-is.
  // If you later want to normalize, do it here.
  return uri;
}

/**
 * Remote image aspectRatio = width / height
 * - Fallbacks to 1 when size cannot be resolved yet.
 */
export function useRemoteImageAspectRatio(uri, fallback = 1) {
  const [aspectRatio, setAspectRatio] = useState(fallback);

  useEffect(() => {
    if (!uri) {
      setAspectRatio(fallback);
      return;
    }

    const key = getCacheKey(uri);
    const cached = aspectRatioCache.get(key);
    if (cached && typeof cached.aspectRatio === "number") {
      setAspectRatio(cached.aspectRatio);
      return;
    }

    let cancelled = false;

    const promise =
      inFlight.get(key) ??
      new Promise((resolve) => {
        inFlight.delete(key); // clear so subsequent calls can retry on failure
        Image.getSize(
          uri,
          (w, h) => resolve({ width: w, height: h, aspectRatio: w / h }),
          () => resolve(null),
        );
      });

    inFlight.set(key, promise);

    promise.then((res) => {
      if (cancelled) return;
      if (!res || typeof res.aspectRatio !== "number" || !Number.isFinite(res.aspectRatio)) {
        setAspectRatio(fallback);
        return;
      }
      aspectRatioCache.set(key, res);
      setAspectRatio(res.aspectRatio);
    });

    return () => {
      cancelled = true;
    };
  }, [uri, fallback]);

  return aspectRatio;
}

