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
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../stores'
import { Project } from '../types'

interface EditProjectModalProps {
  visible: boolean
  project: Project
  onClose: () => void
}

export default function EditProjectModal({ visible, project, onClose }: EditProjectModalProps) {
  const { t } = useTranslation()
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
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('editProject.title')}</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.headerButton}>
            <Text style={styles.saveText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Project name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              {t('createProject.nameLabel')} <Text style={styles.required}>{t('common.required')}</Text>
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
            />
            {nameError && <Text style={styles.errorText}>{t('editProject.nameError')}</Text>}
          </View>

          {/* Source */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('createProject.sourceLabel')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('editProject.sourcePlaceholder')}
              placeholderTextColor="#9ca3af"
              value={source}
              onChangeText={setSource}
              returnKeyType="next"
            />
          </View>

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('createProject.notesLabel')}</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              placeholder={t('editProject.notesPlaceholder')}
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveButtonText}>{t('editProject.submitButton')}</Text>
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
    flex: 1,
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
