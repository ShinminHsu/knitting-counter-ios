// AdMob unit IDs
// Use Google's official test IDs in dev to avoid policy violations
const TEST_IDS = {
  BANNER: 'ca-app-pub-3940256099942544/2934735716',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/4411468910',
  REWARDED: 'ca-app-pub-3940256099942544/1712485313',
}

const PROD_IDS = {
  BANNER: 'ca-app-pub-8349726503229968/2275387779',
  INTERSTITIAL: 'ca-app-pub-8349726503229968/5794028639',
  REWARDED: 'ca-app-pub-8349726503229968/1317529327',
}

const useTestAds = __DEV__ || process.env.EXPO_PUBLIC_USE_TEST_ADS === 'true'
export const AD_UNIT_IDS = useTestAds ? TEST_IDS : PROD_IDS
