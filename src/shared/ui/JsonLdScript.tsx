interface JsonLdScriptProps {
  data: unknown;
  id?: string;
}

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLdScript({ data, id }: JsonLdScriptProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}