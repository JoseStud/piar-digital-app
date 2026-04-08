/**
 * Template source variants accepted by the runtime loader.
 *
 * Callers can pass a same-origin URL or an in-memory byte payload.
 */

/** Runtime template source accepted by the DOCX loader. */
export type PIARDocxTemplateSource =
  | {
      kind: 'url';
      url: string;
      sourceName: string;
    }
  | {
      kind: 'bytes';
      bytes: ArrayBuffer | ArrayBufferView;
      sourceName: string;
    };
