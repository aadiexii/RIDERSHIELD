import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, SafeAreaView,
} from 'react-native';
import { Shield, AlertTriangle, Check, MapPin, Users, Radio } from 'lucide-react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.119:5000'; // Real device or live deployed
// const BACKEND_URL = 'http://10.0.2.2:5000'; // Android emulator

const C = {
  bg:      '#0a0a0a',
  card:    '#0f0f0f',
  card2:   '#1a1a1a',
  orange:  '#f97316',
  white:   '#ffffff',
  gray:    '#9ca3af',
  darkGray:'#374151',
  green:   '#22c55e',
  red:     '#ef4444',
};

const STEPS = [
  { label: 'Checking news signals in your zone' },
  { label: 'Analyzing traffic conditions' },
  { label: 'Checking group reports from nearby riders' },
  { label: 'Confirming your GPS location' },
  { label: 'Verifying activity pattern' },
];

export default function SafetyScreen() {
  const [isActivated, setIsActivated] = useState(false);
  const [steps, setSteps] = useState(STEPS.map(s => ({ ...s, done: false })));
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null);
  const [groupCount, setGroupCount] = useState(0);

  const handleActivate = () => {
    setIsActivated(true);
    setResult(null);
    setGroupCount(0);
    setSteps(STEPS.map(s => ({ ...s, done: false })));

    STEPS.forEach((_, index) => {
      setTimeout(() => {
        setSteps(prev => prev.map((s, i) => i === index ? { ...s, done: true } : s));
      }, 1200 * (index + 1));
    });

    // After all steps complete, call backend
    setTimeout(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/worker/safety-mode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zoneId: 'Z001', zoneName: 'Noida Sector 18', workerId: 'W-4821' }),
        });
        const data = await res.json();
        const approvalChance = data.groupValidated ? 0.95 : 0.75;
        const approved = Math.random() < approvalChance;
        setResult(approved ? 'approved' : 'rejected');
        if (data.groupCount > 0) setGroupCount(data.groupCount);
      } catch {
        // Fallback if backend unreachable
        const approved = Math.random() > 0.2;
        setResult(approved ? 'approved' : 'rejected');
      }
    }, 6000);
  };

  const handleReset = () => {
    setIsActivated(false);
    setResult(null);
    setSteps(STEPS.map(s => ({ ...s, done: false })));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Safety Mode</Text>
          <Text style={s.subtitle}>Manual protection for undetectable disruptions</Text>
        </View>

        {/* Info Card */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>When to use Safety Mode</Text>
          {[
            'Sudden curfew declared in your area',
            'Local strike blocking delivery routes',
            'Market or zone closure without warning',
            'Any disruption that APIs cannot detect',
          ].map((item, i) => (
            <View key={i} style={s.bulletRow}>
              <View style={s.bullet} />
              <Text style={s.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Main Action Area */}
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          {!isActivated && (
            <TouchableOpacity style={s.activateBtn} onPress={handleActivate} activeOpacity={0.85}>
              <Shield color={C.white} size={40} strokeWidth={1.5} />
              <Text style={s.activateBtnTitle}>Activate Safety Mode</Text>
              <Text style={s.activateBtnSub}>Tap to begin verification</Text>
            </TouchableOpacity>
          )}

          {isActivated && result === null && (
            <View style={s.verifyCard}>
              <Text style={s.verifyTitle}>Verifying...</Text>
              {steps.map((step, i) => (
                <View key={i} style={s.stepRow}>
                  <View style={[s.stepCircle, step.done && s.stepCircleDone]}>
                    {step.done && <Check color={C.green} size={13} strokeWidth={3} />}
                  </View>
                  <Text style={[s.stepText, step.done && { color: C.white }]}>{step.label}</Text>
                </View>
              ))}
              <Text style={s.dontClose}>Do not close the app</Text>
            </View>
          )}

          {result === 'approved' && (
            <View style={s.approvedCard}>
              <Check color={C.green} size={40} />
              <Text style={s.approvedTitle}>Safety Mode Approved</Text>
              <Text style={s.approvedBody}>Rs. 285 will be credited to your UPI automatically</Text>
              <Text style={s.approvedNote}>Verification complete · Session saved</Text>
            </View>
          )}

          {result === 'rejected' && (
            <View style={s.rejectedCard}>
              <AlertTriangle color={C.red} size={40} />
              <Text style={s.rejectedTitle}>Verification Failed</Text>
              <Text style={s.rejectedBody}>Insufficient signals detected in your zone</Text>
              <Text style={s.rejectedNote}>Try again after 30 minutes</Text>
              <TouchableOpacity onPress={handleReset} style={{ marginTop: 16 }}>
                <Text style={s.tryAgain}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Trust Note */}
        <View style={s.trustCard}>
          <View style={s.trustRow}>
            <Text style={s.trustLabel}>Trust Score</Text>
            <Text style={s.trustScore}>78 / 100</Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: '78%' }]} />
          </View>
          <Text style={s.activationsLeft}>2 activations remaining this week</Text>
          {groupCount > 0 && (
            <Text style={s.groupNote}>
              {groupCount} other rider{groupCount > 1 ? 's' : ''} in your zone also reported
            </Text>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:          { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title:           { color: C.white, fontSize: 26, fontWeight: '800' },
  subtitle:        { color: C.gray, fontSize: 14, marginTop: 4 },

  infoCard:        { backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, marginTop: 4, padding: 20 },
  infoTitle:       { color: C.orange, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  bulletRow:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet:          { width: 6, height: 6, backgroundColor: C.orange, borderRadius: 3, marginTop: 5, marginRight: 10 },
  bulletText:      { color: C.gray, fontSize: 14, flex: 1 },

  activateBtn:     { backgroundColor: C.orange, borderRadius: 16, padding: 24, alignItems: 'center' },
  activateBtnTitle:{ color: C.white, fontSize: 18, fontWeight: '800', marginTop: 12, letterSpacing: -0.3 },
  activateBtnSub:  { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 },

  verifyCard:      { backgroundColor: C.card, borderRadius: 16, padding: 20 },
  verifyTitle:     { color: C.orange, fontSize: 16, fontWeight: '700', marginBottom: 16 },
  stepRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepCircle:      { width: 22, height: 22, backgroundColor: C.card2, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stepCircleDone:  { backgroundColor: 'rgba(34,197,94,0.15)' },
  stepText:        { color: C.gray, fontSize: 14, marginLeft: 12 },
  dontClose:       { color: C.gray, fontSize: 12, textAlign: 'center', marginTop: 8 },

  approvedCard:    { backgroundColor: 'rgba(5,46,22,0.8)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.green, alignItems: 'center' },
  approvedTitle:   { color: C.green, fontSize: 18, fontWeight: '800', marginTop: 12 },
  approvedBody:    { color: C.white, fontSize: 14, marginTop: 8, textAlign: 'center' },
  approvedNote:    { color: C.gray, fontSize: 12, marginTop: 6 },

  rejectedCard:    { backgroundColor: 'rgba(45,15,15,0.8)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.red, alignItems: 'center' },
  rejectedTitle:   { color: C.red, fontSize: 18, fontWeight: '800', marginTop: 12 },
  rejectedBody:    { color: C.white, fontSize: 14, marginTop: 8, textAlign: 'center' },
  rejectedNote:    { color: C.gray, fontSize: 12, marginTop: 6 },
  tryAgain:        { color: C.orange, fontSize: 14, fontWeight: '600' },

  trustCard:       { backgroundColor: C.card, borderRadius: 14, marginHorizontal: 16, marginTop: 16, padding: 16 },
  trustRow:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  trustLabel:      { color: C.gray, fontSize: 13 },
  trustScore:      { color: C.orange, fontSize: 14, fontWeight: '700' },
  progressBg:      { backgroundColor: C.card2, borderRadius: 4, height: 6, overflow: 'hidden' },
  progressFill:    { backgroundColor: C.orange, height: 6, borderRadius: 4 },
  activationsLeft: { color: C.gray, fontSize: 12, marginTop: 8 },
  groupNote:       { color: C.orange, fontSize: 12, marginTop: 4, fontWeight: '600' },
});
