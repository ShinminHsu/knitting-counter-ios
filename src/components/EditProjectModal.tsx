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
import { useProjectStore } from '../stores'
import { Project } from '../types'

interface EditProjectModalProps {
  visible: boolean
  project: Project
  onClose: () => void
}

export default function EditProjectModal({ visible, project, onClose }: EditProjectModalProps) {
  const updateProject = useProjectStore((s) => s.updateProject)

  const [name, setName] = useState('')
  const [source, setSource] = useState('')
  const [notes, setNotes] = useState('')
  const [nameError, setNameError] = useState(false)

  // Sync form with project data when modal opens
  useEffect(() => {
    if (visible) {
      setName(project.name)
      setSource(project.source ?? '')
      setNotes(project.notes ?? '')
      setNameError(false)
    }
  }, [visible, project])

  const handleSubmit = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError(true)
      return
    }
    updateProject(project.id, {
      name: trimmedName,
      source: source.trim() || undefined,
      notes: notes.trim() || undefined,
    })
    onClose()
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
          <Text style={styles.headerTitle}>編輯專案</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.headerButton}>
            <Text style={styles.saveText}>儲存</Text>
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
              value={name}
              onChangeText={(t) => {
                setName(t)
                if (nameError && t.trim()) setNameError(false)
              }}
              returnKeyType="next"
              autoFocus
            />
            {nameError && <Text style={styles.errorText}>請輸入專案名稱</Text>}
          </View>

          {/* 來源／參考 */}
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
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveButtonText}>儲存變更</Text>
          </TouchableOpacity>
        </ScrollView>
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
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97398',
    textAlign: 'right',
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
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
  },
  saveButton: {
    backgroundColor: '#D97398',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
})
