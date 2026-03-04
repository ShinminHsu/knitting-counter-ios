import { useEffect, useMemo, useRef, useState } from 'react'
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
import { Swipeable } from 'react-native-gesture-handler'
import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import ScreenHeader from '../src/components/ScreenHeader'
import { logScreenView } from '../src/services'
import { SCREEN_NAMES } from '../src/constants'
import { useCustomStitchStore } from '../src/stores/useCustomStitchStore'
import { useTemplateStore } from '../src/stores/useTemplateStore'
import { CraftType, CustomStitchPattern, StitchGroupTemplate, StitchTypeInfo } from '../src/types'
import CustomStitchModal from '../src/components/CustomStitchModal'
import GroupEditor, { GroupEditorResult } from '../src/components/GroupEditor'

type TabKey = 'custom' | 'template'

// ─── PatternElementsScreen ────────────────────────────────────────────────────

export default function PatternElementsScreen() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabKey>('custom')
  const [searchQuery, setSearchQuery] = useState('')
  const [templateSearchQuery, setTemplateSearchQuery] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingStitch, setEditingStitch] = useState<CustomStitchPattern | undefined>(undefined)

  const customStitches = useCustomStitchStore((s) => s.customStitches)
  const deleteCustomStitch = useCustomStitchStore((s) => s.deleteCustomStitch)

  const [editingTemplate, setEditingTemplate] = useState<StitchGroupTemplate | undefined>(undefined)
  const [templateEditorVisible, setTemplateEditorVisible] = useState(false)
  const [newTemplateCraftType, setNewTemplateCraftType] = useState<CraftType | undefined>(undefined)
  const [addTemplateVisible, setAddTemplateVisible] = useState(false)

  const templates = useTemplateStore((s) => s.templates)
  const deleteTemplate = useTemplateStore((s) => s.deleteTemplate)
  const updateTemplate = useTemplateStore((s) => s.updateTemplate)
  const addTemplate = useTemplateStore((s) => s.addTemplate)

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
      t('patternElements.deleteCustomTitle'),
      t('patternElements.deleteCustomMessage', { name: stitch.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
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

  function handleEditTemplatePress(template: StitchGroupTemplate) {
    setEditingTemplate(template)
    setTemplateEditorVisible(true)
  }

  function handleAddTemplatePress() {
    // Ask craft type before opening editor
    Alert.alert(
      t('patternElements.addTemplateTitle'),
      t('patternElements.addTemplateCraftPrompt'),
      [
        {
          text: t('common.crochet'),
          onPress: () => {
            setNewTemplateCraftType('crochet')
            setAddTemplateVisible(true)
          },
        },
        {
          text: t('common.knitting'),
          onPress: () => {
            setNewTemplateCraftType('knitting')
            setAddTemplateVisible(true)
          },
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    )
  }

  function handleAddTemplateConfirm(result: GroupEditorResult) {
    addTemplate({
      name: result.name,
      stitches: result.stitches,
      repeatCount: result.repeatCount,
      craftType: newTemplateCraftType,
    })
    setAddTemplateVisible(false)
    setNewTemplateCraftType(undefined)
  }

  function handleAddTemplateCancel() {
    setAddTemplateVisible(false)
    setNewTemplateCraftType(undefined)
  }

  function handleTemplateEditorConfirm(result: GroupEditorResult) {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        name: result.name,
        stitches: result.stitches,
        repeatCount: result.repeatCount,
        craftType: editingTemplate.craftType,
      })
    }
    setTemplateEditorVisible(false)
    setEditingTemplate(undefined)
  }

  function handleTemplateEditorCancel() {
    setTemplateEditorVisible(false)
    setEditingTemplate(undefined)
  }

  function handleDeleteTemplatePress(template: StitchGroupTemplate) {
    Alert.alert(
      t('patternElements.deleteTemplateTitle'),
      t('patternElements.deleteTemplateMessage', { name: template.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
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
      item.repeatCount > 1
        ? t('patternElements.repeatCount', { count: item.repeatCount })
        : t('patternElements.noRepeat')
    const craftLabel = item.craftType
      ? (item.craftType === 'crochet' ? t('common.crochet') : t('common.knitting'))
      : null

    return (
      <Swipeable
        renderRightActions={() => (
          <TouchableOpacity
            style={styles.swipeDeleteBtn}
            onPress={() => handleDeleteTemplatePress(item)}
            accessibilityLabel={t('common.delete')}
            accessibilityRole="button"
          >
            <Text style={styles.swipeDeleteText}>{t('common.delete')}</Text>
          </TouchableOpacity>
        )}
      >
        <View style={styles.templateRow}>
          <View style={styles.templateInfo}>
            <View style={styles.templateNameRow}>
              <Text style={styles.templateName} numberOfLines={1}>
                {item.name}
              </Text>
              {craftLabel && (
                <View style={[styles.craftBadge, item.craftType === 'crochet' ? styles.badgeCrochet : styles.badgeKnitting]}>
                  <Text style={[styles.craftBadgeText, item.craftType === 'crochet' ? styles.badgeCrochetText : styles.badgeKnittingText]}>
                    {craftLabel}
                  </Text>
                </View>
              )}
              {item.useCount > 0 && (
                <View style={styles.useBadge}>
                  <Text style={styles.useBadgeText}>
                    {t('patternElements.useCount', { count: item.useCount })}
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

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleEditTemplatePress(item)}
            accessibilityLabel={t('common.edit')}
            accessibilityRole="button"
          >
            <Feather name="edit-2" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </Swipeable>
    )
  }

  function renderStitchItem({ item }: { item: CustomStitchPattern }) {
    const craftLabel = item.craftType === 'crochet' ? t('common.crochet') : t('common.knitting')
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
      <Swipeable
        renderRightActions={() => (
          <TouchableOpacity
            style={styles.swipeDeleteBtn}
            onPress={() => handleDeletePress(item)}
            accessibilityLabel={t('common.delete')}
            accessibilityRole="button"
          >
            <Text style={styles.swipeDeleteText}>{t('common.delete')}</Text>
          </TouchableOpacity>
        )}
      >
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

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleEditPress(item)}
            accessibilityLabel={t('common.edit')}
            accessibilityRole="button"
          >
            <Feather name="edit-2" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </Swipeable>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('patternElements.title')} />

      {/* ── Tab selector ────────────────────────────────────────────────────── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'custom' && styles.tabActive]}
          onPress={() => setActiveTab('custom')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'custom' }}
        >
          <Text style={[styles.tabText, activeTab === 'custom' && styles.tabTextActive]}>
            {t('patternElements.tabCustom')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'template' && styles.tabActive]}
          onPress={() => setActiveTab('template')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'template' }}
        >
          <Text style={[styles.tabText, activeTab === 'template' && styles.tabTextActive]}>
            {t('patternElements.tabTemplates')}
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
              placeholder={t('patternElements.searchCustom')}
              placeholderTextColor="#9ca3af"
              clearButtonMode="while-editing"
              returnKeyType="search"
              accessibilityLabel={t('patternElements.searchCustom')}
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
                  {searchQuery.trim() ? t('patternElements.noResultsCustom') : t('patternElements.emptyCustomTitle')}
                </Text>
                {!searchQuery.trim() && (
                  <Text style={styles.emptyStateHint}>
                    {t('patternElements.emptyCustomHint')}
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
              placeholder={t('patternElements.searchTemplates')}
              placeholderTextColor="#9ca3af"
              clearButtonMode="while-editing"
              returnKeyType="search"
              accessibilityLabel={t('patternElements.searchTemplates')}
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
                  {templateSearchQuery.trim() ? t('patternElements.noResultsTemplates') : t('patternElements.emptyTemplatesTitle')}
                </Text>
                {!templateSearchQuery.trim() && (
                  <Text style={styles.emptyStateHint}>
                    {t('patternElements.emptyTemplatesHint')}
                  </Text>
                )}
              </View>
            }
            keyboardShouldPersistTaps="handled"
          />
        </>
      )}

      {/* ── Footer: add button ───────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={activeTab === 'custom' ? handleAddPress : handleAddTemplatePress}
          accessibilityLabel={activeTab === 'custom' ? t('patternElements.addCustom') : t('patternElements.addTemplate')}
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>
            {activeTab === 'custom' ? t('patternElements.addCustom') : t('patternElements.addTemplate')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── CustomStitchModal (create / edit) ───────────────────────────────── */}
      <CustomStitchModal
        visible={modalVisible}
        onClose={handleModalClose}
        editStitch={editingStitch}
      />

      {/* ── GroupEditor (edit template) ──────────────────────────────────────── */}
      {editingTemplate && (
        <GroupEditor
          visible={templateEditorVisible}
          craftType={editingTemplate.craftType ?? 'crochet'}
          initialName={editingTemplate.name}
          initialStitches={editingTemplate.stitches}
          initialRepeatCount={editingTemplate.repeatCount}
          onConfirm={handleTemplateEditorConfirm}
          onCancel={handleTemplateEditorCancel}
        />
      )}

      {/* ── GroupEditor (add new template) ───────────────────────────────────── */}
      <GroupEditor
        visible={addTemplateVisible}
        craftType={newTemplateCraftType ?? 'crochet'}
        onConfirm={handleAddTemplateConfirm}
        onCancel={handleAddTemplateCancel}
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
    backgroundColor: '#f3f4f6',
  },
  badgeKnitting: {
    backgroundColor: '#f3f4f6',
  },
  craftBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeCrochetText: {
    color: '#6b7280',
  },
  badgeKnittingText: {
    color: '#6b7280',
  },

  // Swipe to delete
  swipeDeleteBtn: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 10,
    marginLeft: 8,
  },
  swipeDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Row action buttons
  actionBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 72,
  },
  templateInfo: {
    flex: 1,
    gap: 4,
    marginRight: 8,
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
