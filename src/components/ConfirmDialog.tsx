import { Alert } from 'react-native'
import i18n from '../i18n'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConfirmDialogOptions {
  title: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
  confirmLabel?: string
  destructive?: boolean
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Shows a native confirm dialog using Alert.alert.
 * Call this function imperatively where you need a confirmation.
 */
export function showConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  destructive = false,
}: ConfirmDialogOptions): void {
  // 在呼叫當下才解析，使用者中途切換語言也能正確顯示
  Alert.alert(title, message, [
    {
      text: i18n.t('common.cancel'),
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: confirmLabel ?? i18n.t('common.confirm'),
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ])
}
