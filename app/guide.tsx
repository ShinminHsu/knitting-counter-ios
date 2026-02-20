import { useEffect } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Stack } from 'expo-router'
import { logScreenView } from '../src/services'
import { SCREEN_NAMES } from '../src/constants'

// ─── GuideScreen ──────────────────────────────────────────────────────────────

export default function GuideScreen() {
  // Analytics: log screen view on mount (Req 10.2)
  useEffect(() => {
    logScreenView(SCREEN_NAMES.GUIDE)
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic header title */}
      <Stack.Screen options={{ title: '使用說明' }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Section 1: 如何新增專案 ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>如何新增專案</Text>
          <View style={styles.card}>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepText}>在「我的專案」主畫面點擊右上角的「＋」按鈕。</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepText}>輸入專案名稱（例如：圍巾、帽子），並選擇針法類型。</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepText}>點擊「建立」完成新增，專案會出現在清單中。</Text>
            </View>
          </View>
        </View>

        {/* ── Section 2: 如何建立織圖 ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>如何建立織圖</Text>
          <View style={styles.card}>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepText}>進入專案詳細頁面，點擊「織圖編輯器」。</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepText}>點擊「新增段落」，為每一圈或每一排新增一個段落。</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepText}>在段落中新增針法項目，設定針法類型和針數。</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>4</Text>
              </View>
              <Text style={styles.stepText}>可為段落或針法加上備註，方便日後參考。</Text>
            </View>
          </View>
        </View>

        {/* ── Section 3: 如何追蹤進度 ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>如何追蹤進度</Text>
          <View style={styles.card}>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepText}>在專案詳細頁面點擊「開始追蹤」進入追蹤模式。</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepText}>每完成一針，點擊「下一針」，計數器會自動前進。</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepText}>若針數錯誤，點擊「上一針」退回一步。</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>4</Text>
              </View>
              <Text style={styles.stepText}>完成一圈後，系統會自動跳至下一段落繼續計數。</Text>
            </View>
          </View>
        </View>
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
    padding: 16,
    gap: 24,
    paddingBottom: 32,
  },

  // Section
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D2D2D',
    paddingHorizontal: 4,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  // Step row
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C4527F',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    paddingTop: 4,
  },
})
