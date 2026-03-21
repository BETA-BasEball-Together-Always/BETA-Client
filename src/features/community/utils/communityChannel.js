/**
 * 조회 API 응답의 channel 기준 (목록·상세): ALL 또는 팀코드
 * 게시글 작성 요청의 channel은 TEAM | ALL만 사용(CreatePostScreen)
 */
export function isAllChannelPost(channel) {
  return channel === "ALL";
}
