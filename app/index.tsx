import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useProjectStore } from '../src/stores'
import { logScreenView } from '../src/services'
import { SCREEN_NAMES } from '../src/constants'
import { Project } from '../src/types'
import { calculateProgressPercentage } from '../src/utils/progressUtils'
import AdBanner from '../src/components/AdBanner'
import CreateProjectModal from '../src/components/CreateProjectModal'
import { showConfirmDialog } from '../src/components/ConfirmDialog'

const SCREEN_WIDTH = Dimensions.get('window').width
const DELETE_THRESHOLD = -80
const DELETE_ACTION_WIDTH = 80

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

interface SwipeableProjectCardProps {
  project: Project
  onPress: () => void
  onDelete: (projectId: string, projectName: string) => void
}

function SwipeableProjectCard({ project, onPress, onDelete }: SwipeableProjectCardProps) {
  const translateX = useRef(new Animated.Value(0)).current
  const coverPhoto = project.photos?.find((p) => p.isCover) ?? project.photos?.[0]
  const progress = getOverallProgress(project)
  const isCrochet = project.craftType === 'crochet'

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        // Only activate for intentional horizontal swipes (>= 12px, dominates vertical)
        return (
          Math.abs(gestureState.dx) >= 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
        )
      },
      onPanResponderMove: (_evt, gestureState) => {
        // Only allow left swipe (negative dx), cap at delete action width
        const newX = Math.min(0, Math.max(gestureState.dx, -DELETE_ACTION_WIDTH))
        translateX.setValue(newX)
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dx < DELETE_THRESHOLD) {
          // Snap open to reveal delete button
          Animated.spring(translateX, {
            toValue: -DELETE_ACTION_WIDTH,
            useNativeDriver: true,
            bounciness: 0,
          }).start()
        } else {
          // Snap back to closed
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start()
        }
      },
    })
  ).current

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start()
  }

  const handleDeletePress = () => {
    closeSwipe()
    onDelete(project.id, project.name)
  }

  return (
    <View style={styles.swipeContainer}>
      {/* Delete action background */}
      <View style={styles.deleteAction}>
        <TouchableOpacity
          onPress={handleDeletePress}
          style={styles.deleteButton}
          accessibilityLabel={`刪除專案：${project.name}`}
        >
          <Text style={styles.deleteButtonText}>刪除</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable card */}
      <Animated.View
        style={[styles.animatedCard, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={() => {
            closeSwipe()
            onPress()
          }}
          style={styles.card}
          accessibilityLabel={`專案：${project.name}`}
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
              <Image
                source={require('../assets/images/kniitingIcon.png')}
                style={styles.thumbnailPlaceholder}
                resizeMode="contain"
              />
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
                    {isCrochet ? '鉤針' : '棒針'}
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
                更新於 {formatDate(project.updatedAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

export default function ProjectListScreen() {
  const router = useRouter()
  const projects = useProjectStore((s) => s.projects)
  const deleteProject = useProjectStore((s) => s.deleteProject)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    logScreenView(SCREEN_NAMES.PROJECT_LIST)
  }, [])

  const handleDelete = (projectId: string, projectName: string) => {
    showConfirmDialog({
      title: '刪除專案',
      message: `確定要刪除「${projectName}」嗎？此操作無法復原。`,
      confirmLabel: '刪除',
      destructive: true,
      onConfirm: () => deleteProject(projectId),
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的專案</Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={styles.addButton}
          accessibilityLabel="新增專案"
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Project list or empty state */}
      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>尚無專案</Text>
          <Text style={styles.emptyStateSubtext}>
            點擊 + 開始建立第一個專案
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item: Project) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: { item: Project }) => (
            <SwipeableProjectCard
              project={item}
              onPress={() => router.push(`/project/${item.id}`)}
              onDelete={handleDelete}
            />
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

  // Swipe container
  swipeContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    borderRadius: 12,
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_ACTION_WIDTH,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  deleteButton: {
    width: DELETE_ACTION_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  animatedCard: {
    width: '100%',
  },

  // Card styles
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    padding: 6,
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
    backgroundColor: '#ede9fe',
  },
  badgeKnitting: {
    backgroundColor: '#dcfce7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextCrochet: {
    color: '#6d28d9',
  },
  badgeTextKnitting: {
    color: '#16a34a',
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
