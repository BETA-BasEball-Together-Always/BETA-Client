import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import TeamCard from "./components/TeamCard";
import FrameCard from "./components/FrameCard";
import photoBoothStore from "@features/photoBooth/store/photoBoothStore";
import { FRAMES } from "@features/photoBooth/constants/framesMap";
import { usePrefetchEditFonts } from "@features/photoBooth/hooks/usePrefetchEditFonts";

import { TEAM_DATA } from "@shared/constants/teams";
import { AppText } from "../../../../shared/theme/components/AppText";

import { SafeAreaView } from "react-native-safe-area-context";
import PhotoBoothBack from "../assets/svg/photoBoothBack.svg";

const PHOTO_BOOTH_TEAM_ROWS = [
  { id: "1", teamKey: "kiwoom", name: "키움 히어로즈", dataKey: "KIWOOM" },
  { id: "2", teamKey: "doosan", name: "두산 베어스", dataKey: "DOOSAN" },
  { id: "3", teamKey: "lotte", name: "롯데 자이언츠", dataKey: "LOTTE" },
  { id: "4", teamKey: "samsung", name: "삼성 라이온즈", dataKey: "SAMSUNG" },
  { id: "5", teamKey: "hanhwa", name: "한화 이글스", dataKey: "HANWHA" },
  { id: "6", teamKey: "kia", name: "KIA 타이거즈", dataKey: "KIA" },
  { id: "7", teamKey: "lg", name: "LG 트윈스", dataKey: "LG" },
  { id: "8", teamKey: "ssg", name: "SSG 랜더스", dataKey: "SSG" },
  { id: "9", teamKey: "nc", name: "NC 다이노스", dataKey: "NC" },
  { id: "10", teamKey: "kt", name: "KT 위즈", dataKey: "KT" },
];

const teams = PHOTO_BOOTH_TEAM_ROWS.map((row) => {
  const meta = TEAM_DATA[row.dataKey];
  return {
    ...row,
    Icon: meta?.MainIcon,
    iconScale: meta?.iconScale,
  };
});

/** 2) 프레임 종류 정의(아이디만 사용; 이미지는 아래 FRAMES에서 고름) */
const frames = [
  { id: "2x2", name: "2 x 2" },
  { id: "1x4", name: "1 x 4" },
];

/** 4) 선택팀에 맞는 프레임 이미지 선택 헬퍼 */
const getFrameSource = (teamKeyOrNull, frameId) => {
  const theme = teamKeyOrNull ? FRAMES[teamKeyOrNull] : FRAMES.base;
  return theme?.[frameId] ?? FRAMES.base[frameId];
};

const SelectScreen = ({ navigation }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const { width: bgWidth, height: bgHeight } = useWindowDimensions();

  const {
    setSelectedTeam: setGlobalTeam,
    setSelectedFrame: setGlobalFrame,
    resetSelection,
    resetCaptured,
  } = photoBoothStore();

  const { prefetch } = usePrefetchEditFonts();

  useEffect(() => {
    prefetch(); // 유휴 시간에 미리 로드
  }, []);

  useFocusEffect(
    useCallback(() => {
      // 다른 화면(Camera/Edit/Share 등)에서 뒤로/닫기 등으로 돌아왔을 때
      // SelectScreen이 스택에 남아있어도 항상 초기 상태처럼 보이도록 리셋
      setSelectedTeam(null);
      setSelectedFrame(null);
      resetSelection?.();
      // 이전 촬영/편집 세션의 이미지(추가 이미지 포함)가 다음 세션에 남지 않도록 정리
      resetCaptured?.();
    }, [resetSelection]),
  );

  const handleNext = () => {
    if (selectedTeam && selectedFrame) {
      setGlobalTeam(selectedTeam);
      setGlobalFrame(selectedFrame);
      navigation.navigate("Camera");
    }
  };

  const toggleTeam = (item) => {
    setSelectedTeam((prev) => (prev?.id === item.id ? null : item));
  };

  const toggleFrame = (item) => {
    setSelectedFrame((prev) => (prev?.id === item.id ? null : item));
  };

  const renderTeam = ({ item }) => (
    <TeamCard
      item={item}
      isSelected={selectedTeam?.id === item.id}
      onPress={toggleTeam}
    />
  );

  const renderFrame = ({ item }) => {
    const source = getFrameSource(selectedTeam?.teamKey ?? null, item.id);
    return (
      <FrameCard
        key={item.id}
        item={item}
        source={source}
        isSelected={selectedFrame?.id === item.id}
        onPress={toggleFrame}
      />
    );
  };

  return (
    <View style={styles.screenRoot}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <PhotoBoothBack
          width={bgWidth}
          height={bgHeight}
          preserveAspectRatio="xMidYMid slice"
        />
      </View>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
        <AppText variant="displayTitle" style={styles.title}>
          야구네컷
        </AppText>

        <View style={styles.content}>
          <View style={styles.cardSection}>
            <AppText variant="heading" style={styles.sectionTitle}>
              팀 선택
            </AppText>
            <FlatList
              data={teams}
              horizontal
              keyExtractor={(it) => it.id}
              renderItem={renderTeam}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.teamListContent}
            />
            <View style={styles.frameSection}>
              <AppText variant="heading" style={styles.sectionTitle}>
                프레임 선택
              </AppText>
              <View style={styles.framesRow}>
                {frames.map((f) => renderFrame({ item: f }))}
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleNext}
          disabled={!(selectedTeam && selectedFrame)}
          style={[
            styles.nextButton,
            styles.nextButtonInset,
            !(selectedTeam && selectedFrame) && styles.nextButtonDisabled,
          ]}
        >
          <AppText variant="heading" style={styles.nextText}>
            다음
          </AppText>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default SelectScreen;

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#020408",
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
  },
  title: {
    color: "#F9F9F9",
    textAlign: "center",
    paddingVertical: 10,
    paddingHorizontal: 22,
    lineHeight: 32.7,
  },
  cardSection: {
    flex: 1,
    marginTop: 40,
  },
  /** FlatList는 화면 전체 너비로 스크롤하고, 콘텐츠만 좌우 인셋 */
  teamListContent: {
    paddingHorizontal: 20,
    paddingRight: 24,
  },
  frameSection: {
    // marginTop: 20,
  },
  sectionTitle: {
    color: "#F9F9F9",
    marginBottom: 15.5,
    lineHeight: 24.5,
    paddingHorizontal: 20,
  },
  framesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  nextButton: {
    marginBottom: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  nextButtonInset: {
    marginHorizontal: 20,
  },
  nextButtonDisabled: {
    backgroundColor: "#232323",
  },
  nextText: {
    color: "#3E3E3E",
    lineHeight: 24.5,
  },
});
