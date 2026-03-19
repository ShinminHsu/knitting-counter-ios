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
  } catch (e) {
    console.warn('[IAP] initializeIAP failed:', e)
  }
}

export async function purchasePremium(): Promise<'purchased' | 'cancelled' | 'error'> {
  if (!iapConnected) return 'error:not-connected' as any

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      updateSub.remove()
      errorSub.remove()
      resolve('error:timeout' as any)
    }, 12000)

    const updateSub = purchaseUpdatedListener(async (purchase) => {
      clearTimeout(timer)
      updateSub.remove()
      errorSub.remove()
      await handlePurchase(purchase)
      resolve('purchased')
    })

    const errorSub = purchaseErrorListener((error: any) => {
      clearTimeout(timer)
      updateSub.remove()
      errorSub.remove()
      if (error?.code === 'E_USER_CANCELLED') resolve('cancelled')
      else resolve(`error:${error?.code ?? 'unknown'}` as any)
    })

    requestPurchase({ request: { apple: { sku: PREMIUM_SKU } }, type: 'in-app' })
      .catch((e: any) => {
        clearTimeout(timer)
        updateSub.remove()
        errorSub.remove()
        if (e?.code === 'E_USER_CANCELLED') resolve('cancelled')
        else resolve(`error:${e?.code ?? 'unknown'}:${e?.message ?? ''}` as any)
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
  try {
    await endConnection()
  } catch {
    // ignore
  }
}
