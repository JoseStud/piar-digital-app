# Data Model

`src/features/piar/model/piar.ts` is the canonical source of truth for `PIARFormDataV2`. Every persistence path, importer, exporter, and form section reads and writes that shape.

## Versioning Contract

- `PIAR_DATA_VERSION = 2`.
- The storage and export envelope is `{ v, data }`.
- Additive changes do not require a version bump, but the new field must be defaulted in `createEmptyPIARFormDataV2` and handled by `deepMergeWithDefaultsV2`.
- Breaking changes require a new version, a migration path, and updated import/export logic.
- V1 support has been removed.

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

1. Update `src/features/piar/model/piar.ts`.
2. Default the field in `createEmptyPIARFormDataV2`.
3. Handle the field in `src/features/piar/lib/data/data-utils/sectionMergers.ts` and any related legacy repair code.
4. Wire the field into the relevant section component under `src/features/piar/components/sections/`.
5. Update the PDF generator and the corresponding DOCX instrumenter.
6. Add or adjust the round-trip tests that cover the affected data path.

For example, adding a new `student` narrative field means touching the `StudentV2` interface, its empty default, the student merger, the identity section component, the identity PDF renderer, the identity DOCX instrumenter, and both PDF/DOCX round-trip fixtures.

## Legacy Repair

- `src/features/piar/lib/data/data-utils/legacyFallbacks.ts` carries old-shape repair logic.
- `src/features/piar/lib/data/data-utils/sectionMergers.ts` merges imported data back into the canonical V2 shape.
- Example: legacy `nombreCompleto` values can be repaired into V2 `nombres` and `apellidos` fields during import.
- The legacy layer exists only to make older imports and archived payloads readable; new data should always be written as V2.
