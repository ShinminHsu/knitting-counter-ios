import { useEffect, useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useProjectStore } from '../../../src/stores'
import { logScreenView } from '../../../src/services'
import { SCREEN_NAMES } from '../../../src/constants'
import { Chart, ProjectPhoto } from '../../../src/types'
import EditProjectModal from '../../../src/components/EditProjectModal'
import AddChartModal from '../../../src/components/AddChartModal'
import PhotoGallery from '../../../src/components/PhotoGallery'
import PhotoViewer from '../../../src/components/PhotoViewer'
import { showConfirmDialog } from '../../../src/components/ConfirmDialog'
import { formatDate } from '../../../src/utils/helpers'
import {
  savePhoto,
  deletePhoto as deletePhotoFile,
  takePhoto,
  pickPhotoFromLibrary,
} from '../../../src/services/photoService'

// ─── Craft Type Badge ─────────────────────────────────────────────────────────

function CraftTypeBadge({ craftType }: { craftType: 'crochet' | 'knitting' }) {
  const isCrochet = craftType === 'crochet'
  return (
    <View
      style={[
        styles.craftBadge,
        { backgroundColor: isCrochet ? '#dbeafe' : '#dcfce7' },
      ]}
      accessibilityLabel={isCrochet ? '鉤針專案' : '棒針專案'}
    >
      <Text
        style={[
          styles.craftBadgeText,
          { color: isCrochet ? '#1d4ed8' : '#15803d' },
        ]}
      >
        {isCrochet ? '鉤針' : '棒針'}
      </Text>
    </View>
  )
}

// ─── Chart Card ───────────────────────────────────────────────────────────────

interface ChartCardProps {
  chart: Chart
  projectId: string
  onDelete: () => void
}

function ChartCard({ chart, projectId, onDelete }: ChartCardProps) {
  const router = useRouter()
  const totalRounds = chart.rounds.length
  const progress =
    totalRounds > 0
      ? Math.round((chart.currentRound / totalRounds) * 100)
      : 0

  return (
    <View style={styles.chartCard}>
      {/* Chart name row */}
      <View style={styles.chartCardHeader}>
        <Text style={styles.chartCardName} numberOfLines={1}>
          {chart.name}
        </Text>
        <View style={styles.chartCardHeaderRight}>
          {chart.isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>完成</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onDelete}
            accessibilityLabel={`刪除織圖：${chart.name}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="trash-2" size={15} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes */}
      {chart.notes ? (
        <Text style={styles.chartCardNotes} numberOfLines={2}>
          {chart.notes}
        </Text>
      ) : null}

      {/* Progress */}
      <Text style={styles.chartCardProgress}>
        進度：第 {chart.currentRound} / {totalRounds} 段
        {totalRounds > 0 ? `（${progress}%）` : ''}
      </Text>

      {/* Action buttons */}
      <View style={styles.chartActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            router.push(`/project/${projectId}/editor?chartId=${chart.id}`)
          }
          accessibilityLabel={`編輯織圖：${chart.name}`}
        >
          <Text style={styles.actionButtonText}>編輯織圖</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() =>
            router.push(`/project/${projectId}/tracking?chartId=${chart.id}`)
          }
          accessibilityLabel={`開始追蹤：${chart.name}`}
        >
          <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
            開始追蹤
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── ProjectDetailScreen ──────────────────────────────────────────────────────

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const project = useProjectStore((s) => s.getProjectById(id ?? ''))
  const addChart = useProjectStore((s) => s.addChart)
  const deleteChart = useProjectStore((s) => s.deleteChart)
  const addPhoto = useProjectStore((s) => s.addPhoto)
  const deletePhotoStore = useProjectStore((s) => s.deletePhoto)
  const setCoverPhoto = useProjectStore((s) => s.setCoverPhoto)

  const [showEditProject, setShowEditProject] = useState(false)
  const [showAddChart, setShowAddChart] = useState(false)
  const [viewingPhoto, setViewingPhoto] = useState<ProjectPhoto | null>(null)

  // ── 照片處理 ────────────────────────────────────────────────────────────────

  const handleAddPhoto = () => {
    Alert.alert('新增照片', undefined, [
      {
        text: '使用相機',
        onPress: async () => {
          const uri = await takePhoto()
          if (uri && project) {
            const photo = await savePhoto(uri, project.id, 'progress')
            addPhoto(project.id, photo)
          }
        },
      },
      {
        text: '從相簿選擇',
        onPress: async () => {
          const uri = await pickPhotoFromLibrary()
          if (uri && project) {
            const photo = await savePhoto(uri, project.id, 'reference')
            addPhoto(project.id, photo)
          }
        },
      },
      { text: '取消', style: 'cancel' },
    ])
  }

  const handleDeletePhoto = (photo: ProjectPhoto) => {
    showConfirmDialog({
      title: '刪除照片',
      message: '確定要刪除這張照片嗎？此操作無法復原。',
      confirmLabel: '刪除',
      destructive: true,
      onConfirm: async () => {
        await deletePhotoFile(photo)
        deletePhotoStore(project!.id, photo.id)
      },
    })
  }

  const handleSetCover = (photo: ProjectPhoto) => {
    if (project) {
      setCoverPhoto(project.id, photo.id)
    }
  }

  // ── 織圖處理 ────────────────────────────────────────────────────────────────

  const handleDeleteChart = (chart: Chart) => {
    showConfirmDialog({
      title: '刪除織圖',
      message: `確定要刪除「${chart.name}」嗎？此操作無法復原。`,
      confirmLabel: '刪除',
      destructive: true,
      onConfirm: () => {
        deleteChart(project!.id, chart.id)
      },
    })
  }

  // Analytics: log screen view on mount (Req 10.2)
  useEffect(() => {
    logScreenView(SCREEN_NAMES.PROJECT_DETAIL)
  }, [])

  // Project not found guard
  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>找不到此專案</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.back()}
          >
            <Text style={styles.actionButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Header: project name + craft type badge + edit button ─────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.projectName} numberOfLines={2}>
              {project.name}
            </Text>
            <CraftTypeBadge craftType={project.craftType} />
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => router.push(`/project/${project.id}/import-export`)}
              accessibilityLabel="匯入/匯出"
            >
              <Feather name="share" size={18} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => setShowEditProject(true)}
              accessibilityLabel="編輯專案"
            >
              <Feather name="edit" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Project meta: date + source + notes ──────────────────────────── */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>建立</Text>
            <Text style={styles.metaValue}>{formatDate(project.createdAt)}</Text>
          </View>
          {project.source ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>來源</Text>
              <Text style={styles.metaValue} numberOfLines={2}>{project.source}</Text>
            </View>
          ) : null}
          {project.notes ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>備註</Text>
              <Text style={styles.metaValue}>{project.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Photos section ────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>相片</Text>
          </View>
          <PhotoGallery
            photos={project.photos}
            onAdd={handleAddPhoto}
            onDelete={handleDeletePhoto}
            onSetCover={handleSetCover}
            onPhotoPress={(photo) => setViewingPhoto(photo)}
          />
        </View>

        {/* ── Charts section ────────────────────────────────────────────────── */}
        <View style={styles.section}>
          {/* Section header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>織圖</Text>
            <TouchableOpacity
              style={styles.addChartButton}
              onPress={() => setShowAddChart(true)}
              accessibilityLabel="新增織圖"
            >
              <Text style={styles.addChartButtonText}>+ 新增</Text>
            </TouchableOpacity>
          </View>

          {project.charts.length === 0 ? (
            /* Empty state — Req 1.7 / Req 2.1 */
            <View style={styles.emptyCharts}>
              <MaterialCommunityIcons name="file-outline" size={36} color="#d1d5db" />
              <Text style={styles.emptyChartsTitle}>尚無織圖</Text>
              <Text style={styles.emptyChartsHint}>
                點擊「+ 新增」建立第一個織圖，開始記錄你的編織圖案。
              </Text>
            </View>
          ) : (
            /* ── Vertical chart card list (Req 2.1) ──────────────────────── */
            <View style={styles.chartList}>
              {project.charts.map((chart: Chart) => (
                <ChartCard
                  key={chart.id}
                  chart={chart}
                  projectId={project.id}
                  onDelete={() => handleDeleteChart(chart)}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── TODO: AdBanner at the bottom ─────────────────────────────────── */}

      </ScrollView>

      <EditProjectModal
        visible={showEditProject}
        project={project}
        onClose={() => setShowEditProject(false)}
      />

      <AddChartModal
        visible={showAddChart}
        defaultName={`織圖 ${project.charts.length + 1}`}
        onConfirm={(name, notes) => {
          addChart(project.id, name, notes || undefined)
          setShowAddChart(false)
        }}
        onClose={() => setShowAddChart(false)}
      />

      {viewingPhoto && (
        <PhotoViewer
          photo={viewingPhoto}
          visible={true}
          onClose={() => setViewingPhoto(null)}
        />
      )}
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
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  projectName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  craftBadge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  craftBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  headerIconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Project meta
  metaSection: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    width: 36,
    paddingTop: 1,
  },
  metaValue: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  addChartButton: {
    backgroundColor: '#D97398',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addChartButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Chart card list (vertical)
  chartList: {
    gap: 10,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  chartCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartCardName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
  },
  chartCardNotes: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  chartCardProgress: {
    fontSize: 14,
    color: '#374151',
  },

  // Action buttons
  chartActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D97398',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#D97398',
    borderColor: '#D97398',
  },
  actionButtonText: {
    color: '#D97398',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonTextPrimary: {
    color: '#fff',
  },

  // Empty states
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 16,
  },
  emptyCharts: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyChartsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  emptyChartsHint: {
    fontSize: 13,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
  },
})
