// src/screens/PhotoBooth/ShareScreen.jsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import photoBoothStore from '../../../stores/photoBoothStore';
import { Ionicons } from '@expo/vector-icons'; // expo 환경이면 바로 사용 가능
import DownloadSVG   from '../../../assets/images/Share/download.svg';
import KakaoSVG      from '../../../assets/images/Share/kakao.svg';
import InstagramSVG  from '../../../assets/images/Share/instagram.svg';
import BetaSVG       from '../../../assets/images/Share/beta.svg';
import ShareOtherSVG from '../../../assets/images/Share/share.svg';
import RNShare from 'react-native-share';

export default function ShareScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const exportedFrameUri = photoBoothStore((s) => s.exportedFrameUri); // <- 전역 저장된 프레임 이미지
  const [saving, setSaving] = useState(false);

  // dataURL도 안전하게 처리
  const ensureFileUri = useCallback(async () => {
    if (!exportedFrameUri) return null;

    if (exportedFrameUri.startsWith('file://')) {
      return exportedFrameUri;
    }
    if (exportedFrameUri.startsWith('data:image')) {
      try {
        const base64 = exportedFrameUri.split('base64,')[1];
        const dest = FileSystem.cacheDirectory + `beta-share-${Date.now()}.jpg`;
        await FileSystem.writeAsStringAsync(dest, base64, { encoding: FileSystem.EncodingType.Base64 });
        return dest;
      } catch (e) {
        console.warn('Failed to convert dataURL -> file', e);
        return null;
      }
    }
    // (예: http/https) 원격이면 로컬로 받아서 저장하는게 안전하지만 여기선 기본 Share만 시도
    return exportedFrameUri;
  }, [exportedFrameUri]);

  const onPressBack = () => navigation.goBack();

  const onDownload = useCallback(async () => {
    try {
      if (!exportedFrameUri) return Alert.alert('오류', '저장할 프레임 이미지가 없어요.');
      setSaving(true);

      // 권한
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setSaving(false);
        return Alert.alert('권한 필요', '갤러리 저장 권한을 허용해주세요.');
      }

      const fileUri = await ensureFileUri();
      if (!fileUri) {
        setSaving(false);
        return Alert.alert('오류', '이미지 파일을 준비하지 못했어요.');
      }

      await MediaLibrary.saveToLibraryAsync(fileUri);
      setSaving(false);
      Alert.alert('저장 완료', '갤러리에 저장되었어요!');
    } catch (e) {
      setSaving(false);
      console.warn(e);
      Alert.alert('저장 실패', '이미지 저장 중 문제가 발생했어요.');
    }
  }, [exportedFrameUri, ensureFileUri]);

  const onShareSystemSheet = useCallback(async () => {
    try {
      const fileUri = await ensureFileUri();
      if (!fileUri) return Alert.alert('오류', '공유할 이미지가 없어요.');

      await Share.share({
        url: fileUri, // iOS: url 지원, Android: message에 파일 경로를 넣는게 더 안정적일 때도 있음
        message: Platform.select({
          android: `BETA에서 만든 야구네컷 📸\n${fileUri}`,
          ios: 'BETA에서 만든 야구네컷 📸',
        }),
        title: 'BETA 공유',
      });
    } catch (e) {
      console.warn(e);
      Alert.alert('공유 실패', '공유 중 문제가 발생했어요.');
    }
  }, [ensureFileUri]);

  // 아래 3개는 실제 앱에서는 각 SDK/인텐트 연동 필요. 지금은 샘플 처리.
  const onShareKakao = useCallback(async () => {
    Alert.alert('카카오톡 공유', '카카오 SDK 연동 후 템플릿으로 공유하세요.\n(react-native-kakao-share-link 등)');
  }, []);

  const onShareInstagram = useCallback(async () => {
    try {
      // 1) ViewShot 등에서 만든 로컬 파일 보장 (dataURI면 캐시 파일로 변환)
      const fileUri = await ensureFileUri();
      if (!fileUri) return Alert.alert('오류', '공유할 이미지가 없어요.');
 
      // 2) 인스타그램 "피드" 공유 시도
      //  - url: file:// 경로 가능
      //  - type: 이미지 MIME. jpg 캡처면 image/jpeg
      await RNShare.shareSingle({
        social: RNShare.Social.INSTAGRAM,
        url: fileUri,
        type: 'image/png',
        // filename: 'beta-share.jpg', // (선택) 일부 단말에서 필요할 수 있음
      });
    } catch (e) {
      // 피드 공유가 실패/미지원이면 "스토리"로 폴백
      try {
        const fileUri = await ensureFileUri();
        await RNShare.shareSingle({
          social: RNShare.Social.INSTAGRAM_STORIES,
          method: 'shareBackgroundImage', // 또는 RNShare.InstagramStories.SHARE_BACKGROUND_IMAGE
          backgroundImage: fileUri,
          appId: 'YOUR_FB_APP_ID', // (선택) 스토리 attribution 원하면 입력
          backgroundTopColor: '#000000',
          backgroundBottomColor: '#000000',
        });
      } catch (err) {
        console.warn(err);
        Alert.alert('공유 실패', '인스타그램 공유 중 문제가 발생했어요.');
      }
    }
  }, [ensureFileUri]);

  const onShareBeta = useCallback(() => {
    // BETA 내부 피드/커뮤니티 업로드로 연결 (예: 내 라우터로 이동)
    Alert.alert('BETA 공유', '앱 내부 업로드 흐름으로 연결하세요 (예: 커뮤니티 업로드 화면).');
  }, []);

  const preview = useMemo(() => {
    if (!exportedFrameUri) return null;
    return (
      <View style={styles.previewCard}>
        <Image
          source={{ uri: exportedFrameUri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      </View>
    );
  }, [exportedFrameUri]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onPressBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>야구네컷</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 프레임 미리보기 */}
      <View style={styles.previewWrap}>
        {preview || (
          <View style={[styles.previewCard, styles.previewEmpty]}>
            <Text style={{ color: '#aaa' }}>미리볼 이미지가 없어요</Text>
          </View>
        )}
      </View>

      {/* 다운로드 버튼 */}
      <TouchableOpacity onPress={onDownload} style={styles.downloadBtn} disabled={saving}>
        <DownloadSVG width={18} height={18} />
        <Text style={styles.downloadText}>{saving ? '저장 중...' : '다운로드'}</Text>
      </TouchableOpacity>

      {/* 공유 섹션 */}
      <View style={styles.shareSection}>
        <Text style={styles.shareTitle}>사진 공유</Text>

        <View style={styles.shareRow}>
          {/* <ShareChip label="카카오톡"   SvgIcon={KakaoSVG}      onPress={onShareKakao} /> */}
          <ShareChip label="인스타그램" SvgIcon={InstagramSVG}  onPress={onShareInstagram} />
          <ShareChip label="BETA"       SvgIcon={BetaSVG}       onPress={onShareBeta} />
          <ShareChip label="다른 앱"     SvgIcon={ShareOtherSVG} onPress={onShareSystemSheet} />
        </View>
      </View>
    </View>
  );
}

/** 작은 원형 아이콘 + 라벨 */
function ShareChip({ label, SvgIcon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.chip}>
      <View style={styles.chipCircle}>
        <SvgIcon width={36} height={36} />
      </View>
      <Text style={styles.chipLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const CARD_WIDTH = 266; // 아이폰 14 Pro 스크린샷 비율 참고
const CARD_HEIGHT = 400;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E0E0E' },
  header: {
    // height: 48,
    height: '7%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  backBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  previewWrap: { alignItems: 'center', marginTop: 8 },
  previewCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    // height: '80%',
    // borderRadius: 8,
    overflow: 'hidden',
  },
  previewEmpty: { alignItems: 'center', justifyContent: 'center' },
  previewImage: { width: '100%', height: '100%' },

  downloadBtn: {
    alignSelf: 'center',
    marginTop: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  shareSection: {
    marginTop: 8,
    paddingTop: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#2A2A2A'
  },
  shareTitle: { color: '#ccc', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  shareRow: { flexDirection: 'row', justifyContent: 'center', gap: 5 },

  chip: { alignItems: 'center', width: 70 },
  chipCircle: {
    // width: 54,
    // height: 54,
    padding:12,
    borderRadius: 50,
    backgroundColor: '#2a2a2aff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { marginTop: 8, color: '#C9C9C9', fontSize: 12 },
});
