import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import i18n from '../../../src/i18n'
import { useKeepAwake } from 'expo-keep-awake'
import * as Haptics from 'expo-haptics'
import { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { useProjectStore, useProgressStore } from '../../../src/stores'
import { logScreenView, logTrackingStarted, logChartCompleted } from '../../../src/services'
import { SCREEN_NAMES } from '../../../src/constants'
import CompletionModal from '../../../src/components/CompletionModal'
import ScreenHeader from '../../../src/components/ScreenHeader'
import SpotlightOverlay from '../../../src/components/SpotlightOverlay'
import { useSpotlight } from '../../../src/hooks/useSpotlight'
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
  /** 顯示標籤，例如：「sc × 5」或「【群組名】- 2」 */
  label: string
  /** 每個針法的符號，含 physical 位置（全部展開，不截斷）*/
  symbols: SymbolEntry[]
  /** 此 block 的 physical 起始位置 */
  startPos: number
  /** 此 block 的 physical 結束位置（exclusive）*/
  endPos: number
  /** 單一針法 block 的針法類型（群組 block 不設定）*/
  stitchType?: StitchType
  /**
   * 點擊此 block 時要跳到的位置（覆寫 endPos）。
   * 用於 STITCH PatternItem 的第一個 block（label block）：
   * 點擊「sc × 500」應跳到整個 PatternItem 的末端，一次完成所有 500 針。
   */
  tapEndPos?: number
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

      // 每個邏輯針法（stitch.count 次）→ 各自一個 block，才能讓 auto-scroll 每針跟著移動
      // 只有第一個 block 顯示 "abbr × count" label，其餘只顯示 symbol
      // 第一個 block 的 tapEndPos 指向整個 PatternItem 的末端，點擊可一次完成所有針
      const itemEndPos = pos + stitch.count * stitchCount
      for (let i = 0; i < stitch.count; i++) {
        const blockStart = pos
        const symbol: SymbolEntry = { abbr, stitchType: stitch.type, physicalStart: pos, physicalEnd: pos + stitchCount }
        pos += stitchCount
        const label = i === 0 ? `${abbr} × ${stitch.count}` : ''
        const tapEndPos = i === 0 && stitch.count > 1 ? itemEndPos : undefined
        blocks.push({ key: `${item.id}-${i}`, label, symbols: [symbol], startPos: blockStart, endPos: pos, stitchType: stitch.type, tapEndPos })
      }
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

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={isCompleted ? 1 : 0.7}
      style={blockStyles.row}
      accessibilityLabel={block.label}
      accessibilityRole="button"
    >
      {/* Label：永遠佔位以維持對齊；單針法第 2+ 個 block label 為空字串 */}
      <Text
        style={[
          blockStyles.label,
          isActive && blockStyles.labelActive,
          isCompleted && blockStyles.labelCompleted,
        ]}
        numberOfLines={1}
      >
        {block.label}
      </Text>

      {/* 符號區：單行排列，不換行 */}
      <View style={blockStyles.symbolsRow}>
        {block.symbols.map((symbol, i) => {
          const symStatus = getSymbolStatus(symbol, currentStitch)
          const opacity = symStatus === 'completed' ? 0.2 : symStatus === 'current' ? 1 : 0.7

          if (showIcons && symbol.stitchType) {
            const SymSvg = CROCHET_SVG_MAP[symbol.stitchType] ?? KNIT_SVG_MAP[symbol.stitchType]

            if (SymSvg) {
              const iconColor = symStatus === 'current' ? '#D97398' : '#000'
              return (
                <View key={i} style={{ opacity }}>
                  <SymSvg width={24} height={24} color={iconColor} />
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
  // 每個 block 是一個直向欄位，橫向並排
  row: {
    alignItems: 'flex-start',
    marginRight: 16,
    marginBottom: 14,
  },
  // Label：文字標籤，無 icon；固定高度確保空字串時排版不跑掉
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: '#4b5563',
    height: 14,
    marginBottom: 10,
  },
  labelActive: {
    color: '#D97398',
    fontWeight: '600',
  },
  labelCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  // 符號區：可換行
  symbolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
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
  const [showDescription, setShowDescription] = useState(false)

  const nextStitchRef = useRef<View>(null)
  const prevStitchRef = useRef<View>(null)
  const displayToggleRef = useRef<View>(null)
  const previewArrowRef = useRef<View>(null)

  const { showSpotlight, resolvedSteps, dismiss: dismissSpotlight } = useSpotlight(
    SCREEN_NAMES.PROGRESS_TRACKING,
    [
      {
        ref: nextStitchRef,
        title: t('onboarding.trackingNextTitle'),
        description: t('onboarding.trackingNextDesc'),
      },
      {
        ref: prevStitchRef,
        title: t('onboarding.trackingPrevTitle'),
        description: t('onboarding.trackingPrevDesc'),
      },
      {
        ref: displayToggleRef,
        title: t('onboarding.trackingToggleTitle'),
        description: t('onboarding.trackingToggleDesc'),
        shape: 'circle',
      },
      {
        ref: previewArrowRef,
        title: t('onboarding.trackingPreviewTitle'),
        description: t('onboarding.trackingPreviewDesc'),
      },
    ]
  )
  // null = 正常追蹤模式；number = 預覽指定圈（index）
  const [previewRoundIndex, setPreviewRoundIndex] = useState<number | null>(null)

  const blocksScrollRef = useRef<ScrollView>(null)
  const blockYPositions = useRef<Map<string, number>>(new Map())

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

  const isPreviewMode = previewRoundIndex !== null
  const displayedRoundIndex = isPreviewMode ? previewRoundIndex : currentRound
  const currentRoundData = rounds[displayedRoundIndex] ?? null

  // In preview mode, we always show as if we're at position 0 (beginning of round)
  const displayStitch = isPreviewMode ? 0 : currentStitch

  const totalStitches = currentRoundData ? totalStitchesInRound(currentRoundData) : 0
  const blocks = useMemo(
    () => (currentRoundData ? expandToBlocks(currentRoundData) : []),
    [currentRoundData]
  )
  const descriptionText = useMemo(
    () => (currentRoundData ? getRoundDescriptionText(currentRoundData) : ''),
    [currentRoundData]
  )

  const displayRoundNumber = displayedRoundIndex + roundStartNumber
  const displayLastRoundNumber = totalRounds - 1 + roundStartNumber

  const isLiveRound = totalRounds > 0
  const isLastRound = currentRound === totalRounds - 1

  // ── Auto-scroll to active block ───────────────────────────────────────────────

  useEffect(() => {
    // When displayed round changes, clear stale positions and reset scroll
    blockYPositions.current.clear()
    blocksScrollRef.current?.scrollTo({ y: 0, animated: false })
  }, [displayedRoundIndex])

  useEffect(() => {
    if (isPreviewMode) return // No auto-scroll in preview mode
    const activeBlock = blocks.find((b) => getBlockStatus(b, currentStitch) === 'active')
    if (!activeBlock) return
    const y = blockYPositions.current.get(activeBlock.key)
    if (y === undefined) return
    // Scroll so active block has ~2 rows (~120px) of context above it
    blocksScrollRef.current?.scrollTo({ y: Math.max(0, y - 120), animated: true })
  }, [currentStitch, blocks, isPreviewMode])

  // Reset preview mode when chart changes
  useEffect(() => {
    setPreviewRoundIndex(null)
  }, [selectedChartId])

  // ── Action handlers ──────────────────────────────────────────────────────────

  function handleChartComplete() {
    logChartCompleted()
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
    if (!id || isPreviewMode) return // 預覽模式不可互動
    const jumpPos = block.tapEndPos ?? block.endPos
    if (jumpPos <= currentStitch) return // 已完成，無效（Req 4.14）
    if (jumpPos >= totalStitches) {
      handleCompleteRound()
    } else {
      useProgressStore.getState().jumpToStitchPosition(id, activeChart.id, jumpPos)
    }
  }

  function handlePreviewRound(index: number) {
    if (index < 0 || index >= totalRounds) return
    setPreviewRoundIndex(index)
  }

  function handleExitPreview() {
    setPreviewRoundIndex(null)
  }

  function handleShowChartPicker() {
    if (!project || project.charts.length <= 1) return
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: t('tracking.selectChart'),
        options: [...project.charts.map((c) => c.name), t('common.cancel')],
        cancelButtonIndex: project.charts.length,
      },
      (index) => {
        if (index < project.charts.length) {
          setSelectedChartId(project.charts[index].id)
        }
      }
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        centerElement={
          project.charts.length > 1 ? (
            <TouchableOpacity
              onPress={handleShowChartPicker}
              style={styles.headerTitleBtn}
              accessibilityRole="button"
              accessibilityLabel={t('tracking.selectChart')}
            >
              <Text style={styles.headerTitleText} numberOfLines={1}>{activeChart.name}</Text>
              <Ionicons name="chevron-down" size={14} color="#6b7280" />
            </TouchableOpacity>
          ) : (
            <Text style={styles.headerTitleText} numberOfLines={1}>{activeChart.name}</Text>
          )
        }
      />


      {/* ── Pattern card（flex: 1，內部可垂直滾動）────────────────────────── */}
      <View style={[styles.patternCard, isPreviewMode && styles.patternCardPreview]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            {/* Preview prev arrow */}
            <TouchableOpacity
              ref={previewArrowRef}
              onPress={() => handlePreviewRound(displayedRoundIndex - 1)}
              disabled={displayedRoundIndex <= 0}
              style={[styles.previewArrow, displayedRoundIndex <= 0 && styles.previewArrowDisabled]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={t('tracking.prevRound')}
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={18} color={displayedRoundIndex <= 0 ? '#d1d5db' : '#6b7280'} />
            </TouchableOpacity>
            <Text style={[styles.cardTitle, isPreviewMode && styles.cardTitlePreview]}>
              {t('tracking.roundTitle', { number: displayRoundNumber })}
            </Text>
            {/* Preview next arrow */}
            <TouchableOpacity
              onPress={() => handlePreviewRound(displayedRoundIndex + 1)}
              disabled={displayedRoundIndex >= totalRounds - 1}
              style={[styles.previewArrow, displayedRoundIndex >= totalRounds - 1 && styles.previewArrowDisabled]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={t('tracking.nextRound')}
              accessibilityRole="button"
            >
              <Ionicons name="chevron-forward" size={18} color={displayedRoundIndex >= totalRounds - 1 ? '#d1d5db' : '#6b7280'} />
            </TouchableOpacity>
          </View>
          <View style={styles.cardHeaderRight}>
            {isPreviewMode && (
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>{t('tracking.previewMode')}</Text>
              </View>
            )}
            <Text style={styles.roundBadge}>{t('tracking.roundBadge', { total: displayLastRoundNumber })}</Text>
            <TouchableOpacity
              ref={displayToggleRef}
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

        {/* Pattern description + notes (collapsible) */}
        {(descriptionText || currentRoundData?.notes) ? (
          <>
            <TouchableOpacity
              style={styles.descToggleRow}
              onPress={() => setShowDescription((s) => !s)}
              accessibilityRole="button"
            >
              <Text style={styles.descToggleLabel}>{t('tracking.patternDesc')}</Text>
              <Ionicons
                name={showDescription ? 'chevron-up' : 'chevron-down'}
                size={13}
                color="#9ca3af"
              />
            </TouchableOpacity>
            {showDescription && (
              <>
                {descriptionText ? (
                  <Text style={styles.descriptionText}>{descriptionText}</Text>
                ) : null}
                {currentRoundData?.notes ? (
                  <Text style={styles.notesText}>{t('tracking.roundNotes', { notes: currentRoundData.notes })}</Text>
                ) : null}
              </>
            )}
          </>
        ) : null}

        {/* Blocks：wrap 排列，超出高度可垂直滾動 */}
        <ScrollView
          ref={blocksScrollRef}
          style={styles.blocksContainer}
          contentContainerStyle={styles.blocksContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {blocks.length > 0 ? (
            blocks.map((block) => (
              <View
                key={block.key}
                onLayout={(e) => {
                  blockYPositions.current.set(block.key, e.nativeEvent.layout.y)
                }}
              >
                <StitchBlockRow
                  block={block}
                  currentStitch={displayStitch}
                  showIcons={showIcons}
                  onPress={() => handleBlockTap(block)}
                />
              </View>
            ))
          ) : (
            <Text style={styles.emptyRoundText}>{t('tracking.emptyRound')}</Text>
          )}
        </ScrollView>
      </View>

      {/* ── Bottom controls（固定在底部）────────────────────────────────────── */}
      <View style={styles.bottomControls}>
        {isPreviewMode ? (
          /* Preview mode: show only "return to current" button */
          <TouchableOpacity
            style={styles.returnToCurrentButton}
            onPress={handleExitPreview}
            accessibilityLabel={t('tracking.returnToCurrent')}
            accessibilityRole="button"
          >
            <Ionicons name="return-down-back-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.returnToCurrentText}>{t('tracking.returnToCurrent')}</Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* Row 1: ← 上一針 | 0/21 | 下一針 → */}
            <View style={styles.mainRow}>
              <TouchableOpacity
                ref={prevStitchRef}
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
                ref={nextStitchRef}
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
          </>
        )}
      </View>

      {/* No AdBanner on tracking screen (Req 11.4) */}

      {/* Completion celebration modal (Req 4.5, 11.10–11.15) */}
      <CompletionModal
        visible={showCompletion}
        onClose={handleCompletionClose}
        interstitialShown={project.interstitialShown}
      />

      {showSpotlight && <SpotlightOverlay steps={resolvedSteps} onDismiss={dismissSpotlight} />}
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

  // ── Header title (chart dropdown) ────────────────────────────────────────────
  headerTitleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 200,
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
    flexShrink: 1,
  },

  // ── Description toggle ────────────────────────────────────────────────────────
  descToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  descToggleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },

  // ── Pattern card ─────────────────────────────────────────────────────────────
  patternCardPreview: {
    borderWidth: 1.5,
    borderColor: '#D97398',
    borderStyle: 'dashed',
  },
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
    marginBottom: 14,
    gap: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    flexShrink: 1,
  },
  cardTitlePreview: {
    color: '#D97398',
  },
  previewArrow: {
    padding: 2,
  },
  previewArrowDisabled: {
    opacity: 0.3,
  },
  previewBadge: {
    backgroundColor: '#fce7f0',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  previewBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97398',
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
    marginBottom: 8,
  },
  notesText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  // blocks 容器：wrap 排列，超過螢幕寬度自動換行
  blocksContainer: {
    flex: 1,
    marginTop: 4,
  },
  blocksContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 4,
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
    flex: 2,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  counterCurrent: {
    fontSize: 40,
    fontWeight: '800',
    color: '#D97398',
    letterSpacing: -1,
  },
  counterTotal: {
    fontSize: 20,
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
  returnToCurrentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97398',
    borderRadius: 14,
    paddingVertical: 18,
  },
  returnToCurrentText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
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
