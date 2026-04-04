import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: 200,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.container}>
      <View style={s.titleRow}>
        <Text style={s.titleWhite}>RIDER</Text>
        <Text style={s.titleOrange}>SHIELD</Text>
      </View>
      <Text style={s.tagline}>Income Protection for Delivery Partners</Text>

      <View style={s.loaderWrapper}>
        <View style={s.loaderBg}>
          <Animated.View style={[s.loaderFill, { width: barWidth }]} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  titleRow:     { flexDirection: 'row' },
  titleWhite:   { color: '#ffffff', fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  titleOrange:  { color: '#f97316', fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  tagline:      { color: '#6b7280', fontSize: 13, textAlign: 'center', marginTop: 10, paddingHorizontal: 32 },
  loaderWrapper:{ position: 'absolute', bottom: 60, alignItems: 'center' },
  loaderBg:     { width: 160, height: 2, backgroundColor: '#1a1a1a', borderRadius: 2, overflow: 'hidden' },
  loaderFill:   { height: 2, backgroundColor: '#f97316', borderRadius: 2 },
});
