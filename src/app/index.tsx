import { router, Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Field, H1, Label, Screen } from '@/components/ui';
import { distill, type Distilled } from '@/lib/distill';
import { uid, useStoredState } from '@/lib/storage';
import { usePalette } from '@/theme';

interface Session {
  id: string;
  at: number;
  actions: { text: string; done: boolean }[];
}

export default function Home() {
  const [onboarded, , onboardedReady] = useStoredState('onboarded', false);
  if (onboardedReady && !onboarded) return <Redirect href="/onboarding" />;
  return <HomeScreen />;
}

function HomeScreen() {
  const c = usePalette();
  const [dump, setDump] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Distilled | null>(null);
  const [sessions, setSessions] = useStoredState<Session[]>('sessions', []);

  const current = sessions[0];

  const run = async () => {
    setBusy(true);
    const r = await distill(dump);
    setResult(r);
    setSessions((s) => [{ id: uid(), at: Date.now(), actions: r.actions.map((text) => ({ text, done: false })) }, ...s].slice(0, 30));
    setDump('');
    setBusy(false);
  };

  const toggle = (i: number) =>
    setSessions((s) => s.map((sess, si) => (si === 0 ? { ...sess, actions: sess.actions.map((a, ai) => (ai === i ? { ...a, done: !a.done } : a)) } : sess)));

  return (
    <Screen>
      <H1>Empty your head.</H1>
      <Body muted>Write everything on your mind — tasks, worries, half-ideas. Flow hands you back three things to do.</Body>

      <Field label="Brain dump" multiline value={dump} onChangeText={setDump} placeholder="Reply to Ade about the invoice, gym?, pay rent before Friday, worried about the demo…" />
      <Button title={busy ? 'Distilling…' : 'Give me three things'} disabled={busy || dump.trim().length < 3} onPress={run} />
      {busy ? <ActivityIndicator color={c.primary} /> : null}

      {current ? (
        <Card>
          <Label>Your three{result?.source === 'offline' ? ' · offline suggestion' : ''}</Label>
          {current.actions.map((a, i) => (
            <Pressable key={i} onPress={() => toggle(i)} accessibilityRole="checkbox" accessibilityState={{ checked: a.done }} style={styles.item}>
              <View style={[styles.check, { borderColor: c.primary, backgroundColor: a.done ? c.primary : 'transparent' }]}>
                {a.done ? <Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text> : <Text style={{ color: c.primary, fontWeight: '800' }}>{i + 1}</Text>}
              </View>
              <Text style={[styles.itemText, { color: c.text, textDecorationLine: a.done ? 'line-through' : 'none', opacity: a.done ? 0.5 : 1 }]}>{a.text}</Text>
            </Pressable>
          ))}
          {current.actions.length === 0 ? <Body muted>Nothing actionable found — try listing a few concrete tasks.</Body> : null}
        </Card>
      ) : null}

      <Button title="Breathe first (1 minute)" variant="secondary" onPress={() => router.push('/breathe')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  check: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1, fontSize: 18, fontWeight: '600' },
});
