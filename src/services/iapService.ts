import { initConnection, endConnection, requestPurchase, getAvailablePurchases, finishTransaction, purchaseUpdatedListener } from 'react-native-iap'
import { useEntitlementStore } from '../stores/useEntitlementStore'
import { logIAPPurchaseCompleted } from './analyticsService'

const PREMIUM_SKU = 'com.stitchie.premium'

export async function initializeIAP(): Promise<void> {
  try {
    await initConnection()
    purchaseUpdatedListener(async (purchase) => {
      if (purchase.productId === PREMIUM_SKU) {
        await finishTransaction({ purchase, isConsumable: false })
        useEntitlementStore.getState().setPremium('iap')
        logIAPPurchaseCompleted()
      }
    })
  } catch {
    // IAP unavailable (simulator, no network) — silently ignore
  }
}

export async function purchasePremium(): Promise<'purchased' | 'cancelled' | 'error'> {
  try {
    await requestPurchase({ request: { apple: { sku: PREMIUM_SKU } }, type: 'in-app' })
    return 'purchased'
  } catch (e: any) {
    if (e?.code === 'E_USER_CANCELLED') return 'cancelled'
    return 'error'
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases()
    const hasPremium = purchases.some((p) => p.productId === PREMIUM_SKU)
    if (hasPremium) {
      useEntitlementStore.getState().setPremium('iap')
    }
    return hasPremium
  } catch {
    return false
  }
}

export async function cleanupIAP(): Promise<void> {
  try {
    await endConnection()
  } catch {
    // ignore
  }
}
