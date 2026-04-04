import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Shield, Zap, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';

const C = {
  bg:      '#0a0a0a',
  card:    '#0f0f0f',
  card2:   '#1a1a1a',
  orange:  '#f97316',
  white:   '#ffffff',
  gray:    '#9ca3af',
  muted:   '#6b7280',
  green:   '#22c55e',
};

const FEATURES = [
  { Icon: Shield, title: 'Zero Touch Claims',     desc: 'Disruption detected, payout automatic'   },
  { Icon: Zap,    title: 'Instant UPI Payout',    desc: 'Money in 2 minutes, no forms needed'     },
  { Icon: MapPin, title: 'Zone Based Protection', desc: 'Your entire zone covered automatically'  },
];

export default function OnboardingWelcome() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Logo — matches website navbar exactly */}
      <View style={s.logoRow}>
        <Text style={s.logoWhite}>RIDER</Text>
        <Text style={s.logoOrange}>SHIELD</Text>
      </View>

      {/* Tagline */}
      <Text style={s.tagline}>Income Protection for Delivery Partners</Text>

      {/* Subtle divider */}
      <View style={s.divider} />

      {/* Feature list */}
      <View style={s.featureList}>
        {FEATURES.map(({ Icon, title, desc }, i) => (
          <View key={i} style={s.featureRow}>
            <View style={s.featureIcon}>
              <Icon color={C.orange} size={20} strokeWidth={1.5} />
            </View>
            <View style={s.featureMeta}>
              <Text style={s.featureTitle}>{title}</Text>
              <Text style={s.featureDesc}>{desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bottom CTAs */}
      <View style={s.bottom}>
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => router.push('/onboarding/phone')}
          activeOpacity={0.85}
        >
          <Text style={s.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={s.signIn}>Already registered? Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: C.bg, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40, justifyContent: 'flex-start' },

  logoRow:       { flexDirection: 'row', alignItems: 'center' },
  logoWhite:     { color: C.white, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  logoOrange:    { color: C.orange, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },

  tagline:       { color: C.muted, fontSize: 14, marginTop: 8 },
  divider:       { height: 1, backgroundColor: C.card2, marginTop: 32, marginBottom: 32 },

  featureList:   { flex: 1 },
  featureRow:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 28 },
  featureIcon:   { width: 40, height: 40, backgroundColor: C.card2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureMeta:   { marginLeft: 16, flex: 1, paddingTop: 2 },
  featureTitle:  { color: C.white, fontSize: 15, fontWeight: '600' },
  featureDesc:   { color: C.muted, fontSize: 13, marginTop: 3, lineHeight: 18 },

  bottom:        { gap: 12 },
  primaryBtn:    { backgroundColor: C.orange, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText:{ color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  signIn:        { color: C.muted, fontSize: 14, textAlign: 'center' },
});
