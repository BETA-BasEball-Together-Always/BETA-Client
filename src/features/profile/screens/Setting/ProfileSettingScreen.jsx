import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../../../../shared/component/AppHeader";
import { AppText } from "../../../../shared/theme/components/AppText";

const ProfileSettingScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader pageName="설정" showBack />

      <View style={styles.section}>
        <AppText variant="semi18" className="text-white">
          계정
        </AppText>
        {/* 여기에 각각 페이지 추가!! */}
        {/* 아래의 텍스트들은 스타일 조정 위해 잠시 추가해 둔 값입니다아 */}
        <AppText variant="bodyMedium" className="text-gray-400">
          프로필 수정
        </AppText>
        <AppText variant="bodyMedium" className="text-gray-400">
          비밀번호 변경
        </AppText>
        <AppText variant="bodyMedium" className="text-gray-400">
          로그아웃
        </AppText>
        <AppText variant="bodyMedium" className="text-gray-400">
          계정 탈퇴
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="semi18" className="text-white">
          안내
        </AppText>
        {/* 여기에 각각 페이지 추가!! */}
      </View>

      <View style={styles.section}>
        <AppText variant="semi18" className="text-white">
          안내
        </AppText>
        {/* 여기에 각각 페이지 추가!! */}
      </View>
    </SafeAreaView>
  );
};

export default ProfileSettingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  section: {
    marginVertical: 25,
    marginHorizontal: 25,
    gap: 13,
  },
});
