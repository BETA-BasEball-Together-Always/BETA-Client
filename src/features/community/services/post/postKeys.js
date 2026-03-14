export const postKeys = {
  all: ["community"],
  // 게시글 관련
  posts: () => [...postKeys.all, "posts"],

  // 게시글 목록
  postList: () => [...postKeys.posts(), "list"],

  // 게시글 상세
  postDetail: (postId) => [...postKeys.posts(), "detail", { postId }],

  // 게시글 생성
  createPost: () => [...postKeys.posts(), "create"],

  // 게시글 수정
  updatePost: (postId) => [...postKeys.posts(), "update", { postId }],

  // 게시글 삭제
  deletePost: (postId) => [...postKeys.posts(), "delete", { postId }],
};