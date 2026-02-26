import { useEffect, useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native'
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { logScreenView, logImport, logExport } from '../../../src/services'
import { SCREEN_NAMES } from '../../../src/constants'
import { useProjectStore } from '../../../src/stores/useProjectStore'
import {
  exportProject,
  pickImportFile,
  parseImportFile,
  prepareProjectForImport,
  prepareOverwriteProject,
  mergeProjectCharts,
} from '../../../src/services/importExportService'
import { ImportMode, ProjectExportData } from '../../../src/types'

// ─── ImportExportScreen ───────────────────────────────────────────────────────

export default function ImportExportScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importPreview, setImportPreview] = useState<ProjectExportData | null>(null)

  const project = useProjectStore((s) => s.getProjectById(id ?? ''))
  const importProject = useProjectStore((s) => s.importProject)
  const overwriteProject = useProjectStore((s) => s.overwriteProject)

  // Analytics: log screen view on mount (Req 10.2)
  useEffect(() => {
    logScreenView(SCREEN_NAMES.IMPORT_EXPORT)
  }, [])

  // ── Export ──────────────────────────────────────────────────────────────────

  async function doExport(includePhotos: boolean) {
    if (!project) {
      Alert.alert(t('common.error'), t('importExport.notFound'))
      return
    }
    setIsExporting(true)
    try {
      await exportProject(project, includePhotos)
      await logExport()
    } catch (err) {
      const message = err instanceof Error ? err.message : t('importExport.exportUnknownError')
      Alert.alert(t('importExport.exportFailed'), message)
    } finally {
      setIsExporting(false)
    }
  }

  function handleExport() {
    if (!project) {
      Alert.alert(t('common.error'), t('importExport.notFound'))
      return
    }

    const hasPhotos = project.photos && project.photos.length > 0

    if (hasPhotos) {
      // Req 8.5: ask whether to include photos
      Alert.alert(
        t('importExport.includePhotosTitle'),
        t('importExport.includePhotosMessage'),
        [
          {
            text: t('importExport.includePhotos'),
            onPress: () => doExport(true),
          },
          {
            text: t('importExport.excludePhotos'),
            onPress: () => doExport(false),
          },
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
        ]
      )
    } else {
      doExport(false)
    }
  }

  // ── Import ──────────────────────────────────────────────────────────────────

  async function handleImport() {
    setIsImporting(true)
    try {
      // Step 1: Let user pick a JSON file (Req 8.2)
      const uri = await pickImportFile()
      if (!uri) return // user cancelled

      // Step 2: Read and validate the file (Req 8.4)
      const exportData = await parseImportFile(uri)

      // Step 3: Show preview modal (Req 8.3)
      setImportPreview(exportData)
    } catch (err) {
      // Req 8.4: show descriptive error message
      const message = err instanceof Error ? err.message : t('importExport.importUnknownError')
      Alert.alert(t('importExport.importFailed'), message)
    } finally {
      setIsImporting(false)
    }
  }

  async function handleImportMode(mode: ImportMode) {
    if (!importPreview) return
    setImportPreview(null)

    try {
      if (mode === ImportMode.CREATE_NEW) {
        const newProject = prepareProjectForImport(importPreview)
        importProject(newProject)
        await logImport()
        Alert.alert(t('importExport.importSuccess'), t('importExport.importNewSuccess', { name: newProject.name }), [
          {
            text: t('importExport.goToProject'),
            onPress: () => router.replace(`/project/${newProject.id}`),
          },
          { text: t('importExport.stayHere'), style: 'cancel' },
        ])
      } else if (mode === ImportMode.OVERWRITE_EXISTING) {
        if (!project) {
          Alert.alert(t('common.error'), t('importExport.notFound'))
          return
        }
        const updated = prepareOverwriteProject(project, importPreview)
        overwriteProject(updated)
        await logImport()
        Alert.alert(t('importExport.importSuccess'), t('importExport.importOverwriteSuccess', { name: updated.name }))
      } else if (mode === ImportMode.MERGE_PATTERN) {
        if (!project) {
          Alert.alert(t('common.error'), t('importExport.notFound'))
          return
        }
        const merged = mergeProjectCharts(project, importPreview)
        overwriteProject(merged)
        await logImport()
        const addedCount = importPreview.project.charts.length
        Alert.alert(t('importExport.importSuccess'), t('importExport.importMergeSuccess', { count: addedCount }))
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('importExport.importUnknownError')
      Alert.alert(t('importExport.importFailed'), message)
    }
  }

  // ── Preview Modal summary helpers ───────────────────────────────────────────

  function getTotalRounds(exportData: ProjectExportData): number {
    return exportData.project.charts.reduce((sum, c) => sum + c.rounds.length, 0)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic header title */}
      <Stack.Screen options={{ title: t('importExport.title') }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Export section ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('importExport.exportSection')}</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>{t('importExport.exportDesc')}</Text>
            <TouchableOpacity
              style={[styles.primaryButton, isExporting && styles.buttonDisabled]}
              onPress={handleExport}
              disabled={isExporting}
              accessibilityLabel={t('importExport.exportButton')}
              accessibilityRole="button"
            >
              {isExporting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>{t('importExport.exportButton')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Import section ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('importExport.importSection')}</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>{t('importExport.importDesc')}</Text>
            <TouchableOpacity
              style={[styles.outlineButton, isImporting && styles.buttonDisabled]}
              onPress={handleImport}
              disabled={isImporting}
              accessibilityLabel={t('importExport.importButton')}
              accessibilityRole="button"
            >
              {isImporting ? (
                <ActivityIndicator color="#D97398" />
              ) : (
                <Text style={styles.outlineButtonText}>{t('importExport.importButton')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ── Import Preview Modal (Req 8.3) ────────────────────────────────────── */}
      <Modal
        visible={importPreview !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setImportPreview(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setImportPreview(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>{t('importExport.previewTitle')}</Text>

            {importPreview && (
              <>
                {/* Project info summary */}
                <View style={styles.previewCard}>
                  <Text style={styles.previewProjectName}>{importPreview.project.name}</Text>
                  <View style={styles.previewMeta}>
                    <Text style={styles.previewMetaText}>
                      {t('importExport.previewCharts', { count: importPreview.project.charts.length })}
                    </Text>
                    <Text style={styles.previewMetaSep}>·</Text>
                    <Text style={styles.previewMetaText}>
                      {t('importExport.previewRounds', { count: getTotalRounds(importPreview) })}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalSubtitle}>{t('importExport.selectMode')}</Text>

                {/* Import mode buttons (Req 8.3) */}
                <TouchableOpacity
                  style={styles.modeButton}
                  onPress={() => handleImportMode(ImportMode.CREATE_NEW)}
                  accessibilityRole="button"
                  accessibilityLabel={t('importExport.modeNewTitle')}
                >
                  <Text style={styles.modeButtonTitle}>{t('importExport.modeNewTitle')}</Text>
                  <Text style={styles.modeButtonDesc}>{t('importExport.modeNewDesc')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modeButton}
                  onPress={() => handleImportMode(ImportMode.OVERWRITE_EXISTING)}
                  accessibilityRole="button"
                  accessibilityLabel={t('importExport.modeOverwriteTitle')}
                >
                  <Text style={styles.modeButtonTitle}>{t('importExport.modeOverwriteTitle')}</Text>
                  <Text style={styles.modeButtonDesc}>{t('importExport.modeOverwriteDesc')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modeButton}
                  onPress={() => handleImportMode(ImportMode.MERGE_PATTERN)}
                  accessibilityRole="button"
                  accessibilityLabel={t('importExport.modeMergeTitle')}
                >
                  <Text style={styles.modeButtonTitle}>{t('importExport.modeMergeTitle')}</Text>
                  <Text style={styles.modeButtonDesc}>{t('importExport.modeMergeDesc')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setImportPreview(null)}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.cancel')}
                >
                  <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5f0',
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },

  // Section
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },

  // Buttons
  primaryButton: {
    backgroundColor: '#D97398',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  outlineButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D97398',
  },
  outlineButtonText: {
    color: '#D97398',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    gap: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Preview card
  previewCard: {
    backgroundColor: '#fdf2f8',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#fbcfe8',
  },
  previewProjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewMetaText: {
    fontSize: 13,
    color: '#6b7280',
  },
  previewMetaSep: {
    fontSize: 13,
    color: '#d1d5db',
  },

  // Mode buttons
  modeButton: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 14,
    gap: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modeButtonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  modeButtonDesc: {
    fontSize: 13,
    color: '#6b7280',
  },

  // Cancel
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
})
