import { useEffect, useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useProjectStore } from '../../../src/stores'
import { logScreenView } from '../../../src/services'
import { SCREEN_NAMES } from '../../../src/constants'
import { Chart } from '../../../src/types'
import EditProjectModal from '../../../src/components/EditProjectModal'
import AddChartModal from '../../../src/components/AddChartModal'

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
}

function ChartCard({ chart, projectId }: ChartCardProps) {
  const router = useRouter()
  const totalRounds = chart.rounds.length
  const progress =
    totalRounds > 0
      ? Math.round((chart.currentRound / totalRounds) * 100)
      : 0

  return (
    <View style={styles.chartCard}>
      {/* Chart info */}
      <Text style={styles.chartName}>{chart.name}</Text>
      {chart.description ? (
        <Text style={styles.chartDescription}>{chart.description}</Text>
      ) : null}
      <Text style={styles.chartProgress}>
        進度：第 {chart.currentRound} / {totalRounds} 段（{progress}%）
      </Text>

      {/* Navigation buttons */}
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

  const [showEditProject, setShowEditProject] = useState(false)
  const [showAddChart, setShowAddChart] = useState(false)

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

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditProject(true)}
            accessibilityLabel="編輯專案"
          >
            {/* Pencil icon using Unicode as placeholder until an icon library is wired up */}
            <Text style={styles.editButtonIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* ── Charts section ────────────────────────────────────────────────── */}
        <View style={styles.section}>
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
            /* Empty state — Req 1.7 */
            <View style={styles.emptyCharts}>
              <Text style={styles.emptyChartsTitle}>尚無織圖</Text>
              <Text style={styles.emptyChartsHint}>
                點擊「+ 新增」建立第一個織圖，開始記錄你的編織圖案。
              </Text>
            </View>
          ) : (
            <View style={styles.chartList}>
              {project.charts.map((chart: Chart) => (
                <ChartCard key={chart.id} chart={chart} projectId={project.id} />
              ))}
            </View>
          )}
        </View>

        {/* ── TODO: PhotoGallery section ───────────────────────────────────── */}

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
  editButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonIcon: {
    fontSize: 18,
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

  // Chart list
  chartList: {
    gap: 12,
  },

  // Chart card
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  chartName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  chartDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  chartProgress: {
    fontSize: 14,
    color: '#374151',
  },
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
