import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { Shield, Check, ChevronRight, LogOut, Bell, Lock } from 'lucide-react-native';

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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false}>

        {/* Avatar + Name */}
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarInitial}>RK</Text>
          </View>
          <Text style={s.workerName}>Rahul Kumar</Text>
          <Text style={s.workerZone}>Noida Sector 18</Text>
          <View style={s.planPill}>
            <Text style={s.planPillText}>Standard Plan · Active</Text>
          </View>
        </View>

        {/* Trust Score Card */}
        <View style={s.card}>
          <View style={s.cardRow}>
            <Text style={s.cardGrayLabel}>Trust Score</Text>
            <Text style={s.trustScore}>78 / 100</Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: '78%' }]} />
          </View>
          <Text style={s.trustNote}>High Trust — 2 Safety Mode activations this week</Text>
        </View>

        {/* Plan Details Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>My Plan</Text>
          <InfoRow label="Plan"              value="Standard"           />
          <InfoRow label="Weekly Premium"    value="Rs. 79"             />
          <InfoRow label="Coverage"          value="8 hours / day"      />
          <InfoRow label="Max Payout"        value="Rs. 900 / week"     />
          <InfoRow label="Next Renewal"      value="Auto · 07 Apr 2026" />
        </View>

        {/* Verification Status Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Verification Status</Text>
          {[
            'Aadhaar Verified',
            'PAN Verified',
            'Face Match Complete',
            'Account Aggregator Linked',
          ].map((item, i) => (
            <View key={i} style={s.checkRow}>
              <View style={s.checkCircle}>
                <Check color={C.green} size={12} strokeWidth={3} />
              </View>
              <Text style={s.checkLabel}>{item}</Text>
            </View>
          ))}
          <Text style={s.biometricLabel}>3-Tier Biometric Security Active</Text>
        </View>

        {/* Settings List */}
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
          <TouchableOpacity style={s.settingsRow}>
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
  avatarSection:  { alignItems: 'center', paddingTop: 32, paddingBottom: 20 },
  avatar:         { width: 80, height: 80, borderRadius: 40, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { color: C.white, fontSize: 28, fontWeight: '800' },
  workerName:     { color: C.white, fontSize: 22, fontWeight: '800', marginTop: 12, letterSpacing: -0.3 },
  workerZone:     { color: C.gray, fontSize: 14, marginTop: 4 },
  planPill:       { marginTop: 8, backgroundColor: 'rgba(249,115,22,0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  planPillText:   { color: C.orange, fontSize: 12, fontWeight: '600' },

  card:           { backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 20 },
  cardRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardGrayLabel:  { color: C.gray, fontSize: 14 },
  trustScore:     { color: C.orange, fontSize: 16, fontWeight: '700' },
  progressBg:     { backgroundColor: C.card2, borderRadius: 4, height: 6, marginTop: 8, overflow: 'hidden' },
  progressFill:   { backgroundColor: C.orange, height: 6, borderRadius: 4 },
  trustNote:      { color: C.gray, fontSize: 12, marginTop: 8 },

  cardTitle:      { color: C.white, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  infoRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.card2 },
  infoLabel:      { color: C.gray, fontSize: 14 },
  infoValue:      { color: C.white, fontSize: 14, fontWeight: '600' },

  checkRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  checkCircle:    { width: 20, height: 20, backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  checkLabel:     { color: C.white, fontSize: 14, marginLeft: 10 },
  biometricLabel: { color: C.orange, fontSize: 12, marginTop: 8, fontWeight: '600' },

  settingsList:   { backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, marginTop: 12, overflow: 'hidden' },
  settingsRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20 },
  settingsLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsText:   { color: C.white, fontSize: 15 },
  settingsDivider:{ height: 1, backgroundColor: C.card2 },
});
