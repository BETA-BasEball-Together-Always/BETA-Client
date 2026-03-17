import { StyleSheet } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const AuthBackground = () => {
  return (
    <>
      <LinearGradient
        colors={["#050208", "#241533", "#5B223C", "#943C23", "#121212"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 2, y: 1.4 }}
        style={StyleSheet.absoluteFillObject}
      />
      <BlurView
        intensity={40}
        tint="dark"
        style={StyleSheet.absoluteFillObject}
      />
      <BlurView
        intensity={55}
        tint="default"
        style={StyleSheet.absoluteFillObject}
      />
    </>
  );
};

export default AuthBackground;
