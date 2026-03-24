import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackIcon from "../assets/svg/chevrons/back.svg";
import { AppText } from "../theme/components/AppText";

const AppHeader = ({
  pageName,
  center,
  showBack = false,
  backLabel,
  left,
  right,
}) => {
  const navigation = useNavigation();
  const shouldShowBack = showBack && !left;

  return (
    // <SafeAreaView edges={["top"]} style={styles.safe}>
    <View style={styles.navContainer}>
      {left && <View style={styles.leftContainer}>{left}</View>}
      {shouldShowBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <BackIcon width={12} height={18} marginTop={4} />
          {/* backLabel은 게시글 상세 페이지에서 "< 뒤로가기" 할 때 필요!!" */}
          {backLabel && (
            <AppText variant="bodyRegular" style={styles.backLabel}>
              {backLabel}
            </AppText>
          )}
        </TouchableOpacity>
      )}

      {pageName && (
        <View style={styles.pageNameContainer} pointerEvents="box-none">
          <AppText
            variant="displayTitle2"
            className="text-white"
            style={{ lineHeight: 28.6 }}
          >
            {pageName}
          </AppText>
        </View>
      )}

      {center && (
        <View style={styles.pageNameContainer} pointerEvents="box-none">
          {center}
        </View>
      )}

      {right && <View style={styles.rightContainer}>{right}</View>}

      {/* 오른쪽 균형용 빈 공간 */}
      {/* <View style={styles.right} /> */}
    </View>
    // </SafeAreaView>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#121212",
  },
  navContainer: {
    height: 56,
    // flexDirection: "row",
    // alignItems: "center",
    // justifyContent: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  /** 좌측 커스텀(left) — 가운데 전체 오버레이보다 위에서 터치 수신 */
  leftContainer: {
    position: "absolute",
    left: 25,
    height: "100%",
    justifyContent: "center",
    zIndex: 2,
  },
  backButton: {
    position: "absolute",
    left: 25,
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  backLabel: {
    color: "#FFFFFF",
    marginLeft: 19,
    alignItems: "center",
  },
  pageNameContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  rightContainer: {
    position: "absolute",
    right: 25,
    height: "100%",
    justifyContent: "center",
    zIndex: 2,
  },
});
