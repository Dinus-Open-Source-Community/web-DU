/**
 * Tripay `merchant_ref` di environment ini memakai prefix enrollment UID (8 hex).
 * Contoh: enrollment `a4ab44ee-....` → merchant_ref `a4ab44ee`
 */
export function toTripayMerchantRef(enrollmentUid: string): string {
  const hex = enrollmentUid.replace(/-/g, '').toLowerCase()
  return hex.slice(0, 8)
}
