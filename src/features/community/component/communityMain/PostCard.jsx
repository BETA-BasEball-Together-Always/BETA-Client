import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import UserInfo from "../../../../shared/component/UserInfo";

import PostReactions from "../PostReactions";

const PostCard = ({ post }) => {
  return (
    <>
      <UserInfo user={post.author} channel={post.channel} />
      <View style={styles.contentSection}>
        <AppText variant="caption" style={{ color: "#F9F9F9" }}>
          {post.content}
        </AppText>
        {post.images?.length > 0 && (
          <Image source={{ uri: post.images[0].url }} style={styles.image} />
        )}
      </View>

      <PostReactions emotions={post.emotions} />
    </>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  nickname: {
    color: "#fff",
    fontWeight: "700",
  },
  image: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  contentSection: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
});
