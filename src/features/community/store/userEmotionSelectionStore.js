/**
 * 피드(PostCard)는 언마운트/재사용될 수 있어, 상세에서 남긴 감정 선택을
 * 카드 로컬 state만으로는 복원하기 어렵습니다. 이 디바이스 세션에서
 * 사용자가 토글한 감정(UI id: EMO_JOY 등)을 postId 기준으로 보관합니다.
 * (앱 재시작 시 초기화됨 — 서버에 myEmotion 필드가 생기면 대체 가능)
 */
const selectionByPostId = new Map();

export function setUserEmotionSelection(postId, uiEmotionTypeOrNull) {
  if (postId == null) return;
  selectionByPostId.set(postId, uiEmotionTypeOrNull);
}

/** undefined: 아직 이 기기에서 토글한 적 없음 */
export function getUserEmotionSelection(postId) {
  if (postId == null) return undefined;
  return selectionByPostId.has(postId)
    ? selectionByPostId.get(postId)
    : undefined;
}

export function clearUserEmotionSelection(postId) {
  if (postId == null) return;
  selectionByPostId.delete(postId);
}
