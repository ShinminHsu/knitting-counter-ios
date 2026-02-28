import { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import i18n from '../../../src/i18n'
import { useKeepAwake } from 'expo-keep-awake'
import * as Haptics from 'expo-haptics'
import { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { useProjectStore, useProgressStore } from '../../../src/stores'
import { logScreenView, logTrackingStarted } from '../../../src/services'
import { SCREEN_NAMES } from '../../../src/constants'
import CompletionModal from '../../../src/components/CompletionModal'
import {
  PatternItemType,
  Round,
  StitchGroup,
  StitchInfo,
  StitchType,
  StitchTypeInfo,
} from '../../../src/types'
import {
  getLocalizedStitchName,
  getStitchAbbr,
} from '../../../src/utils/patternHelpers'
import { CROCHET_SVG_MAP, KNIT_SVG_MAP } from '../../../src/constants/stitchIcons'
import { totalStitchesInRound } from '../../../src/stores/useProgressStore'
import { mmkv, STORAGE_KEYS } from '../../../src/stores/mmkvStorage'

// ─── Stitch Block ─────────────────────────────────────────────────────────────

/** 單一符號的位置資訊（用於精確上色）*/
interface SymbolEntry {
  abbr: string
  stitchType?: StitchType
  /** 在本圈的絕對 physical 起始位置（inclusive）*/
  physicalStart: number
  /** 在本圈的絕對 physical 結束位置（exclusive）*/
  physicalEnd: number
}

interface StitchBlock {
  key: string
  /** 顯示標籤，例如：「sc 1」或「【群組名】- 2」 */
  label: string
  /** 每個針法的符號，含 physical 位置（全部展開，不截斷）*/
  symbols: SymbolEntry[]
  /** 此 block 的 physical 起始位置 */
  startPos: number
  /** 此 block 的 physical 結束位置（exclusive）*/
  endPos: number
  /** 單一針法 block 的針法類型（群組 block 不設定）*/
  stitchType?: StitchType
}

type BlockStatus = 'completed' | 'active' | 'upcoming'

function getBlockStatus(block: StitchBlock, currentStitch: number): BlockStatus {
  if (block.endPos <= currentStitch) return 'completed'
  if (block.startPos <= currentStitch) return 'active'
  return 'upcoming'
}

type SymbolStatus = 'completed' | 'current' | 'upcoming'

function getSymbolStatus(symbol: SymbolEntry, currentStitch: number): SymbolStatus {
  if (symbol.physicalEnd <= currentStitch) return 'completed'
  if (symbol.physicalStart <= currentStitch) return 'current'
  return 'upcoming'
}

// ─── Round helpers ─────────────────────────────────────────────────────────────

/**
 * 將一圈的 patternItems 展開為可顯示的 StitchBlock 陣列。
 * 每個 SymbolEntry 的 physicalStart/End 對應 useProgressStore 的 currentStitch 計數。
 * 加針類型（stitchCount > 1）佔多個 physical 位置，但只顯示 1 個符號。
 */
function expandToBlocks(round: Round): StitchBlock[] {
  const blocks: StitchBlock[] = []
  let pos = 0

  for (const item of round.patternItems) {
    if (item.type === PatternItemType.STITCH) {
      const stitch = item.data as StitchInfo
      const abbr = getStitchAbbr(stitch)
      const stitchCount = StitchTypeInfo[stitch.type]?.stitchCount ?? 1
      const blockStart = pos
      const symbols: SymbolEntry[] = []

      // 每個邏輯針法（stitch.count 次）→ 1 個符號，佔 stitchCount 個 physical 位置
      for (let i = 0; i < stitch.count; i++) {
        symbols.push({ abbr, stitchType: stitch.type, physicalStart: pos, physicalEnd: pos + stitchCount })
        pos += stitchCount
      }

      blocks.push({ key: item.id, label: `${abbr} ${stitch.count}`, symbols, startPos: blockStart, endPos: pos, stitchType: stitch.type })
    } else {
      const group = item.data as StitchGroup
      // 計算每次重複的 physical 針數
      const perRepeat = group.stitches.reduce((sum, s) => {
        const sc = StitchTypeInfo[s.type]?.stitchCount ?? 1
        return sum + s.count * sc
      }, 0)

      for (let r = 0; r < group.repeatCount; r++) {
        const blockStart = pos
        const symbols: SymbolEntry[] = []

        for (const s of group.stitches) {
          const abbr = getStitchAbbr(s)
          const sc = StitchTypeInfo[s.type]?.stitchCount ?? 1
          for (let i = 0; i < s.count; i++) {
            symbols.push({ abbr, stitchType: s.type, physicalStart: pos, physicalEnd: pos + sc })
            pos += sc
          }
        }

        const groupLabel = `${group.name} - ${r + 1}`
        blocks.push({
          key: `${item.id}-r${r}`,
          label: groupLabel,
          symbols,
          startPos: blockStart,
          endPos: blockStart + perRepeat,
        })
      }
    }
  }

  return blocks
}

/** 將一圈轉換為人類可讀的說明文字 */
function getRoundDescriptionText(round: Round): string {
  return round.patternItems
    .map((item) => {
      if (item.type === PatternItemType.STITCH) {
        const stitch = item.data as StitchInfo
        return `${getLocalizedStitchName(stitch, i18n.t)} × ${stitch.count}`
      } else {
        const group = item.data as StitchGroup
        const sep = i18n.t('common.stitchListSep')
        const inner = group.stitches.map((s) => `${getLocalizedStitchName(s, i18n.t)} ${s.count}`).join(sep)
        return i18n.t('common.groupSummary', { name: group.name, stitches: inner, count: group.repeatCount })
      }
    })
    .join(i18n.t('common.stitchListSep'))
}

// ─── StitchBlockRow ───────────────────────────────────────────────────────────
// 每個 block 為一行（全寬）：label 在上，符號在下
// 對應 web 版的 inline-block + flex-wrap 結構，但以全寬垂直排列更符合 iOS 習慣

interface StitchBlockRowProps {
  block: StitchBlock
  currentStitch: number
  showIcons: boolean
  onPress: () => void
}

function StitchBlockRow({ block, currentStitch, showIcons, onPress }: StitchBlockRowProps) {
  const blockStatus = getBlockStatus(block, currentStitch)
  const isCompleted = blockStatus === 'completed'
  const isActive = blockStatus === 'active'

  const SvgIcon = block.stitchType
    ? (CROCHET_SVG_MAP[block.stitchType] ?? KNIT_SVG_MAP[block.stitchType])
    : undefined

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={isCompleted ? 1 : 0.7}
      style={blockStyles.row}
      accessibilityLabel={block.label}
      accessibilityRole="button"
    >
      {/* Label row：icon（若有）+ 文字 */}
      <View style={blockStyles.labelRow}>
        {SvgIcon && (
          <SvgIcon
            width={18}
            height={18}
            style={isCompleted ? blockStyles.labelIconCompleted : undefined}
          />
        )}
        <Text
          style={[
            blockStyles.label,
            isActive && blockStyles.labelActive,
            isCompleted && blockStyles.labelCompleted,
          ]}
        >
          {block.label}
        </Text>
      </View>

      {/* 符號區：flex-wrap，每個符號獨立上色，無底色 */}
      <View style={blockStyles.symbolsRow}>
        {block.symbols.map((symbol, i) => {
          const symStatus = getSymbolStatus(symbol, currentStitch)
          const opacity = symStatus === 'completed' ? 0.3 : symStatus === 'current' ? 1 : 0.7

          if (showIcons && symbol.stitchType) {
            const SymSvg = CROCHET_SVG_MAP[symbol.stitchType] ?? KNIT_SVG_MAP[symbol.stitchType]

            if (SymSvg) {
              return (
                <View key={i} style={{ opacity }}>
                  <SymSvg width={24} height={24} />
                </View>
              )
            }
          }

          return (
            <Text
              key={i}
              style={[
                blockStyles.symbol,
                symStatus === 'current' && blockStyles.symbolCurrent,
                symStatus === 'completed' && blockStyles.symbolCompleted,
                symStatus === 'upcoming' && blockStyles.symbolUpcoming,
              ]}
            >
              {symbol.abbr}
            </Text>
          )
        })}
      </View>
    </TouchableOpacity>
  )
}

const blockStyles = StyleSheet.create({
  row: {
    marginBottom: 14,
  },
  // Label row：icon + 文字水平排列
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  labelIcon: {
    width: 18,
    height: 18,
    opacity: 0.85,
  },
  labelIconCompleted: {
    opacity: 0.35,
  },
  // Label：無背景
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  labelActive: {
    color: '#D97398',
    fontWeight: '600',
  },
  labelCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  // 符號區：flex-wrap，無背景色
  symbolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 10,
  },
  symbol: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  symbolCurrent: {
    color: '#D97398',   // 粉紅：當前針
  },
  symbolCompleted: {
    color: '#d1d5db',   // 淺灰：已完成
  },
  symbolUpcoming: {
    color: '#374151',   // 深灰：未完成
  },
  symbolIcon: {
    width: 24,
    height: 24,
  },
  symbolIconCurrent: {
    tintColor: '#D97398',
  },
})

// ─── ProgressTrackingScreen ───────────────────────────────────────────────────

export default function ProgressTrackingScreen() {
  useKeepAwake()
  const { t } = useTranslation()

  const { id, chartId } = useLocalSearchParams<{ id: string; chartId?: string }>()
  const router = useRouter()

  const [showCompletion, setShowCompletion] = useState(false)
  const [showIcons, setShowIcons] = useState<boolean>(
    () => mmkv.getString(STORAGE_KEYS.STITCH_DISPLAY_MODE) === 'icon'
  )

  function handleToggleDisplayMode() {
    const next = !showIcons
    setShowIcons(next)
    mmkv.set(STORAGE_KEYS.STITCH_DISPLAY_MODE, next ? 'icon' : 'abbr')
  }

  useEffect(() => {
    logScreenView(SCREEN_NAMES.PROGRESS_TRACKING)
    logTrackingStarted()
  }, [])

  const project = useProjectStore((s) => s.getProjectById(id ?? ''))

  const initialChartId = chartId ?? project?.currentChartId ?? project?.charts[0]?.id ?? ''
  const [selectedChartId, setSelectedChartId] = useState(initialChartId)

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t('tracking.notFound')}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const activeChart =
    project.charts.find((c) => c.id === selectedChartId) ?? project.charts[0] ?? null

  if (!activeChart) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t('tracking.chartNotFound')}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ── Derived state ────────────────────────────────────────────────────────────

  const roundStartNumber = activeChart.roundStartNumber ?? project.roundStartNumber
  const { currentRound, currentStitch, rounds } = activeChart
  const totalRounds = rounds.length
  const currentRoundData = rounds[currentRound] ?? null

  const totalStitches = currentRoundData ? totalStitchesInRound(currentRoundData) : 0
  const blocks = useMemo(
    () => (currentRoundData ? expandToBlocks(currentRoundData) : []),
    [currentRoundData]
  )
  const descriptionText = useMemo(
    () => (currentRoundData ? getRoundDescriptionText(currentRoundData) : ''),
    [currentRoundData]
  )

  const displayRoundNumber = currentRound + roundStartNumber
  const displayLastRoundNumber = totalRounds - 1 + roundStartNumber

  const isLiveRound = !activeChart.isCompleted && totalRounds > 0
  const isLastRound = currentRound === totalRounds - 1

  // ── Action handlers ──────────────────────────────────────────────────────────

  function handleChartComplete() {
    setShowCompletion(true)
  }

  function handleCompletionClose() {
    if (id) {
      useProjectStore.getState().markInterstitialShown(id)
    }
    router.back()
  }

  function handleNextStitch() {
    if (!id) return
    const result = useProgressStore.getState().advanceStitch(id, activeChart.id)
    if (result === 'round' || result === 'chart') {
      Haptics.notificationAsync(NotificationFeedbackType.Success)
    } else {
      Haptics.impactAsync(ImpactFeedbackStyle.Light)
    }
    if (result === 'chart') handleChartComplete()
  }

  function handlePreviousStitch() {
    if (!id) return
    useProgressStore.getState().goBackStitch(id, activeChart.id)
    Haptics.impactAsync(ImpactFeedbackStyle.Light)
  }

  function handleResetRound() {
    if (!id) return
    Alert.alert(
      t('tracking.resetTitle'),
      t('tracking.resetMessage', { number: displayRoundNumber }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: () => {
            useProgressStore.getState().resetRound(id, activeChart.id)
            Haptics.impactAsync(ImpactFeedbackStyle.Medium)
          },
        },
      ]
    )
  }

  function handleCompleteRound() {
    if (!id) return
    const result = useProgressStore.getState().completeRound(id, activeChart.id)
    Haptics.notificationAsync(NotificationFeedbackType.Success)
    if (result === 'chart') handleChartComplete()
  }

  function handleBlockTap(block: StitchBlock) {
    if (!id) return
    if (block.endPos <= currentStitch) return // 已完成，無效（Req 4.14）
    if (block.endPos >= totalStitches) {
      handleCompleteRound()
    } else {
      useProgressStore.getState().jumpToStitchPosition(id, activeChart.id, block.endPos)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: activeChart.name }} />

      {/* ── Chart switcher（only shown when project has multiple charts）──── */}
      {project.charts.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chartSwitcher}
          contentContainerStyle={styles.chartSwitcherContent}
        >
          {project.charts.map((chart) => {
            const isActive = chart.id === selectedChartId
            return (
              <TouchableOpacity
                key={chart.id}
                style={[styles.chartTab, isActive && styles.chartTabActive]}
                onPress={() => setSelectedChartId(chart.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.chartTabText, isActive && styles.chartTabTextActive]}>
                  {chart.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}

      {/* ── Pattern card（flex: 1，內部可垂直滾動）────────────────────────── */}
      <View style={styles.patternCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('tracking.roundTitle', { number: displayRoundNumber })}</Text>
          <View style={styles.cardHeaderRight}>
            <Text style={styles.roundBadge}>{t('tracking.roundBadge', { total: displayLastRoundNumber })}</Text>
            <TouchableOpacity
              onPress={handleToggleDisplayMode}
              style={styles.displayToggleButton}
              accessibilityLabel={showIcons ? t('tracking.toggleAbbrMode') : t('tracking.toggleIconMode')}
              accessibilityRole="button"
            >
              <Ionicons
                name={showIcons ? 'text-outline' : 'albums-outline'}
                size={18}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Pattern description */}
        {descriptionText ? (
          <Text style={styles.descriptionText}>{descriptionText}</Text>
        ) : null}

        {/* Notes */}
        {currentRoundData?.notes ? (
          <Text style={styles.notesText}>{t('tracking.roundNotes', { notes: currentRoundData.notes })}</Text>
        ) : null}

        {/* Blocks：ScrollView 內，不蓋住下方按鈕 */}
        <ScrollView
          style={styles.blocksScroll}
          contentContainerStyle={styles.blocksContent}
          showsVerticalScrollIndicator={false}
        >
          {blocks.length > 0 ? (
            blocks.map((block) => (
              <StitchBlockRow
                key={block.key}
                block={block}
                currentStitch={currentStitch}
                showIcons={showIcons}
                onPress={() => handleBlockTap(block)}
              />
            ))
          ) : (
            <Text style={styles.emptyRoundText}>{t('tracking.emptyRound')}</Text>
          )}
        </ScrollView>
      </View>

      {/* ── Bottom controls（固定在底部）────────────────────────────────────── */}
      <View style={styles.bottomControls}>

        {/* Row 1: ← 上一針 | 0/21 | 下一針 → */}
        <View style={styles.mainRow}>
          <TouchableOpacity
            style={styles.prevButton}
            onPress={handlePreviousStitch}
            accessibilityLabel={t('tracking.prevLabel')}
            accessibilityRole="button"
          >
            <Text style={styles.prevButtonText}>{t('tracking.prevStitch')}</Text>
          </TouchableOpacity>

          <View style={styles.counter}>
            <Text style={styles.counterCurrent}>{currentStitch}</Text>
            <Text style={styles.counterTotal}>/{totalStitches}</Text>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextStitch}
            accessibilityLabel={t('tracking.nextLabel')}
            accessibilityRole="button"
          >
            <Text style={styles.nextButtonText}>{t('tracking.nextStitch')}</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: 重新開始此圈 | 完成第 N 圈 */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetRound}
            accessibilityLabel={t('tracking.resetRound')}
            accessibilityRole="button"
          >
            <Text style={styles.resetButtonText}>{t('tracking.resetRound')}</Text>
          </TouchableOpacity>

          {isLiveRound ? (
            <TouchableOpacity
              style={styles.completeRoundButton}
              onPress={handleCompleteRound}
              accessibilityLabel={isLastRound ? t('tracking.completeChart') : t('tracking.completeRound', { number: displayRoundNumber })}
              accessibilityRole="button"
            >
              <Text style={styles.completeRoundButtonText}>
                {isLastRound ? t('tracking.completeChart') : t('tracking.completeRound', { number: displayRoundNumber })}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completeRoundPlaceholder} />
          )}
        </View>
      </View>

      {/* No AdBanner on tracking screen (Req 11.4) */}

      {/* Completion celebration modal (Req 4.5, 11.10–11.15) */}
      <CompletionModal
        visible={showCompletion}
        onClose={handleCompletionClose}
        interstitialShown={project.interstitialShown}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  // ── Chart switcher ────────────────────────────────────────────────────────────
  chartSwitcher: {
    flexGrow: 0,
    flexShrink: 0,
    marginTop: 8,
  },
  chartSwitcherContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chartTab: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chartTabActive: {
    backgroundColor: '#D97398',
    borderColor: '#D97398',
  },
  chartTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  chartTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // ── Pattern card ─────────────────────────────────────────────────────────────
  patternCard: {
    flex: 1,
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  roundBadge: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  displayToggleButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 19,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  // ScrollView 內部：blocks 可垂直滾動，不蓋住底部按鈕
  blocksScroll: {
    flex: 1,
    marginTop: 12,
  },
  blocksContent: {
    paddingBottom: 8,
  },
  emptyRoundText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },

  // ── Bottom controls ───────────────────────────────────────────────────────────
  bottomControls: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 4,
    gap: 8,
  },

  // Row 1
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prevButton: {
    flex: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  counter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  counterCurrent: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D97398',
    letterSpacing: -1,
  },
  counterTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9ca3af',
  },
  nextButton: {
    flex: 3,
    backgroundColor: '#D97398',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },

  // Row 2
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  completeRoundButton: {
    flex: 3,
    backgroundColor: '#4b5563',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeRoundButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  completeRoundPlaceholder: {
    flex: 3,
  },

  // Fallback UI
  backButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D97398',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#D97398',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
})
