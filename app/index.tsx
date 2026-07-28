import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { signOut, useSession } from '../auth';
import { t } from '../theme';

export default function Profile() {
  const session = useSession();
  if (!session) return null; // the guard in _layout is already redirecting

  const rows: [string, string][] = [
    ['Name', session.name ?? '—'],
    ['Email', session.email ?? '—'],
    ['Subject', session.sub ?? '—'],
    ['Refresh token', session.refresh ? 'stored in Keychain' : 'none'],
  ];

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ padding: t.pad, gap: 18, paddingTop: 64 }}>
      <Text style={s.h1}>Signed in</Text>
      <View style={s.group}>
        {rows.map(([k, v], i) => (
          <View key={k}>
            {i > 0 && <View style={s.hr} />}
            <View style={s.row}>
              <Text style={s.label}>{k}</Text>
              <Text style={s.value} numberOfLines={1}>{v}</Text>
            </View>
          </View>
        ))}
      </View>
      <Pressable style={s.btn} onPress={signOut}>
        <Text style={s.btnText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: t.bg },
  h1: { color: t.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.5 },
  group: { backgroundColor: t.card, borderRadius: t.radius, borderWidth: 1, borderColor: t.line, paddingHorizontal: t.pad },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, gap: 16 },
  hr: { height: 1, backgroundColor: t.line },
  label: { color: t.text, fontSize: 16 },
  value: { color: t.dim, fontSize: 15, flexShrink: 1 },
  btn: { borderRadius: t.radius, borderWidth: 1, borderColor: t.line, paddingVertical: 15, alignItems: 'center' },
  btnText: { color: '#ff6b6b', fontSize: 16, fontWeight: '600' },
});
