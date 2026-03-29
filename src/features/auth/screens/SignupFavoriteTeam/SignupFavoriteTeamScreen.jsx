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
import { useSignupStatusMutation } from "../../services/signupStatusMutation";
import { useStepBack } from "../../hooks/useStepBack";
import { TEAM_DATA, TEAM_LIST } from "../../../../shared/constants/teams";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import { AppText } from "../../../../shared/theme/components/AppText";

const { height } = Dimensions.get("window");

const SignupFavoriteTeamScreen = ({ navigation, route }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);

  // signup 객체로만 누적 전달
  const signup = route?.params?.signup ?? {};
  const externalTeamList = route?.params?.teamList ?? null;

  const signupTeamMutation = useSignupTeamMutation();
  const signupStatusMutation = useSignupStatusMutation();

  const isNextEnabled = useMemo(() => !!selectedTeam, [selectedTeam]);

  const handleBack = useStepBack("SocialSignup");

  // const teams = useMemo(() => {
  //   if (externalTeamList && externalTeamList.length > 0) {
  //     // return externalTeamList.map((t) => ({
  //     //   key: t.teamCode,
  //     //   label: t.teamNameKr,
  //     //   Icon: TEAMS.find((base) => base.key === t.teamCode)?.Icon ?? LG,
  //     // }));

  //     // TEAMS 배열 순서대로 정렬
  //     return TEAMS.filter((base) =>
  //       externalTeamList.some((t) => t.teamCode === base.key),
  //     ).map((base) => {
  //       const externalTeam = externalTeamList.find(
  //         (t) => t.teamCode === base.key,
  //       );
  //       return {
  //         key: base.key,
  //         label: externalTeam?.teamNameKr ?? base.label,
  //         Icon: base.Icon,
  //       };
  //     });
  //   }
  //   return TEAMS;
  // }, [externalTeamList]);

  const teams = useMemo(() => {
    // teamList 있으면 필터링, 없으면 team_list 전체 사용
    const baseList = externalTeamList
      ? TEAM_LIST.filter((t) =>
          externalTeamList.some((ext) => ext.teamCode === t.key),
        )
      : TEAM_LIST;
    return baseList;
  }, [externalTeamList]);

  const handleNext = async () => {
    if (!isNextEnabled) return;

    try {
      const status = await signupStatusMutation.mutateAsync();
      if (status?.signupStep === "TEAM_SELECTED") {
        const selectedTeamLabel = TEAM_LIST.find(
          (t) => t.key === selectedTeam,
        )?.label;

        if (selectedTeamLabel) {
          await SecureStore.setItemAsync(
            "favoriteTeamLabel",
            selectedTeamLabel,
          );
        }

        navigation.navigate("SignupGenderAge", {
          signup: {
            ...signup,
            favoriteTeamCode: selectedTeam,
          },
          favoriteTeamLabel: selectedTeamLabel,
        });
        return;
      }
    } catch (e) {
      console.warn("[signup/status]", e);
    }

    signupTeamMutation.mutate(
      { teamCode: selectedTeam },
      {
        onSuccess: async () => {
          const selectedTeamLabel = TEAM_LIST.find(
            (t) => t.key === selectedTeam,
          )?.label;

          await SecureStore.setItemAsync(
            "favoriteTeamLabel",
            selectedTeamLabel ?? "",
          );

          navigation.navigate("SignupGenderAge", {
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
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {/* 헤더 */}
            <View style={styles.header}>
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
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <SelectTeamBackground />

              <View style={styles.inner}>
                {/* 타이틀 */}
                <AppText variant="displayTitle" style={styles.title}>
                  회원님의 팬심을 보여줄 구단을 선택해주세요!
                </AppText>

                {/* 팀 선택 */}
                <View style={styles.grid}>
                  {teams.map(({ key, label, MainIcon }) => {
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
                          <MainIcon width={100} height={100} />
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
    </View>
  );
};

export default SignupFavoriteTeamScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingHorizontal: 20,
    paddingBottom: 100, //선택 완료 버튼 때문에 마지막 구단 선택 카드 가려짐
    position: "relative",
  },
  inner: {
    maxWidth: 390,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    maxWidth: 390,
    width: "100%",
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: height * 0.1,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    rowGap: 22,
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
    paddingBottom: 30,
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
