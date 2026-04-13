import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { TrendingUp, TrendingDown, Shield, DollarSign } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.126:5000';

const C = {
  bg: '#0a0a0a', card: '#0f0f0f', card2: '#1a1a1a',
  orange: '#f97316', white: '#ffffff', gray: '#9ca3af',
  darkGray: '#374151', green: '#22c55e', red: '#ef4444', blue: '#3b82f6',
};

export default function EarningsScreen() {
  const { workerId } = useAuth();
  const [payoutData, setPayoutData] = useState<any>(null);
  const [profile,    setProfile]    = useState<any>(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!workerId) return;
    Promise.all([
      fetch(`${BACKEND_URL}/worker/payouts/${workerId}`).then(r => r.json()),
      fetch(`${BACKEND_URL}/worker/profile/${workerId}`).then(r => r.json()),
    ])
      .then(([pd, pr]) => { setPayoutData(pd); setProfile(pr); setLoading(false); })
      .catch(() => setLoading(false));
  }, [workerId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={C.orange} size="large" />
      </SafeAreaView>
    );
  }

  const payouts       = payoutData?.payouts || [];
  const totalReceived = payoutData?.totalPayout || 0;
  const count         = payoutData?.count || 0;
  const weekly        = profile?.weeklyPremium || 79;
  const plan          = profile?.plan || 'standard';

  // Calculate weeks active (from first payout)
  const weeksActive = payouts.length > 0
    ? Math.max(1, Math.ceil((Date.now() - new Date(payouts[payouts.length - 1].timestamp).getTime()) / (7 * 86400000)))
    : 4;

  const totalPremiumPaid = weeksActive * weekly;
  const roi              = totalPremiumPaid > 0 ? ((totalReceived / totalPremiumPaid) - 1) * 100 : 0;
  const avgPerPayout     = count > 0 ? Math.round(totalReceived / count) : 0;
  const savingsVsTradit  = Math.round(totalReceived * 0.3); // 30% extra they'd miss with traditional insurance

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Earnings Intelligence</Text>
          <Text style={s.subtitle}>Your financial protection summary</Text>
        </View>

        {/* ROI Hero Card */}
        <View style={s.heroCard}>
          <Text style={s.heroLabel}>Insurance ROI</Text>
          <Text style={[s.heroValue, { color: roi >= 0 ? C.green : C.red }]}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(0)}%
          </Text>
          <Text style={s.heroSub}>
            Paid Rs. {totalPremiumPaid} in premiums · Received Rs. {totalReceived.toLocaleString('en-IN')} in payouts
          </Text>
          <View style={s.roiBar}>
            <View style={[s.roiFill, { width: `${Math.min(100, (totalReceived / Math.max(totalPremiumPaid, 1)) * 50)}%`, backgroundColor: roi >= 0 ? C.green : C.red }] as any} />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          {[
            { label: 'Total Received',    val: `Rs. ${totalReceived.toLocaleString('en-IN')}`, color: C.green  },
            { label: 'Total Premiums',    val: `Rs. ${totalPremiumPaid}`,                       color: C.white  },
            { label: 'Avg per Payout',    val: `Rs. ${avgPerPayout}`,                           color: C.orange },
            { label: 'Payouts Received',  val: String(count),                                   color: C.white  },
            { label: 'Weeks Active',      val: String(weeksActive),                             color: C.white  },
            { label: 'Claims Filed',      val: '0',                                             color: C.green  },
          ].map((item, i) => (
            <View key={i} style={s.statCard}>
              <Text style={[s.statVal, { color: item.color }]}>{item.val}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Advantage Card */}
        <View style={s.advantageCard}>
          <View style={s.advantageRow}>
            <Shield color={C.orange} size={20} />
            <Text style={s.advantageTitle}>Zero Admin Overhead</Text>
          </View>
          <Text style={s.advantageBody}>
            Traditional claim-based insurance would have taken 15–30 days to process each event.
            RiderShield credited Rs. {totalReceived.toLocaleString('en-IN')} in under 2 minutes per event.
          </Text>
          <View style={s.advantageDivider} />
          <View style={s.advantageRow}>
            <TrendingUp color={C.green} size={20} />
            <Text style={s.advantageTitle}>Extra value delivered: Rs. {savingsVsTradit.toLocaleString('en-IN')}</Text>
          </View>
          <Text style={s.advantageBody}>
            Estimated time and documentation costs saved vs. traditional insurance.
          </Text>
        </View>

        {/* Recent payouts mini-list */}
        {payouts.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Recent Activity</Text>
            {payouts.slice(0, 5).map((p: any, i: number) => {
              const date = p.timestamp
                ? new Date(p.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : '—';
              return (
                <View key={i} style={s.activityRow}>
                  <View>
                    <Text style={s.activityType}>{p.type || '—'} disruption</Text>
                    <Text style={s.activityDate}>{date} · {p.zone}</Text>
                  </View>
                  <Text style={s.activityAmount}>+Rs. {Math.round(p.payoutAmount || 0)}</Text>
                </View>
              );
            })}
          </>
        )}

        {/* Plan Upgrade Prompt */}
        {plan !== 'premium' && (
          <View style={s.upgradeCard}>
            <Text style={s.upgradeTitle}>Upgrade to Premium</Text>
            <Text style={s.upgradeBody}>
              Cover curfews, strikes + 12-hour coverage up to Rs. 1,500/week.
              Current plan: {plan.charAt(0).toUpperCase() + plan.slice(1)}.
            </Text>
            <Text style={s.upgradePrice}>Rs. 119 / week</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:         { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title:          { color: '#ffffff', fontSize: 26, fontWeight: '800' },
  subtitle:       { color: '#9ca3af', fontSize: 14, marginTop: 4 },
  heroCard:       { backgroundColor: '#0f0f0f', borderRadius: 20, marginHorizontal: 16, padding: 24, borderWidth: 1, borderColor: 'rgba(249,115,22,0.2)', marginBottom: 12 },
  heroLabel:      { color: '#9ca3af', fontSize: 12, marginBottom: 4 },
  heroValue:      { fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  heroSub:        { color: '#9ca3af', fontSize: 12, marginTop: 6, lineHeight: 18 },
  roiBar:         { height: 4, backgroundColor: '#1a1a1a', borderRadius: 2, marginTop: 12, overflow: 'hidden' },
  roiFill:        { height: 4, borderRadius: 2 },
  statsGrid:      { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 12 },
  statCard:       { width: '31%', backgroundColor: '#0f0f0f', borderRadius: 14, padding: 14, alignItems: 'center' },
  statVal:        { fontSize: 18, fontWeight: '800' },
  statLabel:      { color: '#9ca3af', fontSize: 10, marginTop: 4, textAlign: 'center' },
  advantageCard:  { backgroundColor: '#0f0f0f', borderRadius: 16, marginHorizontal: 16, padding: 20, marginBottom: 20 },
  advantageRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  advantageTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700', flex: 1 },
  advantageBody:  { color: '#9ca3af', fontSize: 13, lineHeight: 20 },
  advantageDivider:{ height: 1, backgroundColor: '#1a1a1a', marginVertical: 16 },
  sectionTitle:   { color: '#ffffff', fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
  activityRow:    { backgroundColor: '#0f0f0f', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityType:   { color: '#ffffff', fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  activityDate:   { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  activityAmount: { color: '#22c55e', fontSize: 18, fontWeight: '700' },
  upgradeCard:    { backgroundColor: 'rgba(168,85,247,0.08)', borderRadius: 16, marginHorizontal: 16, padding: 20, marginTop: 8, borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)' },
  upgradeTitle:   { color: '#a855f7', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  upgradeBody:    { color: '#9ca3af', fontSize: 13, lineHeight: 19 },
  upgradePrice:   { color: '#a855f7', fontSize: 20, fontWeight: '800', marginTop: 12 },
});
