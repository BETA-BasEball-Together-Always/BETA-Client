import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import BackIcon from "../assets/svg/chevrons/back.svg";
import { AppText } from "../theme/components/AppText";

const AppHeader = ({ left, center, right }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.navContainer}>
      <View style={styles.left}>{left}</View>
      <View style={styles.center}>{center}</View>
      <View style={styles.right}>{right}</View>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  navContainer: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  left: {
    position: "absolute",
    left: 25,
    height: "100%",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  right: {
    position: "absolute",
    right: 25,
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
  },
});
