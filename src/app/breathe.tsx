import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Screen } from '@/components/ui';
import { usePalette } from '@/theme';

/** Box breathing: 4s in, 4s hold, 4s out, 4s hold — 4 rounds ≈ 1 minute. */
const PHASES = [
  { label: 'Breathe in', to: 1 },
  { label: 'Hold', to: 1 },
  { label: 'Breathe out', to: 0.55 },
  { label: 'Hold', to: 0.55 },
] as const;
const PHASE_MS = 4000;
const ROUNDS = 4;

export default function Breathe() {
  const c = usePalette();
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [scale] = useState(() => new Animated.Value(0.55));
  const finished = step >= PHASES.length * ROUNDS;
  const active = running && !finished;

  useEffect(() => {
    if (!running) return;
    if (step >= PHASES.length * ROUNDS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return;
    }
    const phase = PHASES[step % PHASES.length];
    Haptics.selectionAsync().catch(() => {});
    Animated.timing(scale, { toValue: phase.to, duration: PHASE_MS, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start();
    const t = setTimeout(() => setStep((s) => s + 1), PHASE_MS);
    return () => clearTimeout(t);
  }, [running, step, scale]);

  const label = finished ? 'Done. Go do thing #1.' : active ? PHASES[step % PHASES.length].label : 'Ready when you are';

  return (
    <Screen scroll={false} style={{ justifyContent: 'center' }}>
      <View style={styles.stage}>
        <Animated.View style={[styles.circle, { backgroundColor: c.primary, transform: [{ scale }] }]} />
        <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      </View>
      <Body muted style={{ textAlign: 'center' }}>
        {active ? `Round ${Math.floor(step / PHASES.length) + 1} of ${ROUNDS}` : 'Four rounds of box breathing — about a minute.'}
      </Body>
      <Button
        title={active ? 'Stop' : finished ? 'Again' : 'Start'}
        variant={active ? 'secondary' : 'primary'}
        onPress={() => {
          if (active) return setRunning(false);
          setStep(0);
          setRunning(true);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { height: 320, alignItems: 'center', justifyContent: 'center' },
  circle: { position: 'absolute', width: 280, height: 280, borderRadius: 140, opacity: 0.85 },
  label: { fontSize: 24, fontWeight: '800' },
});
