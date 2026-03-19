import React, { useMemo } from "react";
import { StyleSheet, View, Image } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import { LinearGradient } from "expo-linear-gradient";
import { TEAM_DATA } from "../../../../shared/constants/teams";
import TeamLabel from "./TeamLabel";

// import PostReactions from "../PostReactions";

const PostCard = ({ post, showTeam = false }) => {
  const { author } = post;
  const team = TEAM_DATA[author?.teamCode];
  const ProfileIcon = team?.ProfileIcon;

  const contentWithoutHashtags = useMemo(() => {
    const raw = post?.content ?? "";
    // 본문에서 "#태그" 토큰 제거 (공백 기준), 남은 텍스트만 표시
    const removed = raw.replace(/(^|\s)#[^\s#]+/g, " ");
    return removed.replace(/\s+/g, " ").trim();
  }, [post?.content]);

  const primaryImageUri =
    post?.images?.[0]?.imageUrl || post?.images?.[0]?.url || null;

  return (
    <View style={styles.container}>
      {/* 프로필 */}
      <View style={styles.authorRow}>
        <LinearGradient
          colors={team?.gradient?.colors || ["#3A3D44", "#3A3D44"]}
          locations={team?.gradient?.locations}
          start={team?.gradient?.start}
          end={team?.gradient?.end}
          style={styles.avatarCircle}
        >
          {ProfileIcon ? (
            <ProfileIcon width={28} height={28} />
          ) : (
            <AppText style={{ color: "#FFF" }}>{author?.nickname?.[0]}</AppText>
          )}
        </LinearGradient>

        <AppText variant="caption" style={styles.nickname}>
          {author?.nickname}
        </AppText>

        {showTeam && author?.teamCode && (
          <TeamLabel teamCode={author.teamCode} />
        )}
      </View>

      <View style={styles.contentSection}>
        <AppText variant="caption" style={styles.contentText}>
          {contentWithoutHashtags}
        </AppText>

        {post.hashtags?.length > 0 && (
          <View style={styles.hashRow}>
            <AppText variant="caption" style={styles.hashText}>
              {post.hashtags.map((tag) => `#${tag}`).join(" ")}
            </AppText>
          </View>
        )}

        {primaryImageUri && (
          <Image source={{ uri: primaryImageUri }} style={styles.image} />
        )}
      </View>

      {/* <PostReactions emotions={post.emotions} /> */}
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  nickname: {
    color: "#fff",
    fontWeight: "700",
    marginRight: 6,
  },
  image: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  contentSection: {
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  contentText: {
    color: "#F9F9F9",
  },
  hashRow: {
    marginTop: 6,
  },
  hashText: {
    color: "#6F9D48",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 10,
  },
});
