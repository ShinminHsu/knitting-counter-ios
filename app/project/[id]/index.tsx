import { useEffect, useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useProjectStore } from '../../../src/stores'
import { logScreenView } from '../../../src/services'
import { SCREEN_NAMES } from '../../../src/constants'
import { Chart } from '../../../src/types'
import EditProjectModal from '../../../src/components/EditProjectModal'
import AddChartModal from '../../../src/components/AddChartModal'
import { showConfirmDialog } from '../../../src/components/ConfirmDialog'
import { formatDate } from '../../../src/utils/helpers'

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

// ─── Chart Tab ────────────────────────────────────────────────────────────────

interface ChartTabProps {
  chart: Chart
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

function ChartTab({ chart, isSelected, onSelect, onDelete }: ChartTabProps) {
  return (
    <TouchableOpacity
      style={[styles.chartTab, isSelected && styles.chartTabSelected]}
      onPress={onSelect}
      accessibilityLabel={`選擇織圖：${chart.name}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        style={[styles.chartTabText, isSelected && styles.chartTabTextSelected]}
        numberOfLines={1}
      >
        {chart.name}
      </Text>

      {chart.isCompleted && (
        <View style={styles.chartTabCompletedDot} />
      )}

      <TouchableOpacity
        style={styles.chartTabDeleteButton}
        onPress={onDelete}
        accessibilityLabel={`刪除織圖：${chart.name}`}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <MaterialCommunityIcons
          name="close"
          size={12}
          color={isSelected ? '#D97398' : '#9ca3af'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

// ─── Selected Chart Detail ─────────────────────────────────────────────────────

interface SelectedChartDetailProps {
  chart: Chart
  projectId: string
}

function SelectedChartDetail({ chart, projectId }: SelectedChartDetailProps) {
  const router = useRouter()
  const totalRounds = chart.rounds.length
  const progress =
    totalRounds > 0
      ? Math.round((chart.currentRound / totalRounds) * 100)
      : 0

  return (
    <View style={styles.selectedChartDetail}>
      {/* Chart header */}
      <View style={styles.selectedChartHeader}>
        <Text style={styles.selectedChartName} numberOfLines={1}>
          {chart.name}
        </Text>
        {chart.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>完成</Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {chart.notes ? (
        <Text style={styles.selectedChartNotes} numberOfLines={2}>
          {chart.notes}
        </Text>
      ) : null}

      {/* Progress */}
      <Text style={styles.selectedChartProgress}>
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

  const [showEditProject, setShowEditProject] = useState(false)
  const [showAddChart, setShowAddChart] = useState(false)

  // selectedChartId: initialise from project.currentChartId or first chart
  const [selectedChartId, setSelectedChartId] = useState<string | null>(
    project?.currentChartId ?? project?.charts[0]?.id ?? null
  )

  // When charts change (e.g. new chart added), keep selection valid
  useEffect(() => {
    if (!project) return
    const ids = project.charts.map((c) => c.id)
    if (!selectedChartId || !ids.includes(selectedChartId)) {
      setSelectedChartId(ids[0] ?? null)
    }
  }, [project?.charts])

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

  const selectedChart = project.charts.find((c) => c.id === selectedChartId) ?? null

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
            <Feather name="edit" size={18} color="#6b7280" />
          </TouchableOpacity>
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
            <>
              {/* ── Horizontal chart tab scroll (Req 2.1) ─────────────────── */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chartTabList}
                style={styles.chartTabScroll}
              >
                {project.charts.map((chart: Chart) => (
                  <ChartTab
                    key={chart.id}
                    chart={chart}
                    isSelected={chart.id === selectedChartId}
                    onSelect={() => setSelectedChartId(chart.id)}
                    onDelete={() => handleDeleteChart(chart)}
                  />
                ))}
              </ScrollView>

              {/* ── Selected chart detail + actions (Req 2.3) ─────────────── */}
              {selectedChart ? (
                <SelectedChartDetail
                  chart={selectedChart}
                  projectId={project.id}
                />
              ) : null}
            </>
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
          const newChart = addChart(project.id, name, notes || undefined)
          if (newChart) {
            setSelectedChartId(newChart.id)
          }
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

  // Chart tab scroll
  chartTabScroll: {
    marginBottom: 12,
  },
  chartTabList: {
    gap: 8,
    paddingRight: 4,
  },

  // Chart tab pill
  chartTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
    maxWidth: 180,
  },
  chartTabSelected: {
    borderColor: '#D97398',
    backgroundColor: '#fdf2f6',
  },
  chartTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    flexShrink: 1,
  },
  chartTabTextSelected: {
    color: '#D97398',
    fontWeight: '700',
  },
  chartTabCompletedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    flexShrink: 0,
  },
  chartTabDeleteButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  // Selected chart detail card
  selectedChartDetail: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  selectedChartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedChartName: {
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
  selectedChartNotes: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  selectedChartProgress: {
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
