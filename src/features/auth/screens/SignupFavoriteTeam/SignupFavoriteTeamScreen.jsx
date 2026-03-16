import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as SecureStore from "expo-secure-store";

import SelectTeamBackground from "../../components/SelectTeamBackground";
import SignupStepIndicator from "../../components/SignupStepIndicator";
import { useSignupTeamMutation } from "../../services/signupTeamMutation";
import { useStepBack } from "../../hooks/useStepBack";

// 🔽 팀 로고 SVG (경로는 프로젝트에 맞게 조정)
import LG from "../../../../shared/assets/svg/teams/LG.svg";
import Hanwha from "../../../../shared/assets/svg/teams/Hanhwa.svg";
import SSG from "../../../../shared/assets/svg/teams/SSG.svg";
import Samsung from "../../../../shared/assets/svg/teams/Samsung.svg";
import NC from "../../../../shared/assets/svg/teams/NC.svg";
import KT from "../../../../shared/assets/svg/teams/KT.svg";
import Lotte from "../../../../shared/assets/svg/teams/Lotte.svg";
import Kiwoom from "../../../../shared/assets/svg/teams/Kiwoom.svg";
import Doosan from "../../../../shared/assets/svg/teams/Doosan.svg";
import Kia from "../../../../shared/assets/svg/teams/KIA.svg";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import { AppText } from "../../../../shared/theme/components/AppText";

const { height } = Dimensions.get("window");

const TEAMS = [
  { key: "LG", label: "LG 트윈스", Icon: LG },
  { key: "HANWHA", label: "한화 이글스", Icon: Hanwha },
  { key: "SSG", label: "SSG 랜더스", Icon: SSG },
  { key: "SAMSUNG", label: "삼성 라이온즈", Icon: Samsung },
  { key: "NC", label: "NC 다이노스", Icon: NC },
  { key: "KT", label: "KT 위즈", Icon: KT },
  { key: "LOTTE", label: "롯데 자이언츠", Icon: Lotte },
  { key: "KIWOOM", label: "키움 히어로즈", Icon: Kiwoom },
  { key: "DOOSAN", label: "두산 베어스", Icon: Doosan },
  { key: "KIA", label: "기아 타이거즈", Icon: Kia },
];

const SignupFavoriteTeamScreen = ({ navigation, route }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);

  // ✅ signup 객체로만 누적 전달
  const signup = route?.params?.signup ?? {};
  const externalTeamList = route?.params?.teamList ?? null;

  const signupTeamMutation = useSignupTeamMutation();

  const isNextEnabled = useMemo(() => !!selectedTeam, [selectedTeam]);

  const handleBack = useStepBack("SignupNickname");

  const teams = useMemo(() => {
    if (externalTeamList && externalTeamList.length > 0) {
      // return externalTeamList.map((t) => ({
      //   key: t.teamCode,
      //   label: t.teamNameKr,
      //   Icon: TEAMS.find((base) => base.key === t.teamCode)?.Icon ?? LG,
      // }));

      // TEAMS 배열 순서대로 정렬
      return TEAMS.filter((base) =>
        externalTeamList.some((t) => t.teamCode === base.key),
      ).map((base) => {
        const externalTeam = externalTeamList.find(
          (t) => t.teamCode === base.key,
        );
        return {
          key: base.key,
          label: externalTeam?.teamNameKr ?? base.label,
          Icon: base.Icon,
        };
      });
    }
    return TEAMS;
  }, [externalTeamList]);

  const handleNext = () => {
    if (!isNextEnabled) return;

    signupTeamMutation.mutate(
      { teamCode: selectedTeam },
      {
        onSuccess: async () => {
          const selectedTeamLabel = TEAMS.find(
            (t) => t.key === selectedTeam,
          )?.label;

          // 로컬에도 저장
          await SecureStore.setItemAsync(
            "favoriteTeamLabel",
            selectedTeamLabel,
          );

          navigation.replace("SignupGenderAge", {
            signup: {
              ...signup,
              favoriteTeamCode: selectedTeam,
            },
            favoriteTeamLabel: selectedTeamLabel,
          });
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <SelectTeamBackground />

            <View style={styles.inner}>
              {/* 헤더 */}
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                >
                  <BackIcon />
                </TouchableOpacity>
                <View style={styles.stepWrapper}>
                  <SignupStepIndicator currentStep={2} />
                </View>

                <View style={styles.rightPlaceholder} />
              </View>

              {/* 타이틀 */}
              <AppText variant="displayTitle" style={styles.title}>
                회원님의 팬심을 보여줄 구단을 선택해주세요!
              </AppText>

              {/* 팀 선택 */}
              <View style={styles.grid}>
                {teams.map(({ key, label, Icon }) => {
                  const selected = selectedTeam === key;

                  return (
                    <TouchableOpacity
                      key={key}
                      style={styles.item}
                      activeOpacity={0.85}
                      onPress={() => setSelectedTeam(key)}
                    >
                      <View
                        style={[
                          styles.iconBox,
                          selected && styles.iconBoxSelected,
                        ]}
                      >
                        <Icon width={100} height={100} />
                      </View>

                      <AppText
                        variant="bodyMedium"
                        style={[
                          styles.teamLabel,
                          selected && styles.teamLabelSelected,
                        ]}
                      >
                        {label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* 하단 버튼 */}
          <View style={styles.floatingBottomArea}>
            <TouchableOpacity
              style={[
                styles.completeButton,
                !selectedTeam && styles.completeButtonDisabled,
              ]}
              disabled={!selectedTeam}
              activeOpacity={selectedTeam ? 0.85 : 1}
              onPress={handleNext}
            >
              <AppText
                variant="heading"
                style={[
                  styles.completeButtonText,
                  !selectedTeam && styles.completeButtonTextDisabled,
                ]}
              >
                선택완료
              </AppText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default SignupFavoriteTeamScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  inner: {
    maxWidth: 390,
    width: "100%",
    alignSelf: "center",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: height * 0.1,
    marginBottom: 12,
  },
  backButton: {
    width: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1,
  },
  backButtonText: {
    fontSize: 30,
    // borderWidth: 1,
    lineHeight: 15,
    color: "#FFFFFF",
  },
  stepWrapper: {
    alignItems: "center",
    width: 150,
  },
  rightPlaceholder: {
    width: 32,
  },

  title: {
    paddingHorizontal: 30,
    color: "#FFFFFF",
    marginBottom: 24,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 22, // 세로 간격
  },

  item: {
    width: "48%",
    alignItems: "center",
  },

  iconBox: {
    width: 128,
    height: 128,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ✅ 선택된 카드 (LG 트윈스처럼)
  iconBoxSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",

    // iOS 그림자
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },

    // Android 그림자
    elevation: 8,
  },

  teamLabel: {
    marginTop: 10,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },

  teamLabelSelected: {
    color: "#FFFFFF", // 선택된 팀 이름 더 선명하게
  },

  floatingBottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  completeButton: {
    paddingVertical: 18,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  completeButtonDisabled: {
    backgroundColor: "#232323",
  },

  completeButtonText: {
    color: "#111111",
  },

  completeButtonTextDisabled: {
    color: "#3E3E3E",
  },
});
