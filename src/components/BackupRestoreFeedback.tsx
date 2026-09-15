import { ActivityIndicator, Alert, Modal, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import type { RestoreOutcome } from '../services/icloudBackupService'

/** 備份時間顯示（依目前語系） */
export function formatBackupDate(iso: string): string {
  return new Date(iso).toLocaleString(i18n.language)
}

/** 顯示 iCloud 還原結果 */
export function showRestoreOutcomeAlert(outcome: RestoreOutcome): void {
  const t = i18n.t.bind(i18n)
  switch (outcome.status) {
    case 'restored':
      Alert.alert(
        t('backup.restoreDoneTitle'),
        outcome.failed > 0
          ? t('backup.restoreDoneWithFailures', { restored: outcome.restored, failed: outcome.failed })
          : t('backup.restoreDoneMessage', { restored: outcome.restored })
      )
      return
    case 'noBackup':
      Alert.alert(t('backup.restoreConfirmTitle'), t('backup.restoreNothing'))
      return
    case 'unsupportedVersion':
      Alert.alert(t('backup.restoreConfirmTitle'), t('backup.restoreUnsupported'))
      return
    case 'unavailable':
      Alert.alert(t('backup.sectionTitle'), t('backup.unavailable'))
      return
    case 'error':
      Alert.alert(t('common.error'), t('backup.restoreFailed'))
  }
}

/** 還原進行中的全螢幕遮罩 */
export function RestoringOverlay({ visible }: { visible: boolean }) {
  const { t } = useTranslation()
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#D97398" />
          <Text style={styles.text}>{t('backup.restoring')}</Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 12,
  },
  text: {
    fontSize: 15,
    color: '#1f2937',
  },
})
