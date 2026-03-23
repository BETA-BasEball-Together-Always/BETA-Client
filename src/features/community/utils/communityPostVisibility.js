/** 리스트·카드 본문용 (소프트 삭제 후 서버가 내려주는 경우) */
export const DELETED_POST_MESSAGE = "삭제된 게시글입니다";
/** 존재하지 않음·접근 불가 등 */
export const POST_NOT_FOUND_MESSAGE = "게시글을 찾을 수 없습니다";

function normalizeStatus(raw) {
  if (raw == null) return "";
  return String(raw)
    .trim()
    .toUpperCase()
    .replace(/[\s_-]/g, "");
}

/**
 * 이미지 메타가 전부 비활성인지 (소프트 삭제 시 목록에 status 없이 내려오는 케이스)
 */
function hasOnlyInactiveImageAttachments(post) {
  const imgs = post?.images ?? [];
  if (!Array.isArray(imgs) || imgs.length === 0) return false;
  return imgs.every((img) => {
    if (img == null) return true;
    if (typeof img === "string") return false;
    return (
      img.active === false ||
      img.inactive === true ||
      img.enabled === false
    );
  });
}

/**
 * 소프트 삭제 등으로 피드에서 본문·이미지·해시태그를 비활성화해야 하는 게시글
 */
export function isPostDeletedOrHiddenInFeed(post) {
  if (!post) return true;
  if (
    post.deleted === true ||
    post.deleted === 1 ||
    post.deleted === "1" ||
    post.deleted === "true" ||
    post.isDeleted === true ||
    post.isDeleted === 1 ||
    post.isDeleted === "1" ||
    post.isDeleted === "true"
  ) {
    return true;
  }
  if (
    post.available === false ||
    post.available === 0 ||
    post.available === "false" ||
    post.available === "0" ||
    post.visible === false ||
    post.visible === 0 ||
    post.visible === "false" ||
    post.visible === "0"
  ) {
    return true;
  }

  const st = normalizeStatus(post.status ?? post.postStatus ?? post.postState);
  // 서버가 어떤 enum/문구를 쓰든 "삭제/제거" 계열이면 숨김 처리
  if (
    typeof st === "string" &&
    (st.includes("DELETE") ||
      st.includes("DELETED") ||
      st.includes("REMOVE") ||
      st.includes("REMOVED") ||
      st.includes("TOMBSTON") ||
      st.includes("INACTIVE"))
  ) {
    return true;
  }
  if (
    st === "DELETED" ||
    st === "DELETE" ||
    st === "INACTIVE" ||
    st === "REMOVED"
  ) {
    return true;
  }

  // 이미지 메타만 전부 비활성 — 목록에 status 없이 소프트 삭제만 반영된 경우
  if (hasOnlyInactiveImageAttachments(post)) return true;

  return false;
}

/** 리스트 카드에 표시할 안내 문구 */
export function getPostListUnavailableBody(post, { tombstoned = false } = {}) {
  if (tombstoned) return DELETED_POST_MESSAGE;
  if (isPostDeletedOrHiddenInFeed(post)) return DELETED_POST_MESSAGE;
  return null;
}

/** 이미지 항목이 서버에서 비활성화된 경우 제외 */
export function getActivePostImages(post) {
  if (isPostDeletedOrHiddenInFeed(post)) return [];
  const imgs = post?.images ?? [];
  if (!Array.isArray(imgs)) return [];
  return imgs.filter((img) => {
    if (img == null) return false;
    if (typeof img === "string") return true;
    if (img.active === false || img.inactive === true || img.enabled === false)
      return false;
    return !!(img.imageUrl || img.url);
  });
}

/** 해시태그가 객체로 active 플래그를 줄 때 비활성 제외 */
export function getActivePostHashtags(post) {
  if (isPostDeletedOrHiddenInFeed(post)) return [];
  const tags = post?.hashtags ?? [];
  if (!Array.isArray(tags)) return [];
  return tags.filter((t) => {
    if (t == null) return false;
    if (typeof t === "string") return t.trim().length > 0;
    if (typeof t === "object" && t.active === false) return false;
    const name = t.name ?? t.tag ?? t.value;
    return typeof name === "string" && name.trim().length > 0;
  });
}

/** 표시용 "#tag" 문자열 목록 */
export function getActiveHashtagLabels(post) {
  const activeHashtags = getActivePostHashtags(post);

  const activeLabels = activeHashtags
    .map((t) =>
      typeof t === "string" ? t.trim() : (t.name ?? t.tag ?? t.value ?? ""),
    )
    .filter(Boolean);

  // content에서 등장한 순서가 canonical로 보이므로, hashtags 배열 순서가 뒤집혀도 동일하게 맞춘다.
  const content = typeof post?.content === "string" ? post.content : "";
  const match = content.match(/#([^\s#]+)/g);
  if (!match || match.length === 0) return activeLabels;

  const normalizeKey = (s) =>
    String(s ?? "")
      .trim()
      .replace(/^#/, "")
      .toUpperCase();

  const activeKeyToLabel = new Map();
  for (const label of activeLabels) {
    const key = normalizeKey(label);
    if (!activeKeyToLabel.has(key)) activeKeyToLabel.set(key, label);
  }

  const contentKeys = match
    .map((m) => m.replace(/^#/, ""))
    .map((label) => normalizeKey(label));

  const ordered = [];
  const seen = new Set();

  for (const key of contentKeys) {
    if (seen.has(key)) continue;
    const label = activeKeyToLabel.get(key);
    if (!label) continue;
    seen.add(key);
    ordered.push(label);
  }

  // content에 없는(예: 본문에서 제거됐거나 서버가 content와 불일치하는) 해시태그는 기존 순서를 유지해 뒤에 붙인다.
  for (const label of activeLabels) {
    const key = normalizeKey(label);
    if (seen.has(key)) continue;
    ordered.push(label);
    seen.add(key);
  }

  return ordered;
}
