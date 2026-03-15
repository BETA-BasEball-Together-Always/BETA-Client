import { StyleSheet, Text, View } from "react-native";
import React from "react";

const AuthBackground = () => {
  return (
    <>
      {/* <View style={[styles.ellipseShape,
            { backgroundColor: '#443D4D', right: '-25%', top: '0%' }]}
          />
          <View style={[styles.ellipseShape,
            { backgroundColor: '#7284DB', left: '-15%', top: '8%' }]}
          />
          <View style={[styles.ellipseShape,
            { backgroundColor: 'rgba(235, 0, 41, 0.44)', left: '-36%', top: '35%' }]}
          />
          <View style={[styles.ellipseShape,
            { backgroundColor: '#534048', left: '-28%', top: '38%' }]}
          />
          <View style={[styles.ellipseShape,
            { backgroundColor: '#943C23', right: '-28%', top: '66%' }]}
          /> */}
      <View
        style={[
          styles.ellipseShape,
          { backgroundColor: "#443D4D", right: "-25%", top: "0%" },
        ]}
      />
      <View
        style={[
          styles.ellipseShape,
          { backgroundColor: "#7284DB", left: "-15%", top: "8%" },
        ]}
      />
      <View
        style={[
          styles.ellipseShape,
          {
            backgroundColor: "rgba(235, 0, 41, 0.44)",
            left: "-36%",
            top: "35%",
          },
        ]}
      />
      <View
        style={[
          styles.ellipseShape,
          { backgroundColor: "#705762ff", left: "-28%", top: "38%" },
        ]}
      />
      <View
        style={[
          styles.ellipseShape,
          { backgroundColor: "#b74a2cff", right: "-28%", top: "66%" },
        ]}
      />
    </>
  );
};

export default AuthBackground;

const styles = StyleSheet.create({
  ellipseShape: {
    width: "70%",
    aspectRatio: 1,
    borderRadius: "70%",
    position: "absolute",
    filter: "blur(140px)",
  },
});
