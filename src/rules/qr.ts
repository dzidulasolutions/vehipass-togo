/**
 * SIGNATURE SIMULÉE : un simple checksum dont le secret est visible dans le code du navigateur.
 * Il montre le principe (rejeter un QR fabriqué) mais ne protège rien.
 * Le vrai système signerait en Ed25519, clé privée côté serveur uniquement.
 */
const DEMO_SECRET = 'vehipass-demo-secret-NON-SECURISE'

const HEX_ID = /^[0-9a-f]{10,}$/
const HEX_SIGNATURE = /^[0-9a-f]{8}$/

/** Empreinte rapide de 64 bits (cyrb53), suffisante pour une démo. */
function checksum(text: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ code, 2654435761)
    h2 = Math.imul(h2 ^ code, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')
}

export function signPublicId(publicId: string): string {
  return checksum(publicId + DEMO_SECRET).slice(0, 8)
}

/** Jeton contenu dans le QR : identifiant public + signature. Aucune donnée personnelle. */
export function buildQrToken(publicId: string): string {
  return `${publicId}.${signPublicId(publicId)}`
}

/** Adresse encodée dans le QR : https://<domaine>/v/<jeton>. */
export function buildQrUrl(baseUrl: string, publicId: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/v/${buildQrToken(publicId)}`
}

export type ParsedQr = { publicId: string; signatureValid: boolean }

/**
 * Lit ce que la caméra a scanné : une adresse complète ou le jeton seul.
 * Retourne null si le format est illisible ; signatureValid indique si la signature correspond.
 */
export function parseQrToken(scanned: string): ParsedQr | null {
  const text = scanned.trim()
  const marker = '/v/'
  const at = text.lastIndexOf(marker)
  const token = (at >= 0 ? text.slice(at + marker.length) : text).split(/[?#]/)[0] ?? ''

  const [publicId, signature, ...extra] = token.split('.')
  if (!publicId || !signature || extra.length > 0) return null
  if (!HEX_ID.test(publicId) || !HEX_SIGNATURE.test(signature)) return null

  return { publicId, signatureValid: signature === signPublicId(publicId) }
}