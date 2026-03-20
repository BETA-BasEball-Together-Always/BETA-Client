/**
 * 중첩된 화면에서 최상위 Navigation 객체를 찾습니다.
 */
export function getRootNavigation(navigation) {
  if (!navigation) return navigation;
  let root = navigation;
  while (root.getParent?.()) {
    root = root.getParent();
  }
  return root;
}
