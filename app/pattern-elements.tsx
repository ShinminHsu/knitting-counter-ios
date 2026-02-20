import { useEffect, useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native'
import { Stack } from 'expo-router'
import { logScreenView } from '../src/services'
import { SCREEN_NAMES } from '../src/constants'

type TabKey = 'custom' | 'template'

// ─── PatternElementsScreen ────────────────────────────────────────────────────

export default function PatternElementsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('custom')

  // Analytics: log screen view on mount (Req 10.2)
  useEffect(() => {
    logScreenView(SCREEN_NAMES.PATTERN_ELEMENTS)
  }, [])

  function handleAdd() {
    if (activeTab === 'custom') {
      Alert.alert('新增自訂針法', '自訂針法新增功能將於後續版本實作。')
    } else {
      Alert.alert('新增樣板', '樣板新增功能將於後續版本實作。')
    }
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'custom' ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>尚無自訂針法</Text>
            <Text style={styles.emptyStateHint}>
              點擊下方「新增」按鈕，建立你的自訂針法。
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>尚無樣板</Text>
            <Text style={styles.emptyStateHint}>
              點擊下方「新增」按鈕，建立可重複使用的針法樣板。
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Add button (pinned to bottom) ───────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
          accessibilityLabel="新增"
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>+ 新增</Text>
        </TouchableOpacity>
      </View>
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

  // Scroll content
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
