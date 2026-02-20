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
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
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

// ─── Insert Between Separator ────────────────────────────────────────────────

interface InsertSeparatorProps {
  onInsert: () => void
  label: string
}

function InsertSeparator({ onInsert, label }: InsertSeparatorProps) {
  return (
    <TouchableOpacity
      style={styles.insertSeparator}
      onPress={onInsert}
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={{ top: 4, bottom: 4, left: 16, right: 16 }}
    >
      <View style={styles.insertSeparatorLine} />
      <View style={styles.insertSeparatorIcon}>
        <Feather name="plus" size={10} color="#D97398" />
      </View>
      <View style={styles.insertSeparatorLine} />
    </TouchableOpacity>
  )
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
      {/* Left: round label + content */}
      <Text style={styles.roundBadgeText}>R{index + 1}</Text>

      <View style={styles.roundInfo}>
        <View style={styles.roundTitleRow}>
          <Text style={styles.roundStitchCount}>{hasItems ? `${totalStitches} 針` : '尚無針法'}</Text>
        </View>

        {hasItems && (
          <Text style={styles.roundSubtitle} numberOfLines={3}>
            {itemSummaries.join('、')}
          </Text>
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
          onPress={onMoveUp}
          disabled={isFirst}
          accessibilityLabel="上移段落"
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather name="chevron-up" size={20} color={isFirst ? '#d1d5db' : '#6b7280'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onMoveDown}
          disabled={isLast}
          accessibilityLabel="下移段落"
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather name="chevron-down" size={20} color={isLast ? '#d1d5db' : '#6b7280'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          accessibilityLabel="刪除段落"
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <MaterialCommunityIcons name="delete-outline" size={18} color="#6b7280" />
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

  function handleAddRound(insertAfterIndex?: number) {
    if (!activeChart) return
    const newRound = addRound(project!.id, activeChart.id, insertAfterIndex)
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
            <Feather name="edit" size={16} color="#6b7280" />
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
          ItemSeparatorComponent={({ leadingItem }: { leadingItem: Round }) => {
            const leadingIndex = rounds.indexOf(leadingItem)
            return (
              <InsertSeparator
                onInsert={() => handleAddRound(leadingIndex)}
                label={`在第 ${leadingIndex + 1} 段後插入新段落`}
              />
            )
          }}
        />
      )}

      {/* ── Add round button (pinned to bottom) ─────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addRoundButton}
          onPress={() => handleAddRound()}
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
    marginLeft: 8,
  },

  // Rounds list
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  // Insert separator (between round rows)
  insertSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    paddingVertical: 4,
  },
  insertSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  insertSeparatorIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D97398',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
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
  roundBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97398',
    flexShrink: 0,
    marginTop: 1,
    minWidth: 28,
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
  roundStitchCount: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  roundSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
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
    gap: 6,
    flexShrink: 0,
    paddingTop: 2,
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
