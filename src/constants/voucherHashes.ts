/**
 * SHA-256 hashes of valid voucher/promo codes.
 * Hash format: SHA-256 of code.trim().toUpperCase(), hex string.
 *
 * To add a new code:
 *   const hash = await Crypto.digestStringAsync(
 *     Crypto.CryptographicAlgorithm.SHA256,
 *     'YOUR_CODE'.trim().toUpperCase()
 *   )
 *   // Add the resulting hex string to the Set below.
 */
export const VALID_VOUCHER_HASHES: Set<string> = new Set([
  // Add hashes here, e.g.:
  // 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
])
