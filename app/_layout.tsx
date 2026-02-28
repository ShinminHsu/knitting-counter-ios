import 'react-native-gesture-handler';
import '../global.css';
import '../src/i18n';

import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import LottieView from 'lottie-react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { initializeAds, loadInterstitialAd } from '../src/services';

function BackHeaderButton({ label, tintColor }: { label?: string; tintColor?: string }) {
  const router = useRouter()
  const chevronColor = '#2D2D2D'
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={styles.backBtn}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Feather name="chevron-left" size={22} color={chevronColor} />
    </TouchableOpacity>
  )
}

function HomeHeaderButton() {
  const router = useRouter()
  return (
    <TouchableOpacity
      onPress={() => router.navigate('/')}
      style={styles.homeBtn}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Feather name="home" size={20} color="#6b7280" />
    </TouchableOpacity>
  )
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { t } = useTranslation()
  const [showLottie, setShowLottie] = useState(true)

  useEffect(() => {
    // ATT + AdMob init must complete in sequence, but must not block app startup
    // Splash hides immediately; ATT dialog appears on top of the app UI
    SplashScreen.hideAsync()

    const setupAds = async () => {
      // Step 1: Request ATT permission (shows iOS dialog on first launch)
      // Step 2: Initialize AdMob (runs after ATT resolves, regardless of outcome)
      await initializeAds()
      // Step 3: Preload interstitial ad in the background (non-blocking)
      loadInterstitialAd()
    }

    setupAds()
  }, [])

  if (showLottie) {
    return (
      <View style={styles.splash}>
        <LottieView
          source={require('../assets/circles-yarn.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
          onAnimationFinish={() => setShowLottie(false)}
        />
        <Text style={styles.splashTitle}>{t('splash.welcome')}</Text>
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#faf5f0' },
          headerTintColor: '#D97398',
          headerTitleStyle: { color: '#2D2D2D' },
          contentStyle: { backgroundColor: '#faf5f0' },
          headerLeft: ({ canGoBack, label, tintColor }) =>
            canGoBack ? <BackHeaderButton label={label} tintColor={tintColor} /> : null,
          headerRight: () => <HomeHeaderButton />,
        }}
      >
        <Stack.Screen name="index" options={{ title: t('projectList.title'), headerShown: false }} />
        <Stack.Screen name="project/[id]/index" options={{ title: t('projectDetail.title') }} />
        <Stack.Screen name="project/[id]/editor" options={{ title: t('editor.navTitle') }} />
        <Stack.Screen name="project/[id]/tracking" options={{ title: t('tracking.navTitle') }} />
        <Stack.Screen name="project/[id]/import-export" options={{ title: t('importExport.title') }} />
        <Stack.Screen name="project/[id]/round" options={{ title: t('round.navTitle') }} />
        <Stack.Screen name="pattern-elements" options={{ title: t('patternElements.title') }} />
        <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtn: {
    borderRadius: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splash: {
    flex: 1,
    backgroundColor: '#faf5f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 120,
    height: 120,
  },
  splashTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#D97398',
    letterSpacing: 0.5,
  },
})
