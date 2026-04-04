import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';

const C = {
  bg: '#0a0a0a', card: '#0f0f0f', card2: '#1a1a1a',
  orange: '#f97316', white: '#ffffff', gray: '#9ca3af',
  darkGray: '#374151', green: '#22c55e',
};

export default function OtpScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focused, setFocused] = useState(-1);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (val: string, i: number) => {
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    if (next.every(d => d !== '')) {
      setTimeout(() => router.push('/onboarding/verify'), 300);
    }
  };

  const handleKeyPress = (key: string, i: number) => {
    if (key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
        <ChevronLeft color={C.gray} size={24} />
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={s.progressRow}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[s.progressSeg, i <= 1 && s.progressActive]} />
        ))}
      </View>

      <Text style={s.label}>Verify your</Text>
      <Text style={s.heading}>Phone Number</Text>
      <Text style={s.sub}>OTP sent to +91 98765 43210</Text>

      {/* OTP boxes */}
      <View style={s.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={ref => { inputs.current[i] = ref; }}
            style={[s.otpBox, focused === i && s.otpBoxFocused]}
            value={digit}
            onChangeText={val => handleChange(val.slice(-1), i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            onFocus={() => setFocused(i)}
            onBlur={() => setFocused(-1)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
          />
        ))}
      </View>

      <Text style={s.resend}>Resend OTP in 30s</Text>

      {/* CTA */}
      <TouchableOpacity
        style={s.primaryBtn}
        onPress={() => router.push('/onboarding/verify')}
        activeOpacity={0.85}
      >
        <Text style={s.primaryBtnText}>Verify OTP</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: C.bg, paddingHorizontal: 24, paddingTop: 16 },
  backBtn:        { marginBottom: 32 },
  progressRow:    { flexDirection: 'row', marginBottom: 32, gap: 4 },
  progressSeg:    { flex: 1, height: 3, backgroundColor: C.card2, borderRadius: 2 },
  progressActive: { backgroundColor: C.orange },
  label:          { color: C.gray, fontSize: 16 },
  heading:        { color: C.white, fontSize: 28, fontWeight: '800' },
  sub:            { color: C.gray, fontSize: 14, marginBottom: 32, marginTop: 4 },
  otpRow:         { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  otpBox:         { width: 48, height: 56, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.card2, color: C.white, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  otpBoxFocused:  { borderColor: C.orange },
  resend:         { color: C.gray, fontSize: 13, textAlign: 'center', marginTop: 16 },
  primaryBtn:     { position: 'absolute', bottom: 32, left: 24, right: 24, backgroundColor: C.orange, borderRadius: 14, padding: 18, alignItems: 'center' },
  primaryBtnText: { color: C.white, fontSize: 17, fontWeight: '700' },
});
