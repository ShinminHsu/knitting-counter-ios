import { useEffect, useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { useProjectStore } from '../../../src/stores'
import { useChartStore } from '../../../src/stores/useChartStore'
import { logScreenView } from '../../../src/services'
import { SCREEN_NAMES } from '../../../src/constants'
import { PatternItem, PatternItemType, Round } from '../../../src/types'
import EditChartModal from '../../../src/components/EditChartModal'
import {
  calcRoundTotalStitches,
  getStitchLabel,
  isStitchGroup,
  isStitchInfo,
} from '../../../src/utils/patternHelpers'

// ─── Pattern Item Summary ─────────────────────────────────────────────────────

function buildItemSummary(item: PatternItem): string {
  if (item.type === PatternItemType.STITCH && isStitchInfo(item.data)) {
    const label = getStitchLabel(item.data)
    return `${label} × ${item.data.count}`
  }
  if (item.type === PatternItemType.GROUP && isStitchGroup(item.data)) {
    return `【${item.data.name}】× ${item.data.repeatCount}次`
  }
  return ''
}

// ─── Round Row ────────────────────────────────────────────────────────────────

interface RoundRowProps {
  round: Round
  index: number
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

function RoundRow({
  round,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
}: RoundRowProps) {
  const totalStitches = calcRoundTotalStitches(round.patternItems)
  const hasItems = round.patternItems.length > 0

  const itemSummaries = round.patternItems
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => buildItemSummary(item))
    .filter(Boolean)

  return (
    <View style={styles.roundRow} accessibilityLabel={`第 ${index + 1} 段`}>
      {/* Left: badge + content */}
      <View style={styles.roundBadge}>
        <Text style={styles.roundBadgeText}>{index + 1}</Text>
      </View>

      <View style={styles.roundInfo}>
        <View style={styles.roundTitleRow}>
          <Text style={styles.roundTitle}>第 {index + 1} 段</Text>
          {hasItems && (
            <Text style={styles.roundStitchCount}>共 {totalStitches} 針</Text>
          )}
        </View>

        {hasItems ? (
          <Text style={styles.roundSubtitle} numberOfLines={3}>
            {itemSummaries.join('、')}
          </Text>
        ) : (
          <Text style={styles.roundSubtitleEmpty}>尚無針法</Text>
        )}

        {round.notes ? (
          <Text style={styles.roundNotes} numberOfLines={1}>
            備註：{round.notes}
          </Text>
        ) : null}
      </View>

      {/* Right: reorder + delete controls */}
      <View style={styles.roundControls}>
        <TouchableOpacity
          style={[styles.controlButton, isFirst && styles.controlButtonDisabled]}
          onPress={onMoveUp}
          disabled={isFirst}
          accessibilityLabel="上移段落"
          accessibilityRole="button"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Text style={[styles.controlButtonText, isFirst && styles.controlButtonTextDisabled]}>
            ↑
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isLast && styles.controlButtonDisabled]}
          onPress={onMoveDown}
          disabled={isLast}
          accessibilityLabel="下移段落"
          accessibilityRole="button"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Text style={[styles.controlButtonText, isLast && styles.controlButtonTextDisabled]}>
            ↓
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.deleteButton]}
          onPress={onDelete}
          accessibilityLabel="刪除段落"
          accessibilityRole="button"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── PatternEditorScreen ──────────────────────────────────────────────────────

export default function PatternEditorScreen() {
  const { id, chartId } = useLocalSearchParams<{ id: string; chartId?: string }>()
  const router = useRouter()

  const project = useProjectStore((s) => s.getProjectById(id ?? ''))
  const addRound = useChartStore((s) => s.addRound)
  const deleteRound = useChartStore((s) => s.deleteRound)
  const moveRoundUp = useChartStore((s) => s.moveRoundUp)
  const moveRoundDown = useChartStore((s) => s.moveRoundDown)

  const [showEditChart, setShowEditChart] = useState(false)

  // Analytics: log screen view on mount (Req 10.2)
  useEffect(() => {
    logScreenView(SCREEN_NAMES.PATTERN_EDITOR)
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

  // Resolve active chart: prefer chartId from route params, else use project's currentChartId
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

  const rounds = activeChart.rounds

  function handleAddRound() {
    if (!activeChart) return
    const newRound = addRound(project!.id, activeChart.id)
    if (!newRound) {
      Alert.alert('錯誤', '新增段落失敗，請再試一次。')
    }
    // Full round editing logic will be implemented in a later task
  }

  function handleDeleteRound(roundId: string, roundIndex: number) {
    Alert.alert(
      '刪除段落',
      `確定要刪除第 ${roundIndex + 1} 段嗎？此操作無法復原。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: () => deleteRound(project!.id, activeChart!.id, roundId),
        },
      ]
    )
  }

  function handleMoveRoundUp(roundId: string) {
    moveRoundUp(project!.id, activeChart!.id, roundId)
  }

  function handleMoveRoundDown(roundId: string) {
    moveRoundDown(project!.id, activeChart!.id, roundId)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic header title via Stack.Screen */}
      <Stack.Screen options={{ title: activeChart.name }} />

      {/* ── Chart info bar ──────────────────────────────────────────────────── */}
      <View style={styles.chartInfoBar}>
        <View style={styles.chartInfoRow}>
          <View style={styles.chartInfoText}>
            <Text style={styles.chartName} numberOfLines={1}>
              {activeChart.name}
            </Text>
            <Text style={styles.chartRoundCount}>共 {rounds.length} 段</Text>
          </View>
          <TouchableOpacity
            style={styles.chartEditButton}
            onPress={() => setShowEditChart(true)}
            accessibilityLabel="編輯織圖名稱與備註"
          >
            <Text style={styles.chartEditButtonText}>✏️</Text>
          </TouchableOpacity>
        </View>
        {activeChart.notes ? (
          <Text style={styles.chartNotes}>{activeChart.notes}</Text>
        ) : null}
      </View>

      {/* ── Rounds list ─────────────────────────────────────────────────────── */}
      {rounds.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyScrollContent}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>尚無段落</Text>
            <Text style={styles.emptyStateHint}>
              點擊下方「新增段落」按鈕，開始建立你的織圖段落。
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={rounds}
          keyExtractor={(item: Round) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }: { item: Round; index: number }) => (
            <RoundRow
              round={item}
              index={index}
              isFirst={index === 0}
              isLast={index === rounds.length - 1}
              onMoveUp={() => handleMoveRoundUp(item.id)}
              onMoveDown={() => handleMoveRoundDown(item.id)}
              onDelete={() => handleDeleteRound(item.id, index)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* ── Add round button (pinned to bottom) ─────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addRoundButton}
          onPress={handleAddRound}
          accessibilityLabel="新增段落"
          accessibilityRole="button"
        >
          <Text style={styles.addRoundButtonText}>+ 新增段落</Text>
        </TouchableOpacity>
      </View>

      <EditChartModal
        visible={showEditChart}
        projectId={project.id}
        chart={activeChart}
        onClose={() => setShowEditChart(false)}
      />
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

  // Chart info bar
  chartInfoBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 6,
  },
  chartInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartInfoText: {
    flex: 1,
    gap: 2,
  },
  chartName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  chartRoundCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chartNotes: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  chartEditButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginLeft: 8,
  },
  chartEditButtonText: {
    fontSize: 16,
  },

  // Rounds list
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 2,
  },

  // Round row
  roundRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  roundBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  roundBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C4527F',
  },
  roundInfo: {
    flex: 1,
    gap: 3,
  },
  roundTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roundTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  roundStitchCount: {
    fontSize: 12,
    color: '#D97398',
    fontWeight: '500',
  },
  roundSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  roundSubtitleEmpty: {
    fontSize: 13,
    color: '#d1d5db',
  },
  roundNotes: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },

  // Round controls (reorder + delete)
  roundControls: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: '#f9fafb',
  },
  controlButtonText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600',
  },
  controlButtonTextDisabled: {
    color: '#d1d5db',
  },
  deleteButton: {
    backgroundColor: '#fff0f3',
    marginTop: 2,
  },
  deleteButtonText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '700',
  },

  // Empty state
  emptyScrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    maxWidth: 280,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#9ca3af',
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Footer / add button
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#faf5f0',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addRoundButton: {
    backgroundColor: '#D97398',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addRoundButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
