import { initConnection, endConnection, requestPurchase, fetchProducts, getAvailablePurchases, finishTransaction, purchaseUpdatedListener } from 'react-native-iap'
import { useEntitlementStore } from '../stores/useEntitlementStore'
import { logIAPPurchaseCompleted } from './analyticsService'

const PREMIUM_SKU = 'com.stitchie.premium'

export async function initializeIAP(): Promise<void> {
  try {
    await initConnection()
    // Pre-fetch product so StoreKit has it ready before purchase
    await fetchProducts({ skus: [PREMIUM_SKU] })
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
  const timeout = new Promise<'error:timeout'>((resolve) =>
    setTimeout(() => resolve('error:timeout'), 12000)
  )
  const purchase = requestPurchase({ request: { apple: { sku: PREMIUM_SKU } }, type: 'in-app' })
    .then(() => 'purchased' as const)
    .catch((e: any) => {
      if (e?.code === 'E_USER_CANCELLED') return 'cancelled' as const
      return `error:${e?.code ?? 'unknown'}:${e?.message ?? ''}` as any
    })
  return Promise.race([purchase, timeout])
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
