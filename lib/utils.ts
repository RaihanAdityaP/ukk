// crypto.randomUUID() cuma jalan di "secure context" (HTTPS atau localhost).
// Kalau diakses lewat IP address / HTTP biasa (misal buka dari HP di jaringan lokal),
// function itu gak tersedia. Ini fallback yang selalu jalan di kondisi apapun.
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
