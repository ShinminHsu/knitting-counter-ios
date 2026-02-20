import { useEffect } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { useKeepAwake } from 'expo-keep-awake'
import { useProjectStore } from '../../../src/stores'
import { logScreenView, logTrackingStarted } from '../../../src/services'
import { SCREEN_NAMES } from '../../../src/constants'

// ─── ProgressTrackingScreen ───────────────────────────────────────────────────

export default function ProgressTrackingScreen() {
  // Keep the screen awake during tracking (Req 4.1)
  useKeepAwake()

  const { id, chartId } = useLocalSearchParams<{ id: string; chartId?: string }>()
  const router = useRouter()

  const project = useProjectStore((s) => s.getProjectById(id ?? ''))

  // Analytics: log screen view and tracking started on mount (Req 10.2, 10.4)
  useEffect(() => {
    logScreenView(SCREEN_NAMES.PROGRESS_TRACKING)
    logTrackingStarted()
  }, [])

  // Project not found guard
  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>找不到此專案</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Resolve active chart from route param or project's current chart
  const resolvedChartId = chartId ?? project.currentChartId
  const activeChart =
    project.charts.find((c) => c.id === resolvedChartId) ?? project.charts[0] ?? null

  // Chart not found guard
  if (!activeChart) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>找不到織圖</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Placeholder handlers — full tracking logic implemented in Phase 11
  function handleNextStitch() {
    Alert.alert('下一針', '追蹤功能將於後續版本實作。')
  }

  function handlePreviousStitch() {
    Alert.alert('上一針', '追蹤功能將於後續版本實作。')
  }

  function handleResetRound() {
    Alert.alert('重新開始此圈', '追蹤功能將於後續版本實作。')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic header title */}
      <Stack.Screen options={{ title: activeChart.name }} />

      {/* ── Progress display ────────────────────────────────────────────────── */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>目前進度</Text>

        {/* Round number */}
        <View style={styles.counterBlock}>
          <Text style={styles.counterCaption}>圈數</Text>
          <Text style={styles.counterValue}>第 1 圈</Text>
        </View>

        {/* Stitch number */}
        <View style={styles.counterBlock}>
          <Text style={styles.counterCaption}>針數</Text>
          <Text style={styles.counterValue}>第 1 針</Text>
        </View>

        {/* Chart name context */}
        <Text style={styles.chartContext}>織圖：{activeChart.name}</Text>
      </View>

      {/* ── Action buttons ──────────────────────────────────────────────────── */}
      <View style={styles.actionsSection}>
        {/* Primary: next stitch */}
        <TouchableOpacity
          style={styles.nextStitchButton}
          onPress={handleNextStitch}
          accessibilityLabel="下一針"
          accessibilityRole="button"
        >
          <Text style={styles.nextStitchButtonText}>下一針</Text>
        </TouchableOpacity>

        {/* Secondary: previous stitch */}
        <TouchableOpacity
          style={styles.previousStitchButton}
          onPress={handlePreviousStitch}
          accessibilityLabel="上一針"
          accessibilityRole="button"
        >
          <Text style={styles.previousStitchButtonText}>上一針</Text>
        </TouchableOpacity>

        {/* Reset current round */}
        <TouchableOpacity
          style={styles.resetRoundButton}
          onPress={handleResetRound}
          accessibilityLabel="重新開始此圈"
          accessibilityRole="button"
        >
          <Text style={styles.resetRoundButtonText}>重新開始此圈</Text>
        </TouchableOpacity>
      </View>

      {/* No AdBanner on tracking screen */}
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5f0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  // Progress section
  progressSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  counterBlock: {
    alignItems: 'center',
    gap: 4,
  },
  counterCaption: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  counterValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#C4527F',
    letterSpacing: -1,
  },
  chartContext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 8,
  },

  // Action buttons
  actionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  nextStitchButton: {
    backgroundColor: '#D97398',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  nextStitchButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  previousStitchButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D97398',
  },
  previousStitchButtonText: {
    color: '#D97398',
    fontSize: 16,
    fontWeight: '600',
  },
  resetRoundButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetRoundButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },

  // Fallback buttons
  backButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D97398',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#D97398',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
})
