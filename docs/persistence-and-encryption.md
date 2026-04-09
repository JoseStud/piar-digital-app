# Persistence and Encryption

PIAR draft progress stays in the browser. The primary save slot is encrypted localStorage; a short-lived unload-recovery slot keeps the freshest draft available if the page closes before the encrypted write finishes.

## Draft Storage

- `piar-form-progress` stores the encrypted envelope written by `ProgressStore.save`.
- `piar-form-progress-unload-recovery` stores a synchronous plaintext recovery envelope written on `pagehide` and `visibilitychange -> hidden`.
- `ProgressStore.loadWithStatus()` checks the recovery slot first, then falls back to the encrypted slot.

Both slots exist because Web Crypto and IndexedDB cannot be awaited reliably during unload. The recovery copy is intentionally plaintext and is cleared once the next encrypted save catches up.

## Envelope Chain

- `buildPIARDataEnvelope()` wraps form state as `{ v: 2, data }`.
- `buildSerializedPIARProgress()` stringifies that envelope before persistence.
- `encryptSerializedProgress()` wraps the serialized JSON in `{ storageVersion, kind, alg, keyId, iv, ciphertext }`.
- The crypto key is a 256-bit AES-GCM device key generated once per browser profile, stored in IndexedDB database `piar-digital-progress-keys`, and marked `extractable: false`.
- The IV is 12 random bytes per save and is never reused.

`iv` and `ciphertext` are base64-encoded before the envelope is written to storage.

## Load Validation

- `ProgressStore.loadWithStatus()` returns typed result codes rather than throwing for normal failures.
- The recovery slot is validated with `isUnloadRecoveryEnvelope()`, then its embedded JSON is parsed and normalized.
- The encrypted slot must match the exact storage version, kind, algorithm, and key id expected by `isEncryptedProgressEnvelope()`.
- Unknown or pre-encryption content in the encrypted slot surfaces as `validation_failed` or `unencrypted_data`; there is no silent migration path.
- Decrypted payloads are validated by `parsePIARData()`, which uses the canonical schema tree in `src/features/piar/model/piar-schema.ts` and fills missing values from `createEmptyPIARFormDataV2()`.
- `parsePIARData()` is the shared normalizer for local storage, PDF import, and DOCX import. It returns repair warnings for missing or invalid fields and `unsupported_version` for future payloads.

## `keyId` Versioning

The current key id is `piar-progress-device-key-v1`. Future rotations should bump the suffix and keep readers cooperative across versions.

## Race Handling

Two tabs can race on first load. `addStoredKey` treats `ConstraintError` as a benign race, then re-reads the winning key. The in-memory promise cache is cleared on failure so transient IndexedDB errors do not get memoized.

## Threat Model

Protected against:

- casual reads of localStorage by other extensions
- other OS users on the same machine inspecting localStorage files

Not protected against:

- malicious code running in the same origin
- an attacker with full filesystem access to the user's IndexedDB
- browser compromise
- social engineering

## Pre-encryption Drafts

Plain envelopes from before encryption landed are not silently migrated. The load path returns `unencrypted_data`, and the UI surfaces a Spanish error so the user can export a backup before clearing storage.

This is intentional: silently re-saving an unencrypted historical draft would hide that the stored recovery state changed format and could make troubleshooting harder.

## Error Codes

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
