// 중첩 Stack 내부까지 파고들어 "현재 실제 보여지는" 라우트 이름 얻기(탭바 숨기기 로직용)
export function getDeepActiveRouteName(route) {
  let r = route;
  while (r?.state?.routes && r.state.index != null) {
    r = r.state.routes[r.state.index];
  }
  return r?.name ?? route?.name;
}
