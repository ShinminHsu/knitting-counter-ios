export const ANALYTICS_EVENTS = {
  SCREEN_VIEW: 'screen_view',
  PROJECT_CREATED: 'project_created',
  TRACKING_STARTED: 'tracking_started',
  CHART_COMPLETED: 'chart_completed',
  ADD_ROUND: 'add_round',
  ADD_STITCH: 'add_stitch',
  USE_TEMPLATE: 'use_template',
  IMPORT_PROJECT: 'import_project',
  EXPORT_PROJECT: 'export_project',
  REWARDED_AD_WATCHED: 'rewarded_ad_watched',
  REWARDED_AD_DECLINED: 'rewarded_ad_declined',
  INTERSTITIAL_SHOWN: 'interstitial_shown',
  IAP_PURCHASE_COMPLETED: 'iap_purchase_completed',
} as const

export const SCREEN_NAMES = {
  PROJECT_LIST: 'ProjectList',
  PROJECT_DETAIL: 'ProjectDetail',
  PATTERN_EDITOR: 'PatternEditor',
  ROUND_EDITOR: 'RoundEditor',
  PROGRESS_TRACKING: 'ProgressTracking',
  IMPORT_EXPORT: 'ImportExport',
  PATTERN_ELEMENTS: 'PatternElements',
  GUIDE: 'Guide',
  SETTINGS: 'Settings',
} as const

export const REWARD_TYPES = {
  PROJECT_SLOT:            'project_slot',
  PHOTO_SLOT:              'photo_slot',
  STITCH_CATEGORY_INC:     'stitch_category_inc',
  STITCH_CATEGORY_DEC:     'stitch_category_dec',
  STITCH_CATEGORY_SPECIAL: 'stitch_category_special',
} as const

export type RewardType = typeof REWARD_TYPES[keyof typeof REWARD_TYPES]
