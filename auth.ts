/** Hanzo IAM sign-in: OAuth 2.0 authorization code + PKCE, in the system browser.
 *
 *  Deliberately NOT a username/password form. A native app that collects the
 *  password owns it — it lands in the JS heap, in accessibility trees, in
 *  screenshots — and Apple rejects apps that do this for third-party identity.
 *  PKCE keeps the secret out of the app entirely: the app never holds anything
 *  a stolen bundle could replay, so no client secret is shipped.
 *
 *  Tokens go to expo-secure-store (Keychain on iOS, Keystore on Android),
 *  never AsyncStorage.
 */
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

export const ISSUER = 'https://iam.hanzo.ai';
export const CLIENT_ID = 'hanzo-mobile'; // register your own <org>-<app> client

const KEY = 'hanzo.session';

export type Session = { token: string; refresh?: string; sub?: string; email?: string; name?: string };

let session: Session | null = null;
let ready = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const snap = () => session;

// SecureStore has no web backend; the browser demo keeps the session in memory.
const store = {
  get: () => (Platform.OS === 'web' ? Promise.resolve(null) : SecureStore.getItemAsync(KEY)),
  set: (v: string) => (Platform.OS === 'web' ? Promise.resolve() : SecureStore.setItemAsync(KEY, v)),
  del: () => (Platform.OS === 'web' ? Promise.resolve() : SecureStore.deleteItemAsync(KEY)),
};

export function useSession() {
  useEffect(() => {
    if (ready) return;
    ready = true;
    store.get().then((raw) => {
      if (raw) { session = JSON.parse(raw); emit(); }
    });
  }, []);
  return useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), snap, snap);
}

/** Decodes the id_token payload for display. NOT verification — the token is
 *  only ever trusted by the API that checks its signature. */
const claims = (jwt: string): Partial<Session> => {
  try {
    const b = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b.padEnd(b.length + ((4 - (b.length % 4)) % 4), '=')));
  } catch { return {}; }
};

export async function signIn(): Promise<void> {
  const discovery = await AuthSession.fetchDiscoveryAsync(ISSUER);
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'expo-auth', path: 'callback' });

  const req = new AuthSession.AuthRequest({
    clientId: CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    usePKCE: true,
  });

  const res = await req.promptAsync(discovery);
  if (res.type !== 'success') throw new Error(res.type === 'error' ? res.error?.message ?? 'error' : res.type);

  const tok = await AuthSession.exchangeCodeAsync(
    { clientId: CLIENT_ID, code: res.params.code, redirectUri, extraParams: { code_verifier: req.codeVerifier! } },
    discovery,
  );

  const next: Session = {
    token: tok.accessToken,
    refresh: tok.refreshToken,
    ...claims(tok.idToken ?? tok.accessToken),
  };
  session = next;
  await store.set(JSON.stringify(next));
  emit();
}

export async function signOut(): Promise<void> {
  session = null;
  await store.del();
  emit();
}
