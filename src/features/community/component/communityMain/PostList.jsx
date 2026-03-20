import React from "react";
import { StyleSheet, FlatList, View, TouchableOpacity } from "react-native";
import PostCard from "./PostCard";
import { AppText } from "../../../../shared/theme/components/AppText";
import { useNavigation } from "@react-navigation/native";
import PlusIcon from "../../assets/svg/plusIcon.svg";
import SortTabs from "./SortTabs";
import QuestionCard from "./QuestionCard";

const PostList = ({
  posts,
  onEndReached,
  isLoading,
  showTeam = false,
  sort,
  onSortChange,
  user,
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.postId.toString()}
        ListHeaderComponent={
          <View style={styles.header}>
            <SortTabs sort={sort} onChange={onSortChange} />
            <QuestionCard user={user} />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.postListCard}>
            <PostCard post={item} showTeam={showTeam} />
          </View>
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          isLoading ? null : null //나중에 로딩 스피너 삽입할 것!!
        }
      />

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() =>
          navigation.navigate("Community", { screen: "CreatePost" })
        }
      >
        <PlusIcon width={16} height={16} />
      </TouchableOpacity>
    </View>
  );
};

export default PostList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 17,
    paddingBottom: 16,
  },
  postListCard: {
    backgroundColor: "rgba(63, 63, 63, 0.30)",
    borderRadius: 5,
    borderColor: "rgba(127, 127, 127, 0.28)",
    borderWidth: 1,
    marginVertical: 5,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  fabButton: {
    position: "absolute",
    bottom: 16,
    right: 17,
    backgroundColor: "#313131",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 19,
    paddingHorizontal: 20,
  },
});
