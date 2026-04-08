/** Renders a `<script type="application/ld+json">` element for SEO structured data on the marketing landing page. */
interface JsonLdScriptProps {
  data: unknown;
  id?: string;
}

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Serializes structured data safely into a JSON-LD script tag. */
export function JsonLdScript({ data, id }: JsonLdScriptProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
