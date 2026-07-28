import { Slot, useRouter, useSegments } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useSession } from '../auth';
import { t } from '../theme';

/** The auth guard lives here, once. Every screen under app/ is protected by
 *  default; add a route name to PUBLIC to opt one out. */
const PUBLIC = ['sign-in'];

export default function RootLayout() {
  const session = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const isPublic = PUBLIC.includes(segments[0] ?? '');
    if (!session && !isPublic) router.replace('/sign-in');
    if (session && isPublic) router.replace('/');
  }, [session, segments, router]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Head>
        <title>Hanzo Auth</title>
      </Head>
      <StatusBar style="light" />
      <Slot />
    </View>
  );
}
