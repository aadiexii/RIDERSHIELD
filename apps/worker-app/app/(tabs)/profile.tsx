import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, SafeAreaView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Shield, Check, ChevronRight, LogOut, Bell, Lock } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.126:5000';

const C = {
  bg: '#0a0a0a', card: '#0f0f0f', card2: '#1a1a1a',
  orange: '#f97316', white: '#ffffff', gray: '#9ca3af',
  darkGray: '#374151', green: '#22c55e', red: '#ef4444',
};

const trustColor = (score: number) => {
  if (score >= 90) return C.green;
  if (score >= 70) return C.orange;
  if (score >= 50) return '#3b82f6';
  return C.red;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { workerId, logout } = useAuth();
  const [worker,  setWorker]  = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workerId) return;
    fetch(`${BACKEND_URL}/worker/profile/${workerId}`)
      .then(r => r.json())
      .then(d => { setWorker(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [workerId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={C.orange} size="large" />
        <Text style={{ color: C.gray, marginTop: 12 }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const name       = worker?.name        || 'Rahul Kumar';
  const zone       = worker?.zone        || 'Noida Sector 18';
  const plan       = worker?.plan        || 'standard';
  const premium    = worker?.weeklyPremium || 79;
  const maxPayout  = plan === 'premium' ? 1500 : plan === 'standard' ? 900 : 500;
  const coverage   = plan === 'premium' ? '12 hours' : plan === 'standard' ? '8 hours' : '6 hours';
  const trustScore = worker?.trustScore  || 0;
  const kycStatus  = worker?.kycStatus   || 'verified';
  const aaVerified = worker?.aaVerified  ?? true;
  const initials   = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarInitial}>{initials}</Text>
          </View>
          <Text style={s.workerName}>{name}</Text>
          <Text style={s.workerZone}>{zone}</Text>
          <View style={[s.planPill, { backgroundColor: plan === 'premium' ? 'rgba(168,85,247,0.15)' : 'rgba(249,115,22,0.15)' }]}>
            <Text style={[s.planPillText, { color: plan === 'premium' ? '#a855f7' : C.orange }]}>
              {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan · Active
            </Text>
          </View>
          <Text style={s.workerId}>{WORKER_ID}</Text>
        </View>

        {/* Trust Score */}
        <View style={s.card}>
          <View style={s.cardRow}>
            <Text style={s.cardGrayLabel}>Trust Score</Text>
            <Text style={[s.trustScore, { color: trustColor(trustScore) }]}>{trustScore} / 100</Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${trustScore}%` as any, backgroundColor: trustColor(trustScore) }]} />
          </View>
          <Text style={s.trustNote}>
            {trustScore >= 90 ? 'Elite Trust — Maximum coverage limits unlocked'
              : trustScore >= 70 ? 'High Trust — Lower fraud scrutiny, faster claims'
              : trustScore >= 50 ? 'Standard Trust — Normal claim processing'
              : 'Low Trust — Enhanced verification required'}
          </Text>
        </View>

        {/* Plan Details */}
        <View style={s.card}>
          <Text style={s.cardTitle}>My Plan</Text>
          <InfoRow label="Plan"            value={plan.charAt(0).toUpperCase() + plan.slice(1)} />
          <InfoRow label="Weekly Premium"  value={`Rs. ${premium}`} />
          <InfoRow label="Coverage"        value={coverage + ' / day'} />
          <InfoRow label="Max Payout"      value={`Rs. ${maxPayout.toLocaleString('en-IN')} / week`} />
          <InfoRow label="UPI"             value={worker?.upiMasked || '****@oksbi'} />
          <InfoRow label="Earnings Base"   value={`Rs. ${worker?.earningsBaseline || 5400} / week`} />
        </View>

        {/* Verification Status */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Verification Status</Text>
          {[
            { label: 'KYC Verified',              done: kycStatus === 'verified' },
            { label: 'Account Aggregator Linked',  done: aaVerified              },
            { label: 'Zone Coverage Active',        done: true                    },
            { label: 'UPI Payout Enabled',          done: true                    },
          ].map((item, i) => (
            <View key={i} style={s.checkRow}>
              <View style={[s.checkCircle, { backgroundColor: item.done ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }]}>
                <Check color={item.done ? C.green : C.red} size={12} strokeWidth={3} />
              </View>
              <Text style={[s.checkLabel, { color: item.done ? C.white : C.gray }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={s.settingsList}>
          <TouchableOpacity style={s.settingsRow}>
            <View style={s.settingsLeft}>
              <Bell color={C.gray} size={18} />
              <Text style={s.settingsText}>Notifications</Text>
            </View>
            <ChevronRight color={C.gray} size={18} />
          </TouchableOpacity>
          <View style={s.settingsDivider} />
          <TouchableOpacity style={s.settingsRow}>
            <View style={s.settingsLeft}>
              <Lock color={C.gray} size={18} />
              <Text style={s.settingsText}>Privacy & Security</Text>
            </View>
            <ChevronRight color={C.gray} size={18} />
          </TouchableOpacity>
          <View style={s.settingsDivider} />
          <TouchableOpacity style={s.settingsRow} onPress={() => logout()}>
            <View style={s.settingsLeft}>
              <LogOut color={C.red} size={18} />
              <Text style={[s.settingsText, { color: C.red }]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  avatarSection:   { alignItems: 'center', paddingTop: 32, paddingBottom: 20 },
  avatar:          { width: 80, height: 80, borderRadius: 40, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:   { color: C.white, fontSize: 28, fontWeight: '800' },
  workerName:      { color: C.white, fontSize: 22, fontWeight: '800', marginTop: 12, letterSpacing: -0.3 },
  workerZone:      { color: C.gray, fontSize: 14, marginTop: 4 },
  planPill:        { marginTop: 8, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  planPillText:    { fontSize: 12, fontWeight: '600' },
  workerId:        { color: C.darkGray, fontSize: 11, marginTop: 6, fontFamily: 'monospace' },
  card:            { backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 20 },
  cardRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardGrayLabel:   { color: C.gray, fontSize: 14 },
  trustScore:      { fontSize: 16, fontWeight: '700' },
  progressBg:      { backgroundColor: C.card2, borderRadius: 4, height: 6, marginTop: 8, overflow: 'hidden' },
  progressFill:    { height: 6, borderRadius: 4 },
  trustNote:       { color: C.gray, fontSize: 12, marginTop: 8, lineHeight: 18 },
  cardTitle:       { color: C.white, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  infoRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.card2 },
  infoLabel:       { color: C.gray, fontSize: 14 },
  infoValue:       { color: C.white, fontSize: 14, fontWeight: '600' },
  checkRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  checkCircle:     { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  checkLabel:      { fontSize: 14, marginLeft: 10 },
  settingsList:    { backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, marginTop: 12, overflow: 'hidden' },
  settingsRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20 },
  settingsLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsText:    { color: C.white, fontSize: 15 },
  settingsDivider: { height: 1, backgroundColor: C.card2 },
});
