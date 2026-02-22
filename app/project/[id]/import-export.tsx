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
      Alert.alert('錯誤', '找不到專案資料。')
      return
    }
    setIsExporting(true)
    try {
      await exportProject(project, includePhotos)
      await logExport()
    } catch (err) {
      const message = err instanceof Error ? err.message : '匯出時發生未知錯誤。'
      Alert.alert('匯出失敗', message)
    } finally {
      setIsExporting(false)
    }
  }

  function handleExport() {
    if (!project) {
      Alert.alert('錯誤', '找不到專案資料。')
      return
    }

    const hasPhotos = project.photos && project.photos.length > 0

    if (hasPhotos) {
      // Req 8.5: ask whether to include photos
      Alert.alert(
        '是否包含照片？',
        '匯出檔案可包含或排除專案照片。',
        [
          {
            text: '包含照片',
            onPress: () => doExport(true),
          },
          {
            text: '不包含照片',
            onPress: () => doExport(false),
          },
          {
            text: '取消',
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
      const message = err instanceof Error ? err.message : '匯入時發生未知錯誤。'
      Alert.alert('匯入失敗', message)
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
        Alert.alert('匯入成功', `已建立新專案「${newProject.name}」。`, [
          {
            text: '前往新專案',
            onPress: () => router.replace(`/project/${newProject.id}`),
          },
          { text: '留在此頁', style: 'cancel' },
        ])
      } else if (mode === ImportMode.OVERWRITE_EXISTING) {
        if (!project) {
          Alert.alert('錯誤', '找不到目前專案資料。')
          return
        }
        const updated = prepareOverwriteProject(project, importPreview)
        overwriteProject(updated)
        await logImport()
        Alert.alert('匯入成功', `已覆寫專案「${updated.name}」。`)
      } else if (mode === ImportMode.MERGE_PATTERN) {
        if (!project) {
          Alert.alert('錯誤', '找不到目前專案資料。')
          return
        }
        const merged = mergeProjectCharts(project, importPreview)
        overwriteProject(merged)
        await logImport()
        const addedCount = importPreview.project.charts.length
        Alert.alert('匯入成功', `已將 ${addedCount} 個織圖合併至此專案。`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '匯入時發生未知錯誤。'
      Alert.alert('匯入失敗', message)
    }
  }

  // ── Preview Modal summary helpers ───────────────────────────────────────────

  function getTotalRounds(exportData: ProjectExportData): number {
    return exportData.project.charts.reduce((sum, c) => sum + c.rounds.length, 0)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic header title */}
      <Stack.Screen options={{ title: '匯入 / 匯出' }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Export section ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>匯出</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              將此專案的所有資料（織圖、進度、備註）匯出為檔案，方便備份或分享給他人。
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, isExporting && styles.buttonDisabled]}
              onPress={handleExport}
              disabled={isExporting}
              accessibilityLabel="匯出專案"
              accessibilityRole="button"
            >
              {isExporting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>匯出專案</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Import section ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>匯入</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              從檔案匯入專案資料，可用於還原備份或接收他人分享的專案。支援從「檔案」App、AirDrop 或其他裝置分享的 JSON 檔案。
            </Text>
            <TouchableOpacity
              style={[styles.outlineButton, isImporting && styles.buttonDisabled]}
              onPress={handleImport}
              disabled={isImporting}
              accessibilityLabel="匯入專案"
              accessibilityRole="button"
            >
              {isImporting ? (
                <ActivityIndicator color="#D97398" />
              ) : (
                <Text style={styles.outlineButtonText}>匯入專案</Text>
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

            <Text style={styles.modalTitle}>匯入預覽</Text>

            {importPreview && (
              <>
                {/* Project info summary */}
                <View style={styles.previewCard}>
                  <Text style={styles.previewProjectName}>{importPreview.project.name}</Text>
                  <View style={styles.previewMeta}>
                    <Text style={styles.previewMetaText}>
                      {importPreview.project.charts.length} 個織圖
                    </Text>
                    <Text style={styles.previewMetaSep}>·</Text>
                    <Text style={styles.previewMetaText}>
                      共 {getTotalRounds(importPreview)} 段
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalSubtitle}>請選擇匯入方式</Text>

                {/* Import mode buttons (Req 8.3) */}
                <TouchableOpacity
                  style={styles.modeButton}
                  onPress={() => handleImportMode(ImportMode.CREATE_NEW)}
                  accessibilityRole="button"
                  accessibilityLabel="新增為新專案"
                >
                  <Text style={styles.modeButtonTitle}>新增為新專案</Text>
                  <Text style={styles.modeButtonDesc}>建立一個與現有專案獨立的新專案</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modeButton}
                  onPress={() => handleImportMode(ImportMode.OVERWRITE_EXISTING)}
                  accessibilityRole="button"
                  accessibilityLabel="覆蓋此專案"
                >
                  <Text style={styles.modeButtonTitle}>覆蓋此專案</Text>
                  <Text style={styles.modeButtonDesc}>以匯入資料取代目前專案的所有織圖與設定</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modeButton}
                  onPress={() => handleImportMode(ImportMode.MERGE_PATTERN)}
                  accessibilityRole="button"
                  accessibilityLabel="合併花樣"
                >
                  <Text style={styles.modeButtonTitle}>合併花樣</Text>
                  <Text style={styles.modeButtonDesc}>將匯入的織圖附加到此專案</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setImportPreview(null)}
                  accessibilityRole="button"
                  accessibilityLabel="取消"
                >
                  <Text style={styles.cancelButtonText}>取消</Text>
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
