/** Module declarations for non-code asset imports (images, docx templates) used by the bundler. */
declare module '*.docx' {
  const src: string;
  export default src;
}
