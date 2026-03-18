import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../src/stores'
import { logScreenView } from '../src/services'
import { SCREEN_NAMES } from '../src/constants'
import { Project } from '../src/types'
import { calculateProgressPercentage } from '../src/utils/progressUtils'
import AdBanner from '../src/components/AdBanner'
import CreateProjectModal from '../src/components/CreateProjectModal'
import UpgradePromptModal from '../src/components/UpgradePromptModal'
import { useEntitlementStore } from '../src/stores'
import { REWARD_TYPES } from '../src/constants/analytics'
import { showConfirmDialog } from '../src/components/ConfirmDialog'
import SpotlightOverlay from '../src/components/SpotlightOverlay'
import { useSpotlight } from '../src/hooks/useSpotlight'

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const getOverallProgress = (project: Project): number => {
  if (project.charts.length === 0) return 0
  return Math.round(
    project.charts.reduce((sum, chart) => sum + calculateProgressPercentage(chart), 0) /
      project.charts.length
  )
}

interface ProjectCardProps {
  project: Project
  onPress: () => void
  onLongPress: () => void
}

function ProjectCard({ project, onPress, onLongPress }: ProjectCardProps) {
  const { t } = useTranslation()
  const coverPhoto = project.photos?.find((p) => p.isCover) ?? project.photos?.[0]
  const progress = getOverallProgress(project)
  const isCrochet = project.craftType === 'crochet'

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={styles.card}
      accessibilityLabel={`${project.name}`}
      activeOpacity={0.75}
    >
      <View style={styles.cardContent}>
        {/* Cover photo thumbnail */}
        {coverPhoto ? (
          <Image
            source={{ uri: coverPhoto.uri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Image
              source={require('../assets/images/kniitingIcon.png')}
              style={styles.thumbnailIcon}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Right side info */}
        <View style={styles.cardInfo}>
          {/* Name + badge row */}
          <View style={styles.nameRow}>
            <Text style={styles.projectName} numberOfLines={1}>
              {project.name}
            </Text>
            <View
              style={[
                styles.badge,
                isCrochet ? styles.badgeCrochet : styles.badgeKnitting,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isCrochet ? styles.badgeTextCrochet : styles.badgeTextKnitting,
                ]}
              >
                {isCrochet ? t('common.crochet') : t('common.knitting')}
              </Text>
            </View>
          </View>

          {/* Progress row */}
          <View style={styles.progressRow}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          {/* Last modified date */}
          <Text style={styles.dateText}>
            {t('projectList.updatedAt', { date: formatDate(project.updatedAt) })}
          </Text>
        </View>

      </View>
    </TouchableOpacity>
  )
}

export default function ProjectListScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const projects = useProjectStore((s) => s.projects)
  const deleteProject = useProjectStore((s) => s.deleteProject)
  const duplicateProject = useProjectStore((s) => s.duplicateProject)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [pendingCreateAfterAd, setPendingCreateAfterAd] = useState(false)

  useEffect(() => {
    if (!showUpgradeModal && pendingCreateAfterAd) {
      setPendingCreateAfterAd(false)
      setShowCreateModal(true)
    }
  }, [showUpgradeModal, pendingCreateAfterAd])
  const maxProjects = useEntitlementStore((s) => s.maxProjects)
  const adUnlockedProjectCount = useEntitlementStore((s) => s.adUnlockedProjectCount)
  const incrementAdUnlockedProjects = useEntitlementStore((s) => s.incrementAdUnlockedProjects)

  const addButtonRef = useRef<View>(null)
  const settingsButtonRef = useRef<View>(null)

  const { showSpotlight, resolvedSteps, dismiss } = useSpotlight(
    SCREEN_NAMES.PROJECT_LIST,
    [
      {
        ref: addButtonRef,
        title: t('onboarding.projectListAddTitle'),
        description: t('onboarding.projectListAddDesc'),
      },
      {
        ref: settingsButtonRef,
        title: t('onboarding.projectListSettingsTitle'),
        description: t('onboarding.projectListSettingsDesc'),
      },
    ]
  )

  useEffect(() => {
    logScreenView(SCREEN_NAMES.PROJECT_LIST)
  }, [])

  const handleDelete = (projectId: string, projectName: string) => {
    showConfirmDialog({
      title: t('projectList.deleteProject', { name: projectName }),
      message: t('projectList.deleteProjectMessage', { name: projectName }),
      confirmLabel: t('common.delete'),
      destructive: true,
      onConfirm: () => deleteProject(projectId),
    })
  }

  const handleLongPress = (project: Project) => {
    Alert.alert(project.name, undefined, [
      {
        text: t('common.duplicate'),
        onPress: () => duplicateProject(project.id),
      },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => handleDelete(project.id, project.name),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('projectList.title')}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            ref={settingsButtonRef}
            onPress={() => router.push('/settings')}
            style={styles.settingsButton}
            accessibilityLabel={t('settings.title')}
          >
            <Ionicons name="settings-outline" size={22} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            ref={addButtonRef}
            onPress={() => {
              if (projects.length >= maxProjects()) {
                setShowUpgradeModal(true)
              } else {
                setShowCreateModal(true)
              }
            }}
            style={styles.addButton}
            accessibilityLabel={t('projectList.addProject')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Project list or empty state */}
      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>{t('projectList.emptyTitle')}</Text>
          <Text style={styles.emptyStateSubtext}>
            {t('projectList.emptyHint')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item: Project) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: { item: Project }) => (
            <Swipeable
              renderRightActions={() => (
                <TouchableOpacity
                  style={styles.swipeDeleteBtn}
                  onPress={() => handleDelete(item.id, item.name)}
                  accessibilityLabel={t('projectList.deleteProject', { name: item.name })}
                  accessibilityRole="button"
                >
                  <Text style={styles.swipeDeleteText}>{t('common.delete')}</Text>
                </TouchableOpacity>
              )}
            >
              <ProjectCard
                project={item}
                onPress={() => router.push(`/project/${item.id}`)}
                onLongPress={() => handleLongPress(item)}
              />
            </Swipeable>
          )}
        />
      )}

      {/* Ad banner at bottom */}
      <AdBanner />

      {/* Create project modal */}
      <CreateProjectModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <UpgradePromptModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={t('upgrade.projectLimit.title')}
        description={t('upgrade.projectLimit.desc')}
        hasAdOption={adUnlockedProjectCount < 2}
        rewardType={REWARD_TYPES.PROJECT_SLOT}
        onAdRewarded={() => {
          incrementAdUnlockedProjects()
          setPendingCreateAfterAd(true)
        }}
      />

      {showSpotlight && <SpotlightOverlay steps={resolvedSteps} onDismiss={dismiss} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#faf5f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#D97398',
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 26,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },

  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  swipeDeleteBtn: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginLeft: 8,
    marginVertical: 6,
  },
  swipeDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#fce7f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    width: 60,
    height: 60,
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeCrochet: {
    backgroundColor: '#f3f4f6',
  },
  badgeKnitting: {
    backgroundColor: '#f3f4f6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextCrochet: {
    color: '#6b7280',
  },
  badgeTextKnitting: {
    color: '#6b7280',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D97398',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 32,
    textAlign: 'right',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
})
