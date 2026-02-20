import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initializeAds } from '../src/services';

export default function RootLayout() {
  useEffect(() => {
    initializeAds()
  }, [])

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
        <Stack.Screen name="pattern-elements" options={{ title: '針法庫' }} />
      </Stack>
    </>
  );
}
