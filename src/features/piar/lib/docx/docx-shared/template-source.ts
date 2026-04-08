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

