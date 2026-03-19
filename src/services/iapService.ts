import { initConnection, endConnection, requestPurchase, fetchProducts, getAvailablePurchases, finishTransaction, purchaseUpdatedListener, purchaseErrorListener } from 'react-native-iap'
import type { Purchase } from 'react-native-iap'
import { useEntitlementStore } from '../stores/useEntitlementStore'
import { logIAPPurchaseCompleted } from './analyticsService'

const PREMIUM_SKU = 'com.stitchie.premium'
let iapConnected = false

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
    const connected = await initConnection()
    if (!connected) return

    iapConnected = true
    await fetchProducts({ skus: [PREMIUM_SKU] })

    purchaseUpdatedListener(async (purchase) => {
      await handlePurchase(purchase)
    })

    purchaseErrorListener((error) => {
      console.warn('[IAP] purchase error:', error.code, error.message)
    })
  } catch (e) {
    console.warn('[IAP] initializeIAP failed:', e)
  }
}

export async function purchasePremium(): Promise<'purchased' | 'cancelled' | 'error'> {
  if (!iapConnected) return 'error:not-connected' as any

  const timeout = new Promise<'error:timeout'>((resolve) =>
    setTimeout(() => resolve('error:timeout'), 12000)
  )
  const purchase = (async () => {
    try {
      const result = await requestPurchase({ request: { apple: { sku: PREMIUM_SKU } }, type: 'in-app' })
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
  iapConnected = false
  try {
    await endConnection()
  } catch {
    // ignore
  }
}
