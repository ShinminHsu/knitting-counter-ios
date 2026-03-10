import { useEffect } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { logScreenView } from '../src/services'
import ScreenHeader from '../src/components/ScreenHeader'
import { SCREEN_NAMES } from '../src/constants'
import { useOnboardingStore } from '../src/stores'

// ─── GuideScreen ──────────────────────────────────────────────────────────────

export default function GuideScreen() {
  const { t } = useTranslation()
  const resetSpotlights = useOnboardingStore((s) => s.resetSpotlights)

  // Analytics: log screen view on mount (Req 10.2)
  useEffect(() => {
    logScreenView(SCREEN_NAMES.GUIDE)
  }, [])

  function handleReplayTutorial() {
    Alert.alert(t('guide.replayTitle'), t('guide.replayMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('guide.replayConfirm'),
        onPress: () => resetSpotlights(),
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('guide.title')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Replay tutorial button */}
        <TouchableOpacity style={styles.replayButton} onPress={handleReplayTutorial}>
          <Feather name="play-circle" size={18} color="#6b7280" style={{ marginRight: 8 }} />
          <Text style={styles.replayButtonText}>{t('guide.replayButton')}</Text>
        </TouchableOpacity>

        {/* ── Section 1: 專案管理 ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('guide.sectionProjects')}</Text>
          <View style={styles.card}>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
              <Text style={styles.stepText}>{t('guide.addProject1')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
              <Text style={styles.stepText}>{t('guide.addProject2')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
              <Text style={styles.stepText}>{t('guide.addProject3')}</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="info" size={14} color="#6b7280" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.tipText}>{t('guide.tipSwipeDeleteProject')}</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="info" size={14} color="#6b7280" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.tipText}>{t('guide.tipProjectPhoto')}</Text>
            </View>
          </View>
        </View>

        {/* ── Section 2: 織圖 ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('guide.sectionCharts')}</Text>
          <View style={styles.card}>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
              <Text style={styles.stepText}>{t('guide.buildChart1')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
              <Text style={styles.stepText}>{t('guide.buildChart2')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
              <Text style={styles.stepText}>{t('guide.buildChart3')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>4</Text></View>
              <Text style={styles.stepText}>{t('guide.buildChart4')}</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="info" size={14} color="#6b7280" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.tipText}>{t('guide.tipSwipeDeleteChart')}</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="info" size={14} color="#6b7280" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.tipText}>{t('guide.tipImportExport')}</Text>
            </View>
          </View>
        </View>

        {/* ── Section 3: 段落編輯 ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('guide.sectionEditor')}</Text>
          <View style={styles.card}>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
              <Text style={styles.stepText}>{t('guide.editor1')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
              <Text style={styles.stepText}>{t('guide.editor2')}</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="info" size={14} color="#6b7280" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.tipText}>{t('guide.tipLongPressMultiSelect')}</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="info" size={14} color="#6b7280" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.tipText}>{t('guide.tipDragReorder')}</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="info" size={14} color="#6b7280" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.tipText}>{t('guide.tipStitchGroup')}</Text>
            </View>
          </View>
        </View>

        {/* ── Section 4: 計數追蹤 ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('guide.sectionTracking')}</Text>
          <View style={styles.card}>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
              <Text style={styles.stepText}>{t('guide.track1')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
              <Text style={styles.stepText}>{t('guide.track2')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
              <Text style={styles.stepText}>{t('guide.track3')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>4</Text></View>
              <Text style={styles.stepText}>{t('guide.track4')}</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="info" size={14} color="#6b7280" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.tipText}>{t('guide.tipPreviewMode')}</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="info" size={14} color="#6b7280" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.tipText}>{t('guide.tipDisplayToggle')}</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="info" size={14} color="#6b7280" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.tipText}>{t('guide.tipBlockTap')}</Text>
            </View>
          </View>
        </View>

        {/* ── Section 5: 手勢操作 ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('guide.sectionGestures')}</Text>
          <View style={styles.card}>
            <View style={styles.gestureRow}>
              <View style={styles.gestureIconBox}>
                <Feather name="chevrons-left" size={20} color="#6b7280" />
              </View>
              <View style={styles.gestureInfo}>
                <Text style={styles.gestureTitle}>{t('guide.gestureSwipeLeft')}</Text>
                <Text style={styles.gestureDesc}>{t('guide.gestureSwipeLeftDesc')}</Text>
              </View>
            </View>
            <View style={styles.gestureRow}>
              <View style={styles.gestureIconBox}>
                <Feather name="more-vertical" size={20} color="#6b7280" />
              </View>
              <View style={styles.gestureInfo}>
                <Text style={styles.gestureTitle}>{t('guide.gestureLongPress')}</Text>
                <Text style={styles.gestureDesc}>{t('guide.gestureLongPressDesc')}</Text>
              </View>
            </View>
            <View style={styles.gestureRow}>
              <View style={styles.gestureIconBox}>
                <Feather name="menu" size={20} color="#6b7280" />
              </View>
              <View style={styles.gestureInfo}>
                <Text style={styles.gestureTitle}>{t('guide.gestureDrag')}</Text>
                <Text style={styles.gestureDesc}>{t('guide.gestureDragDesc')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section 6: 針法庫 ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('guide.sectionStitchLibrary')}</Text>
          <View style={styles.card}>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
              <Text style={styles.stepText}>{t('guide.stitchLib1')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
              <Text style={styles.stepText}>{t('guide.stitchLib2')}</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="info" size={14} color="#6b7280" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.tipText}>{t('guide.tipSwipeDeleteStitch')}</Text>
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
    paddingBottom: 40,
  },

  replayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
    backgroundColor: '#fff',
  },
  replayButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },

  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D2D2D',
    paddingHorizontal: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    paddingTop: 4,
  },

  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
  },

  gestureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  gestureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  gestureInfo: {
    flex: 1,
    gap: 2,
  },
  gestureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  gestureDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
})
