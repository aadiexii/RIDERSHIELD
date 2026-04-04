import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { router } from 'expo-router';

const C = {
  bg: '#0a0a0a', card: '#0f0f0f', card2: '#1a1a1a',
  orange: '#f97316', white: '#ffffff', gray: '#9ca3af',
  darkGray: '#374151', green: '#22c55e',
};

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');

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

      {/* Security note */}
      <View style={s.securityCard}>
        <Lock color={C.orange} size={16} />
        <Text style={s.securityText}> Bank-level security. OTP verified.</Text>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={s.primaryBtn}
        onPress={() => router.push('/onboarding/otp')}
        activeOpacity={0.85}
      >
        <Text style={s.primaryBtnText}>Send OTP</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg, paddingHorizontal: 24, paddingTop: 16 },
  backBtn:      { marginBottom: 32 },
  progressRow:  { flexDirection: 'row', marginBottom: 32, gap: 4 },
  progressSeg:  { flex: 1, height: 3, backgroundColor: C.card2, borderRadius: 2 },
  progressActive:{ backgroundColor: C.orange },
  label:        { color: C.gray, fontSize: 16 },
  heading:      { color: C.white, fontSize: 28, fontWeight: '800' },
  sub:          { color: C.gray, fontSize: 14, marginBottom: 32, marginTop: 4 },
  inputBox:     { flexDirection: 'row', backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.card2, overflow: 'hidden' },
  prefix:       { paddingHorizontal: 16, paddingVertical: 14, borderRightWidth: 1, borderRightColor: C.card2, justifyContent: 'center' },
  prefixText:   { color: C.white, fontSize: 16, fontWeight: '600' },
  input:        { flex: 1, paddingHorizontal: 16, paddingVertical: 14, color: C.white, fontSize: 18, letterSpacing: 2 },
  inputNote:    { color: C.gray, fontSize: 12, marginTop: 8 },
  securityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 16, marginTop: 24 },
  securityText: { color: C.gray, fontSize: 13, marginLeft: 8 },
  primaryBtn:   { position: 'absolute', bottom: 32, left: 24, right: 24, backgroundColor: C.orange, borderRadius: 14, padding: 18, alignItems: 'center' },
  primaryBtnText:{ color: C.white, fontSize: 17, fontWeight: '700' },
});
