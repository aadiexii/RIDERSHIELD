import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, SafeAreaView,
} from 'react-native';
import { TrendingUp, CloudRain, Thermometer, Wind, Droplets, AlertCircle } from 'lucide-react-native';

const C = {
  bg:      '#0a0a0a',
  card:    '#0f0f0f',
  card2:   '#1a1a1a',
  orange:  '#f97316',
  white:   '#ffffff',
  gray:    '#9ca3af',
  darkGray:'#374151',
  green:   '#22c55e',
  blue:    '#3b82f6',
  red:     '#ef4444',
  cyan:    '#06b6d4',
};

const TYPE_CONFIG: Record<string, { color: string; Icon: any }> = {
  Rain:   { color: C.blue,   Icon: CloudRain   },
  Heat:   { color: C.orange, Icon: Thermometer },
  AQI:    { color: C.gray,   Icon: Wind        },
  Curfew: { color: C.red,    Icon: AlertCircle },
  Flood:  { color: C.cyan,   Icon: Droplets    },
};

const PAYOUTS = [
  { zone: 'Noida Sector 18', type: 'Rain',   date: '28 Mar', amount: 'Rs. 245' },
  { zone: 'Delhi Rohini',    type: 'AQI',    date: '21 Mar', amount: 'Rs. 180' },
  { zone: 'Noida Sector 18', type: 'Heat',   date: '14 Mar', amount: 'Rs. 210' },
  { zone: 'Lucknow',         type: 'Curfew', date: '07 Mar', amount: 'Rs. 320' },
  { zone: 'Noida Sector 18', type: 'Rain',   date: '28 Feb', amount: 'Rs. 195' },
  { zone: 'Delhi Rohini',    type: 'Flood',  date: '21 Feb', amount: 'Rs. 410' },
  { zone: 'Noida Sector 18', type: 'AQI',    date: '14 Feb', amount: 'Rs. 155' },
  { zone: 'Gurugram',        type: 'Heat',   date: '07 Feb', amount: 'Rs. 240' },
];

export default function PayoutsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Payout History</Text>
          <Text style={s.subtitle}>Zero claims filed. All automatic.</Text>
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          {[
            { val: 'Rs. 1,955', label: 'Total Received', valColor: C.orange },
            { val: '8',         label: 'Payouts',        valColor: C.white  },
            { val: '0',         label: 'Claims Filed',   valColor: C.white  },
          ].map((item, i) => (
            <View key={i} style={s.statCard}>
              <Text style={[s.statVal, { color: item.valColor }]}>{item.val}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Payout List */}
        {PAYOUTS.map((p, i) => {
          const cfg = TYPE_CONFIG[p.type] || TYPE_CONFIG['AQI'];
          return (
            <View key={i} style={[s.row, { borderLeftColor: cfg.color }]}>
              <View style={s.rowLeft}>
                <Text style={s.rowZone}>{p.zone}</Text>
                <View style={s.rowMeta}>
                  <View style={[s.typePill, { backgroundColor: cfg.color + '20', borderColor: cfg.color + '40' }]}>
                    <Text style={[s.typeText, { color: cfg.color }]}>{p.type}</Text>
                  </View>
                  <Text style={s.dot}> · </Text>
                  <Text style={s.rowDate}>{p.date}</Text>
                </View>
              </View>
              <View style={s.rowRight}>
                <Text style={s.rowAmount}>{p.amount}</Text>
                <Text style={s.paidText}>Paid</Text>
              </View>
            </View>
          );
        })}

        {/* Total Card */}
        <View style={s.totalCard}>
          <View>
            <Text style={s.totalLabel}>Total Received</Text>
            <Text style={s.totalSub}>8 automatic payouts</Text>
          </View>
          <Text style={s.totalAmount}>Rs. 1,955</Text>
        </View>

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
  statVal:     { fontSize: 22, fontWeight: '800' },
  statLabel:   { color: '#9ca3af', fontSize: 11, marginTop: 4, textAlign: 'center' },

  row:         { backgroundColor: '#0f0f0f', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderLeftWidth: 3 },
  rowLeft:     { flex: 1 },
  rowZone:     { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  rowMeta:     { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  typePill:    { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  typeText:    { fontSize: 10, fontWeight: '600' },
  dot:         { color: '#9ca3af' },
  rowDate:     { color: '#9ca3af', fontSize: 12 },
  rowRight:    { alignItems: 'flex-end' },
  rowAmount:   { color: '#22c55e', fontSize: 18, fontWeight: '700' },
  paidText:    { color: '#22c55e', fontSize: 11, marginTop: 2 },

  totalCard:   { backgroundColor: '#1a1a1a', marginHorizontal: 16, borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 32 },
  totalLabel:  { color: '#9ca3af', fontSize: 13 },
  totalSub:    { color: '#9ca3af', fontSize: 11, marginTop: 2 },
  totalAmount: { color: '#f97316', fontSize: 24, fontWeight: '800' },
});
