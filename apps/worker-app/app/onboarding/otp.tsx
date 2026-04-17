import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getConfirmationResult, clearConfirmationResult } from '../../store/otpStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.119:5000';

const C = {
  bg: '#0a0a0a', card: '#0f0f0f', card2: '#1a1a1a',
  orange: '#f97316', white: '#ffffff', gray: '#9ca3af',
  darkGray: '#374151', green: '#22c55e', red: '#ef4444'
};

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focused, setFocused] = useState(-1);
  const inputs = useRef<(TextInput | null)[]>([]);
  const { login, deviceFingerprint } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const verifyOtp = async (code: string) => {
    setLoading(true);
    setErrorMsg('');

    try {
      // HACKATHON DEMO BYPASS
      if (phone === '9999999999') {
        if (code !== '123456') {
          setErrorMsg('Demo OTP is 123456. Please try again.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${BACKEND_URL}/worker/verify-firebase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: 'DEMO_HACKATHON_TOKEN_123', phone, deviceFingerprint }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        await login(data.workerId, data.token);
        // Standard user onboarding pipeline
        if (data.isNewWorker || !data.aaVerified) {
          router.push('/onboarding/verify');
        } else {
          router.replace('/(tabs)');
        }
        return; // Early exit so we don't hit real Firebase validation below
      }


      // Step 1: Verify OTP with Firebase (REAL PRODUCTION FLOW)
      const confirmation = getConfirmationResult();
      if (!confirmation) {
        setErrorMsg('Session expired. Please go back and request OTP again.');
        setLoading(false);
        return;
      }

      const credential = await confirmation.confirm(code);
      const idToken = await credential.user.getIdToken();
      clearConfirmationResult();

      // Step 2: Exchange Firebase ID token for our backend JWT
      const res = await fetch(`${BACKEND_URL}/worker/verify-firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, phone, deviceFingerprint }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Verification failed');
      } else {
        await login(data.workerId, data.token);
        if (data.isNewWorker || !data.aaVerified) {
          router.push('/onboarding/verify');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setErrorMsg('Wrong OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setErrorMsg('OTP expired. Please go back and request a new one.');
      } else {
        setErrorMsg(err.message || 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (val: string, i: number) => {
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    if (next.every(d => d !== '')) {
      verifyOtp(next.join(''));
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
      <Text style={s.sub}>OTP sent to +91 {phone || '9876543210'}</Text>

      {/* OTP boxes */}
      <View style={s.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={ref => { inputs.current[i] = ref; }}
            style={[s.otpBox, focused === i && s.otpBoxFocused]}
            value={digit}
            onChangeText={v => handleChange(v.slice(-1), i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            onFocus={() => setFocused(i)}
            onBlur={() => setFocused(-1)}
            keyboardType="numeric"
            maxLength={1}
            caretHidden
          />
        ))}
      </View>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={s.resend}>Did not receive OTP? Go back to resend</Text>
      </TouchableOpacity>
      {errorMsg ? <Text style={s.errorTxt}>{errorMsg}</Text> : null}

      {/* CTA */}
      <TouchableOpacity
        style={s.primaryBtn}
        onPress={() => verifyOtp(otp.join(''))}
        disabled={loading || otp.some(d => !d)}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={C.white} />
        ) : (
          <Text style={s.primaryBtnText}>Verify OTP</Text>
        )}
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
  heading:        { color: C.white, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  sub:            { color: C.gray, fontSize: 14, marginBottom: 32 },
  otpRow:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  otpBox:         { width: 48, height: 56, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.card2, color: C.white, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  otpBoxFocused:  { borderColor: C.orange },
  resend:         { color: C.gray, fontSize: 13, textAlign: 'center', marginTop: 4 },
  errorTxt:       { color: C.red, fontSize: 13, textAlign: 'center', marginTop: 12 },
  primaryBtn:     { position: 'absolute', bottom: 32, left: 24, right: 24, backgroundColor: C.orange, borderRadius: 14, padding: 18, alignItems: 'center' },
  primaryBtnText: { color: C.white, fontSize: 17, fontWeight: '700' },
});
