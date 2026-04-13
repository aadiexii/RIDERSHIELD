import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator
} from 'react-native';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth, firebaseConfig } from '../../config/firebase';
import { setConfirmationResult } from '../../store/otpStore';

const C = {
  bg: '#0a0a0a', card: '#0f0f0f', card2: '#1a1a1a',
  orange: '#f97316', white: '#ffffff', gray: '#9ca3af',
  darkGray: '#374151', green: '#22c55e',
};

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaVerifier = useRef<any>(null);

  const handleSendOTP = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    setError('');
    try {
      const phoneNumber = `+91${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier.current);
      setConfirmationResult(confirmation);
      router.push({ pathname: '/onboarding/otp', params: { phone } });
    } catch (err: any) {
      console.log('[Firebase Phone Auth] Error:', err);
      setError(err.message?.includes('invalid-phone-number')
        ? 'Invalid phone number'
        : err.message?.includes('too-many-requests')
        ? 'Too many attempts. Try again later.'
        : 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Firebase reCAPTCHA — invisible, handled in WebView */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={true}
      />

      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
        <ChevronLeft color={C.gray} size={24} />
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={s.progressRow}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[s.progressSeg, i === 0 && s.progressActive]} />
        ))}
      </View>

      <Text style={s.label}>Enter your</Text>
      <Text style={s.heading}>Phone Number</Text>
      <Text style={s.sub}>We will send you a verification code</Text>

      {/* Input */}
      <View style={s.inputBox}>
        <View style={s.prefix}>
          <Text style={s.prefixText}>+91</Text>
        </View>
        <TextInput
          style={s.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="numeric"
          maxLength={10}
          placeholder="9876543210"
          placeholderTextColor={C.darkGray}
        />
      </View>
      <Text style={s.inputNote}>
        Your number must be linked to your Zomato/Swiggy account
      </Text>

      {error ? <Text style={s.errorTxt}>{error}</Text> : null}

      {/* Security note */}
      <View style={s.securityCard}>
        <Lock color={C.orange} size={16} />
        <Text style={s.securityText}> Verified by Firebase · Bank-level security</Text>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[s.primaryBtn, phone.length < 10 && { opacity: 0.5 }]}
        onPress={handleSendOTP}
        disabled={loading || phone.length < 10}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={C.white} />
        ) : (
          <Text style={s.primaryBtnText}>Send OTP</Text>
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
  inputBox:       { flexDirection: 'row', backgroundColor: C.card, borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  prefix:         { paddingHorizontal: 16, paddingVertical: 18, backgroundColor: C.card2, justifyContent: 'center' },
  prefixText:     { color: C.white, fontWeight: '700', fontSize: 16 },
  input:          { flex: 1, color: C.white, fontSize: 18, paddingHorizontal: 16, fontWeight: '600', letterSpacing: 2 },
  inputNote:      { color: C.gray, fontSize: 12, marginBottom: 24 },
  errorTxt:       { color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  securityCard:   { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(249,115,22,0.08)', borderRadius: 12, padding: 14, marginBottom: 16 },
  securityText:   { color: C.gray, fontSize: 13 },
  primaryBtn:     { position: 'absolute', bottom: 32, left: 24, right: 24, backgroundColor: C.orange, borderRadius: 14, padding: 18, alignItems: 'center' },
  primaryBtnText: { color: C.white, fontSize: 17, fontWeight: '700' },
});
