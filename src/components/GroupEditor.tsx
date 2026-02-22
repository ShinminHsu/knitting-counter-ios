import { useEffect, useState } from 'react'
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { CraftType, StitchInfo, StitchType } from '../types'
import { generateId } from '../utils/helpers'
import { getStitchLabel } from '../utils/patternHelpers'
import StitchPicker from './StitchPicker'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GroupEditorResult {
  name: string
  stitches: StitchInfo[]
  repeatCount: number
  saveAsTemplate: boolean
}

interface GroupEditorProps {
  visible: boolean
  craftType: CraftType
  /** Pre-fills the name field for new groups (e.g. "群組 1") */
  defaultName?: string
  /** Pre-filled values for edit mode */
  initialName?: string
  initialStitches?: StitchInfo[]
  initialRepeatCount?: number
  onConfirm: (result: GroupEditorResult) => void
  onCancel: () => void
}

// ─── StitchRow (within group editor) ─────────────────────────────────────────

interface StitchRowProps {
  stitch: StitchInfo
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onChangeCount: (count: number) => void
  onDelete: () => void
}

function StitchRow({ stitch, isFirst, isLast, onMoveUp, onMoveDown, onChangeCount, onDelete }: StitchRowProps) {
  const label = getStitchLabel(stitch)

  return (
    <View style={styles.stitchRow}>
      {/* Move up/down arrows */}
      <View style={styles.moveButtons}>
        <TouchableOpacity
          onPress={onMoveUp}
          disabled={isFirst}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel="上移"
        >
          <Feather name="chevron-up" size={18} color={isFirst ? '#d1d5db' : '#6b7280'} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onMoveDown}
          disabled={isLast}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel="下移"
        >
          <Feather name="chevron-down" size={18} color={isLast ? '#d1d5db' : '#6b7280'} />
        </TouchableOpacity>
      </View>

      {/* Label */}
      <Text style={styles.stitchRowLabel} numberOfLines={1}>
        {label}
      </Text>

      {/* Count + delete */}
      <View style={styles.stitchRowRight}>
        <TouchableOpacity
          style={styles.countBtn}
          onPress={() => onChangeCount(Math.max(1, stitch.count - 1))}
          accessibilityLabel="減少數量"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="minus" size={16} color="#6b7280" />
        </TouchableOpacity>
        <TextInput
          style={styles.countInput}
          value={String(stitch.count)}
          onChangeText={(text) => {
            const n = parseInt(text, 10)
            if (!isNaN(n) && n >= 1) onChangeCount(n)
            else if (text === '') onChangeCount(1)
          }}
          keyboardType="number-pad"
          selectTextOnFocus
          accessibilityLabel="數量"
        />
        <TouchableOpacity
          style={styles.countBtn}
          onPress={() => onChangeCount(stitch.count + 1)}
          accessibilityLabel="增加數量"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="plus" size={16} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          accessibilityLabel="刪除針法"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteBtn}
        >
          <Feather name="trash-2" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── GroupEditor ──────────────────────────────────────────────────────────────

export default function GroupEditor({
  visible,
  craftType,
  defaultName,
  initialName,
  initialStitches,
  initialRepeatCount,
  onConfirm,
  onCancel,
}: GroupEditorProps) {
  const isEditMode = initialName !== undefined

  const [groupName, setGroupName] = useState('')
  const [stitches, setStitches] = useState<StitchInfo[]>([])
  const [repeatCount, setRepeatCount] = useState(1)
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [showStitchPicker, setShowStitchPicker] = useState(false)

  // Sync state when modal opens
  useEffect(() => {
    if (visible) {
      setGroupName(initialName ?? defaultName ?? '')
      setStitches(initialStitches ? initialStitches.map((s) => ({ ...s })) : [])
      setRepeatCount(initialRepeatCount ?? 1)
      setSaveAsTemplate(false)
    }
  }, [visible])

  function handleCancel() {
    onCancel()
  }

  function handleStitchSelected(stitchType: StitchType) {
    const newStitch: StitchInfo = {
      id: generateId(),
      type: stitchType,
      count: 1,
    }
    setStitches((prev) => [...prev, newStitch])
    setShowStitchPicker(false)
  }

  function handleUpdateCount(stitchId: string, count: number) {
    setStitches((prev) =>
      prev.map((s) => (s.id === stitchId ? { ...s, count } : s))
    )
  }

  function handleMoveStitch(stitchId: string, direction: 'up' | 'down') {
    setStitches((prev) => {
      const idx = prev.findIndex((s) => s.id === stitchId)
      if (idx < 0) return prev
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })
  }

  function handleDeleteStitch(stitchId: string) {
    setStitches((prev) => prev.filter((s) => s.id !== stitchId))
  }

  function handleConfirm() {
    if (stitches.length === 0) {
      // Alert without blocking — use inline validation hint
      return
    }

    const finalName = groupName.trim() || defaultName || '群組'

    onConfirm({
      name: finalName,
      stitches,
      repeatCount,
      saveAsTemplate,
    })
  }

  const canConfirm = stitches.length > 0

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleCancel}
            accessibilityLabel="取消"
            accessibilityRole="button"
          >
            <Text style={styles.headerBtnCancel}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? '編輯針法群組' : '新增針法群組'}
          </Text>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleConfirm}
            disabled={!canConfirm}
            accessibilityLabel="確定"
            accessibilityRole="button"
          >
            <Text style={[styles.headerBtnConfirm, !canConfirm && styles.headerBtnDisabled]}>
              確定
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Group Name */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>群組名稱</Text>
            <TextInput
              style={styles.textInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder={defaultName ?? '例：貝殼花樣'}
              placeholderTextColor="#9ca3af"
              returnKeyType="done"
              accessibilityLabel="群組名稱"
            />
          </View>

          {/* Repeat Count */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>重複次數</Text>
            <View style={styles.repeatRow}>
              <TouchableOpacity
                style={styles.countBtn}
                onPress={() => setRepeatCount((c) => Math.max(1, c - 1))}
                accessibilityLabel="減少重複次數"
              >
                <Feather name="minus" size={20} color="#6b7280" />
              </TouchableOpacity>
              <TextInput
                style={styles.repeatInput}
                value={String(repeatCount)}
                onChangeText={(text) => {
                  const n = parseInt(text, 10)
                  if (!isNaN(n) && n >= 1) setRepeatCount(n)
                  else if (text === '') setRepeatCount(1)
                }}
                keyboardType="number-pad"
                selectTextOnFocus
                accessibilityLabel="重複次數"
              />
              <TouchableOpacity
                style={styles.countBtn}
                onPress={() => setRepeatCount((c) => c + 1)}
                accessibilityLabel="增加重複次數"
              >
                <Feather name="plus" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stitches in group */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>針法序列</Text>

            {stitches.length === 0 ? (
              <View style={styles.emptyStitches}>
                <Text style={styles.emptyStitchesText}>尚未加入任何針法</Text>
              </View>
            ) : (
              <View style={styles.stitchesList}>
                {stitches.map((stitch, index) => (
                  <StitchRow
                    key={stitch.id}
                    stitch={stitch}
                    isFirst={index === 0}
                    isLast={index === stitches.length - 1}
                    onMoveUp={() => handleMoveStitch(stitch.id, 'up')}
                    onMoveDown={() => handleMoveStitch(stitch.id, 'down')}
                    onChangeCount={(count) => handleUpdateCount(stitch.id, count)}
                    onDelete={() => handleDeleteStitch(stitch.id)}
                  />
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.addStitchButton}
              onPress={() => setShowStitchPicker(true)}
              accessibilityLabel="加入針法"
              accessibilityRole="button"
            >
              <Feather name="plus" size={16} color="#D97398" />
              <Text style={styles.addStitchButtonText}>加入針法</Text>
            </TouchableOpacity>

            {stitches.length === 0 && (
              <Text style={styles.validationHint}>請至少加入一個針法才能確定</Text>
            )}
          </View>

          {/* Save as template */}
          {!isEditMode && (
            <View style={styles.section}>
              <View style={styles.templateToggleRow}>
                <View style={styles.templateToggleInfo}>
                  <Text style={styles.sectionLabel}>儲存為樣板</Text>
                  <Text style={styles.templateToggleHint}>
                    以群組名稱「{groupName.trim() || defaultName || '群組'}」儲存，方便日後重複使用
                  </Text>
                </View>
                <Switch
                  value={saveAsTemplate}
                  onValueChange={setSaveAsTemplate}
                  trackColor={{ false: '#d1d5db', true: '#D97398' }}
                  thumbColor="#fff"
                  accessibilityLabel="儲存為樣板"
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* StitchPicker modal */}
      <StitchPicker
        visible={showStitchPicker}
        craftType={craftType}
        onSelect={handleStitchSelected}
        onClose={() => setShowStitchPicker(false)}
      />
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5f0',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerBtn: {
    minWidth: 44,
    paddingVertical: 4,
  },
  headerBtnCancel: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'left',
  },
  headerBtnConfirm: {
    fontSize: 16,
    color: '#D97398',
    fontWeight: '600',
    textAlign: 'right',
  },
  headerBtnDisabled: {
    color: '#d1d5db',
  },

  // Body
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 40,
  },

  // Section
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  // Text input
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
  },

  // Repeat count
  repeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
    alignSelf: 'flex-start',
  },
  repeatInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D97398',
    minWidth: 64,
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: '#D97398',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  // Count buttons
  countBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stitch list
  stitchesList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
    overflow: 'hidden',
  },
  stitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  moveButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  stitchRowLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  stitchRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  countInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D97398',
    minWidth: 36,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#D97398',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  deleteBtn: {
    marginLeft: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty stitches state
  emptyStitches: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyStitchesText: {
    fontSize: 14,
    color: '#9ca3af',
  },

  // Validation hint
  validationHint: {
    fontSize: 12,
    color: '#f87171',
    marginTop: 6,
    textAlign: 'center',
  },

  // Add stitch button
  addStitchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D97398',
    borderStyle: 'dashed',
  },
  addStitchButtonText: {
    fontSize: 15,
    color: '#D97398',
    fontWeight: '600',
  },

  // Template toggle
  templateToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  templateToggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  templateToggleHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
})
