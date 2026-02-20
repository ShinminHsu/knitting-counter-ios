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

interface AddChartModalProps {
  visible: boolean
  defaultName: string
  onConfirm: (name: string, notes: string) => void
  onClose: () => void
}

export default function AddChartModal({ visible, defaultName, onConfirm, onClose }: AddChartModalProps) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [nameError, setNameError] = useState(false)

  useEffect(() => {
    if (visible) {
      setName(defaultName)
      setNotes('')
      setNameError(false)
    }
  }, [visible, defaultName])

  const handleConfirm = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError(true)
      return
    }
    onConfirm(trimmedName, notes.trim())
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
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>新增織圖</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
            <Text style={styles.confirmText}>新增</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* 織圖名稱 */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              織圖名稱 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, nameError && styles.textInputError]}
              value={name}
              onChangeText={(t) => {
                setName(t)
                if (nameError && t.trim()) setNameError(false)
              }}
              returnKeyType="next"
              autoFocus
              selectTextOnFocus
            />
            {nameError && <Text style={styles.errorText}>請輸入織圖名稱</Text>}
          </View>

          {/* 備註 */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>備註（選填）</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              placeholder="例如：適合初學者、使用 4mm 棒針…"
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>新增織圖</Text>
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
