import { useEffect } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { logScreenView } from '../src/services'
import { SCREEN_NAMES } from '../src/constants'

// ─── GuideScreen ──────────────────────────────────────────────────────────────

export default function GuideScreen() {
  const { t } = useTranslation()

  // Analytics: log screen view on mount (Req 10.2)
  useEffect(() => {
    logScreenView(SCREEN_NAMES.GUIDE)
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic header title */}
      <Stack.Screen options={{ title: t('guide.title') }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Section 1 ─────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('guide.addProjectTitle')}</Text>
          <View style={styles.card}>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepText}>{t('guide.addProject1')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepText}>{t('guide.addProject2')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepText}>{t('guide.addProject3')}</Text>
            </View>
          </View>
        </View>

        {/* ── Section 2 ─────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('guide.buildChartTitle')}</Text>
          <View style={styles.card}>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepText}>{t('guide.buildChart1')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepText}>{t('guide.buildChart2')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepText}>{t('guide.buildChart3')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>4</Text>
              </View>
              <Text style={styles.stepText}>{t('guide.buildChart4')}</Text>
            </View>
          </View>
        </View>

        {/* ── Section 3 ─────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('guide.trackTitle')}</Text>
          <View style={styles.card}>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepText}>{t('guide.track1')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepText}>{t('guide.track2')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepText}>{t('guide.track3')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>4</Text>
              </View>
              <Text style={styles.stepText}>{t('guide.track4')}</Text>
            </View>
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
    paddingBottom: 32,
  },

  // Section
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D2D2D',
    paddingHorizontal: 4,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  // Step row
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C4527F',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    paddingTop: 4,
  },
})
