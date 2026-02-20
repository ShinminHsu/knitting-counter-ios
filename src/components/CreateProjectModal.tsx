import { useState } from 'react'
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
import { useRouter } from 'expo-router'
import { useProjectStore } from '../stores'
import { logProjectCreated } from '../services'
import { CraftType } from '../types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateProjectModalProps {
  visible: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateProjectModal({ visible, onClose }: CreateProjectModalProps) {
  const router = useRouter()
  const addProject = useProjectStore((s) => s.addProject)

  const [name, setName] = useState('')
  const [craftType, setCraftType] = useState<CraftType>('crochet')
  const [source, setSource] = useState('')
  const [notes, setNotes] = useState('')
  const [nameError, setNameError] = useState(false)

  const resetForm = () => {
    setName('')
    setCraftType('crochet')
    setSource('')
    setNotes('')
    setNameError(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError(true)
      return
    }

    const project = addProject({
      name: trimmedName,
      craftType,
      roundStartNumber: 1,
      source: source.trim() || undefined,
      notes: notes.trim() || undefined,
    })

    logProjectCreated(craftType)
    resetForm()
    onClose()
    router.push(`/project/${project.id}`)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.cancelButton}
            accessibilityLabel="取消"
          >
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>新增專案</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
            accessibilityLabel="建立專案"
          >
            <Text style={styles.submitButtonText}>建立</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 專案名稱 */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              專案名稱 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, nameError && styles.textInputError]}
              placeholder="輸入專案名稱"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={(text) => {
                setName(text)
                if (nameError && text.trim()) setNameError(false)
              }}
              returnKeyType="next"
              autoFocus
            />
            {nameError && (
              <Text style={styles.errorText}>請輸入專案名稱</Text>
            )}
          </View>

          {/* 類型 */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>類型 <Text style={styles.required}>*</Text></Text>
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

          {/* 來源/參考 */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>來源／參考</Text>
            <TextInput
              style={styles.textInput}
              placeholder="例如：書名、網址、影片連結（選填）"
              placeholderTextColor="#9ca3af"
              value={source}
              onChangeText={setSource}
              returnKeyType="next"
            />
          </View>

          {/* 備註 */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>備註</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              placeholder="任何備註事項（選填）"
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Submit button (bottom) */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleSubmit}
            accessibilityLabel="建立專案"
          >
            <Text style={styles.createButtonText}>建立專案</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#faf5f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  cancelButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  submitButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97398',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  createButton: {
    backgroundColor: '#D97398',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
})
