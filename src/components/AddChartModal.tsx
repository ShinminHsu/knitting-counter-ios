import { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTranslation } from 'react-i18next'

interface AddChartModalProps {
  visible: boolean
  defaultName: string
  defaultRoundStart?: 0 | 1
  onConfirm: (name: string, notes: string, roundStartNumber: 0 | 1) => void
  onClose: () => void
}

export default function AddChartModal({ visible, defaultName, defaultRoundStart = 1, onConfirm, onClose }: AddChartModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [nameError, setNameError] = useState(false)
  const [roundStart, setRoundStart] = useState<0 | 1>(defaultRoundStart)

  useEffect(() => {
    if (visible) {
      setName(defaultName)
      setNotes('')
      setNameError(false)
      setRoundStart(defaultRoundStart)
    }
  }, [visible, defaultName, defaultRoundStart])

  const handleConfirm = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError(true)
      return
    }
    onConfirm(trimmedName, notes.trim(), roundStart)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('addChart.title')}</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
            <Text style={styles.confirmText}>{t('common.add')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Chart name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              {t('addChart.nameLabel')} <Text style={styles.required}>{t('common.required')}</Text>
            </Text>
            <TextInput
              style={[styles.textInput, nameError && styles.textInputError]}
              value={name}
              onChangeText={(text) => {
                setName(text)
                if (nameError && text.trim()) setNameError(false)
              }}
              returnKeyType="next"
              autoFocus
              selectTextOnFocus
            />
            {nameError && <Text style={styles.errorText}>{t('addChart.nameError')}</Text>}
          </View>

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('addChart.notesLabel')}</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              placeholder={t('addChart.notesPlaceholder')}
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Round start number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('addChart.roundStartLabel')}</Text>
            <View style={styles.toggleRow}>
              {([0, 1] as const).map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.toggleButton, roundStart === val && styles.toggleButtonActive]}
                  onPress={() => setRoundStart(val)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: roundStart === val }}
                >
                  <Text style={[styles.toggleButtonText, roundStart === val && styles.toggleButtonTextActive]}>
                    {val === 0 ? t('addChart.roundStartFrom0') : t('addChart.roundStartFrom1')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>{t('addChart.submitButton')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#faf5f0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97398',
    textAlign: 'right',
  },
  content: {
    padding: 16,
    gap: 20,
  },
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
  textInputMultiline: {
    minHeight: 88,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
  },
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
  confirmButton: {
    backgroundColor: '#D97398',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
})
