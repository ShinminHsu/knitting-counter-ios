import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'
import * as Haptics from 'expo-haptics'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import i18n from '../../../src/i18n'
import AdBanner from '../../../src/components/AdBanner'
import { useProjectStore } from '../../../src/stores'
import { useChartStore } from '../../../src/stores/useChartStore'
import { useSettingsStore } from '../../../src/stores/useSettingsStore'
import { logScreenView, logRoundAdded } from '../../../src/services'
import { SCREEN_NAMES } from '../../../src/constants'
import { PatternItem, PatternItemType, Round } from '../../../src/types'
import EditChartModal from '../../../src/components/EditChartModal'
import ScreenHeader from '../../../src/components/ScreenHeader'
import {
  calcRoundTotalStitches,
  getLocalizedStitchName,
  isStitchGroup,
  isStitchInfo,
} from '../../../src/utils/patternHelpers'

// ─── Pattern Item Summary ─────────────────────────────────────────────────────

function buildItemSummary(item: PatternItem): string {
  if (item.type === PatternItemType.STITCH && isStitchInfo(item.data)) {
    const label = getLocalizedStitchName(item.data, i18n.t)
    return `${label} × ${item.data.count}`
  }
  if (item.type === PatternItemType.GROUP && isStitchGroup(item.data)) {
    const group = item.data
    const sep = i18n.t('common.stitchListSep')
    const stitchSummary = group.stitches
      .map((s) => `${getLocalizedStitchName(s, i18n.t)} ${s.count}`)
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
  roundStartNumber: number
  isSelecting: boolean
  isSelected: boolean
  isActive: boolean
  drag: () => void
  onPress: () => void
  onLongPress: () => void
}

function RoundRow({
  round,
  index,
  roundStartNumber,
  isSelecting,
  isSelected,
  isActive,
  drag,
  onPress,
  onLongPress,
}: RoundRowProps) {
  const { t } = useTranslation()
  const swipeableRef = useRef<Swipeable>(null)
  const patternItems = round.patternItems ?? []
  const totalStitches = calcRoundTotalStitches(patternItems)
  const hasItems = patternItems.length > 0

  const itemSummaries = patternItems
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => buildItemSummary(item))
    .filter(Boolean)

  return (
    <View style={[styles.roundRowWrapper, isActive && styles.roundRowActive]}>
      {/* Drag handle — long-press triggers drag, separate from row long-press */}
      {!isSelecting && (
        <TouchableOpacity
          onLongPress={drag}
          delayLongPress={150}
          style={styles.dragHandle}
          accessibilityLabel={t('editor.dragHandle')}
          accessibilityRole="button"
        >
          <Feather name="menu" size={18} color="#9ca3af" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.roundRow}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={250}
        activeOpacity={0.75}
        accessibilityLabel={t('editor.editRoundLabel', { index: index + roundStartNumber })}
        accessibilityRole="button"
      >
        {/* Far left: checkbox (select mode only) */}
        {isSelecting && (
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={onPress}
            accessibilityRole="checkbox"
            accessibilityLabel={
              isSelected
                ? t('editor.deselectRoundLabel', { index: index + roundStartNumber })
                : t('editor.selectRoundLabel', { index: index + roundStartNumber })
            }
            accessibilityState={{ checked: isSelected }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && (
                <Feather name="check" size={14} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Middle: R badge on top, summary below, notes below */}
        <View style={styles.roundInfo}>
          <Text style={styles.roundBadgeText}>{t('editor.roundBadge', { index: index + roundStartNumber })}</Text>
          <Text style={styles.roundSummaryText}>
            {hasItems ? itemSummaries.join('、') : t('editor.noStitches')}
          </Text>
          {round.notes ? (
            <Text style={styles.roundNotes} numberOfLines={1}>{round.notes}</Text>
          ) : null}
        </View>

        {/* Right: stitch count (centered, hidden in select mode) */}
        {!isSelecting && hasItems && (
          <View style={styles.roundControls}>
            <Text style={styles.roundStitchCount}>{t('editor.stitchCount', { count: totalStitches })}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
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
  const duplicateRound = useChartStore((s) => s.duplicateRound)
  const reorderRounds = useChartStore((s) => s.reorderRounds)

  const hasSeenMultiSelectHint = useSettingsStore((s) => s.hasSeenMultiSelectHint)
  const markMultiSelectHintSeen = useSettingsStore((s) => s.markMultiSelectHintSeen)

  const [showEditChart, setShowEditChart] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)

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
  const roundStartNumber = activeChart.roundStartNumber ?? project.roundStartNumber ?? 1

  function handleAddRound(insertAfterIndex?: number) {
    if (!activeChart) return
    const newRound = addRound(project!.id, activeChart.id, insertAfterIndex)
    if (newRound) {
      logRoundAdded()
      router.push(
        `/project/${project!.id}/round?chartId=${activeChart!.id}&roundId=${newRound.id}`
      )
    } else {
      Alert.alert(t('common.error'), t('editor.addRoundError'))
    }
  }

  function handleAddRoundWithPrompt() {
    if (!activeChart) return
    Alert.prompt(
      t('editor.addRoundsTitle'),
      t('editor.addRoundsMessage'),
      (countStr) => {
        const count = parseInt(countStr ?? '1', 10)
        if (isNaN(count) || count < 1) return
        let firstNewRound = null
        for (let i = 0; i < count; i++) {
          const newRound = addRound(project!.id, activeChart!.id)
          if (i === 0) firstNewRound = newRound
          if (newRound) logRoundAdded()
        }
        if (count === 1 && firstNewRound) {
          router.push(
            `/project/${project!.id}/round?chartId=${activeChart!.id}&roundId=${firstNewRound.id}`
          )
        }
      },
      'plain-text',
      '1',
      'number-pad',
    )
  }

  function handleDeleteRound(roundId: string, roundIndex: number) {
    Alert.alert(
      t('editor.deleteRoundTitle'),
      t('editor.deleteRoundMessage', { index: roundIndex + roundStartNumber }),
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

  function handleLongPress(roundId: string) {
    if (!isSelecting) {
      markMultiSelectHintSeen()
      setIsSelecting(true)
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.add(roundId)
      return next
    })
  }

  function handleRowPress(round: Round) {
    if (isSelecting) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(round.id)) {
          next.delete(round.id)
        } else {
          next.add(round.id)
        }
        return next
      })
    } else {
      router.push({
        pathname: '/project/[id]/round',
        params: { id: project!.id, chartId: activeChart!.id, roundId: round.id },
      })
    }
  }

  function handleBatchDelete() {
    const count = selectedIds.size
    if (count === 0) return
    Alert.alert(
      t('editor.deleteSelectedTitle'),
      t('editor.deleteSelectedMessage', { count }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach((roundId) => {
              deleteRound(project!.id, activeChart!.id, roundId)
            })
            setIsSelecting(false)
            setSelectedIds(new Set())
          },
        },
      ]
    )
  }

  function handleBatchCopy() {
    Alert.prompt(
      t('editor.duplicateCopiesTitle'),
      t('editor.duplicateCopiesMessage'),
      (countStr) => {
        const count = parseInt(countStr ?? '1', 10)
        if (!isNaN(count) && count > 0) {
          const orderedIds = rounds
            .map((r) => r.id)
            .filter((id) => selectedIds.has(id))
          for (let i = 0; i < count; i++) {
            orderedIds.forEach((roundId) => {
              duplicateRound(project!.id, activeChart!.id, roundId)
            })
          }
          setIsSelecting(false)
          setSelectedIds(new Set())
        }
      },
      'plain-text',
      '1',
      'number-pad',
    )
  }

  function handleCancelSelect() {
    setIsSelecting(false)
    setSelectedIds(new Set())
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={activeChart.name} />

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
        <DraggableFlatList
          containerStyle={{ flex: 1 }}
          data={rounds}
          keyExtractor={(item: Round) => item.id}
          contentContainerStyle={styles.listContent}
          onDragBegin={() => {
            setIsDragging(true)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }}
          onDragEnd={({ data }) => {
            setIsDragging(false)
            reorderRounds(project!.id, activeChart!.id, data.map((r) => r.id))
          }}
          renderItem={({ item, getIndex, drag, isActive }: RenderItemParams<Round>) => {
            const index = getIndex() ?? 0
            return (
              <Swipeable
                enabled={!isDragging && !isSelecting}
                renderRightActions={() => (
                  <TouchableOpacity
                    style={styles.swipeDeleteButton}
                    onPress={() => handleDeleteRound(item.id, index)}
                    accessibilityLabel={t('common.deleteRound')}
                    accessibilityRole="button"
                  >
                    <Text style={styles.swipeDeleteText}>{t('common.delete')}</Text>
                  </TouchableOpacity>
                )}
              >
                <RoundRow
                  round={item}
                  index={index}
                  roundStartNumber={roundStartNumber}
                  isSelecting={isSelecting}
                  isSelected={selectedIds.has(item.id)}
                  isActive={isActive}
                  drag={drag}
                  onLongPress={() => handleLongPress(item.id)}
                  onPress={() => handleRowPress(item)}
                />
              </Swipeable>
            )
          }}
          ItemSeparatorComponent={({ leadingItem }: { leadingItem: Round }) => {
            const leadingIndex = rounds.indexOf(leadingItem)
            return (
              <InsertSeparator
                onInsert={() => handleAddRound(leadingIndex)}
                label={t('editor.insertAfter', { index: leadingIndex + roundStartNumber })}
              />
            )
          }}
        />
      )}

      {/* ── Hint text (long-press to multi-select) ──────────────────────────── */}
      {!isSelecting && !hasSeenMultiSelectHint && rounds.length > 0 && (
        <View style={styles.multiSelectHintBar}>
          <Text style={styles.multiSelectHintText}>{t('editor.multiSelectHint')}</Text>
        </View>
      )}

      {/* ── Footer: multi-select toolbar OR add round button ────────────────── */}
      {isSelecting ? (
        <View style={styles.footer}>
          <View style={styles.multiSelectToolbar}>
            {/* Cancel */}
            <TouchableOpacity
              style={styles.toolbarButtonCancel}
              onPress={handleCancelSelect}
              accessibilityLabel={t('common.cancel')}
              accessibilityRole="button"
            >
              <Text style={styles.toolbarButtonCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>

            {/* Copy */}
            <TouchableOpacity
              style={[styles.toolbarButtonAction, selectedIds.size === 0 && styles.toolbarButtonDisabled]}
              onPress={handleBatchCopy}
              disabled={selectedIds.size === 0}
              accessibilityLabel={t('editor.copySelected')}
              accessibilityRole="button"
            >
              <Text style={styles.toolbarButtonActionText}>{t('editor.copySelected')}</Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={[styles.toolbarButtonDelete, selectedIds.size === 0 && styles.toolbarButtonDisabled]}
              onPress={handleBatchDelete}
              disabled={selectedIds.size === 0}
              accessibilityLabel={t('editor.deleteSelected')}
              accessibilityRole="button"
            >
              <Text style={styles.toolbarButtonDeleteText}>{t('editor.deleteSelected')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addRoundButton}
            onPress={handleAddRoundWithPrompt}
            accessibilityLabel={t('editor.addRound')}
            accessibilityRole="button"
          >
            <Text style={styles.addRoundButtonText}>{t('editor.addRound')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <AdBanner />

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

  // Round row wrapper (drag handle + row)
  roundRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundRowActive: {
    opacity: 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dragHandle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Round row
  roundRow: {
    flex: 1,
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

  // Far left: checkbox (select mode)
  checkboxContainer: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D97398',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: '#D97398',
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
  // Swipe-to-delete action button
  swipeDeleteButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 10,
    marginLeft: 8,
  },
  swipeDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Multi-select hint bar
  multiSelectHintBar: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#faf5f0',
  },
  multiSelectHintText: {
    fontSize: 12,
    color: '#9ca3af',
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

  // Multi-select toolbar
  multiSelectToolbar: {
    flexDirection: 'row',
    gap: 10,
  },
  toolbarButtonCancel: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    minHeight: 44,
    justifyContent: 'center',
  },
  toolbarButtonCancelText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
  },
  toolbarButtonAction: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#6b7280',
    minHeight: 44,
    justifyContent: 'center',
  },
  toolbarButtonActionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  toolbarButtonDelete: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#ef4444',
    minHeight: 44,
    justifyContent: 'center',
  },
  toolbarButtonDeleteText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  toolbarButtonDisabled: {
    opacity: 0.4,
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
