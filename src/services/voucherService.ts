import { sha256 } from 'js-sha256'
import { VALID_VOUCHER_HASHES } from '../constants/voucherHashes'
import { useEntitlementStore } from '../stores/useEntitlementStore'

export function redeemVoucher(code: string): boolean {
  const hash = sha256(code.trim().toUpperCase())
  if (!VALID_VOUCHER_HASHES.has(hash)) return false
  useEntitlementStore.getState().setPremium('voucher', code.trim().toUpperCase())
  return true
}
