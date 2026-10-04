import i18n from '../i18n'

// ─── ID Generation ─────────────────────────────────────────────────────────────

/** 產生簡易唯一 ID（無需額外 package） */
export function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
}

// ─── Date Utilities ─────────────────────────────────────────────────────────────

/** 回傳目前時間的 ISO 8601 字串 */
export function nowISO(): string {
  return new Date().toISOString()
}

/** 將 ISO 日期字串格式化為目前語言的長日期（e.g., "2024年1月15日" / "January 15, 2024"） */
export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  // 在呼叫當下才讀語言，使用者中途切換語言也能正確顯示
  return new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
