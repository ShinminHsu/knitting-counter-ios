import 'react-native-gesture-handler';
import '../global.css';
import '../src/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import { initializeAds, loadInterstitialAd } from '../src/services';
import { useOnboardingStore } from '../src/stores';
import OnboardingCarousel from '../src/components/OnboardingCarousel';

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { t } = useTranslation()
  const [showLottie, setShowLottie] = useState(true)
  const [showCarousel, setShowCarousel] = useState(false)
  const hasSeenCarousel = useOnboardingStore((s) => s.hasSeenCarousel)
  const markCarouselSeen = useOnboardingStore((s) => s.markCarouselSeen)

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
          onAnimationFinish={() => {
            setShowLottie(false)
            if (!hasSeenCarousel) {
              setShowCarousel(true)
            }
          }}
        />
        <Text style={styles.splashTitle}>{t('splash.welcome')}</Text>
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <OnboardingCarousel
        visible={showCarousel}
        onDismiss={() => {
          markCarouselSeen()
          setShowCarousel(false)
        }}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#faf5f0' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="project/[id]/index" />
        <Stack.Screen name="project/[id]/editor" />
        <Stack.Screen name="project/[id]/tracking" />
        <Stack.Screen name="project/[id]/import-export" />
        <Stack.Screen name="project/[id]/round" />
        <Stack.Screen name="pattern-elements" />
        <Stack.Screen name="settings" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
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
