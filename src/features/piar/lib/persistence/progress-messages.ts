/**
 * Every failure mode `ProgressStore.save` can return. The string codes
 * are stable — log them, switch on them, and translate them via
 * `buildProgressStorageMessage`. Do not parse the message string.
 */
export type ProgressStoreSaveErrorCode =
  | 'storage_unavailable'
  | 'quota_exceeded'
  | 'serialization_failed'
  | 'private_browsing'
  | 'crypto_unavailable'
  | 'key_unavailable'
  | 'encryption_failed';

/**
 * Every failure mode `ProgressStore.loadWithStatus` can return.
 * `not_found` is the normal "first visit" case and should usually be
 * treated as success-with-no-data, not as an error to surface.
 */
export type ProgressStoreLoadErrorCode =
  | 'private_browsing'
  | 'storage_unavailable'
  | 'not_found'
  | 'parse_failed'
  | 'validation_failed'
  | 'unsupported_version'
  | 'unencrypted_data'
  | 'crypto_unavailable'
  | 'key_unavailable'
  | 'decryption_failed';

/**
 * Union of every code that `buildProgressStorageMessage` can translate.
 * Every member of both save and load unions has a Spanish message here,
 * so callers surface `result.message` directly — no branching needed.
 */
export type ProgressStoreMessageCode =
  | ProgressStoreSaveErrorCode
  | ProgressStoreLoadErrorCode;

export function buildProgressStorageMessage(code: ProgressStoreMessageCode): string {
  switch (code) {
    case 'quota_exceeded':
      return 'No se pudo guardar el progreso porque el almacenamiento local esta lleno.';
    case 'serialization_failed':
      return 'No se pudo preparar el progreso para guardarlo.';
    case 'private_browsing':
      return 'El almacenamiento local esta bloqueado por este navegador o por el modo privado.';
    case 'crypto_unavailable':
      return 'No se pudo cifrar el progreso porque Web Crypto no esta disponible en este navegador.';
    case 'key_unavailable':
      return 'No se pudo acceder a la llave local de cifrado en este navegador.';
    case 'encryption_failed':
      return 'No se pudo cifrar el progreso para guardarlo.';
    case 'decryption_failed':
      return 'No se pudo descifrar el progreso guardado en este navegador.';
    case 'unencrypted_data':
      return 'El progreso guardado no esta cifrado y no se cargara.';
    case 'parse_failed':
      return 'No se pudo leer el progreso guardado porque esta corrupto.';
    case 'validation_failed':
      return 'El progreso guardado no coincide con el formato esperado.';
    case 'unsupported_version':
      return 'El progreso guardado usa una version incompatible de la aplicacion.';
    case 'storage_unavailable':
      return 'El almacenamiento local no esta disponible en este navegador.';
    case 'not_found':
      return 'No se encontro progreso guardado.';
    default:
      return 'No se pudo completar la operacion de almacenamiento local.';
  }
}
