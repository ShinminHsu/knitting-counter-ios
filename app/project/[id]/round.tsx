import { useState } from 'react'
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../../../src/stores'
import { usePatternStore } from '../../../src/stores/usePatternStore'
import { useTemplateStore } from '../../../src/stores/useTemplateStore'
import { CraftType, PatternItem, PatternItemType, StitchGroup, StitchInfo, StitchType } from '../../../src/types'
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
  onMoveUp: () => void
  onMoveDown: () => void
  onEdit: () => void
  onDelete: () => void
}

function PatternItemRow({ item, isFirst, isLast, onMoveUp, onMoveDown, onEdit, onDelete }: PatternItemRowProps) {
  const { t } = useTranslation()
  const reorderControls = (
    <View style={styles.reorderControls}>
      <TouchableOpacity
        onPress={onMoveUp}
        disabled={isFirst}
        accessibilityLabel={t('editor.moveUpLabel')}
        accessibilityRole="button"
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Feather name="chevron-up" size={20} color={isFirst ? '#d1d5db' : '#6b7280'} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onMoveDown}
        disabled={isLast}
        accessibilityLabel={t('editor.moveDownLabel')}
        accessibilityRole="button"
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Feather name="chevron-down" size={20} color={isLast ? '#d1d5db' : '#6b7280'} />
      </TouchableOpacity>
    </View>
  )

  if (item.type === PatternItemType.STITCH && isStitchInfo(item.data)) {
    const stitch = item.data
    const label = getStitchLabel(stitch)
    return (
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemLabel}>{label}</Text>
          <TouchableOpacity
            onPress={onEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={t('round.editStitchTitle')}
          >
            <Text style={styles.itemCount}>×{stitch.count}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.itemActions}>
          {reorderControls}
          <TouchableOpacity
            onPress={onEdit}
            accessibilityLabel={t('round.editStitchTitle')}
            accessibilityRole="button"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="edit-2" size={16} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            accessibilityLabel={t('round.deleteStitchTitle')}
            accessibilityRole="button"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="trash-2" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (item.type === PatternItemType.GROUP && isStitchGroup(item.data)) {
    const group = item.data
    const stitchSummary = group.stitches
      .map((s) => `${getStitchLabel(s)} ${s.count}`)
      .join('、')
    const groupLabel = stitchSummary
      ? `【${group.name}：${stitchSummary}】 × ${group.repeatCount}`
      : `【${group.name}】 × ${group.repeatCount}`
    return (
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemLabel}>{groupLabel}</Text>
        </View>
        <View style={styles.itemActions}>
          {reorderControls}
          <TouchableOpacity
            onPress={onEdit}
            accessibilityLabel={t('round.editStitchTitle')}
            accessibilityRole="button"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="edit-2" size={16} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            accessibilityLabel={t('round.deleteGroupTitle')}
            accessibilityRole="button"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="trash-2" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
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
  const addStitchToRound = usePatternStore((s) => s.addStitchToRound)
  const updateStitch = usePatternStore((s) => s.updateStitch)
  const deleteStitch = usePatternStore((s) => s.deleteStitch)
  const deleteGroup = usePatternStore((s) => s.deleteGroup)
  const addGroup = usePatternStore((s) => s.addGroup)
  const updateGroup = usePatternStore((s) => s.updateGroup)
  const movePatternItemUp = usePatternStore((s) => s.movePatternItemUp)
  const movePatternItemDown = usePatternStore((s) => s.movePatternItemDown)
  const addTemplate = useTemplateStore((s) => s.addTemplate)

  const [showStitchPicker, setShowStitchPicker] = useState(false)
  const [showGroupEditor, setShowGroupEditor] = useState(false)
  const [editingItem, setEditingItem] = useState<PatternItem | null>(null)
  const [editingGroup, setEditingGroup] = useState<PatternItem | null>(null)
  const [pendingAddType, setPendingAddType] = useState<StitchType | null>(null)

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

  function handleStitchSelected(stitchType: StitchType) {
    setShowStitchPicker(false)
    setPendingAddType(stitchType)
  }

  function handleAddConfirm(stitchType: StitchType, count: number) {
    addStitchToRound(project!.id, chart!.id, round!.id, stitchType, count)
    setPendingAddType(null)
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

      {/* Pattern items list */}
      {sortedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>{t('round.emptyTitle')}</Text>
          <Text style={styles.emptyStateHint}>{t('round.emptyHint')}</Text>
        </View>
      ) : (
        <FlatList
          data={sortedItems}
          keyExtractor={(item: PatternItem) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }: { item: PatternItem; index: number }) => (
            <PatternItemRow
              item={item}
              isFirst={index === 0}
              isLast={index === sortedItems.length - 1}
              onMoveUp={() => movePatternItemUp(project!.id, chart!.id, round!.id, item.id)}
              onMoveDown={() => movePatternItemDown(project!.id, chart!.id, round!.id, item.id)}
              onEdit={() => {
                if (item.type === PatternItemType.GROUP) {
                  handleEditGroup(item)
                } else {
                  handleEditStitch(item)
                }
              }}
              onDelete={() => handleDeleteItem(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Footer: Add stitch / Add group buttons */}
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
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 6,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemLabel: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  itemCount: {
    fontSize: 14,
    color: '#D97398',
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginLeft: 12,
    paddingTop: 2,
  },
  reorderControls: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },

  // Group stitch info
  groupInfo: {
    flex: 1,
    gap: 4,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupPreview: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 16,
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
