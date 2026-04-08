# Data Model

`src/features/piar/model/piar.ts` is the canonical source of truth for `PIARFormDataV2`. Every persistence path, importer, exporter, and form section reads and writes that shape.

## Versioning Contract

- `PIAR_DATA_VERSION = 2`.
- The storage and export envelope is `{ v, data }`. Importers reject `v !== 2` with `unsupported_version`.
- Additive changes do not require a version bump, but the new field must be:
  - defaulted in `createEmptyPIARFormDataV2`,
  - declared in `DOCX_FIELD_DEFINITIONS` so `parsePIARData`'s schema tree recognizes it (otherwise it is silently dropped as `unknown_key` on every import), and
  - handled by `deepMergeWithDefaultsV2` if its top-level section needs custom merge behavior beyond a shallow shape match.
- Breaking changes require a new version, a migration path, and updated import/export logic.
- V1 support has been removed. Legacy-shaped payloads are detected by `looksLikeLegacyPayload` in `lib/portable/piar-import.ts` and rejected with `unsupported_version`.

## Root Shape

- `_version` - the embedded model version.
- `header` - top-of-form metadata such as date, place, person filling out the form, role, institution, campus, and schedule.
- `student` - identity, demographics, condition flags, and narrative descriptions.
- `entornoSalud` - health context, fixed-length support rows, and assistive technology selections.
- `entornoHogar` - home context, caregivers, and household composition.
- `entornoEducativo` - previous schooling, pedagogical reports, and complementary programs.
- `valoracionPedagogica` - five assessment aspects with item responses, support intensity, and observations.
- `competenciasDispositivos` - eight checklist groups for literacy, math, memory, attention, perception, executive function, and language.
- `descripcionHabilidades` - free-text description of strengths and skills.
- `estrategiasAcciones` - free-text strategies and actions.
- `fechaProximaRevision` - the next review date.
- `ajustes` - the fixed tuple of five reasonable-adjustment rows.
- `firmas` - the signature block, including the nine-docente fixed tuple.
- `acta` - the final agreement minutes, with fixed activity rows and signatures.

## Boolean Tri-State

- `null` means `sin respuesta`.
- `true` means `Sí`.
- `false` means `No`.
- Tri-state booleans are used throughout the form. Helpers live in `src/features/piar/lib/forms/boolSelect.ts`.

Never coerce `null` to `false`; unanswered is a distinct state in the printed PIAR workflow.

## Fixed-Length Tuples

- `ajustes` has 5 rows.
- `firmas.docentes` has 9 entries.
- `acta.actividades` has 5 rows.
- The `entornoSalud` row groups use fixed tuples as well.
- The printed PIAR template has a fixed number of slots, so tuple fields must be updated by replacing the full tuple, not by pushing or splicing.

## Adding A Field

1. Update `src/features/piar/model/piar.ts` (type and `createEmptyPIARFormDataV2` default).
2. Add a definition for the field in `src/features/piar/lib/docx/docx-field-manifest/definitions.ts`. This is what `parsePIARData` walks at import time; without an entry the field is flagged as `unknown_key` and the imported value is dropped.
3. Handle the field in `src/features/piar/lib/data/data-utils/sectionMergers.ts` (and `deepMergeWithDefaultsV2.ts` for new top-level slots). `deepMergeWithDefaultsV2` is used by `usePIARFormController` and the PDF generator, not by `parsePIARData`, so the import path and the form-state path each need their own coverage.
4. Wire the field into the relevant section component under `src/features/piar/components/sections/`.
5. Update the PDF generator under `src/features/piar/lib/pdf/pdf-generator/` and the matching DOCX instrumenter under `src/features/piar/lib/docx/docx-instrumenters/`.
6. Add or adjust the round-trip tests that cover the affected data path.

For example, adding a new `student` narrative field means touching the `StudentV2` interface, its empty default, the student definition in `docx-field-manifest/definitions.ts`, the student merger, the identity section component, the identity PDF renderer, the identity DOCX instrumenter, and both PDF/DOCX round-trip fixtures.

## V1 Payload Rejection

- `looksLikeLegacyPayload` in `src/features/piar/lib/portable/piar-import.ts` detects V1-shaped payloads (records that carry `periodos` and `recomendaciones` arrays — both removed in V2) and causes `parsePIARData` to return `unsupported_version` with a clearer error than `corrupt_or_incomplete_data`. The check runs both on bare legacy payloads (no envelope) and on payloads wrapped in a `{ v: 2, data }` envelope.
- There is no in-app V1→V2 migration. Users holding legacy files have to re-enter the data into a fresh V2 draft.
