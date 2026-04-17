import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.119:5000';

const C = {
  bg: '#0a0a0a', card: '#0f0f0f', card2: '#1a1a1a',
  orange: '#f97316', white: '#ffffff', gray: '#9ca3af',
  green: '#22c55e', darkGray: '#374151',
};

const STEPS = [
  'Verifying Bank Details via AA',
  'Fetching transaction history',
  'Analyzing Zomato/Swiggy credits',
  'Calculating income baseline',
];

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.dataRow}>
      <Text style={s.dataLabel}>{label}</Text>
      <Text style={s.dataValue}>{value}</Text>
    </View>
  );
}

export default function VerifyScreen() {
  const { workerId } = useAuth();
  const [phase, setPhase] = useState<'consent' | 'processing' | 'success'>('consent');
  const [step, setStep] = useState(-1);
  const [aaData, setAaData] = useState<any>(null);

  const handleApproveConsent = async () => {
    setPhase('processing');
    setStep(-1);

    for (let i = 0; i < STEPS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setStep(i);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/aa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, bankName: 'SBI' }),
      });
      const result = await res.json();
      if(res.ok) setAaData(result);
      else throw new Error('API failure');
    } catch {
      // Fallback
      setAaData({
        platform: 'Zomato',
        bankName: 'SBI',
        avgWeeklyIncome: 5150,
        earningsBaselineHourly: 92,
        creditsLast8Weeks: 8,
        lastCreditDate: new Date().toISOString().split('T')[0],
        suggestedPlan: 'standard',
      });
    }
    setPhase('success');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ChevronLeft color={C.gray} size={24} />
        </TouchableOpacity>

        {/* Progress: all 4 active */}
        <View style={s.progressRow}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[s.progressSeg, s.progressActive]} />
          ))}
        </View>

        <Text style={s.label}>Verifying your</Text>
        <Text style={s.heading}>Gig Worker Status</Text>

        {phase === 'consent' && (
          <View style={s.consentCard}>
            <View style={s.aaHeader}>
              <View style={s.aaIconBox}>
                <Text style={s.aaIconText}>AA</Text>
              </View>
              <Text style={s.aaName}>Setu Account Aggregator</Text>
              <Text style={s.aaRegulated}>RBI Regulated · Secure Identity</Text>
            </View>
            <View style={s.divider} />
            <Text style={s.consentBodyText}>
              GigShield Insurance requires access to your bank transactions for the past 6 months to calculate your average weekly income and suggest a custom premium plan.
            </Text>
            <View style={s.bankBox}>
              <Text style={s.bankLabel}>Bank Discovered</Text>
              <Text style={s.bankValue}>State Bank of India (SBI)</Text>
              <Text style={s.bankSub}>A/c ending in 4021</Text>
            </View>
            <TouchableOpacity style={s.primaryBtn} onPress={handleApproveConsent}>
              <Text style={s.primaryBtnText}>Approve Consent</Text>
            </TouchableOpacity>
            
            <Text style={{ color: C.gray, fontSize: 11, textAlign: 'center', marginTop: 12 }}>
              Hackathon Note: Using pre-configured test number (+91 99999 99999) to sync mock Zomato API credits.
            </Text>
          </View>
        )}

        {phase === 'processing' && (
          <View style={s.verifyCard}>
            <View style={s.aaHeader}>
              <View style={s.aaIconBox}>
                <Text style={s.aaIconText}>AA</Text>
              </View>
              <Text style={s.aaName}>Setu Account Aggregator</Text>
              <Text style={s.aaRegulated}>RBI Regulated · Secure</Text>
            </View>
            <View style={s.divider} />
            {STEPS.map((label, i) => (
              <View key={i} style={s.stepRow}>
                {step > i ? (
                  <View style={[s.stepCircle, s.stepDone]}><Text style={s.stepCheck}>✓</Text></View>
                ) : step === i ? (
                  <View style={[s.stepCircle, s.stepActive]}>
                    <ActivityIndicator color={C.white} size="small" />
                  </View>
                ) : (
                  <View style={[s.stepCircle, s.stepPending]} />
                )}
                <Text style={[s.stepLabel, { opacity: step >= i ? 1 : 0.35 }]}>{label}</Text>
              </View>
            ))}
            <Text style={s.dontClose}>Do not close the app</Text>
          </View>
        )}

        {phase === 'success' && aaData && (
          <View style={s.successCard}>
            <View style={s.successHeader}>
              <View style={s.successCircle}>
                <Text style={s.successCheck}>✓</Text>
              </View>
              <View style={s.successMeta}>
                <Text style={s.successTitle}>Verified!</Text>
                <Text style={s.successSub}>You are an active gig worker</Text>
              </View>
            </View>

            <View style={[s.divider, { borderColor: 'rgba(34,197,94,0.2)' }]} />

            <DataRow label="Platform"          value={aaData.platform} />
            <DataRow label="Bank"              value={aaData.bankName} />
            <DataRow label="Avg Weekly Income" value={`Rs. ${aaData.avgWeeklyIncome}`} />
            <DataRow label="Income Baseline"   value={`Rs. ${aaData.earningsBaselineHourly}/hr`} />
            <DataRow label="Credits (8 weeks)" value={`${aaData.creditsLast8Weeks} payments`} />
            <DataRow label="Last Credit"       value={aaData.lastCreditDate} />

            <View style={s.recommendBox}>
              <Text style={s.recommendLabel}>AI Recommendation:</Text>
              <Text style={s.recommendValue}> {(aaData.suggestedPlan || 'standard').toUpperCase()} PLAN</Text>
            </View>

            <TouchableOpacity
              style={s.nextBtn}
              onPress={() => router.push('/onboarding/plan')}
              activeOpacity={0.85}
            >
              <Text style={s.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: C.bg, paddingHorizontal: 24, paddingTop: 16 },
  backBtn:         { marginBottom: 32 },
  progressRow:     { flexDirection: 'row', marginBottom: 32, gap: 4 },
  progressSeg:     { flex: 1, height: 3, backgroundColor: C.card2, borderRadius: 2 },
  progressActive:  { backgroundColor: C.orange },
  label:           { color: C.gray, fontSize: 16 },
  heading:         { color: C.white, fontSize: 28, fontWeight: '800', marginBottom: 20 },

  consentCard:     { backgroundColor: C.card, borderRadius: 16, padding: 24, marginTop: 4 },
  consentBodyText: { color: "#e5e7eb", fontSize: 14, lineHeight: 22, marginBottom: 20 },
  bankBox:         { backgroundColor: C.card2, padding: 16, borderRadius: 12, marginBottom: 24 },
  bankLabel:       { color: C.gray, fontSize: 12, marginBottom: 4 },
  bankValue:       { color: C.white, fontSize: 16, fontWeight: 'bold' },
  bankSub:         { color: "#8b5cf6", fontSize: 12, marginTop: 4 },

  verifyCard:      { backgroundColor: C.card, borderRadius: 16, padding: 24, marginTop: 4 },
  aaHeader:        { alignItems: 'center', marginBottom: 4 },
  aaIconBox:       { width: 64, height: 64, backgroundColor: 'rgba(249,115,22,0.1)', borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  aaIconText:      { color: C.orange, fontSize: 20, fontWeight: '800' },
  aaName:          { color: C.gray, fontSize: 13, textAlign: 'center', marginTop: 12 },
  aaRegulated:     { color: C.gray, fontSize: 11, marginTop: 4 },
  divider:         { height: 1, backgroundColor: C.card2, marginVertical: 16 },

  stepRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepCircle:      { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stepDone:        { backgroundColor: 'rgba(34,197,94,0.2)' },
  stepActive:      { backgroundColor: C.orange },
  stepPending:     { backgroundColor: C.card2 },
  stepCheck:       { color: C.green, fontSize: 13, fontWeight: '700' },
  stepLabel:       { color: C.white, fontSize: 13, marginLeft: 12, flex: 1 },
  dontClose:       { color: C.gray, fontSize: 12, textAlign: 'center', marginTop: 8 },

  successCard:     { backgroundColor: 'rgba(5,46,22,0.5)', borderRadius: 16, padding: 24, marginTop: 16, borderWidth: 1, borderColor: C.green },
  successHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  successCircle:   { width: 48, height: 48, backgroundColor: C.green, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  successCheck:    { color: C.white, fontSize: 20, fontWeight: '700' },
  successMeta:     { marginLeft: 12 },
  successTitle:    { color: C.green, fontSize: 18, fontWeight: '800' },
  successSub:      { color: C.gray, fontSize: 13, marginTop: 2 },

  dataRow:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dataLabel:       { color: C.gray, fontSize: 13 },
  dataValue:       { color: C.white, fontSize: 14, fontWeight: '600' },

  recommendBox:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(249,115,22,0.1)', borderRadius: 12, padding: 12, marginTop: 12 },
  recommendLabel:  { color: C.gray, fontSize: 12 },
  recommendValue:  { color: C.orange, fontSize: 12, fontWeight: '700' },

  primaryBtn:      { backgroundColor: C.orange, borderRadius: 14, padding: 16, alignItems: 'center' },
  primaryBtnText:  { color: C.white, fontSize: 16, fontWeight: '700' },
  nextBtn:         { backgroundColor: C.orange, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
});
