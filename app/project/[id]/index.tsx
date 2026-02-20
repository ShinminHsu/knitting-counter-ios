import { useEffect } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useProjectStore } from '../../../src/stores'
import { logScreenView } from '../../../src/services'
import { SCREEN_NAMES } from '../../../src/constants'
import { Chart } from '../../../src/types'

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

// ─── Chart Tab Item ───────────────────────────────────────────────────────────

interface ChartTabProps {
  chart: Chart
  isActive: boolean
  onPress: () => void
}

function ChartTab({ chart, isActive, onPress }: ChartTabProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chartTab, isActive && styles.chartTabActive]}
      accessibilityLabel={`切換至織圖：${chart.name}`}
      accessibilityState={{ selected: isActive }}
    >
      <Text
        style={[styles.chartTabText, isActive && styles.chartTabTextActive]}
        numberOfLines={1}
      >
        {chart.name}
      </Text>
      {chart.isCompleted && (
        <Text style={styles.chartCompletedBadge}>完成</Text>
      )}
    </TouchableOpacity>
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
  const setCurrentChart = useProjectStore((s) => s.setCurrentChart)
  const addChart = useProjectStore((s) => s.addChart)

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

  const activeChartId = project.currentChartId
  const activeChart = project.charts.find((c) => c.id === activeChartId) ?? project.charts[0]

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

          {/* Edit (pencil) button — Req 1.5: visible button, NOT long-press */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/project/${project.id}/editor`)}
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
              onPress={() => {
                const chart = addChart(project.id, `織圖 ${project.charts.length + 1}`)
                if (chart) setCurrentChart(project.id, chart.id)
              }}
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
            <>
              {/* Horizontal scroll chart tabs — Req 2.1 */}
              <FlatList
                data={project.charts}
                keyExtractor={(item: Chart) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chartTabList}
                renderItem={({ item }: { item: Chart }) => (
                  <ChartTab
                    chart={item}
                    isActive={item.id === (activeChart?.id ?? null)}
                    onPress={() => setCurrentChart(project.id, item.id)}
                  />
                )}
              />

              {/* Active chart detail card */}
              {activeChart ? (
                <ChartCard chart={activeChart} projectId={project.id} />
              ) : null}
            </>
          )}
        </View>

        {/* ── TODO: PhotoGallery section (task 6.1 — Req 6.1) ─────────────── */}

        {/* ── TODO: AdBanner at the bottom (task 11.3 — Req 11.3) ─────────── */}

      </ScrollView>
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

  // Chart tabs
  chartTabList: {
    gap: 8,
    paddingBottom: 10,
  },
  chartTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 160,
  },
  chartTabActive: {
    borderColor: '#D97398',
    backgroundColor: '#ede9fe',
  },
  chartTabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  chartTabTextActive: {
    color: '#C4527F',
    fontWeight: '600',
  },
  chartCompletedBadge: {
    fontSize: 10,
    color: '#15803d',
    backgroundColor: '#dcfce7',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
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
