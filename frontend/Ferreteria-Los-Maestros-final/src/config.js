// URL base del backend (API Gateway).
// Vite la toma de VITE_API_URL:
//   npm run dev    -> .env.development  (http://localhost:8080)
//   npm run build  -> .env.production   (IP o dominio de la EC2 en AWS)
// Si no está definida (por ejemplo en las pruebas con Karma), usa localhost.
export const API_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')
