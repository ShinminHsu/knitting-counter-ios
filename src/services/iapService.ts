import { initConnection, endConnection, requestPurchase, fetchProducts, getAvailablePurchases, finishTransaction, purchaseUpdatedListener } from 'react-native-iap'
import type { Purchase } from 'react-native-iap'
import { useEntitlementStore } from '../stores/useEntitlementStore'
import { logIAPPurchaseCompleted } from './analyticsService'

const PREMIUM_SKU = 'com.stitchie.premium'

async function handlePurchase(purchase: Purchase): Promise<void> {
  if (purchase.productId !== PREMIUM_SKU) return
  try {
    await finishTransaction({ purchase, isConsumable: false })
  } catch {
    // finishTransaction can fail if already finished — still grant premium
  }
  useEntitlementStore.getState().setPremium('iap')
  logIAPPurchaseCompleted()
}

export async function initializeIAP(): Promise<void> {
  try {
    await initConnection()
    await fetchProducts({ skus: [PREMIUM_SKU] })
    // Handle purchases initiated outside the app (e.g. App Store promotion)
    purchaseUpdatedListener(async (purchase) => {
      await handlePurchase(purchase)
    })
  } catch {
    // IAP unavailable (simulator, no network) — silently ignore
  }
}

export async function purchasePremium(): Promise<'purchased' | 'cancelled' | 'error'> {
  const timeout = new Promise<'error:timeout'>((resolve) =>
    setTimeout(() => resolve('error:timeout'), 12000)
  )
  const purchase = (async () => {
    try {
      const result = await requestPurchase({ request: { apple: { sku: PREMIUM_SKU } }, type: 'in-app' })
      // v12 returns the purchase object directly — use it to grant premium
      if (result) {
        const p = Array.isArray(result) ? result[0] : result
        if (p) await handlePurchase(p)
      }
      return 'purchased' as const
    } catch (e: any) {
      if (e?.code === 'E_USER_CANCELLED') return 'cancelled' as const
      return `error:${e?.code ?? 'unknown'}:${e?.message ?? ''}` as any
    }
  })()
  return Promise.race([purchase, timeout])
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases()
    for (const p of purchases) {
      await handlePurchase(p)
    }
    return purchases.some((p) => p.productId === PREMIUM_SKU)
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
