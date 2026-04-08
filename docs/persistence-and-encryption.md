# Persistence and Encryption

PIAR draft progress stays in the browser. The primary save slot is encrypted localStorage; a short-lived unload recovery slot keeps the freshest draft available if the page is closed before the encrypted write finishes.

## Two-tier storage

- `piar-form-progress` stores the encrypted draft envelope written by `ProgressStore.save` and read by `loadWithStatus`.
- `piar-form-progress-unload-recovery` stores an unencrypted recovery copy written synchronously during `pagehide`, then cleared after the encrypted save catches up.

Both slots exist because Web Crypto and IndexedDB cannot be awaited reliably during unload. The load path checks unload recovery first so the newest draft wins.

## Encryption design

- Algorithm: `AES-256-GCM`
- Key: 256-bit, generated once per browser profile and stored in IndexedDB database `piar-digital-progress-keys`
- `extractable: false`, so the raw key cannot be exported
- IV: 12 random bytes per save, never reused
- Envelope shape: `{ storageVersion, kind, alg, keyId, iv, ciphertext }`

`iv` and `ciphertext` are base64-encoded before the envelope is written to storage.

## `keyId` versioning

The current key id is `piar-progress-device-key-v1`. Future rotations should bump the suffix and keep readers cooperative across versions.

## Race handling

Two tabs can race on first load. `addStoredKey` treats `ConstraintError` as a benign race, then re-reads the winning key. The in-memory promise cache is cleared on failure so transient IndexedDB errors do not get memoized.

## Threat model

Protected against:

- casual reads of localStorage by other extensions
- other OS users on the same machine inspecting localStorage files

Not protected against:

- malicious code running in the same origin
- an attacker with full filesystem access to the user's IndexedDB
- browser compromise
- social engineering

## Pre-encryption drafts

Plain envelopes from before encryption landed are not silently migrated. The load path returns `unencrypted_data`, and the UI surfaces a Spanish error so the user can export a backup before clearing storage.

This is intentional: silently re-saving an unencrypted historical draft would hide that the user's stored recovery state changed format and could make troubleshooting harder.

## Error codes

| Code | Where it surfaces | Spanish message |
|---|---|---|
| `quota_exceeded` | save | `No se pudo guardar el progreso porque el almacenamiento local esta lleno.` |
| `serialization_failed` | save | `No se pudo preparar el progreso para guardarlo.` |
| `private_browsing` | save/load | `El almacenamiento local esta bloqueado por este navegador o por el modo privado.` |
| `crypto_unavailable` | save/load | `No se pudo cifrar el progreso porque Web Crypto no esta disponible en este navegador.` |
| `key_unavailable` | save/load | `No se pudo acceder a la llave local de cifrado en este navegador.` |
| `encryption_failed` | save | `No se pudo cifrar el progreso para guardarlo.` |
| `decryption_failed` | load | `No se pudo descifrar el progreso guardado en este navegador.` |
| `unencrypted_data` | load | `El progreso guardado no esta cifrado y no se cargara.` |
| `parse_failed` | load | `No se pudo leer el progreso guardado porque esta corrupto.` |
| `validation_failed` | load | `El progreso guardado no coincide con el formato esperado.` |
| `unsupported_version` | load | `El progreso guardado usa una version incompatible de la aplicacion.` |
| `storage_unavailable` | save/load | `El almacenamiento local no esta disponible en este navegador.` |
| `not_found` | load | `No se encontro progreso guardado.` |
