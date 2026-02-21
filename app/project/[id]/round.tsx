import { useState } from 'react'
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useProjectStore } from '../../../src/stores'
import { usePatternStore } from '../../../src/stores/usePatternStore'
import { PatternItem, PatternItemType, StitchType } from '../../../src/types'
import StitchPicker from '../../../src/components/StitchPicker'
import {
  getStitchLabel,
  isStitchInfo,
  isStitchGroup,
  calcRoundTotalStitches,
} from '../../../src/utils/patternHelpers'

// ─── Count Editor Modal ───────────────────────────────────────────────────────

interface CountEditorProps {
  value: number
  onConfirm: (count: number) => void
  onCancel: () => void
}

function CountEditor({ value, onConfirm, onCancel }: CountEditorProps) {
  const [count, setCount] = useState(value)

  return (
    <View style={styles.countEditorOverlay}>
      <View style={styles.countEditorBox}>
        <Text style={styles.countEditorTitle}>數量</Text>
        <View style={styles.countEditorRow}>
          <TouchableOpacity
            style={styles.countButton}
            onPress={() => setCount((c) => Math.max(1, c - 1))}
            accessibilityLabel="減少數量"
          >
            <Feather name="minus" size={20} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.countValue}>{count}</Text>
          <TouchableOpacity
            style={styles.countButton}
            onPress={() => setCount((c) => c + 1)}
            accessibilityLabel="增加數量"
          >
            <Feather name="plus" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <View style={styles.countEditorActions}>
          <TouchableOpacity style={styles.countActionCancel} onPress={onCancel}>
            <Text style={styles.countActionCancelText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.countActionConfirm}
            onPress={() => onConfirm(count)}
          >
            <Text style={styles.countActionConfirmText}>確定</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// ─── PatternItem Row ──────────────────────────────────────────────────────────

interface PatternItemRowProps {
  item: PatternItem
  onEditCount: () => void
  onDelete: () => void
}

function PatternItemRow({ item, onEditCount, onDelete }: PatternItemRowProps) {
  if (item.type === PatternItemType.STITCH && isStitchInfo(item.data)) {
    const stitch = item.data
    const label = getStitchLabel(stitch)
    return (
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemLabel}>{label}</Text>
          <TouchableOpacity
            onPress={onEditCount}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="編輯數量"
          >
            <Text style={styles.itemCount}>×{stitch.count}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            onPress={onEditCount}
            accessibilityLabel="編輯針法數量"
            accessibilityRole="button"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="edit-2" size={16} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            accessibilityLabel="刪除針法"
            accessibilityRole="button"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <MaterialCommunityIcons name="delete-outline" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (item.type === PatternItemType.GROUP && isStitchGroup(item.data)) {
    const group = item.data
    return (
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemLabel}>【{group.name}】</Text>
          <Text style={styles.itemCount}>×{group.repeatCount}次</Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            onPress={onDelete}
            accessibilityLabel="刪除群組"
            accessibilityRole="button"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <MaterialCommunityIcons name="delete-outline" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return null
}

// ─── RoundEditScreen ──────────────────────────────────────────────────────────

export default function RoundEditScreen() {
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

  const [showStitchPicker, setShowStitchPicker] = useState(false)
  const [editingItem, setEditingItem] = useState<PatternItem | null>(null)

  // Project / chart / round guards
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

  const chart = project.charts.find((c) => c.id === chartId)
  if (!chart) {
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

  const round = chart.rounds.find((r) => r.id === roundId)
  if (!round) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>找不到段落</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const sortedItems = round.patternItems.slice().sort((a, b) => a.order - b.order)
  const totalStitches = calcRoundTotalStitches(round.patternItems)
  const roundIndex = chart.rounds.findIndex((r) => r.id === roundId)

  function handleStitchSelected(stitchType: StitchType) {
    // After stitch is selected from picker, add it with count = 1
    // We show a count editor right after
    addStitchToRound(project!.id, chart!.id, round!.id, stitchType, 1)
    setShowStitchPicker(false)
  }

  function handleEditCount(item: PatternItem) {
    setEditingItem(item)
  }

  function handleCountConfirm(newCount: number) {
    if (!editingItem) return
    if (editingItem.type === PatternItemType.STITCH && isStitchInfo(editingItem.data)) {
      updateStitch(project!.id, chart!.id, round!.id, editingItem.id, { count: newCount })
    }
    setEditingItem(null)
  }

  function handleDeleteItem(item: PatternItem) {
    const isGroup = item.type === PatternItemType.GROUP

    Alert.alert(
      isGroup ? '刪除群組' : '刪除針法',
      isGroup ? '確定要刪除此群組嗎？' : '確定要刪除此針法嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: () => {
            if (isGroup) {
              deleteGroup(project!.id, chart!.id, round!.id, item.id)
            } else {
              deleteStitch(project!.id, chart!.id, round!.id, item.id)
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: `R${roundIndex + 1} 段落編輯` }} />

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          第 {roundIndex + 1} 段 · 共 {totalStitches} 針
        </Text>
      </View>

      {/* Pattern items list */}
      {sortedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>尚無針法</Text>
          <Text style={styles.emptyStateHint}>點擊下方「新增針法」按鈕，開始加入針法。</Text>
        </View>
      ) : (
        <FlatList
          data={sortedItems}
          keyExtractor={(item: PatternItem) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: { item: PatternItem }) => (
            <PatternItemRow
              item={item}
              onEditCount={() => handleEditCount(item)}
              onDelete={() => handleDeleteItem(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Footer: Add stitch button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowStitchPicker(true)}
          accessibilityLabel="新增針法"
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>+ 新增針法</Text>
        </TouchableOpacity>
      </View>

      {/* StitchPicker modal */}
      <StitchPicker
        visible={showStitchPicker}
        craftType={project.craftType}
        onSelect={handleStitchSelected}
        onClose={() => setShowStitchPicker(false)}
      />

      {/* Count editor overlay */}
      {editingItem !== null && editingItem.type === PatternItemType.STITCH && isStitchInfo(editingItem.data) && (
        <CountEditor
          value={editingItem.data.count}
          onConfirm={handleCountConfirm}
          onCancel={() => setEditingItem(null)}
        />
      )}
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
    alignItems: 'center',
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
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#D97398',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
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
  countEditorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  countButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D97398',
    minWidth: 48,
    textAlign: 'center',
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
