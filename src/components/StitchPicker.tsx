import { useMemo, useState } from 'react'
import {
  Modal,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { STITCH_CATEGORIES_BY_CRAFT, STITCH_CATEGORY_LOCK_KEY, StitchCategoryLockKey } from '../constants/stitches'
import { useEntitlementStore } from '../stores/useEntitlementStore'
import { REWARD_TYPES } from '../constants/analytics'
import UpgradePromptModal from './UpgradePromptModal'
import { CROCHET_SVG_MAP, KNIT_SVG_MAP } from '../constants/stitchIcons'
import { useCustomStitchStore } from '../stores/useCustomStitchStore'
import { CraftType, CustomStitchPattern, StitchType, StitchTypeInfo } from '../types'
import CustomStitchModal from './CustomStitchModal'

// ─── Symbol mapping for built-in stitches ─────────────────────────────────────

const STITCH_SYMBOL: Partial<Record<StitchType, string>> = {
  // 鉤針基礎
  [StitchType.MAGIC_RING]:   '◎',
  [StitchType.CHAIN]:        '○',
  [StitchType.SLIP_STITCH]:  '•',
  [StitchType.SINGLE]:       '×',
  [StitchType.HALF_DOUBLE]:  'T',
  [StitchType.DOUBLE]:       '⊤',
  [StitchType.TREBLE]:       '⊥',
  [StitchType.CH3_PICOT]:    '⌇',
  [StitchType.DTR]:          '⫡',
  // 鉤針加針
  [StitchType.SC_INC]:       'V',
  [StitchType.SC3INC]:       'Ψ',
  [StitchType.HDC_INC]:      'V̈',
  [StitchType.HDC3_INC]:     'Ψ̈',
  [StitchType.DC_INC]:       'Ṽ',
  [StitchType.DC3_INC]:      'Ψ̃',
  // 鉤針減針
  [StitchType.SC2TOG]:       'Λ',
  [StitchType.SC3TOG]:       '⋀',
  [StitchType.HDC2TOG]:      '∧',
  [StitchType.HDC3TOG]:      '⋀',
  [StitchType.DC2TOG]:       '∧',
  [StitchType.DC3TOG]:       '⋀',
  // 鉤針特殊
  [StitchType.DC3_CLUSTER]:  '❋',
  [StitchType.HDC3_CLUSTER]: '❊',
  [StitchType.DC5_POPCORN]:  '✿',
  [StitchType.DC5_SHELL]:    '❦',
  // 棒針基礎
  [StitchType.CAST_ON]:        '⊕',
  [StitchType.BIND_OFF]:       '⊘',
  [StitchType.KNIT]:           '−',
  [StitchType.PURL]:           '·',
  [StitchType.YARN_OVER]:      'O',
  [StitchType.SLIP_WYIB]:      'V',
  [StitchType.SLIP_WYIF]:      'V',
  [StitchType.BACKWARD_LOOP_CO]:'⊛',
  [StitchType.K_TBL]:          '⊞',
  [StitchType.P_TBL]:          '⊡',
  // 棒針減針 2→1
  [StitchType.K2TOG]:          '/',
  [StitchType.P2TOG]:          '/',
  [StitchType.SSK]:            '\\',
  [StitchType.SSP]:            '\\',
  // 棒針減針 3→1
  [StitchType.K3TOG]:          '⟋',
  [StitchType.P3TOG]:          '⟋',
  [StitchType.SSSK]:           '⟍',
  [StitchType.SSSP]:           '⟍',
  [StitchType.S2KP2]:          '⊼',
  [StitchType.SSPP2]:          '⊼',
  // 棒針加針
  [StitchType.LLI]:            'M',
  [StitchType.LLPI]:           'M',
  [StitchType.RLI]:            'M',
  [StitchType.RLPI]:           'M',
  // 棒針麻花
  [StitchType.CABLE_2ST_RC]:   '⥊',
  [StitchType.CABLE_2ST_LC]:   '⥋',
  [StitchType.CABLE_2ST_RPC]:  '⤸',
  [StitchType.CABLE_2ST_LPC]:  '⤹',
  // 自訂
  [StitchType.CUSTOM]:       '✦',
}

function getSymbol(type: StitchType): string {
  return STITCH_SYMBOL[type] ?? '·'
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BuiltInItem {
  kind: 'builtin'
  stitchType: StitchType
}

interface CustomItem {
  kind: 'custom'
  stitch: CustomStitchPattern
}

type ListItem = BuiltInItem | CustomItem

interface SectionData {
  title: string
  data: ListItem[]
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StitchPickerProps {
  craftType: CraftType
  onSelect: (type: StitchType, customStitch?: CustomStitchPattern) => void
  visible: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StitchPicker({
  craftType,
  onSelect,
  visible,
  onClose,
}: StitchPickerProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [showCreateCustom, setShowCreateCustom] = useState(false)
  const [showCustomLocked, setShowCustomLocked] = useState(false)
  const [lockedCategory, setLockedCategory] = useState<{ key: StitchCategoryLockKey; label: string } | null>(null)
  const { getByType, customStitches } = useCustomStitchStore()
  const isStitchCategoryUnlocked = useEntitlementStore((s) => s.isStitchCategoryUnlocked)
  const unlockStitchCategory = useEntitlementStore((s) => s.unlockStitchCategory)
  const canUseCustomStitches = useEntitlementStore((s) => s.canUseCustomStitches)

  const sections = useMemo<SectionData[]>(() => {
    const q = query.trim().toLowerCase()
    const categories = STITCH_CATEGORIES_BY_CRAFT[craftType]

    const builtInSections: SectionData[] = categories
      .map((cat) => {
        const filtered = cat.stitches.filter((type) => {
          if (!q) return true
          const info = StitchTypeInfo[type]
          return (
            t(`stitch.name.${type}`).toLowerCase().includes(q) ||
            info.abbr.toLowerCase().includes(q) ||
            info.englishName.toLowerCase().includes(q)
          )
        })
        return { title: t(cat.label), data: filtered.map((t): BuiltInItem => ({ kind: 'builtin', stitchType: t })) }
      })
      .filter((sec) => sec.data.length > 0)

    const customStitches = getByType(craftType).filter((s) => {
      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) ||
        s.abbr.toLowerCase().includes(q) ||
        (s.englishName?.toLowerCase().includes(q) ?? false)
      )
    })

    const customSection: SectionData[] =
      customStitches.length > 0
        ? [{ title: t('stitch.category.custom'), data: customStitches.map((s): CustomItem => ({ kind: 'custom', stitch: s })) }]
        : []

    return [...builtInSections, ...customSection]
  }, [craftType, query, getByType])

  function handleSelect(item: ListItem) {
    if (item.kind === 'builtin') {
      onSelect(item.stitchType)
    } else {
      onSelect(StitchType.CUSTOM, item.stitch)
    }
    onClose()
  }

  function handleCustomStitchCreated(stitch: CustomStitchPattern) {
    // Close CustomStitchModal first, then wait for its dismiss animation (~300ms)
    // before closing StitchPicker — avoids iOS "already presenting" error
    setShowCreateCustom(false)
    setTimeout(() => {
      onSelect(StitchType.CUSTOM, stitch)
      onClose()
    }, 350)
  }

  function renderItem({ item, section }: { item: ListItem; section: SectionData }) {
    if (item.kind === 'builtin') {
      const lockKey = getSectionLockKey(section.title)
      const isLocked = lockKey ? !isStitchCategoryUnlocked(lockKey) : false
      const info = StitchTypeInfo[item.stitchType]
      const symbol = getSymbol(item.stitchType)
      const SvgIcon = CROCHET_SVG_MAP[item.stitchType] ?? KNIT_SVG_MAP[item.stitchType]
      return (
        <TouchableOpacity
          style={[styles.stitchRow, isLocked && styles.stitchRowLocked]}
          onPress={() => isLocked
            ? setLockedCategory({ key: lockKey!, label: section.title })
            : handleSelect(item)
          }
          activeOpacity={0.6}
        >
          {SvgIcon ? (
            <SvgIcon width={24} height={24} color="#000" style={{ marginRight: 8 }} />
          ) : (
            <Text style={styles.stitchSymbol}>{symbol}</Text>
          )}
          <Text style={styles.stitchLabel}>{t(`stitch.name.${item.stitchType}`)}</Text>
          <Text style={styles.stitchAbbr}>{info.abbr}</Text>
        </TouchableOpacity>
      )
    }

    const isLocked = !canUseCustomStitches()
    return (
      <TouchableOpacity
        style={[styles.stitchRow, isLocked && styles.stitchRowLocked]}
        onPress={() => isLocked ? setShowCustomLocked(true) : handleSelect(item)}
        activeOpacity={0.6}
      >
        <Text style={styles.stitchSymbol}>✦</Text>
        <Text style={styles.stitchLabel}>{item.stitch.name}</Text>
        {isLocked
          ? <Feather name="lock" size={14} color="#9ca3af" />
          : <Text style={styles.stitchAbbr}>{item.stitch.abbr}</Text>
        }
      </TouchableOpacity>
    )
  }

  function getSectionLockKey(title: string): StitchCategoryLockKey | null {
    const categories = STITCH_CATEGORIES_BY_CRAFT[craftType]
    const cat = categories.find((c) => t(c.label) === title)
    if (!cat) return null
    return STITCH_CATEGORY_LOCK_KEY[cat.label] ?? null
  }

  function renderSectionHeader({ section }: { section: SectionData }) {
    const lockKey = getSectionLockKey(section.title)
    const isLocked = lockKey ? !isStitchCategoryUnlocked(lockKey) : false
    return (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={isLocked ? () => setLockedCategory({ key: lockKey!, label: section.title }) : undefined}
        activeOpacity={isLocked ? 0.7 : 1}
      >
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
        {isLocked && <Feather name="lock" size={14} color="#9ca3af" />}
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('stitchPicker.title')}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('stitchPicker.searchPlaceholder')}
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        {/* Stitch list */}
        {sections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('stitchPicker.noResults')}</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => {
              if (item.kind === 'builtin') return `builtin-${item.stitchType}-${index}`
              return `custom-${item.stitch.id}`
            }}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Footer: create custom stitch */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.createCustomButton}
            onPress={() => canUseCustomStitches() ? setShowCreateCustom(true) : setShowCustomLocked(true)}
            activeOpacity={0.7}
          >
            {!canUseCustomStitches() && <Feather name="lock" size={14} color="#9ca3af" style={{ marginRight: 6 }} />}
            <Text style={styles.createCustomText}>{t('stitch.createCustomShort')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nested CustomStitchModal */}
      <CustomStitchModal
        visible={showCreateCustom}
        defaultCraftType={craftType}
        onClose={() => setShowCreateCustom(false)}
        onCreated={handleCustomStitchCreated}
      />

      {/* Stitch category upgrade modal */}
      <UpgradePromptModal
        visible={lockedCategory !== null}
        onClose={() => setLockedCategory(null)}
        title={t('upgrade.stitchCategory.title')}
        description={t('upgrade.stitchCategory.desc', { category: lockedCategory?.label ?? '' })}
        hasAdOption={true}
        rewardType={REWARD_TYPES.STITCH_CATEGORY_INC}
        onAdRewarded={() => {
          if (lockedCategory) unlockStitchCategory(lockedCategory.key)
        }}
      />

      {/* Custom stitch upgrade modal (premium only, no ad) */}
      <UpgradePromptModal
        visible={showCustomLocked}
        onClose={() => setShowCustomLocked(false)}
        title={t('upgrade.customStitch.title')}
        description={t('upgrade.customStitch.desc')}
        hasAdOption={false}
        onAdRewarded={() => {}}
      />
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#1f2937',
  },
  listContent: {
    paddingBottom: 8,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  createCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  createCustomText: {
    fontSize: 14,
    color: '#D97398',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    backgroundColor: '#faf5f0',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stitchRowLocked: {
    opacity: 0.4,
  },
  stitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  stitchSymbol: {
    width: 28,
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    marginRight: 8,
  },
  stitchIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  stitchLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  stitchAbbr: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
  },
})
