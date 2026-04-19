/**
 * AuthStack 루트 reset은 동일 resume에 대해 한 번만 적용한다.
 * 루트 CommonActions.reset 후 AuthStack이 remount되면 컴포넌트 ref가 초기화되어
 * reset이 반복될 수 있어, 모듈 스코프로 "이미 적용한 resume"을 기억한다.
 *
 * - clearAuthResumeResetGuard: 로그아웃·세션 초기화·앱 부트스트랩 시작 시 호출해
 *   다음 로그인/재진입에서 다시 reset이 허용되게 한다.
 */

let lastAppliedAuthResumeKey = null;

export function buildAuthResumeGuardKey(resume) {
  if (!resume || typeof resume.name !== "string") return null;
  try {
    return JSON.stringify({
      name: resume.name.trim(),
      params: resume.params ?? null,
    });
  } catch {
    return resume.name.trim();
  }
}

export function hasAuthResumeResetAlreadyApplied(resume) {
  const key = buildAuthResumeGuardKey(resume);
  if (key == null) return false;
  return lastAppliedAuthResumeKey === key;
}

export function markAuthResumeResetApplied(resume) {
  lastAppliedAuthResumeKey = buildAuthResumeGuardKey(resume);
}

export function clearAuthResumeResetGuard() {
  lastAppliedAuthResumeKey = null;
}
