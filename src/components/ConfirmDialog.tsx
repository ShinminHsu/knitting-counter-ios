import { Alert } from 'react-native'

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
  confirmLabel = '確定',
  destructive = false,
}: ConfirmDialogOptions): void {
  Alert.alert(title, message, [
    {
      text: '取消',
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: confirmLabel,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ])
}
