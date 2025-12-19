import React, {useState, useMemo} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import AuthBackground from "../../components/AuthBackground";
import SignupStepIndicator from "../../components/SignupStepIndicator";

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

const {height} = Dimensions.get("window");

const TEAMS = [
  {key: "LG", label: "LG 트윈스", Icon: LG},
  {key: "HANWHA", label: "한화 이글스", Icon: Hanwha},
  {key: "SSG", label: "SSG 랜더스", Icon: SSG},
  {key: "SAMSUNG", label: "삼성 라이온즈", Icon: Samsung},
  {key: "NC", label: "NC 다이노스", Icon: NC},
  {key: "KT", label: "KT 위즈", Icon: KT},
  {key: "LOTTE", label: "롯데 자이언츠", Icon: Lotte},
  {key: "KIWOOM", label: "키움 히어로즈", Icon: Kiwoom},
  {key: "DOOSAN", label: "두산 베어스", Icon: Doosan},
  {key: "KIA", label: "기아 타이거즈", Icon: Kia},
];

const SignupFavoriteTeamScreen = ({navigation, route}) => {
  const [selectedTeam, setSelectedTeam] = useState(null);

  // ✅ signup 객체로만 누적 전달
  const signup = route?.params?.signup ?? {};

  const isNextEnabled = useMemo(() => !!selectedTeam, [selectedTeam]);

  const handleNext = () => {
    if (!isNextEnabled) return;

    navigation.navigate("SignupGenderAge", {
      signup: {
        ...signup,
        favoriteTeam: selectedTeam,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <AuthBackground />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inner}>
              {/* 헤더 */}
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>{"<"}</Text>
                </TouchableOpacity>
                <View style={styles.stepWrapper}>
                  <SignupStepIndicator currentStep={2} />
                </View>

                <View style={styles.rightPlaceholder} />
              </View>

              {/* 타이틀 */}
              <Text style={styles.title}>
                회원님의 팬심을 보여줄 구단을 선택해주세요!
              </Text>

              {/* 팀 선택 */}
              <View style={styles.grid}>
                {TEAMS.map(({key, label, Icon}) => {
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

                      <Text
                        style={[
                          styles.teamLabel,
                          selected && styles.teamLabelSelected,
                        ]}
                      >
                        {label}
                      </Text>
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
              <Text
                style={[
                  styles.completeButtonText,
                  !selectedTeam && styles.completeButtonTextDisabled,
                ]}
              >
                선택완료
              </Text>
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
    paddingTop: height * 0.02,
    paddingBottom: height * 0.2,
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
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 24,
    lineHeight: 30,
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
    shadowOffset: {width: 0, height: 6},

    // Android 그림자
    elevation: 8,
  },

  teamLabel: {
    marginTop: 10,
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
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
    paddingVertical: 12,
    // height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  completeButtonDisabled: {
    backgroundColor: "#232323",
  },

  completeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },

  completeButtonTextDisabled: {
    color: "#3E3E3E",
  },
});
