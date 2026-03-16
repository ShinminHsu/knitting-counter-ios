import { useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Swipeable } from 'react-native-gesture-handler'
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'
import { useTranslation } from 'react-i18next'
import { CraftType, CustomStitchPattern, StitchInfo, StitchType } from '../types'
import { generateId } from '../utils/helpers'
import { getLocalizedStitchName } from '../utils/patternHelpers'
import StitchPicker from './StitchPicker'
import UpgradePromptModal from './UpgradePromptModal'
import { useTemplateStore } from '../stores/useTemplateStore'
import { useEntitlementStore } from '../stores/useEntitlementStore'
import { REWARD_TYPES } from '../constants/analytics'

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
  drag: () => void
  onPress: () => void
  onChangeCount: (count: number) => void
}

function StitchRow({ stitch, drag, onPress, onChangeCount }: StitchRowProps) {
  const { t } = useTranslation()
  const label = getLocalizedStitchName(stitch, t)
  const [countText, setCountText] = useState(String(stitch.count))
  const isEditingRef = useRef(false)

  useEffect(() => {
    if (!isEditingRef.current) {
      setCountText(String(stitch.count))
    }
  }, [stitch.count])

  function handleDecrement() {
    const next = Math.max(1, stitch.count - 1)
    setCountText(String(next))
    onChangeCount(next)
  }

  function handleIncrement() {
    const next = stitch.count + 1
    setCountText(String(next))
    onChangeCount(next)
  }

  return (
    <View style={styles.stitchRow}>
      {/* Drag handle */}
      <TouchableOpacity
        onLongPress={drag}
        delayLongPress={150}
        accessibilityLabel={t('round.dragHandle')}
        style={styles.dragHandle}
      >
        <Feather name="menu" size={18} color="#9ca3af" />
      </TouchableOpacity>

      {/* Label — tapping opens edit */}
      <TouchableOpacity style={styles.stitchRowLabelBtn} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.stitchRowLabel} numberOfLines={1}>
          {label}
        </Text>
      </TouchableOpacity>

      {/* Count controls */}
      <View style={styles.stitchRowRight}>
        <TouchableOpacity
          style={styles.countBtn}
          onPress={handleDecrement}
          accessibilityLabel={t('round.decreaseCount')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="minus" size={16} color="#6b7280" />
        </TouchableOpacity>
        <TextInput
          style={styles.countInput}
          value={countText}
          onFocus={() => { isEditingRef.current = true }}
          onBlur={() => {
            isEditingRef.current = false
            const n = parseInt(countText, 10)
            if (isNaN(n) || n < 1) setCountText(String(stitch.count))
          }}
          onChangeText={(text) => {
            setCountText(text)
            const n = parseInt(text, 10)
            if (!isNaN(n) && n >= 1) onChangeCount(n)
          }}
          keyboardType="number-pad"
          selectTextOnFocus
          accessibilityLabel={t('round.countLabel')}
        />
        <TouchableOpacity
          style={styles.countBtn}
          onPress={handleIncrement}
          accessibilityLabel={t('round.increaseCount')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="plus" size={16} color="#6b7280" />
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
  const { t } = useTranslation()
  const isEditMode = initialName !== undefined
  const allTemplates = useTemplateStore((s) => s.templates)
  // 只顯示符合目前 craftType 的樣板（未設定 craftType 的舊資料視為相容）
  const templates = allTemplates.filter(
    (tpl) => tpl.craftType === undefined || tpl.craftType === craftType
  )

  const [groupName, setGroupName] = useState('')
  const [stitches, setStitches] = useState<StitchInfo[]>([])
  const [repeatCount, setRepeatCount] = useState(1)
  const [repeatCountText, setRepeatCountText] = useState('1')
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [showStitchPicker, setShowStitchPicker] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showTemplateLocked, setShowTemplateLocked] = useState(false)
  const [editingStitchIndex, setEditingStitchIndex] = useState<number | null>(null)
  const canUseTemplates = useEntitlementStore((s) => s.canUseTemplates)
  const unlockTemplate = useEntitlementStore((s) => s.unlockTemplate)
  const [isDragging, setIsDragging] = useState(false)

  // Sync state when modal opens
  useEffect(() => {
    if (visible) {
      setGroupName(initialName ?? defaultName ?? '')
      setStitches(initialStitches ? initialStitches.map((s) => ({ ...s })) : [])
      const initRepeat = initialRepeatCount ?? 1
      setRepeatCount(initRepeat)
      setRepeatCountText(String(initRepeat))
      setSaveAsTemplate(false)
    }
  }, [visible])

  function handleCancel() {
    onCancel()
  }

  function handleStitchSelected(stitchType: StitchType, customPattern?: CustomStitchPattern) {
    if (editingStitchIndex !== null) {
      // Edit mode: update the stitch in place, preserving count and position
      setStitches((prev) =>
        prev.map((s, idx) =>
          idx === editingStitchIndex
            ? {
                ...s,
                type: stitchType,
                customName: customPattern?.name,
                customAbbr: customPattern?.abbr,
              }
            : s
        )
      )
      setEditingStitchIndex(null)
    } else {
      // Add mode: create a new stitch and append it
      const newStitch: StitchInfo = {
        id: generateId(),
        type: stitchType,
        count: 1,
        ...(customPattern && {
          customName: customPattern.name,
          customAbbr: customPattern.abbr,
        }),
      }
      setStitches((prev) => [...prev, newStitch])
    }
    setShowStitchPicker(false)
  }

  function handleUpdateCount(stitchId: string, count: number) {
    setStitches((prev) =>
      prev.map((s) => (s.id === stitchId ? { ...s, count } : s))
    )
  }

  function handleDeleteStitch(stitchId: string) {
    setStitches((prev) => prev.filter((s) => s.id !== stitchId))
  }

  function handleReorderStitches(newData: StitchInfo[]) {
    setStitches(newData)
  }

  function handleLoadTemplate(template: { name: string; stitches: StitchInfo[]; repeatCount: number }) {
    setGroupName(template.name)
    setStitches(template.stitches.map((s) => ({ ...s, id: generateId() })))
    setRepeatCount(template.repeatCount)
    setRepeatCountText(String(template.repeatCount))
  }

  function handleConfirm() {
    if (stitches.length === 0) {
      // Alert without blocking — use inline validation hint
      return
    }

    const finalName = groupName.trim() || defaultName || t('groupEditor.defaultGroupName')

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleCancel}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
          >
            <Text style={styles.headerBtnCancel}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? t('groupEditor.titleEdit') : t('groupEditor.titleCreate')}
          </Text>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleConfirm}
            disabled={!canConfirm}
            accessibilityLabel={t('common.confirm')}
            accessibilityRole="button"
          >
            <Text style={[styles.headerBtnConfirm, !canConfirm && styles.headerBtnDisabled]}>
              {t('common.confirm')}
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
            <Text style={styles.sectionLabel}>{t('groupEditor.groupName')}</Text>
            <TextInput
              style={styles.textInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder={defaultName ?? t('groupEditor.groupNamePlaceholder')}
              placeholderTextColor="#9ca3af"
              returnKeyType="done"
              accessibilityLabel={t('groupEditor.groupName')}
            />
          </View>

          {/* Repeat Count */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('groupEditor.repeatCount')}</Text>
            <View style={styles.repeatRow}>
              <TouchableOpacity
                style={styles.countBtn}
                onPress={() => {
                  const next = Math.max(1, repeatCount - 1)
                  setRepeatCount(next)
                  setRepeatCountText(String(next))
                }}
                accessibilityLabel={t('groupEditor.decreaseRepeat')}
              >
                <Feather name="minus" size={20} color="#6b7280" />
              </TouchableOpacity>
              <TextInput
                style={styles.repeatInput}
                value={repeatCountText}
                onChangeText={(text) => {
                  setRepeatCountText(text)
                  const n = parseInt(text, 10)
                  if (!isNaN(n) && n >= 1) setRepeatCount(n)
                }}
                onBlur={() => {
                  const n = parseInt(repeatCountText, 10)
                  if (isNaN(n) || n < 1) setRepeatCountText(String(repeatCount))
                }}
                keyboardType="number-pad"
                selectTextOnFocus
                accessibilityLabel={t('groupEditor.repeatLabel')}
              />
              <TouchableOpacity
                style={styles.countBtn}
                onPress={() => {
                  const next = repeatCount + 1
                  setRepeatCount(next)
                  setRepeatCountText(String(next))
                }}
                accessibilityLabel={t('groupEditor.increaseRepeat')}
              >
                <Feather name="plus" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Load from template (create mode only) */}
          {!isEditMode && templates.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.loadTemplateButton}
                onPress={() => canUseTemplates() ? setShowTemplatePicker(true) : setShowTemplateLocked(true)}
                accessibilityRole="button"
              >
                <Feather name="layers" size={16} color="#4b5563" />
                <Text style={styles.loadTemplateButtonText}>{t('groupEditor.loadFromTemplate')}</Text>
                {canUseTemplates()
                  ? <Feather name="chevron-right" size={16} color="#4b5563" />
                  : <Feather name="lock" size={16} color="#9ca3af" />
                }
              </TouchableOpacity>
            </View>
          )}

          {/* Stitches in group */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('groupEditor.stitchSequence')}</Text>

            {stitches.length === 0 ? (
              <View style={styles.emptyStitches}>
                <Text style={styles.emptyStitchesText}>{t('groupEditor.emptyStitches')}</Text>
              </View>
            ) : (
              <View style={styles.stitchesList}>
                <DraggableFlatList
                  data={stitches}
                  keyExtractor={(item) => item.id}
                  onDragBegin={() => setIsDragging(true)}
                  onDragEnd={({ data }) => { setIsDragging(false); handleReorderStitches(data) }}
                  scrollEnabled={false}
                  renderItem={({ item, drag }: RenderItemParams<StitchInfo>) => (
                    <Swipeable
                      enabled={!isDragging}
                      renderRightActions={() => (
                        <TouchableOpacity
                          style={styles.swipeDelete}
                          onPress={() => handleDeleteStitch(item.id)}
                        >
                          <Text style={styles.swipeDeleteText}>{t('common.delete')}</Text>
                        </TouchableOpacity>
                      )}
                    >
                      <StitchRow
                        stitch={item}
                        drag={drag}
                        onPress={() => setEditingStitchIndex(stitches.indexOf(item))}
                        onChangeCount={(count) => handleUpdateCount(item.id, count)}
                      />
                    </Swipeable>
                  )}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.addStitchButton}
              onPress={() => setShowStitchPicker(true)}
              accessibilityLabel={t('groupEditor.addStitch')}
              accessibilityRole="button"
            >
              <Feather name="plus" size={16} color="#D97398" />
              <Text style={styles.addStitchButtonText}>{t('groupEditor.addStitch')}</Text>
            </TouchableOpacity>

            {stitches.length === 0 && (
              <Text style={styles.validationHint}>{t('groupEditor.validationHint')}</Text>
            )}
          </View>

          {/* Save as template */}
          {!isEditMode && (
            <View style={styles.section}>
              <View style={styles.templateToggleRow}>
                <View style={styles.templateToggleInfo}>
                  <Text style={styles.sectionLabel}>{t('groupEditor.saveAsTemplate')}</Text>
                  <Text style={styles.templateToggleHint}>
                    {t('groupEditor.saveAsTemplateHint', { name: groupName.trim() || defaultName || t('groupEditor.defaultGroupName') })}
                  </Text>
                </View>
                <Switch
                  value={saveAsTemplate}
                  onValueChange={(v) => {
                    if (v && !canUseTemplates()) {
                      setShowTemplateLocked(true)
                    } else {
                      setSaveAsTemplate(v)
                    }
                  }}
                  trackColor={{ false: '#d1d5db', true: '#D97398' }}
                  thumbColor="#fff"
                  accessibilityLabel={t('groupEditor.saveAsTemplate')}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* StitchPicker modal */}
      <StitchPicker
        visible={showStitchPicker || editingStitchIndex !== null}
        craftType={craftType}
        onSelect={handleStitchSelected}
        onClose={() => {
          setShowStitchPicker(false)
          setEditingStitchIndex(null)
        }}
      />

      {/* Template picker modal */}
      <Modal
        visible={showTemplatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTemplatePicker(false)}
      >
        <View style={styles.templatePickerContainer}>
          <View style={styles.templatePickerHeader}>
            <Text style={styles.templatePickerTitle}>{t('groupEditor.loadFromTemplate')}</Text>
            <TouchableOpacity
              style={styles.templatePickerClose}
              onPress={() => setShowTemplatePicker(false)}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
            >
              <Text style={styles.templatePickerCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.templatePickerBody}>
            {templates.map((tpl) => (
              <TouchableOpacity
                key={tpl.id}
                style={styles.templatePickerRow}
                onPress={() => {
                  handleLoadTemplate(tpl)
                  setShowTemplatePicker(false)
                }}
                accessibilityRole="button"
                accessibilityLabel={tpl.name}
              >
                <View style={styles.templateRowInfo}>
                  <Text style={styles.templateRowName}>{tpl.name}</Text>
                  <Text style={styles.templateRowMeta}>
                    {t('groupEditor.templateMeta', { count: tpl.stitches.length, repeat: tpl.repeatCount })}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#d1d5db" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Template upgrade modal */}
      <UpgradePromptModal
        visible={showTemplateLocked}
        onClose={() => setShowTemplateLocked(false)}
        title={t('upgrade.template.title')}
        description={t('upgrade.template.desc')}
        hasAdOption={true}
        rewardType={REWARD_TYPES.TEMPLATE}
        onAdRewarded={() => unlockTemplate()}
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
    flex: 1,
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
    backgroundColor: '#fff',
  },
  dragHandle: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stitchRowLabelBtn: {
    flex: 1,
  },
  stitchRowLabel: {
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

  // Swipe to delete
  swipeDelete: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 8,
  },
  swipeDeleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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

  // Template empty state
  templateEmpty: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 16,
    alignItems: 'center',
  },
  templateEmptyText: {
    fontSize: 13,
    color: '#9ca3af',
  },

  // Template browser
  templateList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  templateRowInfo: {
    flex: 1,
  },
  templateRowName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  templateRowMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },

  // Load template button
  loadTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4b5563',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  loadTemplateButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '600',
  },

  // Template picker modal
  templatePickerContainer: {
    flex: 1,
    backgroundColor: '#faf5f0',
  },
  templatePickerHeader: {
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
  templatePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  templatePickerClose: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  templatePickerCloseText: {
    fontSize: 16,
    color: '#6b7280',
  },
  templatePickerBody: {
    flex: 1,
    paddingTop: 8,
  },
  templatePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 8,
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
