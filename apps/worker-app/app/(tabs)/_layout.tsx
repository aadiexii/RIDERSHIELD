import { Tabs } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { House, Wallet, Shield, User, TrendingUp, Fingerprint, BookOpen } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export default function TabLayout() {
  const [locked, setLocked] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const appState = useRef(AppState.currentState);
  const backgroundedAt = useRef<number | null>(null);

  // ── Check biometric availability on mount ────────────────────────────────
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    })();
  }, []);

  // ── Lock when app comes back from background (after 30s) ─────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current === 'active' && nextState === 'background') {
        backgroundedAt.current = Date.now();
      }
      if (nextState === 'active' && backgroundedAt.current !== null) {
        const elapsed = Date.now() - backgroundedAt.current;
        // Lock if app was in background for more than 30 seconds
        if (elapsed > 30000 && biometricAvailable) {
          setLocked(true);
        }
        backgroundedAt.current = null;
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [biometricAvailable]);

  // ── Authenticate ─────────────────────────────────────────────────────────
  const authenticate = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity to access RiderShield',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });
      if (result.success) setLocked(false);
    } catch (err) {
      console.log('Biometric error:', err);
    }
  };

  // ── Biometric Lock Screen ─────────────────────────────────────────────────
  if (locked) {
    return (
      <View style={s.lockScreen}>
        <View style={s.lockIconBox}>
          <Fingerprint color="#f97316" size={56} />
        </View>
        <Text style={s.lockTitle}>Session Locked</Text>
        <Text style={s.lockSub}>
          Authenticate to access your RiderShield account
        </Text>
        <TouchableOpacity style={s.unlockBtn} onPress={authenticate} activeOpacity={0.85}>
          <Text style={s.unlockBtnText}>Unlock with Biometrics</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f0f',
          borderTopColor: '#1a1a1a',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="payouts"
        options={{
          title: 'Payouts',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          title: 'Safety',
          tabBarIcon: ({ color, size }) => <Shield color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="docs"
        options={{
          href: null,
          title: 'Guide',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  lockScreen:   { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  lockIconBox:  { width: 96, height: 96, backgroundColor: 'rgba(249,115,22,0.1)', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  lockTitle:    { color: '#ffffff', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  lockSub:      { color: '#9ca3af', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  unlockBtn:    { backgroundColor: '#f97316', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40 },
  unlockBtnText:{ color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
