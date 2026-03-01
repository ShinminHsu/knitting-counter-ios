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
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
            accessibilityLabel={t('common.cancel')}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('createProject.title')}</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
            accessibilityLabel={t('createProject.submitButton')}
          >
            <Text style={styles.submitButtonText}>{t('common.create')}</Text>
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
              placeholder={t('createProject.namePlaceholder')}
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
              <Text style={styles.errorText}>{t('createProject.nameError')}</Text>
            )}
          </View>

          {/* Craft type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('createProject.craftTypeLabel')} <Text style={styles.required}>{t('common.required')}</Text></Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  craftType === 'crochet' && styles.toggleButtonActive,
                ]}
                onPress={() => setCraftType('crochet')}
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
                ]}
                onPress={() => setCraftType('knitting')}
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

          {/* Source */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('createProject.sourceLabel')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('createProject.sourcePlaceholder')}
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
              placeholder={t('createProject.notesPlaceholder')}
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
            accessibilityLabel={t('createProject.submitButton')}
          >
            <Text style={styles.createButtonText}>{t('createProject.submitButton')}</Text>
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
    flex: 1,
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
    flex: 1,
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
