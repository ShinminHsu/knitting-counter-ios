import '../global.css';
import '../src/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import LottieView from 'lottie-react-native';
import { initializeAds } from '../src/services';

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [showLottie, setShowLottie] = useState(true)

  useEffect(() => {
    initializeAds()
    SplashScreen.hideAsync()
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
        <Text style={styles.splashTitle}>Welcome to Stitchie</Text>
      </View>
    )
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#faf5f0' },
          headerTintColor: '#D97398',
          headerTitleStyle: { color: '#2D2D2D' },
          contentStyle: { backgroundColor: '#faf5f0' },
        }}
      >
        <Stack.Screen name="index" options={{ title: '我的專案', headerShown: false }} />
        <Stack.Screen name="project/[id]/index" options={{ title: '專案詳細' }} />
        <Stack.Screen name="project/[id]/editor" options={{ title: '織圖編輯器' }} />
        <Stack.Screen name="project/[id]/tracking" options={{ title: '進度追蹤' }} />
        <Stack.Screen name="project/[id]/import-export" options={{ title: '匯入匯出' }} />
        <Stack.Screen name="project/[id]/round" options={{ title: '段落編輯' }} />
        <Stack.Screen name="pattern-elements" options={{ title: '針法庫' }} />
      </Stack>
    </>
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
