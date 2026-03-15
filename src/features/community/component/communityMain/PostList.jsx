import React from "react";
import { StyleSheet, FlatList, View, TouchableOpacity } from "react-native";
import PostCard from "./PostCard";
import { AppText } from "../../../../shared/theme/components/AppText";
// import { useNavigation } from "@react-navigation/native";
import PlusIcon from "../../assets/svg/plusIcon.svg";

const PostList = ({ posts, onEndReached }) => {
  //   const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.postId.toString()}
        renderItem={({ item }) => (
          <View style={styles.postListCard}>
            <PostCard post={item} />
          </View>
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
      />

      <TouchableOpacity
        style={styles.fabButton}
        // onPress={() => navigation.navigate("CreatePost")}
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
  postListCard: {
    backgroundColor: "rgba(63, 63, 63, 0.30)",
    borderRadius: 5,
    borderColor: "rgba(127, 127, 127, 0.28)",
    borderWidth: 1,
    marginVertical: 5,
    paddingVertical: 17,
    paddingHorizontal: 13,
  },
  fabButton: {
    position: "absolute",
    bottom: 23,
    right: 0,
    backgroundColor: "#313131",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 19,
    paddingHorizontal: 20,
  },

  fabText: {
    color: "#fff",
  },
});
