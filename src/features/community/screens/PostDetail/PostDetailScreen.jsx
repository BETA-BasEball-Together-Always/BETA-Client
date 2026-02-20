import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "../../../../shared/component/AppHeader";
// import * as Clipboard from "expo-clipboard";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import MenuIcon from "../../assets/svg/TopBar/menuIcon.svg";

import HeartIcon from "../../assets/svg/CommunityPost/heartIcon.svg";
import HeartFilledIcon from "../../assets/svg/CommunityPost/heartFilledIcon.svg";
import CommentIcon from "../../assets/svg/CommunityPost/commentIcon.svg";
import CommentOnPressIcon from "../../assets/svg/CommunityPost/commentOnPressIcon.svg";
import LinkIcon from "../../assets/svg/CommunityPost/linkIcon.svg";
import LinkOnPressIcon from "../../assets/svg/CommunityPost/linkOnPressIcon.svg";

const { width } = Dimensions.get("window");

const PostDetailScreen = ({ route, navigation }) => {
  const { post, onSelectReaction } = route.params; // PostDetailScreen으로 navigation할 때 post 데이터를 전달받는다고 가정

  useEffect(() => {
    console.log("처음 진입 시 post:", post);
  }, []);

  const imageList = post.images ?? (post.image ? [post.image] : []);
  const reactions = [
    { id: "EMO_JOY", emoji: "💖", bgColor: "#FFBDBD" },
    { id: "EMO_SAD", emoji: "😭", bgColor: "#C2EFFF" },
    { id: "EMO_FUN", emoji: "🤣", bgColor: "#FFFABF" },
    { id: "EMO_HYPE", emoji: "🔥", bgColor: "#FF9F76" },
  ];
  const [actionY, setActionY] = useState(0);
  const REACTION_HEIGHT = 25; // 바 실제 높이

  // 각 아이콘 버튼들 상태!!
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const [reactionCounts, setReactionCounts] = useState(
    post.reactionCounts || {
      EMO_JOY: 0,
      EMO_SAD: 0,
      EMO_FUN: 0,
      EMO_HYPE: 0,
    },
  );

  const totalReactions = Object.values(reactionCounts).reduce(
    (sum, val) => sum + val,
    0,
  );

  const [commentMode, setCommentMode] = useState(false);
  const [linkPressed, setLinkPressed] = useState(false);
  const [copyModalVisible, setCopyModalVisible] = useState(false);

  const handleMorePress = () => {
    if (post.isMine) {
      console.log("수정/삭제 모달");
    } else {
      console.log("신고 모달");
    }
  };

  const handleLikePress = () => {
    // setShowReactionPicker((prev) => !prev);
    setShowReactionPicker(!showReactionPicker);
  };

  const handleReactionSelect = (reaction) => {
    console.log("👉 클릭한 reaction id:", reaction.id);
    console.log("👉 이전 선택 reaction:", selectedReaction);
    const prevReaction = selectedReaction;

    if (prevReaction?.id === reaction.id) {
      setReactionCounts((prevCounts) => ({
        ...prevCounts,
        [reaction.id]: Math.max(prevCounts[reaction.id] - 1, 0),
      }));

      setSelectedReaction(null);
      setShowReactionPicker(false);

      if (onSelectReaction) {
        onSelectReaction(post.id, null);
      }

      return;
    }
    if (prevReaction) {
      setReactionCounts((prevCounts) => ({
        ...prevCounts,
        [prevReaction.id]: Math.max(prevCounts[prevReaction.id] - 1, 0),
      }));
    }

    setReactionCounts((prevCounts) => ({
      ...prevCounts,
      [reaction.id]: prevCounts[reaction.id] + 1,
    }));

    setSelectedReaction(reaction);
    setShowReactionPicker(false);

    if (onSelectReaction) {
      onSelectReaction(post.id, reaction);
    }
  };

  const handleCommentPress = () => {
    setCommentMode(!commentMode);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(post.uri ?? "https://example.com");
    setLinkPressed(true);
    setCopyModalVisible(true);

    setTimeout(() => {
      setLinkPressed(false);
      setCopyModalVisible(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <AppHeader
        left={
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BackIcon width={12} height={18.5} />
            <AppText variant="bodyRegular" style={styles.backLabel}>
              뒤로가기
            </AppText>
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity onPress={handleMorePress}>
            <MenuIcon width={20} height={20} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* 유저 프로필!! 기찬 오빠 코드에서 따왔습니다! 이 부분은 수정 예정*/}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <AppText variant="middle" className="text-white">
              {post.nickname?.[0] ?? "유"}
            </AppText>
          </View>

          <View style={styles.headerText}>
            <AppText variant="semi14" style={styles.nickname}>
              {post.nickname}
            </AppText>
            <AppText variant="numMediumRegular" className="text-gray-500">
              {post.timeAgo}
            </AppText>
          </View>
        </View>

        {imageList.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {imageList.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri: img }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
        )}
        {post.content && (
          <View style={styles.textWrapper}>
            <AppText variant="middle" style={styles.content}>
              {post.content}
            </AppText>
          </View>
        )}

        <View style={styles.reactionWrapper}>
          {/* 공감 리스트 */}
          <View style={styles.reactionSummary}>
            <View style={styles.reactionIconRow}>
              {reactions.map((reaction) =>
                reactionCounts[reaction.id] > 0 ? (
                  <View
                    key={reaction.id}
                    style={[
                      styles.summaryCircle,
                      { backgroundColor: reaction.bgColor },
                    ]}
                  >
                    <AppText variant="semi13">{reaction.emoji}</AppText>
                  </View>
                ) : null,
              )}
              <AppText variant="numMediumRegular" className="text-gray-400">
                {totalReactions}
              </AppText>
            </View>

            <AppText variant="numMediumRegular" className="text-gray-400">
              댓글 {post.comments ?? 0}
            </AppText>
          </View>

          {/* 🔥 리액션 바 오버레이 */}
          {showReactionPicker && (
            <>
              {/* 바깥 터치 시 닫기 */}
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setShowReactionPicker(false)}
              />

              <View
                style={[
                  styles.reactionOverlay,
                  { top: actionY - REACTION_HEIGHT },
                ]}
              >
                <View style={styles.reactionBar}>
                  {reactions.map((reaction) => {
                    const isSelected = selectedReaction?.id === reaction.id;
                    return (
                      <TouchableOpacity
                        key={reaction.id}
                        onPress={() => handleReactionSelect(reaction)}
                      >
                        <View
                          style={[
                            styles.reactionCircle,
                            { backgroundColor: reaction.bgColor },
                            selectedReaction && !isSelected && styles.dimmed,
                          ]}
                        >
                          <AppText style={styles.reactionEmoji}>
                            {reaction.emoji}
                          </AppText>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.actionContainer}>
          {/* {showReactionPicker && (
            <View style={styles.reactionBar}>
              {reactions.map((reaction) => {
                const isSelected = selectedReaction?.id === reaction.id;

                return (
                  <TouchableOpacity
                    key={reaction.id}
                    onPress={() => handleReactionSelect(reaction)}
                  >
                    <View
                      style={[
                        styles.reactionCircle,
                        { backgroundColor: reaction.bgColor },
                        selectedReaction && !isSelected && styles.dimmed,
                      ]}
                    >
                      <AppText style={styles.reactionEmoji}>
                        {reaction.emoji}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )} */}

          <View
            style={styles.actionRow}
            onLayout={(e) => {
              setActionY(e.nativeEvent.layout.y);
            }}
          >
            <View style={styles.leftActions}>
              {/* 좋아요 */}
              <TouchableOpacity
                onPress={handleLikePress}
                onLongPress={() => setShowReactionPicker(true)}
                activeOpacity={0.7}
              >
                {selectedReaction ? (
                  <HeartFilledIcon width={31.3} height={27} />
                ) : (
                  <HeartIcon width={31.3} height={27} />
                )}
              </TouchableOpacity>

              {/* 댓글 */}
              <TouchableOpacity onPress={() => setCommentMode(!commentMode)}>
                {commentMode ? (
                  <CommentOnPressIcon width={25} height={25} />
                ) : (
                  <CommentIcon width={25} height={25} />
                )}
              </TouchableOpacity>
            </View>

            {/* URL 복사 */}
            <TouchableOpacity onPress={handleCopyLink}>
              {linkPressed ? (
                <LinkOnPressIcon width={22} height={22} />
              ) : (
                <LinkIcon width={22} height={22} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={copyModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <AppText variant="middle">URL이 클립보드에 복사되었습니다</AppText>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backLabel: {
    color: "#F9F9F9",
    marginLeft: 15,
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  avatarCircle: {
    width: 39.38,
    height: 38,
    borderRadius: 50,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },

  headerText: {
    marginLeft: 10,
    alignItems: "flex-start",
  },

  nickname: {
    color: "#D4D4D4",
    marginBottom: 2,
  },

  timeAgo: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },

  /* 이미지 */
  imageScroll: {
    marginBottom: 16,
  },
  imageWrapper: {
    width: width - 32, // 화면 너비에서 양쪽 패딩(16 + 16)을 뺀 값
    aspectRatio: 3 / 2,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 12,
  },

  postImage: {
    width: "100%",
    height: "100%",
  },

  /* 텍스트 */
  textWrapper: {
    marginTop: 4,
    marginBottom: 16,
  },
  content: {
    color: "#F9F9F9",
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginHorizontal: 5,
  },
  leftActions: {
    flexDirection: "row",
    gap: 25,
  },
  // modalContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "rgba(0,0,0,0.5)",
  // },
  // modalBox: {
  //   backgroundColor: "#FFFFFF",
  //   padding: 20,
  //   borderRadius: 10,
  // }
  actionContainer: {
    // marginTop: 20,
  },
  reactionBar: {
    flexDirection: "row",
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    paddingVertical: 5.5,
    alignSelf: "flex-start",
  },
  reactionCircle: {
    width: 50,
    height: 48,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },

  dimmed: {
    opacity: 0.3,
  },
  reactionOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "flex-start",
  },

  reactionSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 27,
  },
  reactionIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
  },
  summaryCircle: {
    width: 26,
    height: 26,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },
  reactionEmoji: {
    fontSize: 18,
  },
});
