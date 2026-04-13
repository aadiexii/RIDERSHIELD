import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { TrendingUp, CloudRain, Thermometer, Wind, Droplets, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.126:5000';

const C = {
  bg: '#0a0a0a', card: '#0f0f0f', card2: '#1a1a1a',
  orange: '#f97316', white: '#ffffff', gray: '#9ca3af',
  darkGray: '#374151', green: '#22c55e', blue: '#3b82f6',
  red: '#ef4444', cyan: '#06b6d4',
};

const TYPE_CONFIG: Record<string, { color: string; label: string; Icon: any }> = {
  rain:   { color: C.blue,   label: 'Rain',   Icon: CloudRain   },
  heat:   { color: C.orange, label: 'Heat',   Icon: Thermometer },
  smog:   { color: C.gray,   label: 'AQI',    Icon: Wind        },
  curfew: { color: C.red,    label: 'Curfew', Icon: AlertCircle },
  flood:  { color: C.cyan,   label: 'Flood',  Icon: Droplets    },
};

export default function PayoutsScreen() {
  const { workerId } = useAuth();
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workerId) return;
    fetch(`${BACKEND_URL}/worker/payouts/${workerId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [workerId]);

  const payouts = data?.payouts || [];
  const total   = data?.totalPayout || 0;
  const count   = data?.count || 0;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={C.orange} size="large" />
        <Text style={{ color: C.gray, marginTop: 12, fontSize: 13 }}>Loading payouts...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Payout History</Text>
          <Text style={s.subtitle}>Zero claims filed. All automatic.</Text>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { val: `Rs. ${total.toLocaleString('en-IN')}`, label: 'Total Received', valColor: C.orange },
            { val: String(count),                           label: 'Payouts',        valColor: C.white  },
            { val: '0',                                     label: 'Claims Filed',   valColor: C.white  },
          ].map((item, i) => (
            <View key={i} style={s.statCard}>
              <Text style={[s.statVal, { color: item.valColor }]}>{item.val}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* No payouts yet */}
        {payouts.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ color: C.gray, fontSize: 15 }}>No payouts yet</Text>
            <Text style={{ color: C.darkGray, fontSize: 13, marginTop: 6 }}>
              Payouts appear automatically when disruptions are detected
            </Text>
          </View>
        )}

        {/* Payout List */}
        {payouts.map((p: any, i: number) => {
          const cfg = TYPE_CONFIG[p.type] || TYPE_CONFIG['smog'];
          const date = p.timestamp ? new Date(p.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';
          return (
            <View key={i} style={[s.row, { borderLeftColor: cfg.color }]}>
              <View style={s.rowLeft}>
                <Text style={s.rowZone}>{p.zone || '—'}</Text>
                <View style={s.rowMeta}>
                  <View style={[s.typePill, { backgroundColor: cfg.color + '20', borderColor: cfg.color + '40' }]}>
                    <Text style={[s.typeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                  <Text style={s.dot}> · </Text>
                  <Text style={s.rowDate}>{date}</Text>
                  {p.razorpayPayoutId && (
                    <>
                      <Text style={s.dot}> · </Text>
                      <Text style={[s.rowDate, { color: C.green }]}>UPI ✓</Text>
                    </>
                  )}
                </View>
                <Text style={s.claimId} numberOfLines={1}>{p.claimId}</Text>
              </View>
              <View style={s.rowRight}>
                <Text style={s.rowAmount}>Rs. {Math.round(p.payoutAmount || 0)}</Text>
                <Text style={[s.paidText, { color: p.status === 'paid' ? C.green : C.orange }]}>
                  {p.status === 'paid' ? 'Paid' : p.status}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Total Card */}
        {payouts.length > 0 && (
          <View style={s.totalCard}>
            <View>
              <Text style={s.totalLabel}>Total Received</Text>
              <Text style={s.totalSub}>{count} automatic payout{count !== 1 ? 's' : ''}</Text>
            </View>
            <Text style={s.totalAmount}>Rs. {total.toLocaleString('en-IN')}</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:      { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title:       { color: '#ffffff', fontSize: 26, fontWeight: '800' },
  subtitle:    { color: '#9ca3af', fontSize: 14, marginTop: 4 },
  statsRow:    { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20, gap: 8 },
  statCard:    { flex: 1, backgroundColor: '#0f0f0f', borderRadius: 14, padding: 14, alignItems: 'center' },
  statVal:     { fontSize: 20, fontWeight: '800' },
  statLabel:   { color: '#9ca3af', fontSize: 11, marginTop: 4, textAlign: 'center' },
  row:         { backgroundColor: '#0f0f0f', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderLeftWidth: 3 },
  rowLeft:     { flex: 1 },
  rowZone:     { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  rowMeta:     { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  typePill:    { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  typeText:    { fontSize: 10, fontWeight: '600' },
  dot:         { color: '#9ca3af' },
  rowDate:     { color: '#9ca3af', fontSize: 12 },
  claimId:     { color: '#374151', fontSize: 10, marginTop: 4, fontFamily: 'monospace' },
  rowRight:    { alignItems: 'flex-end' },
  rowAmount:   { color: '#22c55e', fontSize: 18, fontWeight: '700' },
  paidText:    { fontSize: 11, marginTop: 2 },
  totalCard:   { backgroundColor: '#1a1a1a', marginHorizontal: 16, borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 32 },
  totalLabel:  { color: '#9ca3af', fontSize: 13 },
  totalSub:    { color: '#9ca3af', fontSize: 11, marginTop: 2 },
  totalAmount: { color: '#f97316', fontSize: 24, fontWeight: '800' },
});
