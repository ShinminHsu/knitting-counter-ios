import * as Crypto from 'expo-crypto'
import { VALID_VOUCHER_HASHES } from '../constants/voucherHashes'
import { useEntitlementStore } from '../stores/useEntitlementStore'

export async function redeemVoucher(code: string): Promise<boolean> {
  try {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptographicAlgorithm.SHA256,
      code.trim().toUpperCase()
    )
    if (!VALID_VOUCHER_HASHES.has(hash)) return false
    useEntitlementStore.getState().setPremium('voucher', code.trim().toUpperCase())
    return true
  } catch {
    return false
  }
}
