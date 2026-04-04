import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { ChevronLeft, Check, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';

const C = {
  bg: '#0a0a0a', card: '#0f0f0f', card2: '#1a1a1a',
  orange: '#f97316', white: '#ffffff', gray: '#9ca3af',
  darkGray: '#374151', green: '#22c55e',
};

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Rs. 49',
    amount: 49,
    features: ['Rain coverage only', '6 hours/day · Rs. 500 max payout'],
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 'Rs. 79',
    amount: 79,
    features: ['Rain + Heat + AQI coverage', '8 hours/day · Rs. 900 max payout'],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'Rs. 119',
    amount: 119,
    features: ['Full coverage matrix', '12 hours/day · Rs. 1500 max payout'],
    popular: false,
  },
];

export default function PlanScreen() {
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const selected = PLANS.find(p => p.id === selectedPlan)!;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ChevronLeft color={C.gray} size={24} />
        </TouchableOpacity>

        {/* Progress bar */}
        <View style={s.progressRow}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[s.progressSeg, i <= 2 && s.progressActive]} />
          ))}
        </View>

        <Text style={s.label}>Choose your</Text>
        <Text style={s.heading}>Coverage Plan</Text>
        <Text style={s.sub}>Flat weekly rate. Cancel anytime.</Text>

        {/* Plan Cards */}
        {PLANS.map(plan => {
          const isSelected = selectedPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.85}
              style={[
                s.planCard,
                isSelected ? s.planCardSelected : s.planCardDefault,
              ]}
            >
              <View style={s.planCardTop}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={s.planName}>{plan.name}</Text>
                    {plan.popular && (
                      <View style={s.popularBadge}>
                        <Text style={s.popularText}>Popular</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                    <Text style={s.planPrice}>{plan.price}</Text>
                    <Text style={s.planPer}>/week</Text>
                  </View>
                </View>
                {isSelected ? (
                  <View style={s.checkCircle}>
                    <Check color={C.white} size={14} />
                  </View>
                ) : (
                  <View style={s.uncheckCircle} />
                )}
              </View>

              <View style={s.planDivider} />

              {plan.features.map((feat, i) => (
                <View key={i} style={s.featRow}>
                  <View style={s.featDot} />
                  <Text style={s.featText}>{feat}</Text>
                </View>
              ))}
            </TouchableOpacity>
          );
        })}

        {/* ML Recommendation */}
        <View style={s.mlCard}>
          <TrendingUp color={C.orange} size={16} />
          <Text style={s.mlText}>
            {' '}Your zone risk score: 0.7 — Standard recommended
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={s.primaryBtnText}>
            Start Protection · {selected.price}/week
          </Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: C.bg, paddingHorizontal: 24, paddingTop: 16 },
  backBtn:           { marginBottom: 32 },
  progressRow:       { flexDirection: 'row', marginBottom: 32, gap: 4 },
  progressSeg:       { flex: 1, height: 3, backgroundColor: C.card2, borderRadius: 2 },
  progressActive:    { backgroundColor: C.orange },
  label:             { color: C.gray, fontSize: 16 },
  heading:           { color: C.white, fontSize: 28, fontWeight: '800' },
  sub:               { color: C.gray, fontSize: 14, marginBottom: 24, marginTop: 4 },

  planCard:          { borderRadius: 16, padding: 20, marginBottom: 12 },
  planCardSelected:  { borderWidth: 2, borderColor: C.orange, backgroundColor: 'rgba(249,115,22,0.05)' },
  planCardDefault:   { borderWidth: 1, borderColor: C.card2, backgroundColor: C.card },
  planCardTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName:          { color: C.white, fontSize: 17, fontWeight: '700' },
  popularBadge:      { backgroundColor: C.orange, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
  popularText:       { color: C.white, fontSize: 10, fontWeight: '700' },
  planPrice:         { color: C.orange, fontSize: 24, fontWeight: '800' },
  planPer:           { color: C.gray, fontSize: 13, marginLeft: 2 },
  checkCircle:       { width: 24, height: 24, backgroundColor: C.orange, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  uncheckCircle:     { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.darkGray },
  planDivider:       { height: 1, backgroundColor: C.card2, marginVertical: 12 },
  featRow:           { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  featDot:           { width: 6, height: 6, backgroundColor: C.orange, borderRadius: 3, marginRight: 10 },
  featText:          { color: C.gray, fontSize: 13 },

  mlCard:            { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginTop: 4, marginBottom: 16 },
  mlText:            { color: C.gray, fontSize: 12, flex: 1 },

  primaryBtn:        { backgroundColor: C.orange, borderRadius: 14, padding: 18, alignItems: 'center' },
  primaryBtnText:    { color: C.white, fontSize: 17, fontWeight: '700' },
});
