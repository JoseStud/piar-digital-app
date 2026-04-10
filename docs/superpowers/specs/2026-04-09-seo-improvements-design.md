# SEO Improvements Design — PIAR Digital

**Date:** 2026-04-09
**Goal:** Increase Google rankings for "PIAR plus" (branded) and the full PIAR keyword cluster (Decreto 1421, formulario PIAR, PIAR docentes Colombia).
**Approach:** Structured data + targeted content pages (Approach B).

---

## 1. Technical Fixes

### 1.1 FAQPage + HowTo JSON-LD

Add two new JSON-LD blocks to `src/app/page.tsx` (not `layout.tsx`, since `/diligenciar` must not inherit them):

- **`FAQPage`** schema maps to the 2 FAQ items kept on `/`. The full `FAQPage` schema (all ~10 questions) lives on `/preguntas-frecuentes`.
- **`HowTo`** schema maps to the 3 numbered "Cómo se usa" steps already in `MarketingLandingPage`. Steps: (1) Abrir el formulario, (2) Diligenciar las secciones, (3) Exportar PDF o DOCX.

Both blocks are inlined as `<script type="application/ld+json">` in the server component.

### 1.2 Canonical URL

Add `alternates: { canonical: '/' }` to the root metadata in `src/app/layout.tsx`, and add explicit canonical exports to each new page's `metadata`. This prevents Google from treating query strings or trailing slashes as duplicate URLs.

### 1.3 Sitemap `lastModified` Fix

`src/app/sitemap.ts` currently uses `new Date()`, which changes on every build and confuses crawlers. Replace with a `BUILD_DATE` environment variable (set in `next.config.ts` at build time via `Date.now()`) with a fallback to a fixed ISO date string. All sitemap entries use this stable value.

### 1.4 Page-Level Metadata for `/`

`src/app/page.tsx` currently exports no `metadata` — it inherits layout defaults. Add a route-specific export:

```ts
export const metadata: Metadata = {
  title: 'PIAR plus — Formulario PIAR Digital para Docentes | Decreto 1421',
  description:
    'PIAR plus: diligencia el Plan Individual de Ajustes Razonables en tu navegador. Gratuito, sin registro, sin servidores. Compatible con el Anexo 2 del Decreto 1421 de Colombia.',
  alternates: { canonical: '/' },
};
```

This associates the "PIAR plus" brand term directly with the homepage in Google's index.

---

## 2. Landing Page Restructuring (`MarketingLandingPage.tsx`)

Changes to `/` avoid content duplication with the new dedicated pages.

### 2.1 "¿Qué es el PIAR?" Section → Teaser

- **Keep:** The first paragraph (PIAR definition + Decreto 1421 mention).
- **Remove:** The three follow-up detail paragraphs.
- **Add:** A "Leer más sobre el Decreto 1421 →" link pointing to `/decreto-1421`.

### 2.2 FAQ Section → 2-Question Teaser

- **Keep:** 2 of the 5 existing questions: "¿Qué es el PIAR?" and "¿Los datos del formulario se suben a internet?".
- **Remove:** The other 3 questions from the landing page.
- **Add:** A "Ver todas las preguntas frecuentes →" link pointing to `/preguntas-frecuentes`.
- The `FAQPage` JSON-LD on `/` lists only those 2 questions.

### 2.3 Footer Navigation

Replace the single-paragraph footer text with a two-column layout:

- Left: disclaimer text (existing).
- Right: nav links — "Decreto 1421 de 2017" (`/decreto-1421`), "Preguntas frecuentes" (`/preguntas-frecuentes`), "Diligenciar PIAR" (`/diligenciar`).

---

## 3. New Content Pages

### 3.1 `/decreto-1421` — Deep Guide

**File:** `src/app/decreto-1421/page.tsx`
**Component:** `src/features/piar/screens/Decreto1421Page.tsx` (pure server component)

**Route metadata:**
```ts
export const metadata: Metadata = {
  title: 'Decreto 1421 de 2017: Guía de educación inclusiva en Colombia | PIAR plus',
  description:
    'Qué establece el Decreto 1421 de 2017, qué obliga a las instituciones educativas, y cómo el PIAR es el instrumento central de la educación inclusiva en Colombia.',
  alternates: { canonical: '/decreto-1421' },
};
```

**JSON-LD:** `Article` schema with `headline`, `description`, `inLanguage: "es-CO"`, `author: { '@type': 'Organization', name: 'PIAR Digital' }`.

**Content structure (headings):**
1. `<h1>` Decreto 1421 de 2017: Guía completa sobre educación inclusiva en Colombia
2. `<h2>` ¿Qué es el Decreto 1421?
3. `<h2>` ¿A quiénes aplica?
4. `<h2>` ¿Qué obliga a las instituciones educativas?
5. `<h2>` El PIAR como instrumento central del Decreto 1421 (links back to `/`)
6. `<h2>` Tipos de discapacidad que abarca el Decreto
7. `<h2>` ¿Con qué frecuencia debe actualizarse el PIAR?
8. CTA link to `/diligenciar`

**Sitemap entry:** `{ url: '/decreto-1421', changeFrequency: 'yearly', priority: 0.7 }`

---

### 3.2 `/preguntas-frecuentes` — Full FAQ

**File:** `src/app/preguntas-frecuentes/page.tsx`
**Component:** `src/features/piar/screens/FaqPage.tsx` (pure server component)

**Route metadata:**
```ts
export const metadata: Metadata = {
  title: 'Preguntas frecuentes sobre el PIAR | PIAR plus',
  description:
    'Respuestas a las dudas más comunes sobre el PIAR: quién lo diligencia, con qué frecuencia se actualiza, cómo exportar, si funciona sin internet, y más.',
  alternates: { canonical: '/preguntas-frecuentes' },
};
```

**JSON-LD:** Full `FAQPage` schema with all ~10 questions.

**Questions (existing 5 + 5 new):**

Existing (from landing page):
1. ¿Qué es el PIAR?
2. ¿Quién debe diligenciar el PIAR?
3. ¿Qué es el Decreto 1421 de 2017?
4. ¿Los datos del formulario se suben a internet?
5. ¿En qué formatos puedo exportar el PIAR?

New additions:
6. ¿Con qué frecuencia debe actualizarse el PIAR? — Annually per school year, or when the student's situation changes significantly.
7. ¿Qué pasa si el estudiante cambia de institución? — The PIAR can be exported as PDF/DOCX and imported in the new institution.
8. ¿El documento DOCX es compatible con Google Docs? — Yes.
9. ¿Qué son los "ajustes razonables"? — Legal definition from Decreto 1421, what they imply in practice.
10. ¿La herramienta funciona sin conexión a internet? — Yes, after first load, via service worker.

**Sitemap entry:** `{ url: '/preguntas-frecuentes', changeFrequency: 'monthly', priority: 0.8 }`

---

## 4. Sitemap Final State

```ts
[
  { url: base, changeFrequency: 'monthly', priority: 1, lastModified: BUILD_DATE },
  { url: `${base}/decreto-1421`, changeFrequency: 'yearly', priority: 0.7, lastModified: BUILD_DATE },
  { url: `${base}/preguntas-frecuentes`, changeFrequency: 'monthly', priority: 0.8, lastModified: BUILD_DATE },
]
```

`/diligenciar` is excluded (disallowed in `robots.txt`).

---

## 5. Files Affected

| File | Change |
|---|---|
| `src/app/page.tsx` | Add `metadata` export, add `FAQPage` + `HowTo` JSON-LD |
| `src/app/layout.tsx` | Add `alternates.canonical` to root metadata |
| `src/app/sitemap.ts` | Add new pages, fix `lastModified` |
| `src/features/piar/screens/MarketingLandingPage.tsx` | Shorten FAQ + PIAR sections, update footer |
| `src/app/decreto-1421/page.tsx` | New route |
| `src/features/piar/screens/Decreto1421Page.tsx` | New server component |
| `src/app/preguntas-frecuentes/page.tsx` | New route |
| `src/features/piar/screens/FaqPage.tsx` | New server component |
| `next.config.ts` | Add `BUILD_DATE` env var |

---

## 6. Out of Scope

- `Organization` schema, `SearchAction`, meta keywords — deferred to a future pass after Search Console data accumulates.
- `/glosario` page — not enough volume justification yet.
- Off-page SEO (backlinks, social proof) — out of scope for code changes.
- Performance / Core Web Vitals optimizations — separate concern.
