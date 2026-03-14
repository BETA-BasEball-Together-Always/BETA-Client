// src/utils/cn.js
// 문자열 병합 유틸(src/shared/theme/components/AppText.js 파일에서 사용)
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
