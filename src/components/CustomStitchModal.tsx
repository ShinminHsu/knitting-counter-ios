import { useEffect, useState } from 'react'
import {
  Alert,
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
import { useTranslation } from 'react-i18next'
import { CraftType, CustomStitchPattern } from '../types'
import { useCustomStitchStore } from '../stores/useCustomStitchStore'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CustomStitchModalProps {
  visible: boolean
  onClose: () => void
  defaultCraftType?: CraftType
  /** Pass an existing stitch to open in edit mode */
  editStitch?: CustomStitchPattern
  /** Called with the newly created stitch (create mode only) */
  onCreated?: (stitch: CustomStitchPattern) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomStitchModal({
  visible,
  onClose,
  defaultCraftType = 'crochet',
  editStitch,
  onCreated,
}: CustomStitchModalProps) {
  const { t } = useTranslation()
  const addCustomStitch = useCustomStitchStore((s) => s.addCustomStitch)
  const updateCustomStitch = useCustomStitchStore((s) => s.updateCustomStitch)
  const customStitches = useCustomStitchStore((s) => s.customStitches)

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

    // Check for duplicate name (skip check against the stitch being edited)
    const isDuplicate = customStitches.some(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase() && s.id !== editStitch?.id
    )
    if (isDuplicate) {
      Alert.alert(t('customStitch.duplicateTitle'), t('customStitch.duplicateMessage'))
      return
    }

    if (isEditMode && editStitch) {
      updateCustomStitch(editStitch.id, {
        name: trimmedName,
        abbr: abbr.trim() || trimmedName,
        englishName: englishName.trim() || trimmedName,
      })
      onClose()
    } else {
      const newStitch = addCustomStitch({
        name: trimmedName,
        abbr: abbr.trim() || trimmedName,
        englishName: englishName.trim() || trimmedName,
        craftType,
      })
      onClose()
      onCreated?.(newStitch)
    }
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
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
          >
            <Text style={styles.headerBtnCancel}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditMode ? t('customStitch.titleEdit') : t('customStitch.titleCreate')}</Text>
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
          {/* Stitch name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              {t('customStitch.nameLabel')} <Text style={styles.required}>{t('common.required')}</Text>
            </Text>
            <TextInput
              style={[styles.textInput, nameError && styles.textInputError]}
              value={name}
              onChangeText={(text) => {
                setName(text)
                if (nameError && text.trim()) setNameError(false)
              }}
              placeholder={t('customStitch.namePlaceholder')}
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
              autoFocus
              accessibilityLabel={t('customStitch.nameLabel')}
            />
            {nameError && <Text style={styles.errorText}>{t('customStitch.nameError')}</Text>}
          </View>

          {/* English name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('customStitch.englishNameLabel')}</Text>
            <TextInput
              style={styles.textInput}
              value={englishName}
              onChangeText={setEnglishName}
              placeholder={t('customStitch.englishNamePlaceholder')}
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
              autoCapitalize="words"
              accessibilityLabel={t('customStitch.englishNameLabel')}
            />
          </View>

          {/* Abbreviation */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('customStitch.abbrLabel')}</Text>
            <TextInput
              style={styles.textInput}
              value={abbr}
              onChangeText={setAbbr}
              placeholder={t('customStitch.abbrPlaceholder')}
              placeholderTextColor="#9ca3af"
              returnKeyType="done"
              autoCapitalize="none"
              accessibilityLabel={t('customStitch.abbrLabel')}
            />
          </View>

          {/* Craft type (disabled in edit mode) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              {t('createProject.craftTypeLabel')} <Text style={styles.required}>{t('common.required')}</Text>
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
                accessibilityLabel={t('common.crochet')}
                accessibilityState={{ selected: craftType === 'crochet' }}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    craftType === 'crochet' && styles.toggleButtonTextActive,
                  ]}
                >
                  {t('common.crochet')}
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
                accessibilityLabel={t('common.knitting')}
                accessibilityState={{ selected: craftType === 'knitting' }}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    craftType === 'knitting' && styles.toggleButtonTextActive,
                  ]}
                >
                  {t('common.knitting')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm button (bottom) */}
          <TouchableOpacity
            style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!canConfirm}
            accessibilityLabel={isEditMode ? t('customStitch.titleEdit') : t('customStitch.titleCreate')}
            accessibilityRole="button"
          >
            <Text style={styles.confirmButtonText}>{isEditMode ? t('customStitch.submitEdit') : t('customStitch.submitCreate')}</Text>
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
