import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import BetaLogo from '../shared/assets/svg/logos/BetaLogo.svg';

const SplashScreen = () => {
  /** Shared Values */
  const blueOpacity = useSharedValue(1);
  const purpleOpacity = useSharedValue(0);
  const redOpacity = useSharedValue(0);
  const brownOpacity = useSharedValue(0);

  /** 애니메이션 실행 함수 */
  const runAnimation = () => {
    // 초기화
    blueOpacity.value = 1;
    purpleOpacity.value = 0;
    redOpacity.value = 0;
    brownOpacity.value = 0;

    // 애니메이션
    blueOpacity.value = withTiming(0, { duration: 1000 });

    purpleOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    redOpacity.value = withDelay(350, withTiming(1, { duration: 650 }));
    brownOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
  };

  /** 첫 렌더 시 자동 시작 */
  useEffect(() => {
    runAnimation();
  }, []);

  /** Animated Styles */
  const blueStyle = useAnimatedStyle(() => ({
    opacity: blueOpacity.value,
  }));

  const purpleStyle = useAnimatedStyle(() => ({
    opacity: purpleOpacity.value,
  }));

  const redStyle = useAnimatedStyle(() => ({
    opacity: redOpacity.value,
  }));

  const brownStyle = useAnimatedStyle(() => ({
    opacity: brownOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* 7284DB */}
      <Animated.View
        style={[
          styles.ellipseShape,
          styles.primaryEllipse,
          { backgroundColor: '#7284DB', left: '-15%', top: '8%' },
          blueStyle,
        ]}
      />

      {/* 443D4D */}
      <Animated.View
        style={[
          styles.ellipseShape,
          styles.secondaryEllipse,
          { backgroundColor: '#443D4D', right: '-25%', top: '0%' },
          purpleStyle,
        ]}
      />

      {/* rgba(235,0,41,0.44) */}
      <Animated.View
        style={[
          styles.ellipseShape,
          styles.secondaryEllipse,
          { backgroundColor: 'rgba(235, 0, 41, 0.44)', left: '-36%', top: '35%' },
          redStyle,
        ]}
      />

      {/* 943C23 */}
      <Animated.View
        style={[
          styles.ellipseShape,
          styles.secondaryEllipse,
          { backgroundColor: '#943C23', right: '-35%', top: '66%' },
          brownStyle,
        ]}
      />

      <BetaLogo width="37%" />

      {/* 🔥 테스트 버튼 🔥 */}
      {/* <TouchableOpacity style={styles.button} onPress={runAnimation}>
        <Text style={styles.buttonText}>Replay Animation</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipseShape:{
    width: '70%',
    aspectRatio: 1,
    borderRadius: '70%',
    position: 'absolute',
  },
  primaryEllipse: {
    filter: 'blur(150px)',
  },
  secondaryEllipse: {
    filter: 'blur(110px)',
  },  
  button: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    opacity: 0.7,
  },
  buttonText: {
    color: 'black',
    fontWeight: '600',
  },
});
