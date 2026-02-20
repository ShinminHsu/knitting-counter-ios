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
import { STITCH_CATEGORIES_BY_CRAFT } from '../constants/stitches'
import { useCustomStitchStore } from '../stores/useCustomStitchStore'
import { CraftType, CustomStitchPattern, StitchType, StitchTypeInfo } from '../types'

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
  // 鉤針加針
  [StitchType.SC_INC]:       'V',
  [StitchType.HDC_INC]:      'V̈',
  [StitchType.DC_INC]:       'Ṽ',
  [StitchType.TR_INC]:       'V̄',
  // 鉤針減針
  [StitchType.SC2TOG]:       'Λ',
  [StitchType.HDC2TOG]:      '∧',
  [StitchType.HDC3TOG]:      '⋀',
  [StitchType.DC2TOG]:       '∧',
  [StitchType.DC3TOG]:       '⋀',
  [StitchType.TR3TOG]:       '⋀',
  // 鉤針特殊
  [StitchType.DC3_CLUSTER]:  '❋',
  [StitchType.HDC3_CLUSTER]: '❊',
  [StitchType.DC5_POPCORN]:  '✿',
  [StitchType.DC5_SHELL]:    '❦',
  // 棒針基礎
  [StitchType.CAST_ON]:      '⊕',
  [StitchType.BIND_OFF]:     '⊘',
  [StitchType.KNIT]:         '−',
  [StitchType.PURL]:         '·',
  [StitchType.YARN_OVER]:    'O',
  [StitchType.SLIP_WYIB]:    'V',
  [StitchType.SLIP_WYIF]:    'V',
  [StitchType.WRAP_AND_TURN]:'W',
  // 棒針減針
  [StitchType.SSK]:          '\\',
  [StitchType.SSP]:          '\\',
  [StitchType.K2TOG]:        '/',
  [StitchType.P2TOG]:        '/',
  [StitchType.SSSK]:         '⟍',
  [StitchType.SSSP]:         '⟍',
  [StitchType.K3TOG]:        '⟋',
  [StitchType.P3TOG]:        '⟋',
  [StitchType.CDD]:          '⊼',
  [StitchType.CDDP]:         '⊼',
  // 棒針加針
  [StitchType.M1L]:          'M',
  [StitchType.M1LP]:         'M',
  [StitchType.M1R]:          'M',
  [StitchType.M1RP]:         'M',
  [StitchType.K_TBL]:        '⊞',
  [StitchType.P_TBL]:        '⊡',
  // 棒針麻花
  [StitchType.CABLE_1_1_RC]: '⥊',
  [StitchType.CABLE_1_1_LC]: '⥋',
  [StitchType.CABLE_2_2_RC]: '⥌',
  [StitchType.CABLE_2_2_LC]: '⥍',
  [StitchType.CABLE_1_1_RPC]:'⤸',
  [StitchType.CABLE_1_1_LPC]:'⤹',
  [StitchType.CABLE_2_2_RPC]:'⤻',
  [StitchType.CABLE_2_2_LPC]:'⤺',
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
  onSelect: (type: StitchType) => void
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
  const [query, setQuery] = useState('')
  const { getByType } = useCustomStitchStore()

  const sections = useMemo<SectionData[]>(() => {
    const q = query.trim().toLowerCase()
    const categories = STITCH_CATEGORIES_BY_CRAFT[craftType]

    const builtInSections: SectionData[] = categories
      .map((cat) => {
        const filtered = cat.stitches.filter((type) => {
          if (!q) return true
          const info = StitchTypeInfo[type]
          return (
            info.label.toLowerCase().includes(q) ||
            info.abbr.toLowerCase().includes(q) ||
            info.englishName.toLowerCase().includes(q)
          )
        })
        return { title: cat.label, data: filtered.map((t): BuiltInItem => ({ kind: 'builtin', stitchType: t })) }
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
        ? [{ title: '自訂', data: customStitches.map((s): CustomItem => ({ kind: 'custom', stitch: s })) }]
        : []

    return [...builtInSections, ...customSection]
  }, [craftType, query, getByType])

  function handleSelect(item: ListItem) {
    if (item.kind === 'builtin') {
      onSelect(item.stitchType)
    } else {
      onSelect(StitchType.CUSTOM)
    }
    onClose()
  }

  function renderItem({ item }: { item: ListItem }) {
    if (item.kind === 'builtin') {
      const info = StitchTypeInfo[item.stitchType]
      const symbol = getSymbol(item.stitchType)
      return (
        <TouchableOpacity
          style={styles.stitchRow}
          onPress={() => handleSelect(item)}
          activeOpacity={0.6}
        >
          <Text style={styles.stitchSymbol}>{symbol}</Text>
          <Text style={styles.stitchLabel}>{info.label}</Text>
          <Text style={styles.stitchAbbr}>{info.abbr}</Text>
        </TouchableOpacity>
      )
    }

    return (
      <TouchableOpacity
        style={styles.stitchRow}
        onPress={() => handleSelect(item)}
        activeOpacity={0.6}
      >
        <Text style={styles.stitchSymbol}>✦</Text>
        <Text style={styles.stitchLabel}>{item.stitch.name}</Text>
        <Text style={styles.stitchAbbr}>{item.stitch.abbr}</Text>
      </TouchableOpacity>
    )
  }

  function renderSectionHeader({ section }: { section: SectionData }) {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
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
          <Text style={styles.headerTitle}>選擇針法</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜尋針法..."
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
            <Text style={styles.emptyText}>找不到符合的針法</Text>
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
      </View>
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
    paddingBottom: 32,
  },
  sectionHeader: {
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
    color: '#D97398',
    textAlign: 'center',
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
