/**
 * 이미지만 있는 게시글: 서버 content 필수 검증용(1자).
 * 본문 표시에서는 숨긴다.
 */
export const PHOTO_ONLY_POST_PLACEHOLDER = "\u3164";

export function stripPhotoOnlyPlaceholderForDisplay(text) {
  if (text == null) return "";
  const t = String(text);
  if (t === PHOTO_ONLY_POST_PLACEHOLDER) return "";
  if (t.trim() === PHOTO_ONLY_POST_PLACEHOLDER) return "";
  return t;
}
