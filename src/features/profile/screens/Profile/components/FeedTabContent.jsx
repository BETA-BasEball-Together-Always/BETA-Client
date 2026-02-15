import React from "react";
import { View, StyleSheet } from "react-native";
import EmptyState from "./EmptyState";
import PostList from "./PostList";

// 목업 데이터 - 추후 실제 API로 대체될 예정
// 게시글이 없는 경우를 테스트하려면 빈 배열로 변경: const mockUserPosts = [];
const mockUserPosts = [
  // {
  //   id: "1",
  //   content: "오늘 경기 정말 멋졌어요! 우리 팀 화이팅!",
  //   timeAgo: "2시간 전",
  //   likes: 15,
  //   comments: 3,
  //   image: null,
  // },
  // {
  //   id: "2",
  //   content: "야구장에서 찍은 사진입니다. 날씨가 너무 좋았어요!",
  //   timeAgo: "1일 전",
  //   likes: 42,
  //   comments: 8,
  //   image: "https://picsum.photos/seed/post1/600/400",
  // },
  // {
  //   id: "3",
  //   content: "오늘 홈런 레전드였습니다!",
  //   timeAgo: "3일 전",
  //   likes: 28,
  //   comments: 5,
  //   image: null,
  // },
];

const FeedTabContent = () => {
  // 추후 실제 API 호출로 대체될 예정
  const userPosts = mockUserPosts;
  const hasPosts = userPosts && userPosts.length > 0;

  return (
    <View style={styles.container}>
      {hasPosts ? (
        <PostList posts={userPosts} />
      ) : (
        <EmptyState />
      )}
    </View>
  );
};

export default FeedTabContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
