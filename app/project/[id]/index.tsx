import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../../../src/stores'
import { logScreenView } from '../../../src/services'
import { SCREEN_NAMES } from '../../../src/constants'
import { Chart, ProjectPhoto } from '../../../src/types'
import EditProjectModal from '../../../src/components/EditProjectModal'
import AddChartModal from '../../../src/components/AddChartModal'
import PhotoGallery from '../../../src/components/PhotoGallery'
import PhotoViewer from '../../../src/components/PhotoViewer'
import { showConfirmDialog } from '../../../src/components/ConfirmDialog'
import AdBanner from '../../../src/components/AdBanner'
import UpgradePromptModal from '../../../src/components/UpgradePromptModal'
import ScreenHeader from '../../../src/components/ScreenHeader'
import { useEntitlementStore } from '../../../src/stores'
import { REWARD_TYPES } from '../../../src/constants/analytics'
import SpotlightOverlay from '../../../src/components/SpotlightOverlay'
import { useSpotlight } from '../../../src/hooks/useSpotlight'
import { formatDate } from '../../../src/utils/helpers'
import {
  savePhoto,
  deletePhoto as deletePhotoFile,
  takePhoto,
  pickPhotoFromLibrary,
  photoFileExists,
} from '../../../src/services/photoService'

// ─── Craft Type Badge ─────────────────────────────────────────────────────────

function CraftTypeBadge({ craftType }: { craftType: 'crochet' | 'knitting' }) {
  const { t } = useTranslation()
  const isCrochet = craftType === 'crochet'
  return (
    <View
      style={[
        styles.craftBadge,
        { backgroundColor: '#f3f4f6' },
      ]}
    >
      <Text
        style={[
          styles.craftBadgeText,
          { color: '#6b7280' },
        ]}
      >
        {isCrochet ? t('common.crochet') : t('common.knitting')}
      </Text>
    </View>
  )
}

// ─── Chart Card ───────────────────────────────────────────────────────────────

interface ChartCardProps {
  chart: Chart
  projectId: string
  onDelete: () => void
  onDuplicate: () => void
}

function ChartCard({ chart, projectId, onDelete, onDuplicate }: ChartCardProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const totalRounds = chart.rounds.length
  const progress =
    totalRounds > 0
      ? Math.round((chart.currentRound / totalRounds) * 100)
      : 0

  return (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.swipeDeleteBtn}
          onPress={onDelete}
          accessibilityLabel={t('projectDetail.deleteChart', { name: chart.name })}
          accessibilityRole="button"
        >
          <Text style={styles.swipeDeleteText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      )}
    >
    <TouchableOpacity
      activeOpacity={1}
      onLongPress={onDuplicate}
      delayLongPress={400}
    >
    <View style={styles.chartCard}>
      {/* Chart name row */}
      <View style={styles.chartCardHeader}>
        <Text style={styles.chartCardName} numberOfLines={1}>
          {chart.name}
        </Text>
        {chart.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>{t('projectDetail.chartCompleted')}</Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {chart.notes ? (
        <Text style={styles.chartCardNotes} numberOfLines={2}>
          {chart.notes}
        </Text>
      ) : null}

      {/* Progress */}
      <Text style={styles.chartCardProgress}>
        {totalRounds > 0
          ? t('projectDetail.chartProgress', { current: chart.currentRound, total: totalRounds, progress })
          : `${chart.currentRound} / ${totalRounds}`}
      </Text>

      {/* Action buttons */}
      <View style={styles.chartActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            router.push(`/project/${projectId}/editor?chartId=${chart.id}`)
          }
        >
          <Text style={styles.actionButtonText}>{t('projectDetail.editChart')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() =>
            router.push(`/project/${projectId}/tracking?chartId=${chart.id}`)
          }
        >
          <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
            {t('projectDetail.startTracking')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </TouchableOpacity>
    </Swipeable>
  )
}

// ─── ProjectDetailScreen ──────────────────────────────────────────────────────

export default function ProjectDetailScreen() {
  const { t, i18n } = useTranslation()
  const metaLabelWidth = i18n.language === 'ja' ? 56 : i18n.language === 'en' ? 52 : 36
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const project = useProjectStore((s) => s.getProjectById(id ?? ''))
  const addChart = useProjectStore((s) => s.addChart)
  const deleteChart = useProjectStore((s) => s.deleteChart)
  const duplicateChart = useProjectStore((s) => s.duplicateChart)
  const addPhoto = useProjectStore((s) => s.addPhoto)
  const deletePhotoStore = useProjectStore((s) => s.deletePhoto)
  const setCoverPhoto = useProjectStore((s) => s.setCoverPhoto)

  const [showEditProject, setShowEditProject] = useState(false)
  const [showAddChart, setShowAddChart] = useState(false)
  const [viewingPhoto, setViewingPhoto] = useState<ProjectPhoto | null>(null)
  const [showPhotoUpgrade, setShowPhotoUpgrade] = useState(false)
  const maxPhotosPerProject = useEntitlementStore((s) => s.maxPhotosPerProject)
  const adUnlockedPhotoCount = useEntitlementStore((s) => s.adUnlockedPhotoCount)
  const incrementAdUnlockedPhotos = useEntitlementStore((s) => s.incrementAdUnlockedPhotos)

  const addChartButtonRef = useRef<View>(null)
  const exportButtonRef = useRef<View>(null)
  const editButtonRef = useRef<View>(null)

  const { showSpotlight, resolvedSteps, dismiss } = useSpotlight(
    SCREEN_NAMES.PROJECT_DETAIL,
    [
      {
        ref: addChartButtonRef,
        title: t('onboarding.projectDetailAddChartTitle'),
        description: t('onboarding.projectDetailAddChartDesc'),
      },
      {
        ref: exportButtonRef,
        title: t('onboarding.projectDetailExportTitle'),
        description: t('onboarding.projectDetailExportDesc'),
      },
      {
        ref: editButtonRef,
        title: t('onboarding.projectDetailEditTitle'),
        description: t('onboarding.projectDetailEditDesc'),
      },
    ]
  )

  // ── 照片處理 ────────────────────────────────────────────────────────────────

  const doAddPhoto = () => {
    Alert.alert(t('projectDetail.addPhotoTitle'), undefined, [
      {
        text: t('projectDetail.addPhotoCamera'),
        onPress: async () => {
          const uri = await takePhoto()
          if (uri && project) {
            const photo = await savePhoto(uri, project.id, 'progress')
            addPhoto(project.id, photo)
          }
        },
      },
      {
        text: t('projectDetail.addPhotoLibrary'),
        onPress: async () => {
          const uri = await pickPhotoFromLibrary()
          if (uri && project) {
            const photo = await savePhoto(uri, project.id, 'reference')
            addPhoto(project.id, photo)
          }
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ])
  }

  const handleAddPhoto = () => {
    if (project && project.photos.length >= maxPhotosPerProject()) {
      setShowPhotoUpgrade(true)
    } else {
      doAddPhoto()
    }
  }

  const handleDeletePhoto = (photo: ProjectPhoto) => {
    showConfirmDialog({
      title: t('projectDetail.deletePhotoTitle'),
      message: t('projectDetail.deletePhotoMessage'),
      confirmLabel: t('common.delete'),
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
      title: t('projectDetail.deleteChartTitle'),
      message: t('projectDetail.deleteChartMessage', { name: chart.name }),
      confirmLabel: t('common.delete'),
      destructive: true,
      onConfirm: () => {
        deleteChart(project!.id, chart.id)
      },
    })
  }

  const handleLongPressChart = (chart: Chart) => {
    Alert.alert(chart.name, undefined, [
      {
        text: t('common.duplicate'),
        onPress: () => duplicateChart(project!.id, chart.id),
      },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => handleDeleteChart(chart),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ])
  }

  // Analytics: log screen view on mount (Req 10.2)
  useEffect(() => {
    logScreenView(SCREEN_NAMES.PROJECT_DETAIL)
  }, [])

  // Cleanup orphaned photo metadata (files deleted after app rebuild)
  useEffect(() => {
    if (!project || project.photos.length === 0) return
    const cleanup = async () => {
      for (const photo of project.photos) {
        const exists = await photoFileExists(photo)
        if (!exists) {
          deletePhotoStore(project.id, photo.id)
        }
      }
    }
    cleanup()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  // Project not found guard
  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={t('projectDetail.title')} />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t('projectDetail.notFound')}</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.back()}
          >
            <Text style={styles.actionButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('projectDetail.title')} />
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
              ref={exportButtonRef}
              style={styles.headerIconButton}
              onPress={() => router.push(`/project/${project.id}/import-export`)}
              accessibilityLabel={t('projectDetail.importExport')}
            >
              <Feather name="share" size={18} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              ref={editButtonRef}
              style={styles.headerIconButton}
              onPress={() => setShowEditProject(true)}
              accessibilityLabel={t('projectDetail.editProject')}
            >
              <Feather name="edit" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Project meta: date + source + notes ──────────────────────────── */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { width: metaLabelWidth }]}>{t('projectDetail.metaCreated')}</Text>
            <Text style={styles.metaValue}>{formatDate(project.createdAt)}</Text>
          </View>
          {project.source ? (
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { width: metaLabelWidth }]}>{t('projectDetail.metaSource')}</Text>
              {/^https?:\/\//.test(project.source) ? (
                <TouchableOpacity onPress={() => Linking.openURL(project.source!)} style={{ flex: 1 }}>
                  <Text style={[styles.metaValue, styles.metaLink]} numberOfLines={2}>{project.source}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.metaValue} numberOfLines={2}>{project.source}</Text>
              )}
            </View>
          ) : null}
          {project.notes ? (
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { width: metaLabelWidth }]}>{t('projectDetail.metaNotes')}</Text>
              <Text style={styles.metaValue}>{project.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Photos section ────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('projectDetail.sectionPhotos')}</Text>
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
            <Text style={styles.sectionTitle}>{t('projectDetail.sectionCharts')}</Text>
            <TouchableOpacity
              ref={addChartButtonRef}
              style={styles.addChartButton}
              onPress={() => setShowAddChart(true)}
            >
              <Text style={styles.addChartButtonText}>{t('projectDetail.addChart')}</Text>
            </TouchableOpacity>
          </View>

          {project.charts.length === 0 ? (
            /* Empty state — Req 1.7 / Req 2.1 */
            <View style={styles.emptyCharts}>
              <MaterialCommunityIcons name="file-outline" size={36} color="#d1d5db" />
              <Text style={styles.emptyChartsTitle}>{t('projectDetail.emptyChartsTitle')}</Text>
              <Text style={styles.emptyChartsHint}>
                {t('projectDetail.emptyChartsHint')}
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
                  onDuplicate={() => handleLongPressChart(chart)}
                />
              ))}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Ad banner at bottom — Req 11.3 */}
      <AdBanner />

      <EditProjectModal
        visible={showEditProject}
        project={project}
        onClose={() => setShowEditProject(false)}
      />

      <AddChartModal
        visible={showAddChart}
        defaultName={t('addChart.defaultName', { n: project.charts.length + 1 })}
        defaultRoundStart={project.roundStartNumber}
        onConfirm={(name, notes, roundStartNumber) => {
          addChart(project.id, name, notes || undefined, roundStartNumber)
          setShowAddChart(false)
        }}
        onClose={() => setShowAddChart(false)}
      />

      {viewingPhoto && (
        <PhotoViewer
          photos={project.photos}
          initialIndex={project.photos.findIndex((p) => p.id === viewingPhoto?.id) ?? 0}
          visible={true}
          onClose={() => setViewingPhoto(null)}
        />
      )}

      <UpgradePromptModal
        visible={showPhotoUpgrade}
        onClose={() => setShowPhotoUpgrade(false)}
        title={t('upgrade.photoLimit.title')}
        description={t('upgrade.photoLimit.desc')}
        hasAdOption={adUnlockedPhotoCount < 2}
        rewardType={REWARD_TYPES.PHOTO_SLOT}
        onAdRewarded={() => {
          incrementAdUnlockedPhotos()
          doAddPhoto()
        }}
      />

      {showSpotlight && <SpotlightOverlay steps={resolvedSteps} onDismiss={dismiss} />}
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
    paddingTop: 1,
  },
  metaValue: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  metaLink: {
    color: '#D97398',
    textDecorationLine: 'underline',
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
  swipeDeleteBtn: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginLeft: 8,
  },
  swipeDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
