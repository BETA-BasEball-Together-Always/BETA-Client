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
import LG from "../../assets/teams/lg.svg";
import Hanwha from "../../assets/teams/hanwha.svg";
import SSG from "../../assets/teams/ssg.svg";
import Samsung from "../../assets/teams/samsung.svg";
import NC from "../../assets/teams/nc.svg";
import KT from "../../assets/teams/kt.svg";
import Lotte from "../../assets/teams/lotte.svg";
import Kiwoom from "../../assets/teams/kiwoom.svg";
import Doosan from "../../assets/teams/doosan.svg";
import Kia from "../../assets/teams/kia.svg";

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

const SignupFavoriteTeam = ({navigation, route}) => {
  const [selectedTeam, setSelectedTeam] = useState(null);

  const isNextEnabled = useMemo(() => !!selectedTeam, [selectedTeam]);

  const handleNext = () => {
    if (!isNextEnabled) return;

    navigation.navigate("SignupGenderAge", {
      ...route?.params,
      favoriteTeam: selectedTeam,
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

                <SignupStepIndicator currentStep={2} />

                <View style={styles.rightPlaceholder} />
              </View>

              {/* 타이틀 */}
              <Text style={styles.title}>
                회원님의 팬심을 보여줄{"\n"}구단을 선택해주세요!
              </Text>

              {/* 팀 선택 */}
              <View style={styles.grid}>
                {TEAMS.map(({key, label, Icon}) => {
                  const selected = selectedTeam === key;

                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.card, selected && styles.cardSelected]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedTeam(key)}
                    >
                      <Icon width={56} height={56} />
                      <Text style={styles.teamLabel}>{label}</Text>
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
                styles.nextButton,
                !isNextEnabled && styles.nextButtonDisabled,
              ]}
              activeOpacity={isNextEnabled ? 0.8 : 1}
              disabled={!isNextEnabled}
              onPress={handleNext}
            >
              <Text
                style={[
                  styles.nextButtonText,
                  !isNextEnabled && styles.nextButtonTextDisabled,
                ]}
              >
                다음
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default SignupFavoriteTeam;

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
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 30,
    color: "#FFFFFF",
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
  card: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  cardSelected: {
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  teamLabel: {
    marginTop: 10,
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  floatingBottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nextButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  nextButtonTextDisabled: {
    color: "rgba(255,255,255,0.45)",
  },
});
