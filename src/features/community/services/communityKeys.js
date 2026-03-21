export const communityKeys = {
  all: ["community"],

  posts: () => [...communityKeys.all, "posts"],

  postList: ({ channel, sort }) => [
    ...communityKeys.posts(),
    "list",
    { channel, sort },
  ],

  postDetail: (postId) => [...communityKeys.posts(), "detail", { postId }],
};

export default communityKeys;
