import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { CLIENT_ID, ISSUER, signIn } from '../auth';
import { t } from '../theme';

export default function SignIn() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const go = async () => {
    setBusy(true); setErr(null);
    try { await signIn(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  return (
    <View style={s.wrap}>
      <View style={s.mark}><Text style={s.markText}>H</Text></View>
      <Text style={s.h1}>Sign in</Text>
      <Text style={s.sub}>
        Opens {new URL(ISSUER).host} in the system browser. The password is never
        typed into this app.
      </Text>

      <Pressable style={[s.btn, busy && { opacity: 0.6 }]} onPress={go} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Continue with Hanzo</Text>}
      </Pressable>

      {err && <Text style={s.err}>{err}</Text>}
      <Text style={s.meta}>client_id {CLIENT_ID} · authorization_code + PKCE</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  mark: { width: 62, height: 62, borderRadius: 18, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  markText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  h1: { color: t.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.5 },
  sub: { color: t.dim, fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 330 },
  btn: { backgroundColor: t.accent, borderRadius: t.radius, paddingVertical: 15, paddingHorizontal: 28, alignItems: 'center', alignSelf: 'stretch', maxWidth: 360, marginTop: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  err: { color: '#ff6b6b', fontSize: 13, textAlign: 'center' },
  meta: { color: t.dim, fontSize: 12, marginTop: 6 },
});
