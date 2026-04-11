import { initConnection, endConnection, requestPurchase, fetchProducts, getAvailablePurchases, finishTransaction, purchaseUpdatedListener, purchaseErrorListener } from 'react-native-iap'
import type { Purchase } from 'react-native-iap'
import { useEntitlementStore } from '../stores/useEntitlementStore'
import { logIAPPurchaseCompleted } from './analyticsService'

const PREMIUM_SKU = 'com.stitchie.premium'
let iapConnected = false
let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener> | null = null
let purchaseErrorSub: ReturnType<typeof purchaseErrorListener> | null = null
let pendingResolve: ((result: 'purchased' | 'cancelled' | 'error') => void) | null = null

async function handlePurchase(purchase: Purchase): Promise<void> {
  if (purchase.productId !== PREMIUM_SKU) return
  try {
    await finishTransaction({ purchase, isConsumable: false })
  } catch {
    // finishTransaction can fail if already finished — still grant premium
  }
  useEntitlementStore.getState().setPremium('iap')
  logIAPPurchaseCompleted()
  pendingResolve?.('purchased')
  pendingResolve = null
}

export async function initializeIAP(): Promise<void> {
  try {
    await initConnection()
    iapConnected = true
    await fetchProducts({ skus: [PREMIUM_SKU] })

    // Register persistent listeners for the lifetime of the app.
    // This also handles transactions that were interrupted in a previous session.
    purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
      await handlePurchase(purchase)
    })
    purchaseErrorSub = purchaseErrorListener((error: any) => {
      if (error?.code === 'E_USER_CANCELLED') {
        pendingResolve?.('cancelled')
      } else {
        pendingResolve?.('error')
      }
      pendingResolve = null
    })
  } catch (e) {
    console.warn('[IAP] initializeIAP failed:', e)
  }
}

export async function purchasePremium(): Promise<'purchased' | 'cancelled' | 'error'> {
  if (!iapConnected) return 'error'

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pendingResolve = null
      resolve('error')
    }, 30000)

    pendingResolve = (result) => {
      clearTimeout(timer)
      resolve(result)
    }

    requestPurchase({ request: { apple: { sku: PREMIUM_SKU } }, type: 'in-app' })
      .catch((e: any) => {
        clearTimeout(timer)
        pendingResolve = null
        if (e?.code === 'E_USER_CANCELLED') resolve('cancelled')
        else resolve('error')
      })
  })
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
  purchaseUpdateSub?.remove()
  purchaseErrorSub?.remove()
  purchaseUpdateSub = null
  purchaseErrorSub = null
  pendingResolve = null
  try {
    await endConnection()
  } catch {
    // ignore
  }
}
