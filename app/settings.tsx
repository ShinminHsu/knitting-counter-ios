import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import i18n from '../src/i18n'
import { mmkv, STORAGE_KEYS } from '../src/stores/mmkvStorage'
import ScreenHeader from '../src/components/ScreenHeader'

const LANGUAGES = [
  { code: 'en', labelKey: 'settings.languageEn' as const },
  { code: 'zh-TW', labelKey: 'settings.languageZhTW' as const },
  { code: 'ja', labelKey: 'settings.languageJa' as const },
]

export default function SettingsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const currentLanguage = i18n.language

  function handleLanguageSelect(code: string) {
    mmkv.set(STORAGE_KEYS.LANGUAGE, code)
    i18n.changeLanguage(code)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title={t('settings.title')} />
      <View style={styles.container}>
      {/* Tools section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>{t('settings.toolsSection')}</Text>
        <View style={styles.optionGroup}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => router.push('/pattern-elements')}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Text style={styles.optionLabel}>{t('settings.stitchLibrary')}</Text>
            <Feather name="chevron-right" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>{t('settings.language')}</Text>
        <View style={styles.optionGroup}>
          {LANGUAGES.map((lang, index) => {
            const isSelected = currentLanguage === lang.code
            const isLast = index === LANGUAGES.length - 1
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.optionRow, !isLast && styles.optionRowBorder]}
                onPress={() => handleLanguageSelect(lang.code)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {t(lang.labelKey)}
                </Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf5f0',
  },
  container: {
    flex: 1,
    backgroundColor: '#faf5f0',
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  optionGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  optionRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  optionLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  optionLabelSelected: {
    color: '#D97398',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#D97398',
    fontWeight: '700',
  },
})
