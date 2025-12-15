// src/features/auth/screens/SignupGenderAge/SignupGenderAgeScreen.jsx
import React, {useState, useMemo} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import AuthBackground from "../../components/AuthBackground";
import SignupStepIndicator from "../../components/SignupStepIndicator";

const {height} = Dimensions.get("window");

const SignupGenderAgeScreen = ({navigation, route}) => {
  const [gender, setGender] = useState(null); // 'FEMALE' | 'MALE' | null
  const [age, setAge] = useState("");

  const isNextEnabled = useMemo(() => {
    return !!age && Number(age) > 0;
  }, [age]);

  const handleNext = () => {
    navigation.navigate("SignupNickname", {
      ...route?.params,
      gender,
      age: age ? Number(age) : null,
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
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>{"<"}</Text>
                </TouchableOpacity>

                <View style={styles.stepWrapper}>
                  <SignupStepIndicator currentStep={3} />
                </View>

                <View style={styles.rightPlaceholder} />
              </View>

              {/* 성별 */}
              <Text style={styles.title}>
                성별을 선택해주세요
                <Text style={styles.optional}> * 선택사항</Text>
              </Text>

              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "FEMALE" && styles.genderFemaleSelected,
                  ]}
                  onPress={() => setGender("FEMALE")}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === "FEMALE" && styles.genderFemaleTextSelected,
                    ]}
                  >
                    여성
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "MALE" && styles.genderMaleSelected,
                  ]}
                  onPress={() => setGender("MALE")}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === "MALE" && styles.genderMaleTextSelected,
                    ]}
                  >
                    남성
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 나이 */}
              <Text style={[styles.title, {marginTop: 48, marginBottom: 8}]}>
                나이를 입력해주세요
                <Text style={styles.optional}> * 선택사항</Text>
              </Text>

              <View style={styles.ageInputWrapper}>
                <TextInput
                  style={styles.ageInput}
                  value={age}
                  onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  placeholder=""
                  placeholderTextColor="#B8B8C4"
                  maxLength={3}
                />
              </View>
            </View>
          </ScrollView>

          {/* 하단 버튼 */}
          <View style={styles.floatingBottomArea}>
            {isNextEnabled && (
              <TouchableOpacity
                style={styles.nextButton}
                activeOpacity={0.85}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>다음</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.skipButton}
              activeOpacity={0.8}
              onPress={handleNext}
            >
              <Text style={styles.skipButtonText}>건너뛰기</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default SignupGenderAgeScreen;

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
    paddingBottom: height * 0.25,
    paddingHorizontal: 20,
  },
  inner: {
    maxWidth: 390,
    width: "100%",
    alignSelf: "center",
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: height * 0.1,
    marginBottom: 20,
  },
  backButton: {
    width: 32,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 30,
    lineHeight: 15,
    color: "#FFFFFF",
  },
  stepWrapper: {
    width: 150,
    alignItems: "center",
  },
  rightPlaceholder: {
    width: 32,
  },

  /* Title */
  title: {
    fontSize: 22,
    // fontWeight: "700",
    fontFamily: "NotoSansKR_SemiBold",
    lineHeight: 33,
    color: "#FFFFFF",
    marginBottom: 16,
    // borderWidth: 1,
  },
  optional: {
    fontSize: 13,
    fontWeight: "400",
    color: "rgba(255,255,255,0.6)",
  },

  /* Gender */
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  genderText: {
    fontSize: 18,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },

  genderFemaleSelected: {
    borderWidth: 1,
    borderColor: "#FF4D8D",
    backgroundColor: "rgba(255,116,176,0.15)",
  },
  genderFemaleTextSelected: {
    color: "#FF4D8D",
  },

  genderMaleSelected: {
    borderWidth: 1,
    borderColor: "#4D7CFF",
    backgroundColor: "rgba(116,141,255,0.15)",
  },
  genderMaleTextSelected: {
    color: "#4D7CFF",
  },

  /* Age */
  ageInputWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.5)",
    // paddingVertical: 6,
    // borderWidth: 1,
  },
  ageInput: {
    fontSize: 18,
    color: "#FFFFFF",
  },

  /* Bottom */
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  skipButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#232323",
    justifyContent: "center",
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
