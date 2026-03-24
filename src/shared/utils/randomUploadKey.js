/**
 * React Native에서 `uuid`가 `crypto.getRandomValues` 미구현으로 실패할 수 있어
 * 파일명·FormData 필드 등에 사용할 충분히 유니크한 키를 만듭니다.
 */
export function randomUploadKey() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}-${Math.random().toString(36).slice(2, 11)}`;
}
