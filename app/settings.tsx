import { useEffect, useState } from 'react'
import { Alert, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import i18n from '../src/i18n'
import { mmkv, STORAGE_KEYS } from '../src/stores/mmkvStorage'
import ScreenHeader from '../src/components/ScreenHeader'
import { requestATTIfNeeded, logScreenView, purchasePremium, restorePurchases, redeemVoucher, preloadRewardedAd } from '../src/services'
import { SCREEN_NAMES } from '../src/constants'
import { useEntitlementStore } from '../src/stores'

const LANGUAGES = [
  { code: 'en', labelKey: 'settings.languageEn' as const },
  { code: 'zh-TW', labelKey: 'settings.languageZhTW' as const },
  { code: 'ja', labelKey: 'settings.languageJa' as const },
]

export default function SettingsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const currentLanguage = i18n.language
  const [promoCode, setPromoCode] = useState('')
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null)
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)

  const isPremium = useEntitlementStore((s) => s.isPremium)
  const premiumSource = useEntitlementStore((s) => s.premiumSource)

  useEffect(() => {
    logScreenView(SCREEN_NAMES.SETTINGS)
    requestATTIfNeeded()
  }, [])

  function handleLanguageSelect(code: string) {
    mmkv.set(STORAGE_KEYS.LANGUAGE, code)
    i18n.changeLanguage(code)
  }

  async function handleGetPremium() {
    const result = await purchasePremium()
    if (result === 'error') {
      Alert.alert(t('common.error'), t('common.error'))
    }
  }

  async function handleRestorePurchases() {
    const restored = await restorePurchases()
    if (!restored) {
      Alert.alert(t('common.error'), t('common.error'))
    }
  }

  async function handleRedeemCode() {
    const success = await redeemVoucher(promoCode)
    if (success) {
      setRedeemMessage(t('upgrade.codeRedeemed'))
      setPromoCode('')
    } else {
      setRedeemMessage(t('upgrade.invalidCode'))
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title={t('settings.title')} />
      <View style={styles.container}>

      {/* Premium section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>{t('upgrade.premiumSection')}</Text>
        <View style={styles.optionGroup}>
          {isPremium ? (
            <>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => router.push('/premium')}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionLabel, styles.premiumActiveLabel]}>
                  {premiumSource === 'voucher'
                    ? t('upgrade.premiumActiveVoucher')
                    : t('upgrade.premiumActive')}
                </Text>
                <Feather name="chevron-right" size={18} color="#16a34a" />
              </TouchableOpacity>
              {premiumSource === 'iap' && (
                <TouchableOpacity
                  style={[styles.optionRow, styles.optionRowBorder]}
                  onPress={handleRestorePurchases}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionLabel}>{t('upgrade.restorePurchase')}</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => router.push('/premium')}
                activeOpacity={0.7}
              >
                <Text style={styles.optionLabel}>{t('upgrade.plansTitle')}</Text>
                <Feather name="chevron-right" size={18} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionRow, styles.optionRowBorder]}
                onPress={handleGetPremium}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionLabel, styles.premiumCTALabel]}>{t('upgrade.getPremium')}</Text>
                <Feather name="chevron-right" size={18} color="#D97398" />
              </TouchableOpacity>
              <View style={[styles.optionRow, styles.optionRowBorder, styles.promoRow]}>
                <TextInput
                  style={styles.promoInput}
                  placeholder={t('upgrade.enterPromoCode')}
                  placeholderTextColor="#9ca3af"
                  value={promoCode}
                  onChangeText={(v) => { setPromoCode(v); setRedeemMessage(null) }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.redeemButton, !promoCode.trim() && styles.redeemButtonDisabled]}
                  onPress={handleRedeemCode}
                  disabled={!promoCode.trim()}
                >
                  <Text style={styles.redeemButtonText}>{t('upgrade.redeemCode')}</Text>
                </TouchableOpacity>
              </View>
              {redeemMessage && (
                <View style={styles.optionRow}>
                  <Text style={[
                    styles.redeemMessage,
                    redeemMessage === t('upgrade.codeRedeemed') && styles.redeemSuccess,
                  ]}>
                    {redeemMessage}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

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

      {/* Help section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>{t('settings.helpSection')}</Text>
        <View style={styles.optionGroup}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => router.push('/guide')}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Text style={styles.optionLabel}>{t('settings.helpGuide')}</Text>
            <Feather name="chevron-right" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>{t('settings.language')}</Text>
        <View style={styles.optionGroup}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setShowLanguagePicker(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Text style={styles.optionLabel}>{t('settings.language')}</Text>
            <View style={styles.optionRowRight}>
              <Text style={styles.optionValueText}>
                {LANGUAGES.find((l) => l.code === currentLanguage)
                  ? t(LANGUAGES.find((l) => l.code === currentLanguage)!.labelKey)
                  : currentLanguage}
              </Text>
              <Feather name="chevron-right" size={18} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* DEV: Entitlement debug */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DEV Tools</Text>
          <View style={styles.optionGroup}>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => useEntitlementStore.getState().setPremium('iap')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionLabel, { color: '#16a34a' }]}>Set Premium (IAP)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionRow, styles.optionRowBorder]}
              onPress={() => useEntitlementStore.getState().resetPremium()}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionLabel, { color: '#ef4444' }]}>Reset to Free</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionRow, styles.optionRowBorder]}
              onPress={() => {
                mmkv.remove(STORAGE_KEYS.ATT_REQUESTED)
                mmkv.set(STORAGE_KEYS.APP_LAUNCH_COUNT, 1)
                Alert.alert('ATT Reset', 'ATT flag cleared. Restart app to trigger dialog.')
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionLabel, { color: '#f59e0b' }]}>Reset ATT flag</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionRow, styles.optionRowBorder]}
              onPress={() => { preloadRewardedAd(); Alert.alert('Ad', 'Preloading rewarded ad...') }}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionLabel, { color: '#6b7280' }]}>Preload Rewarded Ad</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>

    {/* Language picker modal */}
    <Modal
      visible={showLanguagePicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLanguagePicker(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowLanguagePicker(false)}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.languageSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t('settings.language')}</Text>
            {LANGUAGES.map((lang, index) => {
              const isSelected = currentLanguage === lang.code
              const isLast = index === LANGUAGES.length - 1
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.sheetOptionRow, !isLast && styles.optionRowBorder]}
                  onPress={() => {
                    handleLanguageSelect(lang.code)
                    setShowLanguagePicker(false)
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                >
                  <Text style={[styles.sheetOptionLabel, isSelected && styles.optionLabelSelected]}>
                    {t(lang.labelKey)}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  optionLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  optionLabelSelected: {
    color: '#D97398',
    fontWeight: '600',
  },
  premiumActiveLabel: {
    color: '#16a34a',
    fontWeight: '600',
  },
  premiumCTALabel: {
    color: '#D97398',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#D97398',
    fontWeight: '700',
  },
  promoRow: {
    gap: 8,
  },
  promoInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 44,
  },
  redeemButton: {
    backgroundColor: '#D97398',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  redeemButtonDisabled: {
    opacity: 0.4,
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  redeemMessage: {
    fontSize: 14,
    color: '#ef4444',
  },
  redeemSuccess: {
    color: '#16a34a',
  },
  optionRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionValueText: {
    fontSize: 15,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  languageSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 16,
    minHeight: 52,
  },
  sheetOptionLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
})
