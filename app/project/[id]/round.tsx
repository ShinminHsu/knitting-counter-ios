import { useRef, useState } from 'react'
import * as Haptics from 'expo-haptics'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'
import { Swipeable } from 'react-native-gesture-handler'
import { Feather } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import i18n from '../../../src/i18n'
import { useProjectStore } from '../../../src/stores'
import { usePatternStore } from '../../../src/stores/usePatternStore'
import { useTemplateStore } from '../../../src/stores/useTemplateStore'
import { useChartStore } from '../../../src/stores/useChartStore'
import { CraftType, CustomStitchPattern, PatternItem, PatternItemType, StitchGroup, StitchInfo, StitchType } from '../../../src/types'
import StitchPicker from '../../../src/components/StitchPicker'
import GroupEditor, { GroupEditorResult } from '../../../src/components/GroupEditor'
import {
  getStitchLabel,
  isStitchInfo,
  isStitchGroup,
  calcRoundTotalStitches,
} from '../../../src/utils/patternHelpers'
import { StitchTypeInfo } from '../../../src/types'

// ─── Stitch Editor Modal ──────────────────────────────────────────────────────

interface StitchEditorProps {
  title: string
  stitchType: StitchType
  count: number
  craftType: CraftType
  onConfirm: (stitchType: StitchType, count: number) => void
  onCancel: () => void
}

function StitchEditor({ title, stitchType, count: initialCount, craftType, onConfirm, onCancel }: StitchEditorProps) {
  const { t } = useTranslation()
  const [currentType, setCurrentType] = useState(stitchType)
  const [count, setCount] = useState(initialCount)
  const [showChangePicker, setShowChangePicker] = useState(false)

  return (
    <>
      <View style={styles.countEditorOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.countEditorKAV}
        >
        <View style={styles.countEditorBox}>
          <Text style={styles.countEditorTitle}>{title}</Text>

          {/* Stitch type row */}
          <TouchableOpacity
            style={styles.stitchTypeRow}
            onPress={() => setShowChangePicker(true)}
            accessibilityLabel={t('round.changeStitchType')}
          >
            <Text style={styles.stitchTypeLabel} numberOfLines={1}>
              {currentType === StitchType.CUSTOM ? t('stitch.category.custom') : StitchTypeInfo[currentType]?.label ?? currentType}
            </Text>
            <Feather name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          {/* Count row */}
          <View style={styles.countEditorRow}>
            <TouchableOpacity
              style={styles.countButton}
              onPress={() => setCount((c) => Math.max(1, c - 1))}
              accessibilityLabel={t('round.decreaseCount')}
            >
              <Feather name="minus" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TextInput
              style={styles.countInput}
              value={String(count)}
              onChangeText={(text) => {
                const n = parseInt(text, 10)
                if (!isNaN(n) && n >= 1) setCount(n)
                else if (text === '') setCount(1)
              }}
              keyboardType="number-pad"
              selectTextOnFocus
              accessibilityLabel={t('round.countLabel')}
            />
            <TouchableOpacity
              style={styles.countButton}
              onPress={() => setCount((c) => c + 1)}
              accessibilityLabel={t('round.increaseCount')}
            >
              <Feather name="plus" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.countEditorActions}>
            <TouchableOpacity style={styles.countActionCancel} onPress={onCancel}>
              <Text style={styles.countActionCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.countActionConfirm}
              onPress={() => onConfirm(currentType, count)}
            >
              <Text style={styles.countActionConfirmText}>{t('common.confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      </View>

      {/* Nested StitchPicker for changing type */}
      <StitchPicker
        visible={showChangePicker}
        craftType={craftType}
        onSelect={(type) => {
          setCurrentType(type)
          setShowChangePicker(false)
        }}
        onClose={() => setShowChangePicker(false)}
      />
    </>
  )
}

// ─── PatternItem Row ──────────────────────────────────────────────────────────

interface PatternItemRowProps {
  item: PatternItem
  isFirst: boolean
  isLast: boolean
  drag: () => void
  isActive: boolean
  isDragging: boolean
  onEdit: () => void
  onDelete: () => void
}

function PatternItemRow({ item, drag, isActive, isDragging, onEdit, onDelete }: PatternItemRowProps) {
  const { t } = useTranslation()

  function renderRightActions() {
    return (
      <TouchableOpacity
        style={styles.swipeDeleteButton}
        onPress={onDelete}
        accessibilityLabel={t('common.delete')}
        accessibilityRole="button"
      >
        <Text style={styles.swipeDeleteText}>{t('common.delete')}</Text>
      </TouchableOpacity>
    )
  }

  const actionButtons = (
    <View style={styles.itemActions}>
      <TouchableOpacity
        onPress={onEdit}
        accessibilityLabel={t('round.editStitchTitle')}
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="edit-2" size={15} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  )

  if (item.type === PatternItemType.STITCH && isStitchInfo(item.data)) {
    const stitch = item.data
    const label = getStitchLabel(stitch)
    return (
      <Swipeable
        renderRightActions={renderRightActions}
        enabled={!isDragging}
        friction={2}
        overshootRight={false}
      >
        <View style={[styles.itemRow, isActive && styles.itemRowActive]}>
          {/* Left: drag handle */}
          <TouchableOpacity
            onLongPress={drag}
            delayLongPress={150}
            accessibilityLabel={t('round.dragHandle')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.dragHandle}
          >
            <Feather name="menu" size={18} color="#9ca3af" />
          </TouchableOpacity>
          {/* Middle: label×count */}
          <TouchableOpacity style={styles.itemInfo} onPress={onEdit} activeOpacity={0.7}>
            <Text style={styles.itemLabel}>
              {label}<Text style={styles.itemCountInline}>×{stitch.count}</Text>
            </Text>
          </TouchableOpacity>
          {/* Right: actions */}
          {actionButtons}
        </View>
      </Swipeable>
    )
  }

  if (item.type === PatternItemType.GROUP && isStitchGroup(item.data)) {
    const group = item.data
    const sep = i18n.t('common.stitchListSep')
    const stitchSummary = group.stitches
      .map((s) => `${getStitchLabel(s)} ${s.count}`)
      .join(sep)
    const groupLabel = stitchSummary
      ? i18n.t('common.groupSummary', { name: group.name, stitches: stitchSummary, count: group.repeatCount })
      : i18n.t('common.groupSummaryEmpty', { name: group.name, count: group.repeatCount })
    return (
      <Swipeable
        renderRightActions={renderRightActions}
        enabled={!isDragging}
        friction={2}
        overshootRight={false}
      >
        <View style={[styles.itemRow, isActive && styles.itemRowActive]}>
          {/* Left: drag handle */}
          <TouchableOpacity
            onLongPress={drag}
            delayLongPress={150}
            accessibilityLabel={t('round.dragHandle')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.dragHandle}
          >
            <Feather name="menu" size={18} color="#9ca3af" />
          </TouchableOpacity>
          {/* Middle: group label */}
          <TouchableOpacity style={styles.itemInfo} onPress={onEdit} activeOpacity={0.7}>
            <Text style={styles.itemLabel}>{groupLabel}</Text>
          </TouchableOpacity>
          {/* Right: actions */}
          {actionButtons}
        </View>
      </Swipeable>
    )
  }

  return null
}

// ─── RoundEditScreen ──────────────────────────────────────────────────────────

export default function RoundEditScreen() {
  const { t } = useTranslation()
  const { id, chartId, roundId } = useLocalSearchParams<{
    id: string
    chartId: string
    roundId: string
  }>()
  const router = useRouter()

  const project = useProjectStore((s) => s.getProjectById(id ?? ''))
  const updateRound = useChartStore((s) => s.updateRound)
  // Selector to get round notes at hook level (needed to initialize notesText state)
  const initialNotes = useProjectStore((s) => {
    const p = s.getProjectById(id ?? '')
    const c = p?.charts.find((ch) => ch.id === (chartId ?? ''))
    return c?.rounds.find((r) => r.id === (roundId ?? ''))?.notes ?? ''
  })
  const addStitchToRound = usePatternStore((s) => s.addStitchToRound)
  const updateStitch = usePatternStore((s) => s.updateStitch)
  const deleteStitch = usePatternStore((s) => s.deleteStitch)
  const deleteGroup = usePatternStore((s) => s.deleteGroup)
  const addGroup = usePatternStore((s) => s.addGroup)
  const updateGroup = usePatternStore((s) => s.updateGroup)
  const reorderPatternItems = usePatternStore((s) => s.reorderPatternItems)
  const addTemplate = useTemplateStore((s) => s.addTemplate)

  const [isDragging, setIsDragging] = useState(false)
  const [showStitchPicker, setShowStitchPicker] = useState(false)
  const [showGroupEditor, setShowGroupEditor] = useState(false)
  const [editingItem, setEditingItem] = useState<PatternItem | null>(null)
  const [editingGroup, setEditingGroup] = useState<PatternItem | null>(null)
  const [pendingAddType, setPendingAddType] = useState<StitchType | null>(null)
  const [pendingCustomStitch, setPendingCustomStitch] = useState<CustomStitchPattern | null>(null)
  const [notesText, setNotesText] = useState(initialNotes)
  // Sync notesText when navigating to a different round
  const prevRoundIdRef = useRef(roundId)
  if (prevRoundIdRef.current !== roundId) {
    prevRoundIdRef.current = roundId
    setNotesText(initialNotes)
  }

  // Project / chart / round guards
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

  const chart = project.charts.find((c) => c.id === chartId)
  if (!chart) {
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

  const round = chart.rounds.find((r) => r.id === roundId)
  if (!round) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t('round.notFound')}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const sortedItems = round.patternItems.slice().sort((a, b) => a.order - b.order)
  const totalStitches = calcRoundTotalStitches(round.patternItems)
  const roundIndex = chart.rounds.findIndex((r) => r.id === roundId)

  // Default group name based on existing group count
  const existingGroupCount = sortedItems.filter((item) => item.type === PatternItemType.GROUP).length
  const defaultGroupName = t('round.defaultGroupName', { n: existingGroupCount + 1 })

  function handleStitchSelected(stitchType: StitchType, customStitch?: CustomStitchPattern) {
    setShowStitchPicker(false)
    // Delay opening StitchEditor until pageSheet dismiss animation finishes (~300ms on iOS)
    setTimeout(() => {
      setPendingCustomStitch(customStitch ?? null)
      setPendingAddType(stitchType)
    }, 350)
  }

  function handleAddConfirm(stitchType: StitchType, count: number) {
    addStitchToRound(
      project!.id,
      chart!.id,
      round!.id,
      stitchType,
      count,
      pendingCustomStitch?.name,
      pendingCustomStitch?.abbr
    )
    setPendingAddType(null)
    setPendingCustomStitch(null)
  }

  function handleEditStitch(item: PatternItem) {
    setEditingItem(item)
  }

  function handleEditGroup(item: PatternItem) {
    setEditingGroup(item)
    setShowGroupEditor(true)
  }

  function handleEditConfirm(newType: StitchType, newCount: number) {
    if (!editingItem) return
    if (editingItem.type === PatternItemType.STITCH && isStitchInfo(editingItem.data)) {
      updateStitch(project!.id, chart!.id, round!.id, editingItem.id, {
        type: newType,
        count: newCount,
      })
    }
    setEditingItem(null)
  }

  function handleDeleteItem(item: PatternItem) {
    const isGroupItem = item.type === PatternItemType.GROUP

    Alert.alert(
      isGroupItem ? t('round.deleteGroupTitle') : t('round.deleteStitchTitle'),
      isGroupItem ? t('round.deleteGroupMessage') : t('round.deleteStitchMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            if (isGroupItem) {
              deleteGroup(project!.id, chart!.id, round!.id, item.id)
            } else {
              deleteStitch(project!.id, chart!.id, round!.id, item.id)
            }
          },
        },
      ]
    )
  }

  function handleGroupConfirm(result: GroupEditorResult) {
    if (editingGroup && isStitchGroup(editingGroup.data)) {
      // Edit mode
      updateGroup(project!.id, chart!.id, round!.id, editingGroup.id, {
        name: result.name,
        stitches: result.stitches,
        repeatCount: result.repeatCount,
      })
    } else {
      // Create mode
      addGroup(project!.id, chart!.id, round!.id, result.name, result.stitches, result.repeatCount)
      if (result.saveAsTemplate) {
        addTemplate({
          name: result.name,
          stitches: result.stitches,
          repeatCount: result.repeatCount,
        })
      }
    }
    setEditingGroup(null)
    setShowGroupEditor(false)
  }

  function handleGroupEditorCancel() {
    setEditingGroup(null)
    setShowGroupEditor(false)
  }

  // Extract initial values for GroupEditor (edit mode)
  const editingGroupData = editingGroup && isStitchGroup(editingGroup.data)
    ? (editingGroup.data as StitchGroup)
    : null

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: t('round.title', { index: roundIndex + 1 }) }} />

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {t('round.summary', { index: roundIndex + 1, count: totalStitches })}
        </Text>
      </View>

      {/* Notes input */}
      <View style={styles.notesBar}>
        <TextInput
          style={styles.notesInput}
          value={notesText}
          onChangeText={setNotesText}
          placeholder={t('round.notesPlaceholder')}
          placeholderTextColor="#d1d5db"
          returnKeyType="done"
          onBlur={() => {
            const text = notesText.trim()
            const current = round.notes ?? ''
            if (text !== current) {
              updateRound(project!.id, chart!.id, round!.id, { notes: text || undefined })
            }
          }}
        />
      </View>

      {/* Pattern items list */}
      {sortedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>{t('round.emptyTitle')}</Text>
          <Text style={styles.emptyStateHint}>{t('round.emptyHint')}</Text>
        </View>
      ) : (
        <DraggableFlatList
          data={sortedItems}
          keyExtractor={(item: PatternItem) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, drag, isActive, getIndex }: RenderItemParams<PatternItem>) => {
            const index = getIndex() ?? 0
            return (
              <PatternItemRow
                item={item}
                isFirst={index === 0}
                isLast={index === sortedItems.length - 1}
                drag={drag}
                isActive={isActive}
                isDragging={isDragging}
                onEdit={() => {
                  if (item.type === PatternItemType.GROUP) {
                    handleEditGroup(item)
                  } else {
                    handleEditStitch(item)
                  }
                }}
                onDelete={() => handleDeleteItem(item)}
              />
            )
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onDragBegin={() => {
            setIsDragging(true)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }}
          onDragEnd={({ data }) => {
            setIsDragging(false)
            reorderPatternItems(
              project!.id,
              chart!.id,
              round!.id,
              data.map((item) => item.id)
            )
          }}
        />
      )}

      {/* Footer: Add stitch / Add group / Done buttons */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={[styles.addButton, styles.addButtonSecondary]}
            onPress={() => {
              setEditingGroup(null)
              setShowGroupEditor(true)
            }}
            accessibilityLabel={t('round.addGroup')}
            accessibilityRole="button"
          >
            <Text style={styles.addButtonSecondaryText}>{t('round.addGroup')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, styles.addButtonPrimary]}
            onPress={() => setShowStitchPicker(true)}
            accessibilityLabel={t('round.addStitch')}
            accessibilityRole="button"
          >
            <Text style={styles.addButtonText}>{t('round.addStitch')}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={styles.doneButtonText}>{t('round.done')}</Text>
        </TouchableOpacity>
      </View>

      {/* StitchPicker modal */}
      <StitchPicker
        visible={showStitchPicker}
        craftType={project.craftType}
        onSelect={handleStitchSelected}
        onClose={() => setShowStitchPicker(false)}
      />

      {/* Add stitch editor */}
      {pendingAddType !== null && (
        <StitchEditor
          title={t('round.addStitchTitle')}
          stitchType={pendingAddType}
          count={1}
          craftType={project.craftType}
          onConfirm={handleAddConfirm}
          onCancel={() => setPendingAddType(null)}
        />
      )}

      {/* Edit stitch editor */}
      {editingItem !== null && editingItem.type === PatternItemType.STITCH && isStitchInfo(editingItem.data) && (
        <StitchEditor
          title={t('round.editStitchTitle')}
          stitchType={editingItem.data.type}
          count={editingItem.data.count}
          craftType={project.craftType}
          onConfirm={handleEditConfirm}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* Group editor modal (create & edit) */}
      <GroupEditor
        visible={showGroupEditor}
        craftType={project.craftType}
        defaultName={editingGroupData ? undefined : defaultGroupName}
        initialName={editingGroupData?.name}
        initialStitches={editingGroupData?.stitches}
        initialRepeatCount={editingGroupData?.repeatCount}
        onConfirm={handleGroupConfirm}
        onCancel={handleGroupEditorCancel}
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

  // Summary bar
  summaryBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Notes bar
  notesBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  notesInput: {
    fontSize: 13,
    color: '#6b7280',
    paddingVertical: 4,
  },

  // List
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 0,
  },

  // Pattern item row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 6,
    gap: 8,
  },
  itemRowActive: {
    opacity: 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  swipeDeleteButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 10,
    marginBottom: 6,
  },
  swipeDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dragHandle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    lineHeight: 20,
  },
  itemCountInline: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 8,
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
    maxWidth: 260,
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#faf5f0',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonPrimary: {
    backgroundColor: '#D97398',
  },
  addButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D97398',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  addButtonSecondaryText: {
    color: '#D97398',
    fontSize: 16,
    fontWeight: '700',
  },
  doneButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',  // light gray
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9ca3af',  // muted gray text
  },

  // Fallback
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

  // Count editor overlay
  countEditorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  countEditorKAV: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countEditorBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 260,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  countEditorTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  stitchTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  stitchTypeLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  countEditorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  countButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D97398',
    minWidth: 72,
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: '#D97398',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  countEditorActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  countActionCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  countActionCancelText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  countActionConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#D97398',
    alignItems: 'center',
  },
  countActionConfirmText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
})
