/**
 * React Native Image 네이티브 캐시가 동일 https URL에 다른 비트맵을 잘못 묶는 경우
 * (CDN이 같은 경로에 객체를 덮어쓴 뒤 URL 문자열은 동일한 경우 등) 완화.
 * 표시용으로만 쿼리 파라미터를 붙여 캐시 키를 분리합니다.
 *
 * 서명·토큰이 포함된 URL은 깨지지 않도록 그대로 둡니다.
 */
export function withImageDisplayCacheKey(uri, uniqueKey) {
  if (uri == null || typeof uri !== "string") return uri;
  const t = uri.trim();
  if (t.startsWith("file://") || t.startsWith("/")) return t;
  if (!/^https?:\/\//i.test(t)) return t;

  if (/[?&](X-Amz-Signature|X-Amz-Credential|Signature|sig|token)=/i.test(t)) {
    return t;
  }

  const sep = t.includes("?") ? "&" : "?";
  return `${t}${sep}_rnImg=${encodeURIComponent(String(uniqueKey))}`;
}
