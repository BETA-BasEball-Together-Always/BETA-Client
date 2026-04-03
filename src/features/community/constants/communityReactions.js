/** 게시글 감정 표현 — PostReactions / ReactionPicker / ReactionSummary 공통 */
export const COMMUNITY_REACTIONS = [
  // 서버 emotionType 기준 순서(인덱스): 0=LIKE, 1=SAD, 2=FUN, 3=HYPE
  { id: "LIKE", emoji: "💖", bgColor: "#FFBDBD" },
  { id: "SAD", emoji: "😭", bgColor: "#C2EFFF" },
  { id: "FUN", emoji: "🤣", bgColor: "#FFFABF" },
  { id: "HYPE", emoji: "🔥", bgColor: "#FF9F76" },
];

const VALID_EMOTION_IDS = new Set(["LIKE", "SAD", "FUN", "HYPE"]);

const EMOTION_INDEX_TO_ID = ["LIKE", "SAD", "FUN", "HYPE"];

/** 목록/홈 응답에서 postId vs id 혼용 대응 */
export function resolveCommunityPostId(post) {
  if (!post) return null;
  const id = post.postId ?? post.id;
  return id == null ? null : id;
}

export function normalizeCommunityEmotionType(raw) {
  if (raw == null) return null;

  if (typeof raw === "number") {
    if (Number.isInteger(raw) && raw >= 0 && raw < EMOTION_INDEX_TO_ID.length) {
      return EMOTION_INDEX_TO_ID[raw];
    }
    return null;
  }

  if (typeof raw === "string") {
    const u = raw.trim().toUpperCase();
    return VALID_EMOTION_IDS.has(u) ? u : null;
  }

  if (typeof raw === "object") {
    const nested =
      raw.emotionType ?? raw.type ?? raw.code ?? raw.emotion ?? raw.name;
    return normalizeCommunityEmotionType(nested);
  }

  return null;
}

/**
 * POST .../emotions 토글 응답 해석.
 *
 * - 서버가 toggled를 문자열 "true"/"false", 숫자 1/0으로 주면 `=== true`만으로는 감지 실패 →
 *   스토어에 null이 들어가고(PostCard는 storeEmotion===null이면 post.emotionType 무시) 빈 하트로 고착될 수 있음.
 * - toggled 없이 emotionType만 오는 응답도 추론한다.
 */
export function parseEmotionToggleServerResponse(data, variables) {
  const t = data?.toggled;

  const explicitOff = t === false || t === 0 || t === "false" || t === "FALSE";
  const explicitOn = t === true || t === 1 || t === "true" || t === "TRUE";

  if (explicitOff) {
    return {
      toggledOn: false,
      toggledOff: true,
      resolvedEmotionType: null,
      ambiguous: false,
    };
  }

  if (explicitOn) {
    const resolved =
      normalizeCommunityEmotionType(data?.emotionType) ??
      normalizeCommunityEmotionType(variables?.emotionType) ??
      null;
    return {
      toggledOn: true,
      toggledOff: false,
      resolvedEmotionType: resolved,
      ambiguous: false,
    };
  }

  const inferred =
    normalizeCommunityEmotionType(data?.emotionType) ??
    normalizeCommunityEmotionType(variables?.emotionType) ??
    null;

  if (inferred) {
    return {
      toggledOn: true,
      toggledOff: false,
      resolvedEmotionType: inferred,
      ambiguous: false,
    };
  }

  if (data?.emotionType === null || data?.emotionType === "") {
    return {
      toggledOn: false,
      toggledOff: true,
      resolvedEmotionType: null,
      ambiguous: false,
    };
  }

  return {
    toggledOn: false,
    toggledOff: false,
    resolvedEmotionType: null,
    ambiguous: true,
  };
}

/**
 * 게시글에 대해 "내가 남긴 감정"을 읽는다.
 *
 * 백엔드 명세: 게시글 본문에는 `emotionType`만 내려오고 `myEmotion` / `myEmotionType`은 없음.
 * (토글 응답에도 `emotionType` 필드 사용)
 * 하위 호환을 위해 예전 필드명은 뒤쪽 후보로만 둔다.
 */
export function pickEmotionTypeFromPost(post) {
  if (!post) return null;
  const em = post.emotions;
  const candidates = [
    post.emotionType,
    post.userEmotionType,
    em?.emotionType,
    em?.userEmotionType,
    post.myEmotionType,
    post.myEmotion,
    em?.myEmotionType,
  ];
  for (const c of candidates) {
    const n = normalizeCommunityEmotionType(c);
    if (n) return n;
  }
  return null;
}

/** 호환용 별칭 — 과거 이름 유지 (동작은 pickEmotionTypeFromPost와 동일) */
export function pickEmotionTypeFromPostCoalesced(post) {
  return pickEmotionTypeFromPost(post);
}

/**
 * 하트/피커에 쓸 "내 감정" 값.
 * 게시글 객체(post)에 서버가 내려준 emotionType이 있으면 그걸 최우선(토글 응답·GET 상세·목록 캐시 모두 동일).
 * 없을 때만 로컬 스토어(옵티미스틱/영속)를 사용한다.
 */
export function resolveSelectedEmotionForPost(post, storeEmotion) {
  // storeEmotion이 명시적으로 존재하면(특히 null=취소) 서버 값보다 우선한다.
  // 서버 응답/캐시가 잠깐 stale일 때도 UI가 즉시 토글되도록 하기 위함.
  if (storeEmotion === null) return null;
  if (storeEmotion !== undefined) {
    return normalizeCommunityEmotionType(storeEmotion) ?? undefined;
  }

  const fromPost = pickEmotionTypeFromPostCoalesced(post);
  if (fromPost) return fromPost;
  return undefined;
}
