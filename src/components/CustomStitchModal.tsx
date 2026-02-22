import { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { CraftType, CustomStitchPattern } from '../types'
import { useCustomStitchStore } from '../stores/useCustomStitchStore'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CustomStitchModalProps {
  visible: boolean
  onClose: () => void
  defaultCraftType?: CraftType
  /** Pass an existing stitch to open in edit mode */
  editStitch?: CustomStitchPattern
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomStitchModal({
  visible,
  onClose,
  defaultCraftType = 'crochet',
  editStitch,
}: CustomStitchModalProps) {
  const addCustomStitch = useCustomStitchStore((s) => s.addCustomStitch)
  const updateCustomStitch = useCustomStitchStore((s) => s.updateCustomStitch)

  const isEditMode = editStitch !== undefined

  const [name, setName] = useState('')
  const [englishName, setEnglishName] = useState('')
  const [abbr, setAbbr] = useState('')
  const [craftType, setCraftType] = useState<CraftType>(defaultCraftType)
  const [nameError, setNameError] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      if (editStitch) {
        setName(editStitch.name)
        setEnglishName(editStitch.englishName === editStitch.name ? '' : editStitch.englishName)
        setAbbr(editStitch.abbr === editStitch.name ? '' : editStitch.abbr)
        setCraftType(editStitch.craftType)
      } else {
        setName('')
        setEnglishName('')
        setAbbr('')
        setCraftType(defaultCraftType)
      }
      setNameError(false)
    }
  }, [visible, defaultCraftType, editStitch])

  function handleCancel() {
    onClose()
  }

  function handleConfirm() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError(true)
      return
    }

    if (isEditMode && editStitch) {
      updateCustomStitch(editStitch.id, {
        name: trimmedName,
        abbr: abbr.trim() || trimmedName,
        englishName: englishName.trim() || trimmedName,
      })
    } else {
      addCustomStitch({
        name: trimmedName,
        abbr: abbr.trim() || trimmedName,
        englishName: englishName.trim() || trimmedName,
        craftType,
      })
    }

    onClose()
  }

  const canConfirm = name.trim().length > 0

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
          <Text style={styles.headerTitle}>{isEditMode ? '編輯自訂針法' : '新增自訂針法'}</Text>
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
          {/* 針法名稱（必填）*/}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              針法名稱 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, nameError && styles.textInputError]}
              value={name}
              onChangeText={(text) => {
                setName(text)
                if (nameError && text.trim()) setNameError(false)
              }}
              placeholder="例：貝殼針"
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
              autoFocus
              accessibilityLabel="針法名稱"
            />
            {nameError && <Text style={styles.errorText}>請輸入針法名稱</Text>}
          </View>

          {/* 英文名稱（選填）*/}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>英文名稱（選填）</Text>
            <TextInput
              style={styles.textInput}
              value={englishName}
              onChangeText={setEnglishName}
              placeholder="e.g. Shell Stitch"
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
              autoCapitalize="words"
              accessibilityLabel="英文名稱"
            />
          </View>

          {/* 符號／縮寫（選填）*/}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>符號／縮寫（選填）</Text>
            <TextInput
              style={styles.textInput}
              value={abbr}
              onChangeText={setAbbr}
              placeholder="e.g. sh"
              placeholderTextColor="#9ca3af"
              returnKeyType="done"
              autoCapitalize="none"
              accessibilityLabel="符號縮寫"
            />
          </View>

          {/* 類型：鉤針／棒針（編輯模式下不可更改）*/}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              類型 <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  craftType === 'crochet' && styles.toggleButtonActive,
                  isEditMode && styles.toggleButtonDisabled,
                ]}
                onPress={() => !isEditMode && setCraftType('crochet')}
                disabled={isEditMode}
                accessibilityLabel="鉤針"
                accessibilityState={{ selected: craftType === 'crochet' }}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    craftType === 'crochet' && styles.toggleButtonTextActive,
                  ]}
                >
                  鉤針
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  craftType === 'knitting' && styles.toggleButtonActive,
                  isEditMode && styles.toggleButtonDisabled,
                ]}
                onPress={() => !isEditMode && setCraftType('knitting')}
                disabled={isEditMode}
                accessibilityLabel="棒針"
                accessibilityState={{ selected: craftType === 'knitting' }}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    craftType === 'knitting' && styles.toggleButtonTextActive,
                  ]}
                >
                  棒針
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm button (bottom) */}
          <TouchableOpacity
            style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!canConfirm}
            accessibilityLabel={isEditMode ? '儲存自訂針法' : '新增自訂針法'}
            accessibilityRole="button"
          >
            <Text style={styles.confirmButtonText}>{isEditMode ? '儲存針法' : '新增針法'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    minHeight: 44,
    justifyContent: 'center',
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
    padding: 16,
    paddingBottom: 32,
    gap: 20,
  },

  // Field
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    color: '#ef4444',
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 44,
  },
  textInputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
  },

  // CraftType toggle
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 10,
  },
  toggleButtonDisabled: {
    opacity: 0.6,
  },
  toggleButtonActive: {
    backgroundColor: '#fce7f0',
    borderColor: '#D97398',
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  toggleButtonTextActive: {
    color: '#C4527F',
    fontWeight: '700',
  },

  // Confirm button
  confirmButton: {
    backgroundColor: '#D97398',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#f3c5d6',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
})
