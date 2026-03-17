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
  'e90c78d27e0acc95cc3fe8ac7bc07f1d25de4eaae6f759bd8de7eafa0884cd29', // STITCHIE-BETA1
  'd70107375afbd5ffb3e2849321f65592a51d03edca2a2a9082a6dc2e80144680', // STITCHIE-BETA2
  '975290d2821ba693bfd55f7f052bec35ea8725634d6083c6680f4cac25e065f4', // STITCHIE-BETA3
  'fa22682da633d92ad72eed31f0323c29fcfa8a4cdf781fef397da3e01a3c6e46', // STITCHIE-FRIEND1
  '4038004adabef75a0a524f045814dadd15a3ae9c9fe68714c50903eeaa74d458', // STITCHIE-FRIEND2
])
