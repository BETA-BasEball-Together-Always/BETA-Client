import {
  getCurrentLeafRoute,
  navigateToPostDetail,
  rootNavigationRef,
} from "../../app/navigation/rootNavigation";
import { useUserStore } from "../store/userStore";

let pendingPushTarget = null;
let lastHandledMessageKey = null;

function normalizeString(value) {
  const normalized = value == null ? "" : String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizePostId(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  const numericPostId = Number(normalized);
  return Number.isSafeInteger(numericPostId) ? numericPostId : normalized;
}

function buildMessageKey(remoteMessage) {
  const messageId = normalizeString(
    remoteMessage?.messageId ?? remoteMessage?.message_id,
  );
  const type = normalizeString(remoteMessage?.data?.type);
  const postId = normalizeString(remoteMessage?.data?.postId);
  const sentTime =
    remoteMessage?.sentTime != null
      ? normalizeString(remoteMessage.sentTime)
      : null;

  const key = [messageId, type, postId, sentTime].filter(Boolean).join(":");
  return key || (postId ? `post:${postId}` : null);
}

function resolveRoutePostId(route) {
  if (!route?.params) {
    return null;
  }

  return normalizePostId(route.params.postId ?? route.params.post?.postId);
}

export function queuePushOpen(remoteMessage) {
  const postId = normalizePostId(remoteMessage?.data?.postId);
  if (postId == null) {
    return { queued: false, reason: "POST_ID_MISSING" };
  }

  const messageKey = buildMessageKey(remoteMessage);
  if (
    messageKey != null &&
    (messageKey === lastHandledMessageKey ||
      messageKey === pendingPushTarget?.messageKey)
  ) {
    return { queued: false, reason: "DUPLICATE", messageKey };
  }

  pendingPushTarget = {
    postId,
    type: normalizeString(remoteMessage?.data?.type),
    commentId: normalizeString(remoteMessage?.data?.commentId),
    emotionType: normalizeString(remoteMessage?.data?.emotionType),
    messageKey,
  };

  return { queued: true, target: pendingPushTarget };
}

export function flushPendingPushNavigation() {
  if (pendingPushTarget == null) {
    return { handled: false, reason: "NO_PENDING" };
  }

  if (!rootNavigationRef.isReady()) {
    return { handled: false, reason: "NAVIGATION_NOT_READY" };
  }

  const { accessToken, user } = useUserStore.getState();

  // 세션 복구가 끝난 뒤에도 로그인 상태가 아니면 이번 푸시 진입은 무시한다.
  if (!accessToken || !user?.id) {
    pendingPushTarget = null;
    return { handled: false, reason: "AUTH_REQUIRED_DROPPED" };
  }

  const currentRoute = getCurrentLeafRoute();
  const currentPostId = resolveRoutePostId(currentRoute);

  if (
    currentRoute?.name === "PostDetail" &&
    currentPostId != null &&
    String(currentPostId) === String(pendingPushTarget.postId)
  ) {
    lastHandledMessageKey = pendingPushTarget.messageKey ?? lastHandledMessageKey;
    pendingPushTarget = null;
    return { handled: true, reason: "ALREADY_ON_POST" };
  }

  const target = pendingPushTarget;
  const navigated = navigateToPostDetail(target.postId);

  lastHandledMessageKey = target.messageKey ?? lastHandledMessageKey;
  pendingPushTarget = null;

  return {
    handled: navigated,
    reason: navigated ? "NAVIGATED" : "NAVIGATION_FAILED",
    target,
  };
}
