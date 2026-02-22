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
import { CraftType } from '../types'
import { useCustomStitchStore } from '../stores/useCustomStitchStore'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CustomStitchModalProps {
  visible: boolean
  onClose: () => void
  defaultCraftType?: CraftType
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomStitchModal({
  visible,
  onClose,
  defaultCraftType = 'crochet',
}: CustomStitchModalProps) {
  const addCustomStitch = useCustomStitchStore((s) => s.addCustomStitch)

  const [name, setName] = useState('')
  const [englishName, setEnglishName] = useState('')
  const [abbr, setAbbr] = useState('')
  const [craftType, setCraftType] = useState<CraftType>(defaultCraftType)
  const [nameError, setNameError] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setName('')
      setEnglishName('')
      setAbbr('')
      setCraftType(defaultCraftType)
      setNameError(false)
    }
  }, [visible, defaultCraftType])

  function handleCancel() {
    onClose()
  }

  function handleConfirm() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError(true)
      return
    }

    addCustomStitch({
      name: trimmedName,
      abbr: abbr.trim() || trimmedName,
      englishName: englishName.trim() || trimmedName,
      craftType,
    })

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
          <Text style={styles.headerTitle}>新增自訂針法</Text>
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

          {/* 類型：鉤針／棒針 */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              類型 <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  craftType === 'crochet' && styles.toggleButtonActive,
                ]}
                onPress={() => setCraftType('crochet')}
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
                ]}
                onPress={() => setCraftType('knitting')}
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
            accessibilityLabel="新增自訂針法"
            accessibilityRole="button"
          >
            <Text style={styles.confirmButtonText}>新增針法</Text>
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
