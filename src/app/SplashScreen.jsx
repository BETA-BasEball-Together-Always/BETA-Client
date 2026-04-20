import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const PHASE1_GRADIENT = ["#4A4552", "#443D4D", "#2E2835", "#1A181C"];
const PHASE1_LOCATIONS = [0, 0.35, 0.72, 1];

const PHASE2_GRADIENT = ["#151515", "#121212", "#0C0C0C", "#080808"];
const PHASE2_LOCATIONS = [0, 0.4, 0.78, 1];

const LOGO_FADE_MS = 200;
const MIN_SPLASH_TOTAL_MS = 1500;

/**
 * @param {object | null} props.bootResult — bootstrapSession 결과(null이면 대기 중)
 * @param {() => void} props.onExitComplete — 로고 페이드아웃 후 메인/인증 전환
 */
const SplashScreen = ({ bootResult = null, onExitComplete }) => {
  const phase = useSharedValue(0);
  const logoOpacity = useSharedValue(1);
  const exitStartedRef = useRef(false);
  const startedAtRef = useRef(Date.now());
  const [phase2Ready, setPhase2Ready] = useState(false);
  const [minTimeReady, setMinTimeReady] = useState(false);

  useEffect(() => {
    startedAtRef.current = Date.now();
    setPhase2Ready(false);
    setMinTimeReady(false);

    const t = setTimeout(() => {
      setMinTimeReady(true);
    }, MIN_SPLASH_TOTAL_MS);

    phase.value = withDelay(
      800,
      withTiming(1, { duration: 400, easing: Easing.linear }, (finished) => {
        if (finished === true) {
          runOnJS(setPhase2Ready)(true);
        }
      }),
    );

    return () => {
      clearTimeout(t);
    };
  }, [phase]);

  const canStartExit = useMemo(() => {
    return bootResult != null && phase2Ready && minTimeReady;
  }, [bootResult, phase2Ready, minTimeReady]);

  useEffect(() => {
    if (!canStartExit || exitStartedRef.current) return;
    exitStartedRef.current = true;
    logoOpacity.value = withTiming(
      0,
      {
        duration: LOGO_FADE_MS,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished !== true || !onExitComplete) return;
        runOnJS(onExitComplete)();
      },
    );
  }, [canStartExit, logoOpacity, onExitComplete]);

  const phase1Style = useAnimatedStyle(() => ({
    opacity: 1 - phase.value,
  }));

  const phase2Style = useAnimatedStyle(() => ({
    opacity: phase.value,
  }));

  const logoFadeStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  return (
    <View style={styles.root}>
      <Animated.View
        style={[StyleSheet.absoluteFill, phase1Style]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={PHASE1_GRADIENT}
          locations={PHASE1_LOCATIONS}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <LinearGradient
          colors={[
            "rgba(114, 132, 219, 0.38)",
            "rgba(114, 132, 219, 0.12)",
            "transparent",
          ]}
          locations={[0, 0.35, 1]}
          style={styles.topWash}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.55 }}
        />
        <BlurView
          pointerEvents="none"
          intensity={Platform.OS === "ios" ? 32 : 22}
          tint="dark"
          style={styles.blurVeil}
        />
      </Animated.View>

      <Animated.View
        style={[StyleSheet.absoluteFill, phase2Style]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={PHASE2_GRADIENT}
          locations={PHASE2_LOCATIONS}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <LinearGradient
          colors={[
            "rgba(114, 132, 219, 0.2)",
            "transparent",
            "rgba(68, 61, 77, 0.35)",
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.85, y: 0.65 }}
        />
        <LinearGradient
          colors={[
            "transparent",
            "rgba(148, 60, 35, 0.18)",
            "rgba(235, 0, 41, 0.12)",
          ]}
          locations={[0.45, 0.82, 1]}
          style={styles.bottomWarmWash}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <BlurView
          pointerEvents="none"
          intensity={Platform.OS === "ios" ? 40 : 26}
          tint="dark"
          style={styles.blurVeil}
        />
      </Animated.View>

      <Animated.View
        style={[styles.logoWrap, logoFadeStyle]}
        pointerEvents="none"
      >
        <View style={styles.glassOuter}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.14)",
              "rgba(255, 255, 255, 0.02)",
              "transparent",
            ]}
            locations={[0, 0.45, 1]}
            style={styles.glassTopSheen}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
          />
          {/* <BlurView
            intensity={Platform.OS === "ios" ? 42 : 28}
            tint="dark"
            style={styles.glassBlur}
          > */}
          <Text style={styles.logoText} allowFontScaling={false}>
            BETA
          </Text>
          {/* </BlurView> */}
        </View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#443D4D",
  },
  topWash: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.95,
  },
  bottomWarmWash: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  blurVeil: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  logoWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  glassOuter: {
    borderRadius: 999,
    overflow: "hidden",
    paddingVertical: 13,
    paddingHorizontal: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.00)",
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "rgba(255, 255, 255, 0.32)",
    ...Platform.select({
      ios: {
        shadowColor: "#FFFFFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  glassTopSheen: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
    borderRadius: 999,
  },
  // glassBlur: {
  //   alignItems: "center",
  //   justifyContent: "center",
  //   overflow: "hidden",
  //   borderRadius: 999,
  //   backgroundColor: "rgba(0, 0, 0, 0.12)",
  //   paddingHorizontal: 8,
  //   paddingVertical: 2,
  // },
  logoText: {
    fontSize: 55,
    fontWeight: "800",
    fontStyle: "italic",
    color: "#FFFFFF",
    letterSpacing: 0.6,
    includeFontPadding: false,
    alignItems: "center",
    justifyContent: "center",
  },
});
