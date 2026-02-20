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

/** 將 ISO 日期字串格式化為繁體中文顯示格式（e.g., "2024年1月15日"） */
export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('zh-Hant-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/** 將 ISO 日期字串格式化為相對時間（e.g., "3 天前", "剛剛", "1 個月前"） */
export function formatRelativeDate(isoString: string): string {
  const now = Date.now()
  const past = new Date(isoString).getTime()
  const diffMs = now - past

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  if (hours < 24) return `${hours} 小時前`
  if (days < 30) return `${days} 天前`
  if (months < 12) return `${months} 個月前`
  return `${years} 年前`
}
