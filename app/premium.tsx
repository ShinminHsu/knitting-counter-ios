import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
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
import { purchasePremium, restorePurchases } from '../src/services'
import { SCREEN_NAMES } from '../src/constants'
import ScreenHeader from '../src/components/ScreenHeader'
import { useEntitlementStore } from '../src/stores'

// ─── Data ─────────────────────────────────────────────────────────────────────

type CellValue = 'check' | 'cross' | 'ad' | string

interface PlanRow {
  labelKey: string
  free: CellValue
  premium: CellValue
}

// ─── PremiumPlansScreen ────────────────────────────────────────────────────────

export default function PremiumPlansScreen() {
  const { t } = useTranslation()
  const [purchasing, setPurchasing] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const isPremium = useEntitlementStore((s) => s.isPremium)
  const premiumSource = useEntitlementStore((s) => s.premiumSource)

  useEffect(() => {
    logScreenView(SCREEN_NAMES.PREMIUM_PLANS)
  }, [])

  const rows: PlanRow[] = [
    { labelKey: 'upgrade.rowProjects',        free: t('upgrade.rowProjectsFree'),        premium: t('upgrade.rowProjectsPremium') },
    { labelKey: 'upgrade.rowPhotos',           free: t('upgrade.rowPhotosFree'),           premium: t('upgrade.rowPhotosPremium') },
    { labelKey: 'upgrade.rowStitchCategories', free: t('upgrade.rowStitchCategoriesFree'), premium: t('upgrade.rowStitchCategoriesPremium') },
    { labelKey: 'upgrade.rowCustomStitch',     free: 'cross',                              premium: 'check' },
    { labelKey: 'upgrade.rowTemplate',         free: 'ad',                                 premium: 'check' },
    { labelKey: 'upgrade.rowExport',           free: 'cross',                              premium: 'check' },
  ]

  async function handleGetPremium() {
    setPurchasing(true)
    await purchasePremium()
    setPurchasing(false)
  }

  async function handleRestore() {
    setRestoring(true)
    await restorePurchases()
    setRestoring(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('upgrade.plansTitle')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.tagline}>{t('upgrade.plansTagline')}</Text>

        {/* Comparison table */}
        <View style={styles.table}>
          {/* Column headers */}
          <View style={[styles.row, styles.headerRow]}>
            <View style={styles.labelCell} />
            <View style={styles.planCell}>
              <Text style={styles.planHeaderFree}>{t('upgrade.plansFree')}</Text>
            </View>
            <View style={styles.planCell}>
              <Text style={styles.planHeaderPremium}>{t('upgrade.plansPremium')}</Text>
            </View>
          </View>

          {/* Feature rows */}
          {rows.map((row, i) => (
            <View key={row.labelKey} style={[styles.row, i % 2 === 0 && styles.rowShaded]}>
              <View style={styles.labelCell}>
                <Text style={styles.rowLabel}>{t(row.labelKey as any)}</Text>
              </View>
              <View style={styles.planCell}>
                <CellContent value={row.free} />
              </View>
              <View style={styles.planCell}>
                <CellContent value={row.premium} />
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        {isPremium ? (
          <View style={styles.premiumActiveBox}>
            <Feather name="check-circle" size={20} color="#16a34a" />
            <Text style={styles.premiumActiveText}>
              {premiumSource === 'voucher'
                ? t('upgrade.premiumActiveVoucher')
                : t('upgrade.premiumActive')}
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.buyButton, purchasing && styles.buttonDisabled]}
              onPress={handleGetPremium}
              disabled={purchasing}
            >
              {purchasing
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buyButtonText}>{t('upgrade.getPremium')}</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.restoreButton, restoring && styles.buttonDisabled]}
              onPress={handleRestore}
              disabled={restoring}
            >
              {restoring
                ? <ActivityIndicator color="#9ca3af" size="small" />
                : <Text style={styles.restoreText}>{t('upgrade.restorePurchase')}</Text>
              }
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── CellContent ──────────────────────────────────────────────────────────────

function CellContent({ value }: { value: CellValue }) {
  const { t } = useTranslation()
  if (value === 'check') {
    return <Feather name="check" size={18} color="#16a34a" />
  }
  if (value === 'cross') {
    return <Feather name="x" size={18} color="#d1d5db" />
  }
  if (value === 'ad') {
    return (
      <View style={styles.adBadge}>
        <Text style={styles.adBadgeText}>{t('upgrade.adUnlockable')}</Text>
      </View>
    )
  }
  return <Text style={styles.cellText}>{value}</Text>
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5f0',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
    gap: 20,
  },
  tagline: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  // Table
  table: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerRow: {
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: 10,
  },
  rowShaded: {
    backgroundColor: '#fafafa',
  },
  labelCell: {
    flex: 2,
    paddingHorizontal: 14,
  },
  planCell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  planHeaderFree: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  planHeaderPremium: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C4527F',
  },
  rowLabel: {
    fontSize: 14,
    color: '#374151',
  },
  cellText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  adBadge: {
    backgroundColor: '#fce7f0',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adBadgeText: {
    fontSize: 11,
    color: '#C4527F',
    fontWeight: '500',
  },

  // CTA
  buyButton: {
    backgroundColor: '#D97398',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  restoreText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  premiumActiveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  premiumActiveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16a34a',
  },
})
