import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as SecureStore from "expo-secure-store";

import SelectTeamBackground from "../../components/SelectTeamBackground";
import SignupProgressHeader from "../../components/SignupProgressHeader";
import { useSignupTeamMutation } from "../../services/signupTeamMutation";
import { useSignupStatusMutation } from "../../services/signupStatusMutation";
import { useStepBack } from "../../hooks/useStepBack";
import { TEAM_LIST } from "../../../../shared/constants/teams";
import { getKboRankCardRabbitIcon } from "../../../../shared/constants/kboRankCardRabbitIcons";

import { AppText } from "../../../../shared/theme/components/AppText";
import { useSignupDraftStore } from "../../stores/useSignupDraftStore";
import { useSignupDraftPersistHydrated } from "../../hooks/useSignupDraftPersistHydrated";
import { applySignupStatusToDraft } from "../../../../shared/auth/applySignupStatusToDraft";

const RABBIT_ICON_SIZE = 74.14;

function normalizeTeamCode(code) {
  let s = String(code ?? "").trim();
  if (s.includes("_")) {
    s = s.split("_")[0] ?? "";
  }
  return s.toUpperCase();
}

function getTeamCodeFromStatusDto(team) {
  if (!team || typeof team !== "object") return "";
  const c = team.code ?? team.teamCode ?? team.team_code;
  if (c == null) return "";
  const s = String(c).trim();
  return s.length > 0 ? s : "";
}

function pickTeamDisplayLabel(team, apiTeamCode) {
  if (!team || typeof team !== "object") return apiTeamCode;
  const kr =
    typeof team.team_name_kr === "string" ? team.team_name_kr.trim() : "";
  if (kr) return kr;
  const en =
    typeof team.team_name_en === "string" ? team.team_name_en.trim() : "";
  if (en) return en;
  const legacyKr =
    typeof team.teamNameKr === "string" ? team.teamNameKr.trim() : "";
  if (legacyKr) return legacyKr;
  const legacyEn =
    typeof team.teamNameEn === "string" ? team.teamNameEn.trim() : "";
  if (legacyEn) return legacyEn;
  return apiTeamCode;
}

function mapStatusTeamListItemToRow(team) {
  const apiTeamCode = getTeamCodeFromStatusDto(team);
  if (!apiTeamCode) return null;
  const label = pickTeamDisplayLabel(team, apiTeamCode);
  const match = TEAM_LIST.find(
    (t) => normalizeTeamCode(t.key) === normalizeTeamCode(apiTeamCode),
  );
  return {
    rowKey: apiTeamCode,
    label,
    MainIcon: match?.MainIcon ?? null,
    apiTeamCode,
  };
}

function SignupFavoriteTeamScreenBody({ navigation, route }) {
  const routeParams = route?.params ?? {};
  const signupParam =
    routeParams?.signup != null &&
    typeof routeParams.signup === "object" &&
    !Array.isArray(routeParams.signup)
      ? routeParams.signup
      : {};

  const draftFavoriteTeamCode = useSignupDraftStore((s) => s.favoriteTeamCode);
  const setDraftFavoriteTeam = useSignupDraftStore((s) => s.setFavoriteTeam);

  const [selectedTeam, setSelectedTeam] = useState(
    signupParam?.favoriteTeamCode ?? draftFavoriteTeamCode ?? null,
  );

  const signup = signupParam;
  const paramFavoriteTeamCodeRaw = signupParam?.favoriteTeamCode;
  const paramFavoriteTeamCode =
    paramFavoriteTeamCodeRaw != null &&
    String(paramFavoriteTeamCodeRaw).trim() !== ""
      ? String(paramFavoriteTeamCodeRaw).trim()
      : null;

  const [teamListPhase, setTeamListPhase] = useState("loading");
  const [teamListError, setTeamListError] = useState(null);
  const [teamRows, setTeamRows] = useState([]);

  const teamRowsRef = useRef(teamRows);
  const teamListPhaseRef = useRef(teamListPhase);
  teamRowsRef.current = teamRows;
  teamListPhaseRef.current = teamListPhase;

  const signupTeamMutation = useSignupTeamMutation();
  const signupStatusMutation = useSignupStatusMutation();

  const signupStatusMutateAsync = signupStatusMutation.mutateAsync;

  const loadTeamListFromStatus = useCallback(
    async (isCancelled) => {
      if (isCancelled?.()) return;
      setTeamListPhase("loading");
      setTeamListError(null);
      try {
        const status = await signupStatusMutateAsync();
        if (isCancelled?.()) return;
        applySignupStatusToDraft(status);
        const list = status?.teamList;
        if (!Array.isArray(list) || list.length === 0) {
          setTeamRows([]);
          setTeamListPhase("error");
          setTeamListError(
            "구단 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          );
          return;
        }
        const rows = [];
        for (const item of list) {
          const row = mapStatusTeamListItemToRow(item);
          if (row) rows.push(row);
        }
        if (rows.length === 0) {
          setTeamRows([]);
          setTeamListPhase("error");
          setTeamListError(
            "구단 정보를 인식하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          );
          return;
        }
        setTeamRows(rows);
        setTeamListPhase("success");
      } catch (e) {
        if (isCancelled?.()) return;
        console.warn("[signup/status]", e);
        setTeamRows([]);
        setTeamListPhase("error");
        const raw = e?.response?.data;
        let msg =
          typeof raw === "string"
            ? raw
            : typeof raw?.message === "string"
              ? raw.message
              : null;
        if (!msg && e?.message === "NO_ACCESS_TOKEN") {
          msg = "로그인 정보가 없습니다. 다시 로그인해 주세요.";
        }
        setTeamListError(
          msg ??
            "구단 목록을 불러오지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.",
        );
      }
    },
    [signupStatusMutateAsync],
  );

  useFocusEffect(
    useCallback(() => {
      const d = useSignupDraftStore.getState();
      const fromDraft =
        d.favoriteTeamCode != null &&
        String(d.favoriteTeamCode).trim() !== ""
          ? String(d.favoriteTeamCode).trim()
          : null;
      const restored = fromDraft ?? paramFavoriteTeamCode;
      setSelectedTeam(restored ?? null);

      const alreadyHaveList =
        teamListPhaseRef.current === "success" &&
        teamRowsRef.current.length > 0;
      if (alreadyHaveList) {
        return () => {};
      }

      let cancelled = false;
      loadTeamListFromStatus(() => cancelled);
      return () => {
        cancelled = true;
      };
    }, [loadTeamListFromStatus, paramFavoriteTeamCode]),
  );

  const isNextEnabled = useMemo(
    () => !!selectedTeam && teamListPhase === "success",
    [selectedTeam, teamListPhase],
  );

  const handleBack = useStepBack("SocialSignup");

  const goToGenderAge = async (teamCode) => {
    const list = teamRows;
    const selectedTeamLabel =
      list.find(
        (t) =>
          normalizeTeamCode(t.apiTeamCode) === normalizeTeamCode(teamCode),
      )?.label ??
      TEAM_LIST.find(
        (t) => normalizeTeamCode(t.key) === normalizeTeamCode(teamCode),
      )?.label ??
      String(teamCode ?? "");

    await SecureStore.setItemAsync(
      "favoriteTeamLabel",
      selectedTeamLabel ?? "",
    );

    setDraftFavoriteTeam({
      code: teamCode,
      label: selectedTeamLabel,
    });

    navigation.navigate("SignupGenderAge", {
      signup: {
        ...signup,
        favoriteTeamCode: teamCode,
      },
      favoriteTeamLabel: selectedTeamLabel,
    });
  };

  const handleNext = async () => {
    if (!isNextEnabled) return;

    try {
      const status = await signupStatusMutateAsync();
      if (status?.signupStep === "TEAM_SELECTED") {
        await goToGenderAge(selectedTeam);
        return;
      }
    } catch (e) {
      console.warn("[signup/status]", e);
    }

    try {
      await signupTeamMutation.mutateAsync({ teamCode: selectedTeam });
      await goToGenderAge(selectedTeam);
    } catch (e) {
      console.warn("[signup/team]", e);
      const raw = e?.response?.data;
      let msg =
        typeof raw === "string"
          ? raw
          : typeof raw?.message === "string"
            ? raw.message
            : null;
      if (!msg && e?.message === "NO_ACCESS_TOKEN") {
        msg = "로그인 정보가 없습니다. 다시 로그인해 주세요.";
      }
      if (!msg) {
        msg = "구단 선택을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
      }
      Alert.alert("안내", msg);
    }
  };

  /** 이전 단계에서 온 코드가 서버 목록 키만 맞는 경우 -> 현재 rows의 apiTeamCode로 맞춤 */
  useEffect(() => {
    if (!selectedTeam || teamRows.length === 0) return;
    if (teamRows.some((t) => t.apiTeamCode === selectedTeam)) return;
    const row = teamRows.find(
      (t) =>
        normalizeTeamCode(t.apiTeamCode) === normalizeTeamCode(selectedTeam),
    );
    if (row) setSelectedTeam(row.apiTeamCode);
  }, [teamRows, selectedTeam]);

  useEffect(() => {
    if (!selectedTeam) return;
    const selectedTeamLabel =
      teamRows.find(
        (t) =>
          normalizeTeamCode(t.apiTeamCode) ===
          normalizeTeamCode(selectedTeam),
      )?.label ??
      TEAM_LIST.find((t) => t.key === selectedTeam)?.label ??
      TEAM_LIST.find(
        (t) => normalizeTeamCode(t.key) === normalizeTeamCode(selectedTeam),
      )?.label;
    setDraftFavoriteTeam({
      code: selectedTeam,
      label: selectedTeamLabel ?? "",
    });
  }, [selectedTeam, teamRows, setDraftFavoriteTeam]);

  return (
    <View style={styles.root}>
      <SelectTeamBackground />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <TouchableWithoutFeedback
          style={styles.touchableFill}
          onPress={Keyboard.dismiss}
        >
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inner}>
                <SignupProgressHeader currentStep={2} onBack={handleBack} />

                {/* 타이틀 */}
                <AppText variant="displayTitle" style={styles.title}>
                  회원님의 팬심을 보여줄 구단을 선택해주세요!
                </AppText>

                {teamListPhase === "loading" ? (
                  <View style={styles.teamListStateBlock}>
                    <ActivityIndicator color="#FFFFFF" size="large" />
                    <AppText
                      variant="smallRegular"
                      style={styles.teamListStateSubtext}
                    >
                      구단 목록을 불러오는 중입니다…
                    </AppText>
                  </View>
                ) : teamListPhase === "error" ? (
                  <View style={styles.teamListStateBlock}>
                    <AppText
                      variant="bodyMedium"
                      style={styles.teamListErrorText}
                    >
                      {teamListError ??
                        "구단 목록을 불러오지 못했습니다. 다시 시도해 주세요."}
                    </AppText>
                    <TouchableOpacity
                      style={styles.teamListRetryButton}
                      activeOpacity={0.85}
                      onPress={() => loadTeamListFromStatus(() => false)}
                    >
                      <AppText variant="heading" style={styles.teamListRetryText}>
                        다시 시도
                      </AppText>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.grid}>
                    {teamRows.map(({ rowKey, label, apiTeamCode }) => {
                      const selected =
                        selectedTeam != null &&
                        normalizeTeamCode(selectedTeam) ===
                          normalizeTeamCode(apiTeamCode);
                      const teamKey = normalizeTeamCode(apiTeamCode);
                      const RabbitIcon = getKboRankCardRabbitIcon(teamKey);
                      const fallbackInitial =
                        typeof label === "string" && label.trim().length > 0
                          ? label.trim().slice(0, 2)
                          : teamKey.slice(0, 2);

                      return (
                        <TouchableOpacity
                          key={rowKey}
                          style={styles.item}
                          activeOpacity={0.85}
                          onPress={() => setSelectedTeam(apiTeamCode)}
                        >
                          <View
                            style={[
                              styles.iconBox,
                              selected && styles.iconBoxSelected,
                            ]}
                          >
                            {RabbitIcon ? (
                              <RabbitIcon
                                width={RABBIT_ICON_SIZE}
                                height={RABBIT_ICON_SIZE}
                              />
                            ) : (
                              <AppText
                                variant="bodyMedium"
                                style={[
                                  styles.fallbackTeamInitials,
                                  selected && styles.fallbackTeamInitialsOnLight,
                                ]}
                              >
                                {fallbackInitial}
                              </AppText>
                            )}
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
                )}
              </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View style={styles.floatingBottomArea}>
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  !isNextEnabled && styles.completeButtonDisabled,
                ]}
                disabled={!isNextEnabled}
                activeOpacity={isNextEnabled ? 0.85 : 1}
                onPress={handleNext}
              >
                <AppText
                  variant="heading"
                  style={[
                    styles.completeButtonText,
                    !isNextEnabled && styles.completeButtonTextDisabled,
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
}

export default function SignupFavoriteTeamScreen(props) {
  const draftHydrated = useSignupDraftPersistHydrated();
  if (!draftHydrated) {
    return (
      <View style={styles.root}>
        <SelectTeamBackground />
        <SafeAreaView
          style={[styles.safeArea, styles.loadingFill]}
          edges={["top", "left", "right"]}
        >
          <ActivityIndicator color="#FFFFFF" size="large" />
        </SafeAreaView>
      </View>
    );
  }
  return <SignupFavoriteTeamScreenBody {...props} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingFill: {
    justifyContent: "center",
    alignItems: "center",
  },
  touchableFill: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 100, //선택 완료 버튼 때문에 마지막 구단 선택 카드 가려짐
    position: "relative",
  },
  inner: {
    maxWidth: 390,
    width: "100%",
    alignSelf: "center",
  },
  // header styles moved to SignupProgressHeader

  title: {
    paddingHorizontal: 30,
    color: "#FFFFFF",
    lineHeight: 32.7,
    marginBottom: 24,
  },

  teamListStateBlock: {
    minHeight: 220,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  teamListStateSubtext: {
    marginTop: 8,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },
  teamListErrorText: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  teamListRetryButton: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  teamListRetryText: {
    color: "#111111",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  item: {
    width: "48%",
    alignItems: "center",
    marginBottom: 22,
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

  fallbackTeamInitials: {
    fontSize: 28,
    color: "#FFFFFF",
  },
  fallbackTeamInitialsOnLight: {
    color: "#111111",
  },

  teamLabel: {
    marginTop: 10,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 24.5,
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
