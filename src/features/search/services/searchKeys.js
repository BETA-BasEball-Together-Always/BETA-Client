export const searchKeys = {
  all: ["search"],
  logs: () => [...searchKeys.all, "logs"],
  suggestions: (keyword) => [...searchKeys.all, "suggestions", { keyword }],
  users: (keyword) => [...searchKeys.all, "results", "users", { keyword }],
  posts: (keyword, channel, sort) => [
    ...searchKeys.all,
    "results",
    "posts",
    { keyword, channel, sort },
  ],
  hashtags: (keyword) => [...searchKeys.all, "results", "hashtags", { keyword }],
};

export default searchKeys;
