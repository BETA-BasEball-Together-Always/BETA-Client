import React, {useMemo} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import AuthBackground from "../../components/AuthBackground";

const TermsDetailScreen = ({navigation, route}) => {
  const type = route?.params?.type;

  const {title, body} = useMemo(() => {
    switch (type) {
      case "TOS":
        return {
          title: "이용약관",
          body: "여기에 이용약관 내용을 넣어주세요.\n\n- 서비스 목적\n- 회원 의무\n- 금지 행위\n- 책임 제한\n- 분쟁 해결\n\n(백엔드/노션/웹뷰 등으로 연결 예정이면 이 부분을 교체)",
        };
      case "PRIVACY_REQUIRED":
        return {
          title: "개인정보 수집 및 이용 동의",
          body: "여기에 개인정보 수집/이용 동의 내용을 넣어주세요.\n\n- 수집 항목\n- 이용 목적\n- 보유 기간\n- 동의 거부 권리 및 불이익",
        };
      case "PRIVACY_MARKETING":
        return {
          title: "개인정보 마케팅 활용 동의",
          body: "여기에 마케팅 활용 동의 내용을 넣어주세요.\n\n- 활용 항목\n- 활용 목적\n- 보유 기간\n- 수신 동의/철회 방법",
        };
      default:
        return {title: "약관", body: "표시할 약관 타입이 없습니다."};
    }
  }, [type]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthBackground />

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{title}</Text>

        <View style={{width: 32}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.bodyText}>{body}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsDetailScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: "#000"},
  headerRow: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {width: 32, alignItems: "center"},
  backButtonText: {fontSize: 28, lineHeight: 20, color: "#fff"},
  headerTitle: {color: "#fff", fontSize: 16, fontWeight: "700"},
  content: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24},
  bodyText: {color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 20},
});
