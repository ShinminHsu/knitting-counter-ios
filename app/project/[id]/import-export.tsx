import { useEffect } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { logScreenView } from '../../../src/services'
import { SCREEN_NAMES } from '../../../src/constants'

// ─── ImportExportScreen ───────────────────────────────────────────────────────

export default function ImportExportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  // Analytics: log screen view on mount (Req 10.2)
  useEffect(() => {
    logScreenView(SCREEN_NAMES.IMPORT_EXPORT)
  }, [])

  function handleExport() {
    Alert.alert('匯出專案', '匯出功能將於後續版本實作。')
  }

  function handleImport() {
    Alert.alert('匯入專案', '匯入功能將於後續版本實作。')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic header title */}
      <Stack.Screen options={{ title: '匯入 / 匯出' }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Export section ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>匯出</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              將此專案的所有資料（織圖、進度、備註）匯出為檔案，方便備份或分享給他人。
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleExport}
              accessibilityLabel="匯出專案"
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>匯出專案</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Import section ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>匯入</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              從檔案匯入專案資料，可用於還原備份或接收他人分享的專案。
            </Text>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={handleImport}
              accessibilityLabel="匯入專案"
              accessibilityRole="button"
            >
              <Text style={styles.outlineButtonText}>匯入專案</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5f0',
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },

  // Section
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },

  // Buttons
  primaryButton: {
    backgroundColor: '#D97398',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  outlineButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D97398',
  },
  outlineButtonText: {
    color: '#D97398',
    fontSize: 16,
    fontWeight: '600',
  },
})
