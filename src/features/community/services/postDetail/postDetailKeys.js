const postDetailKeys = {
  detail: (postId) => ["community", "postDetail", postId],
  comments: (postId) => ["community", "postComments", postId],
};

export default postDetailKeys;
