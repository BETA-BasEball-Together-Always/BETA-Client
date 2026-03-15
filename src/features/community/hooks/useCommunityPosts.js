import { useState, useEffect } from "react";
// import { fetchPosts } from "../api/communityApi";

export default function useCommunityPosts({ channel, sort }) {
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(true);

  useEffect(() => {
    loadPosts(true);
  }, [channel, sort]);

  async function loadPosts(reset = false) {
    const res = await fetchPosts({
      channel,
      sort,
      cursor: sort === "latest" ? cursor : null,
      offset: sort === "popular" ? offset : null,
    });

    if (reset) {
      setPosts(res.posts);
    } else {
      setPosts((prev) => [...prev, ...res.posts]);
    }

    setHasNext(res.hasNext);
    setCursor(res.nextCursor);
    setOffset((prev) => prev + res.posts.length);
  }

  function loadMore() {
    if (hasNext) {
      loadPosts();
    }
  }

  return { posts, loadMore };
}
