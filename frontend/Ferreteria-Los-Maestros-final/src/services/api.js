// Token JWT de la sesión (lo emite el micro de usuarios al iniciar sesión).
import { load } from '../utils.js'

export const TOKEN_KEY = 'flm_token'
export const TOKEN_EXPIRA_KEY = 'flm_token_expira'

// Header "Authorization: Bearer <token>" para las peticiones que requieren sesión
// (crear/editar/borrar productos, comprar, administrar usuarios). Sin sesión, no agrega nada.
export function authHeaders() {
  const token = load(TOKEN_KEY, null)
  return token ? { Authorization: `Bearer ${token}` } : {}
}
