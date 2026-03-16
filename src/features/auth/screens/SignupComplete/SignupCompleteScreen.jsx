import React, { useEffect } from "react";
import { StyleSheet, View, SafeAreaView, TouchableOpacity } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import AuthBackground from "../../components/AuthBackground";
import CompleteIcon from "../../assets/common/svg/signupComplete.svg";

import * as SecureStore from "expo-secure-store";

const SignupCompleteScreen = ({ navigation, route }) => {
  const [favoriteTeamLabel, setFavoriteTeamLabel] = useState("팬");

  useEffect(() => {
    const labelFromParams = route?.params?.signup?.favoriteTeamLabel;
    if (labelFromParams) {
      setFavoriteTeamLabel(labelFromParams);
    } else {
      // route.params 없으면 로컬에서 불러오기
      SecureStore.getItemAsync("favoriteTeamLabel").then((stored) => {
        if (stored) setFavoriteTeamLabel(stored);
      });
    }
  }, [route?.params]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthBackground />
      <View style={styles.container}>
        <CompleteIcon width={273.721} height={251.031} />
        <AppText variant="displayTitle2" style={styles.mainText}>
          회원가입이 완료되었습니다!
        </AppText>
        <AppText variant="semi14" style={styles.subText}>
          {favoriteTeamLabel} 팬 일환이 된 것을 축하합니다~
        </AppText>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace("Main")}
        >
          <AppText variant="heading" style={styles.btnText}>
            응원하러 가기
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignupCompleteScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  mainText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  subText: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "#111111",
  },
});
