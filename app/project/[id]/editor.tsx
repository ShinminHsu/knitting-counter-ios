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
import { useTranslation } from 'react-i18next'
import i18n from '../../../src/i18n'
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
    const group = item.data
    const sep = i18n.t('common.stitchListSep')
    const stitchSummary = group.stitches
      .map((s) => `${getStitchLabel(s)} ${s.count}`)
      .join(sep)
    return stitchSummary
      ? i18n.t('common.groupSummary', { name: group.name, stitches: stitchSummary, count: group.repeatCount })
      : i18n.t('common.groupSummaryEmpty', { name: group.name, count: group.repeatCount })
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
      hitSlop={{ top: 6, bottom: 6, left: 16, right: 16 }}
    >
      <Feather name="plus" size={14} color="#d1d5db" />
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
  onDuplicate: (copies: number) => void
  onPress: () => void
}

function RoundRow({
  round,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
  onPress,
}: RoundRowProps) {
  const { t } = useTranslation()
  const totalStitches = calcRoundTotalStitches(round.patternItems)
  const hasItems = round.patternItems.length > 0

  const itemSummaries = round.patternItems
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => buildItemSummary(item))
    .filter(Boolean)

  function handleDuplicatePress() {
    Alert.prompt(
      t('editor.duplicateCopiesTitle'),
      t('editor.duplicateCopiesMessage'),
      (text) => {
        const n = parseInt(text, 10)
        if (!isNaN(n) && n >= 1 && n <= 20) {
          onDuplicate(n)
        }
      },
      'plain-text',
      '1',
      'number-pad'
    )
  }

  return (
    <TouchableOpacity
      style={styles.roundRow}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel={t('editor.editRoundLabel', { index: index + 1 })}
      accessibilityRole="button"
    >
      {/* Far left: ↑↓ arrows — vertically centered */}
      <View style={styles.roundArrowsCol}>
        <TouchableOpacity
          onPress={onMoveUp}
          disabled={isFirst}
          accessibilityLabel={t('editor.moveUpLabel')}
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather name="chevron-up" size={18} color={isFirst ? '#d1d5db' : '#9ca3af'} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onMoveDown}
          disabled={isLast}
          accessibilityLabel={t('editor.moveDownLabel')}
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather name="chevron-down" size={18} color={isLast ? '#d1d5db' : '#9ca3af'} />
        </TouchableOpacity>
      </View>

      {/* Middle: R badge on top, summary below, notes below */}
      <View style={styles.roundInfo}>
        <Text style={styles.roundBadgeText}>{t('editor.roundBadge', { index: index + 1 })}</Text>
        <Text style={styles.roundSummaryText} numberOfLines={3}>
          {hasItems ? itemSummaries.join('、') : t('editor.noStitches')}
        </Text>
        {round.notes ? (
          <Text style={styles.roundNotes} numberOfLines={1}>{round.notes}</Text>
        ) : null}
      </View>

      {/* Right: stitch count (centered) + vertical icon column */}
      <View style={styles.roundControls}>
        {hasItems && (
          <Text style={styles.roundStitchCount}>{t('editor.stitchCount', { count: totalStitches })}</Text>
        )}
        <View style={styles.roundIconsCol}>
          <TouchableOpacity
            onPress={handleDuplicatePress}
            accessibilityLabel={t('editor.duplicateRound')}
            accessibilityRole="button"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="copy" size={16} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            accessibilityLabel={t('editor.deleteRoundLabel')}
            accessibilityRole="button"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="trash-2" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ─── PatternEditorScreen ──────────────────────────────────────────────────────

export default function PatternEditorScreen() {
  const { t } = useTranslation()
  const { id, chartId } = useLocalSearchParams<{ id: string; chartId?: string }>()
  const router = useRouter()

  const project = useProjectStore((s) => s.getProjectById(id ?? ''))
  const addRound = useChartStore((s) => s.addRound)
  const deleteRound = useChartStore((s) => s.deleteRound)
  const moveRoundUp = useChartStore((s) => s.moveRoundUp)
  const moveRoundDown = useChartStore((s) => s.moveRoundDown)
  const duplicateRound = useChartStore((s) => s.duplicateRound)

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
          <Text style={styles.emptyText}>{t('editor.notFound')}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
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
          <Text style={styles.emptyText}>{t('editor.chartNotFound')}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
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
      Alert.alert(t('common.error'), t('editor.addRoundError'))
    }
    // Full round editing logic will be implemented in a later task
  }

  function handleDeleteRound(roundId: string, roundIndex: number) {
    Alert.alert(
      t('editor.deleteRoundTitle'),
      t('editor.deleteRoundMessage', { index: roundIndex + 1 }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
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
            <Text style={styles.chartRoundCount}>{t('editor.roundCount', { count: rounds.length })}</Text>
          </View>
          <TouchableOpacity
            style={styles.chartEditButton}
            onPress={() => setShowEditChart(true)}
            accessibilityLabel={t('editor.editChartLabel')}
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
            <Text style={styles.emptyStateTitle}>{t('editor.emptyTitle')}</Text>
            <Text style={styles.emptyStateHint}>
              {t('editor.emptyHint')}
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
              onDuplicate={(copies) => {
                for (let i = 0; i < copies; i++) {
                  duplicateRound(project!.id, activeChart!.id, item.id)
                }
              }}
              onPress={() =>
                router.push({
                  pathname: '/project/[id]/round',
                  params: { id: project!.id, chartId: activeChart!.id, roundId: item.id },
                })
              }
            />
          )}
          ItemSeparatorComponent={({ leadingItem }: { leadingItem: Round }) => {
            const leadingIndex = rounds.indexOf(leadingItem)
            return (
              <InsertSeparator
                onInsert={() => handleAddRound(leadingIndex)}
                label={t('editor.insertAfter', { index: leadingIndex + 1 })}
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
          accessibilityLabel={t('editor.addRound')}
          accessibilityRole="button"
        >
          <Text style={styles.addRoundButtonText}>{t('editor.addRound')}</Text>
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
    alignItems: 'center',
    paddingVertical: 2,
  },

  // Round row
  roundRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  // Far left: ↑↓ arrows — vertically centered
  roundArrowsCol: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  // Middle: content (R1, summary, notes stacked)
  roundInfo: {
    flex: 1,
    gap: 3,
  },
  roundBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97398',
  },
  roundSummaryText: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
    lineHeight: 18,
  },
  roundNotes: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 16,
  },

  // Right: stitch count centered + vertical icon column
  roundControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  roundStitchCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  roundIconsCol: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
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
