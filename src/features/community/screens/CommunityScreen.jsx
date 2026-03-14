// src/screens/Community/LGCommunityScreen.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// 상단 질문 카드 + 일반 게시글 통합 데이터
const posts = [
  {
    id: 'q-1',
    type: 'question',
    nickname: '토도토',
    subtitle: '오늘은 어떤 마음으로 응원하고 있는지 공유해주세요',
  },
  {
    id: '1',
    type: 'post',
    nickname: 'siswe',
    timeAgo: '1시간',
    content:
      '오늘 잘실 직관 했는데… 7회 말 진짜 미쳤다 😭\n함성소리 아직도 귀에 맴돌아 ㅋㅋㅠㅠㅠ 우리팀 분위기 완전 열렸어!!',
    image: 'https://picsum.photos/seed/lg1/600/400',
    likes: 19,
    comments: 7,
    tags: [],
  },
  {
    id: '2',
    type: 'post',
    nickname: '자자장',
    timeAgo: '1시간',
    content: '오늘 홈런 레전드… 이걸 보다니 ㅠ',
    image: null,
    likes: 0,
    comments: 3,
    tags: [],
  },
  {
    id: '3',
    type: 'post',
    nickname: '잠실맥주러버',
    timeAgo: '3시간',
    content:
      '요즘 경기 볼 때마다 심장에 나비가 날아다님ㅋㅋ\n그래도 아래서 멘탈 잃지 맙시다 🍺🔥\n다들 이번 주 직관 계획 있으세요?',
    image: null,
    tags: ['직관', '감동'],
    likes: 19,
    comments: 6,
  },
  {
    id: '4',
    type: 'post',
    nickname: '엘쥐',
    timeAgo: '1일',
    content:
      '처음 잠실구장 가보는 사람인데요!\n3루쪽이랑 1루쪽 중 어디가 응원 분위기 더 좋은가요?\n추천 좀 해주세요🙏',
    image: null,
    tags: [],
    likes: 5,
    comments: 3,
  },
  {
    id: '5',
    type: 'post',
    nickname: '토도토',
    timeAgo: '1분',
    content:
      '사진 속 웃음은 평화롭지만\n현실은 9회 말에 또 떨면서 기도하는 팬심… 🤧⚾️',
    image: 'https://picsum.photos/seed/lg2/600/400',
    tags: ['무적엘지', '야구네컷'],
    likes: 12,
    comments: 4,
  },
];

const LGCommunityScreen = () => {
  const renderItem = ({ item }) => {
    if (item.type === 'question') return <QuestionCard data={item} />;
    return <PostCard post={item} />;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>BETA</Text>
        <Text style={styles.channelTitle}>LG트윈스 채널</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

/* ---------------------------------- */
/* 질문카드 */
/* ---------------------------------- */
const QuestionCard = ({ data }) => {
  return (
    <View style={styles.questionCard}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarInitial}>{data.nickname[0]}</Text>
      </View>
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.questionTitle}>{data.nickname}</Text>
        <Text style={styles.questionSubtitle}>{data.subtitle}</Text>
      </View>
    </View>
  );
};

/* ---------------------------------- */
/* 일반 게시물 카드 */
/* ---------------------------------- */
const PostCard = ({ post }) => {
  return (
    <View style={styles.postCard}>
      {/* header */}
      <View style={styles.postHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {post.nickname[0] ?? '유'}
          </Text>
        </View>
        <View style={styles.postHeaderText}>
          <Text style={styles.nickname}>{post.nickname}</Text>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreText}>···</Text>
        </TouchableOpacity>
      </View>

      {/* 이미지 */}
      {post.image && (
        <View style={styles.postImageWrapper}>
          <Image source={{ uri: post.image }} style={styles.postImage} />
          <View style={styles.watermarkOverlay}>
            <Text style={styles.watermarkText}>TWIN SEOUL</Text>
          </View>
        </View>
      )}

      {/* 텍스트 */}
      <View style={styles.postBody}>
        <Text style={styles.postContent} numberOfLines={4}>
          {post.content}
        </Text>
        <TouchableOpacity>
          <Text style={styles.moreLink}>더보기</Text>
        </TouchableOpacity>
      </View>

      {/* 태그 */}
      {post.tags?.length > 0 && (
        <View style={styles.tagsRow}>
          {post.tags.map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 하단 */}
      <View style={styles.postFooter}>
        <View style={styles.reactionRow}>
          <Text style={styles.reactionIcon}>😍</Text>
          <Text style={styles.reactionIcon}>😭</Text>
          <Text style={styles.reactionIcon}>🔥</Text>
          <Text style={styles.reactionCount}>{post.likes}</Text>
        </View>

        <View style={styles.footerRight}>
          <Text style={styles.commentCount}>댓글 {post.comments}</Text>
          <Text style={styles.footerIcon}>💬</Text>
          <Text style={styles.footerIcon}>↗</Text>
        </View>
      </View>
    </View>
  );
};

export default LGCommunityScreen;

/* ---------------------------------- */
/* StyleSheet */
/* ---------------------------------- */

const CARD_BG = '#1C1C1E';
const TEXT_MAIN = '#F4F4F5';
const TEXT_SUB = '#A1A1AA';
const ACCENT = '#FF3366';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 12,
  },
  channelTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  /* 질문카드 */
  questionCard: {
    backgroundColor: CARD_BG,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionTitle: {
    color: TEXT_MAIN,
    fontSize: 14,
    fontWeight: '600',
  },
  questionSubtitle: {
    color: TEXT_SUB,
    fontSize: 12,
    marginTop: 2,
  },

  /* 아바타 */
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  /* 게시물 카드 */
  postCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postHeaderText: {
    marginLeft: 8,
  },
  nickname: {
    color: TEXT_MAIN,
    fontSize: 13,
    fontWeight: '600',
  },
  timeAgo: {
    color: TEXT_SUB,
    fontSize: 11,
  },
  moreButton: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
  },
  moreText: {
    color: TEXT_SUB,
    fontSize: 18,
  },

  postImageWrapper: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 3 / 2,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  watermarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.2,
  },
  watermarkText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 4,
    fontSize: 32,
  },

  postBody: {
    marginTop: 10,
  },
  postContent: {
    color: TEXT_MAIN,
    fontSize: 13,
    lineHeight: 18,
  },
  moreLink: {
    marginTop: 4,
    color: ACCENT,
    fontSize: 12,
    fontWeight: '600',
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  tagPill: {
    backgroundColor: '#27272A',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: TEXT_SUB,
    fontSize: 11,
  },

  postFooter: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  reactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  reactionCount: {
    color: TEXT_SUB,
    fontSize: 12,
    marginLeft: 4,
  },

  footerRight: {
    marginLeft: 'auto',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  commentCount: {
    color: TEXT_SUB,
    fontSize: 12,
  },
  footerIcon: {
    fontSize: 14,
  },
});
