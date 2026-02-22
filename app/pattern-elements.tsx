import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Stack } from 'expo-router'
import { logScreenView } from '../src/services'
import { SCREEN_NAMES } from '../src/constants'
import { useCustomStitchStore } from '../src/stores/useCustomStitchStore'
import { useTemplateStore } from '../src/stores/useTemplateStore'
import { CustomStitchPattern, StitchGroupTemplate, StitchTypeInfo } from '../src/types'
import CustomStitchModal from '../src/components/CustomStitchModal'

type TabKey = 'custom' | 'template'

// ─── PatternElementsScreen ────────────────────────────────────────────────────

export default function PatternElementsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('custom')
  const [searchQuery, setSearchQuery] = useState('')
  const [templateSearchQuery, setTemplateSearchQuery] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingStitch, setEditingStitch] = useState<CustomStitchPattern | undefined>(undefined)

  const customStitches = useCustomStitchStore((s) => s.customStitches)
  const deleteCustomStitch = useCustomStitchStore((s) => s.deleteCustomStitch)

  const templates = useTemplateStore((s) => s.templates)
  const deleteTemplate = useTemplateStore((s) => s.deleteTemplate)

  // Analytics: log screen view on mount (Req 10.2)
  useEffect(() => {
    logScreenView(SCREEN_NAMES.PATTERN_ELEMENTS)
  }, [])

  // Filter stitches by search query
  const filteredStitches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return customStitches
    return customStitches.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.englishName && s.englishName.toLowerCase().includes(query)) ||
        (s.abbr && s.abbr.toLowerCase().includes(query))
    )
  }, [customStitches, searchQuery])

  // Filter templates by search query (Req 5.5)
  const filteredTemplates = useMemo(() => {
    const query = templateSearchQuery.trim().toLowerCase()
    if (!query) return templates
    return templates.filter((t) => t.name.toLowerCase().includes(query))
  }, [templates, templateSearchQuery])

  function handleAddPress() {
    setEditingStitch(undefined)
    setModalVisible(true)
  }

  function handleEditPress(stitch: CustomStitchPattern) {
    setEditingStitch(stitch)
    setModalVisible(true)
  }

  function handleDeletePress(stitch: CustomStitchPattern) {
    Alert.alert(
      '刪除自訂針法',
      `確定要刪除「${stitch.name}」嗎？此操作無法復原。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: () => deleteCustomStitch(stitch.id),
        },
      ]
    )
  }

  function handleModalClose() {
    setModalVisible(false)
    setEditingStitch(undefined)
  }

  function handleDeleteTemplatePress(template: StitchGroupTemplate) {
    Alert.alert(
      '刪除樣板',
      `確定要刪除「${template.name}」嗎？此操作無法復原。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: () => deleteTemplate(template.id),
        },
      ]
    )
  }

  /** Build a short stitch preview string, e.g. "sc×6, sc-inc×2" */
  function buildStitchPreview(template: StitchGroupTemplate): string {
    const parts = template.stitches.map((s) => {
      const abbr =
        s.type === 'custom'
          ? (s.customAbbr ?? s.customName ?? '自訂')
          : (StitchTypeInfo[s.type]?.abbr ?? s.type)
      return s.count > 1 ? `${abbr}×${s.count}` : abbr
    })
    const preview = parts.join(', ')
    // Truncate long previews to keep UI tidy
    return preview.length > 60 ? preview.slice(0, 57) + '…' : preview
  }

  function renderTemplateItem({ item }: { item: StitchGroupTemplate }) {
    const preview = buildStitchPreview(item)
    const repeatLabel =
      item.repeatCount > 1 ? `重複 ${item.repeatCount} 次` : '不重複'

    return (
      <TouchableOpacity
        style={styles.templateRow}
        onLongPress={() => handleDeleteTemplatePress(item)}
        accessibilityLabel={`長按刪除樣板 ${item.name}`}
        delayLongPress={400}
        activeOpacity={0.7}
      >
        <View style={styles.templateInfo}>
          <View style={styles.templateNameRow}>
            <Text style={styles.templateName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.useCount > 0 && (
              <View style={styles.useBadge}>
                <Text style={styles.useBadgeText}>
                  用過 {item.useCount} 次
                </Text>
              </View>
            )}
          </View>
          {preview.length > 0 && (
            <Text style={styles.templatePreview} numberOfLines={2}>
              {preview}
            </Text>
          )}
          <Text style={styles.templateMeta}>{repeatLabel}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  function renderStitchItem({ item }: { item: CustomStitchPattern }) {
    const craftLabel = item.craftType === 'crochet' ? '鉤針' : '棒針'
    const craftBadgeStyle =
      item.craftType === 'crochet' ? styles.badgeCrochet : styles.badgeKnitting
    const craftTextStyle =
      item.craftType === 'crochet' ? styles.badgeCrochetText : styles.badgeKnittingText

    // Build subtitle: English name and/or abbr
    const subtitleParts: string[] = []
    if (item.englishName && item.englishName !== item.name) {
      subtitleParts.push(item.englishName)
    }
    if (item.abbr && item.abbr !== item.name && item.abbr !== item.englishName) {
      subtitleParts.push(item.abbr)
    }
    const subtitle = subtitleParts.join('  ·  ')

    return (
      <View style={styles.stitchRow}>
        <View style={styles.stitchInfo}>
          <View style={styles.stitchNameRow}>
            <Text style={styles.stitchName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={[styles.craftBadge, craftBadgeStyle]}>
              <Text style={[styles.craftBadgeText, craftTextStyle]}>{craftLabel}</Text>
            </View>
          </View>
          {subtitle.length > 0 && (
            <Text style={styles.stitchSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.stitchActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleEditPress(item)}
            accessibilityLabel={`編輯 ${item.name}`}
            accessibilityRole="button"
          >
            <Text style={styles.actionBtnIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDeletePress(item)}
            accessibilityLabel={`刪除 ${item.name}`}
            accessibilityRole="button"
          >
            <Text style={styles.actionBtnIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic header title */}
      <Stack.Screen options={{ title: '針法庫' }} />

      {/* ── Tab selector ────────────────────────────────────────────────────── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'custom' && styles.tabActive]}
          onPress={() => setActiveTab('custom')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'custom' }}
        >
          <Text style={[styles.tabText, activeTab === 'custom' && styles.tabTextActive]}>
            自訂針法
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'template' && styles.tabActive]}
          onPress={() => setActiveTab('template')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'template' }}
        >
          <Text style={[styles.tabText, activeTab === 'template' && styles.tabTextActive]}>
            樣板
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      {activeTab === 'custom' ? (
        <>
          {/* Search bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="搜尋針法名稱..."
              placeholderTextColor="#9ca3af"
              clearButtonMode="while-editing"
              returnKeyType="search"
              accessibilityLabel="搜尋自訂針法"
            />
          </View>

          {/* Stitch list */}
          <FlatList
            data={filteredStitches}
            keyExtractor={(item) => item.id}
            renderItem={renderStitchItem}
            contentContainerStyle={
              filteredStitches.length === 0 ? styles.listEmpty : styles.listContent
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>
                  {searchQuery.trim() ? '找不到符合的針法' : '尚無自訂針法'}
                </Text>
                {!searchQuery.trim() && (
                  <Text style={styles.emptyStateHint}>
                    點擊下方「＋ 新增自訂針法」按鈕，建立你的自訂針法。
                  </Text>
                )}
              </View>
            }
            keyboardShouldPersistTaps="handled"
          />
        </>
      ) : (
        /* ── 樣板 tab (task 12.2) ──────────────────────────────────────────── */
        <>
          {/* Search bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={templateSearchQuery}
              onChangeText={setTemplateSearchQuery}
              placeholder="搜尋樣板名稱..."
              placeholderTextColor="#9ca3af"
              clearButtonMode="while-editing"
              returnKeyType="search"
              accessibilityLabel="搜尋樣板"
            />
          </View>

          {/* Template list */}
          <FlatList
            data={filteredTemplates}
            keyExtractor={(item) => item.id}
            renderItem={renderTemplateItem}
            contentContainerStyle={
              filteredTemplates.length === 0 ? styles.listEmpty : styles.listContent
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>
                  {templateSearchQuery.trim() ? '找不到符合的樣板' : '尚無樣板'}
                </Text>
                {!templateSearchQuery.trim() && (
                  <Text style={styles.emptyStateHint}>
                    在圈段編輯器中儲存針法群組為樣板後，即可在此管理。
                  </Text>
                )}
              </View>
            }
            keyboardShouldPersistTaps="handled"
          />
        </>
      )}

      {/* ── Footer: add button (only shown on custom tab) ───────────────────── */}
      {activeTab === 'custom' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPress}
            accessibilityLabel="新增自訂針法"
            accessibilityRole="button"
          >
            <Text style={styles.addButtonText}>＋ 新增自訂針法</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── CustomStitchModal (create / edit) ───────────────────────────────── */}
      <CustomStitchModal
        visible={modalVisible}
        onClose={handleModalClose}
        editStitch={editingStitch}
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

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#D97398',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#D97398',
    fontWeight: '700',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#faf5f0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 40,
  },

  // List
  listContent: {
    paddingVertical: 8,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  // Stitch row
  stitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 64,
  },
  stitchInfo: {
    flex: 1,
    gap: 4,
    marginRight: 8,
  },
  stitchNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stitchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flexShrink: 1,
  },
  stitchSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },

  // CraftType badge
  craftBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeCrochet: {
    backgroundColor: '#fce7f0',
  },
  badgeKnitting: {
    backgroundColor: '#e0f2fe',
  },
  craftBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeCrochetText: {
    color: '#C4527F',
  },
  badgeKnittingText: {
    color: '#0284c7',
  },

  // Row action buttons
  stitchActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  actionBtnIcon: {
    fontSize: 18,
  },

  // Separator
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
    marginLeft: 16,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    gap: 8,
    maxWidth: 280,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#9ca3af',
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Template row
  templateRow: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 72,
    justifyContent: 'center',
  },
  templateInfo: {
    gap: 4,
  },
  templateNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flexShrink: 1,
  },
  templatePreview: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  templateMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },

  // Use count badge
  useBadge: {
    backgroundColor: '#fce7f0',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  useBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C4527F',
  },

  // Footer / add button
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#faf5f0',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addButton: {
    backgroundColor: '#D97398',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
