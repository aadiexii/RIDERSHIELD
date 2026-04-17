import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

const C = {
  bg: '#0a0a0a', card: '#0f0f0f', card2: '#1a1a1a',
  orange: '#f97316', white: '#ffffff', gray: '#9ca3af',
  darkGray: '#374151', green: '#22c55e', red: '#ef4444', blue: '#3b82f6'
};

export default function DocsScreen() {
  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.header}>
        <Text style={s.title}>Hackathon Guide</Text>
        <Text style={s.subTitle}>Demo Instructions for Judges</Text>
      </View>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        
        <View style={s.card}>
          <Text style={s.cardTitle}>1. Application Context</Text>
          <Text style={s.cardText}>
            This mobile application is for delivery drivers. It allows them to view active coverage zones, track no-claim rebates, and monitor completely automated parametic payouts triggered by severe weather or major disruptions.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>2. Triggering a Payout</Text>
          <Text style={s.cardText}>
            To see the core value proposition, navigate to the Orchestration Hub inside the Admin Dashboard on your PC. Locate the Simulation Studio and trigger a "Flood Event". 
            {'\n\n'}
            The background workers will propagate the climate trigger to this mobile application in real time.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>3. What to Observe</Text>
          <Text style={s.cardText}>
            Keep this mobile application open during the simulation. 
            {'\n'}• A high-priority banner will automatically slide down on the Home screen.
            {'\n'}• A +Rs. 300 parametric payout will automatically inject into the "Payouts" tab history without requiring a manual reload.
            {'\n'}• This entire sequence happens with zero human verification required.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>4. Tab Breakdown</Text>
          <Text style={s.cardText}>
            <Text style={s.bold}>Payouts: </Text>View all automated and manual insurance payouts.
            {'\n\n'}
            <Text style={s.bold}>Earnings: </Text>Monitor weekly streaks and calculate No-Claim Cashbacks.
            {'\n\n'}
            <Text style={s.bold}>Safety: </Text>Option to trigger manual coverage checks if AI fails.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  header:   { padding: 24, paddingTop: 32, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.card2 },
  title:    { color: C.white, fontSize: 32, fontWeight: '800' },
  subTitle: { color: C.orange, fontSize: 16, marginTop: 4, fontWeight: '600' },
  scroll:   { flex: 1 },
  content:  { padding: 16, paddingBottom: 40 },
  card:     { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: C.card2 },
  cardTitle:{ color: C.white, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  cardText: { color: C.gray, fontSize: 14, lineHeight: 22 },
  bold:     { color: C.white, fontWeight: '700' }
});
