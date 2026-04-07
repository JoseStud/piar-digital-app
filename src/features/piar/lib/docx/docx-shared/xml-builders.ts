import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import {
  DOCX_FIELD_DEFINITIONS_BY_SECTION,
  buildDocxFieldValueMap,
} from '@piar-digital-app/features/piar/lib/docx/docx-field-manifest';
import {
  PIAR_DOCX_STORE_ITEM_ID,
  PIAR_DOCX_XML_NAMESPACE,
  XML_PREFIX_MAPPINGS,
} from './constants';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildControlTextRuns(value: string): string {
  const normalized = value.replace(/\r\n/g, '\n');
  if (normalized === '') {
    return '<w:r><w:t xml:space="preserve"> </w:t></w:r>';
  }

  return normalized
    .split('\n')
    .map((line, index) => {
      const textRun = `<w:r><w:t xml:space="preserve">${escapeXml(line === '' ? ' ' : line)}</w:t></w:r>`;
      if (index === 0) {
        return textRun;
      }
      return `<w:r><w:br/></w:r>${textRun}`;
    })
    .join('');
}

function buildContentControlXml(path: string, label: string, value: string, controlId: number, kind: 'plain' | 'rich'): string {
  const xpath = `/piar:document/piar:fields/piar:field[@path='${path}']`;
  const controlKind = kind === 'rich'
    ? '<w:richText/>'
    : '<w:text/>';

  return `
    <w:sdt>
      <w:sdtPr>
        <w:alias w:val="${escapeXml(label)}"/>
        <w:tag w:val="${escapeXml(path)}"/>
        <w:id w:val="${controlId}"/>
        <w:lock w:val="sdtLocked"/>
        <w:dataBinding w:storeItemID="${PIAR_DOCX_STORE_ITEM_ID}" w:xpath="${escapeXml(xpath)}" w:prefixMappings="${escapeXml(XML_PREFIX_MAPPINGS)}"/>
        ${controlKind}
      </w:sdtPr>
      <w:sdtContent>
        <w:p>
          <w:rPr/>
          ${buildControlTextRuns(value)}
        </w:p>
      </w:sdtContent>
    </w:sdt>
  `.trim();
}

function buildSectionTableXml(section: string, entries: Array<{ path: string; label: string; kind: 'plain' | 'rich'; value: string }>, startControlId: number): string {
  const rows = entries.map((entry, index) => `
    <w:tr>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="3800" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>
        </w:tcPr>
        <w:p>
          <w:r>
            <w:rPr><w:b/></w:rPr>
            <w:t xml:space="preserve">${escapeXml(entry.label)}</w:t>
          </w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr><w:tcW w:w="6200" w:type="dxa"/></w:tcPr>
        ${buildContentControlXml(entry.path, `${section} · ${entry.label}`, entry.value, startControlId + index, entry.kind)}
      </w:tc>
    </w:tr>
  `).join('');

  return `
    <w:p>
      <w:pPr><w:spacing w:before="200" w:after="100"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="28"/></w:rPr>
        <w:t>${escapeXml(section)}</w:t>
      </w:r>
    </w:p>
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="10000" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="3800"/>
        <w:gridCol w:w="6200"/>
      </w:tblGrid>
      ${rows}
    </w:tbl>
  `.trim();
}

export function buildDocxCustomXml(data: PIARFormDataV2): string {
  const fieldValues = buildDocxFieldValueMap(data);
  const fields = Array.from(fieldValues.entries())
    .map(([path, value]) => `<piar:field path="${escapeXml(path)}">${escapeXml(value)}</piar:field>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<piar:document xmlns:piar="${PIAR_DOCX_XML_NAMESPACE}" v="${data._version}">
  <piar:fields>${fields}</piar:fields>
</piar:document>`;
}

export function buildDocxCustomXmlItemProps(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ds:datastoreItem ds:itemID="${PIAR_DOCX_STORE_ITEM_ID}" xmlns:ds="http://schemas.openxmlformats.org/officeDocument/2006/customXml">
  <ds:schemaRefs>
    <ds:schemaRef ds:uri="${PIAR_DOCX_XML_NAMESPACE}"/>
  </ds:schemaRefs>
</ds:datastoreItem>`;
}

export function buildDocxCustomXmlRelationships(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXmlProps" Target="itemProps1.xml"/>
</Relationships>`;
}

export function buildDocxDocumentXml(data: PIARFormDataV2): string {
  const fieldValues = buildDocxFieldValueMap(data);
  let controlId = 1000;
  const sections = Array.from(DOCX_FIELD_DEFINITIONS_BY_SECTION.entries())
    .map(([section, definitions]) => {
      const xml = buildSectionTableXml(
        section,
        definitions.map((definition) => ({
          path: definition.path,
          label: definition.label,
          kind: definition.kind,
          value: fieldValues.get(definition.path) ?? '',
        })),
        controlId,
      );

      controlId += definitions.length;
      return xml;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
  xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 w15 w16se wp14">
  <w:body>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="160"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
        <w:t>PIAR Digital — DOCX editable</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="240"/></w:pPr>
      <w:r>
        <w:t xml:space="preserve">Edite únicamente dentro de los campos estructurados. El archivo DOCX conserva los datos PIAR en XML incrustado para la reimportación en la aplicación.</w:t>
      </w:r>
    </w:p>
    ${sections}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="18720" w:code="14"/>
      <w:pgMar w:top="1418" w:right="1418" w:bottom="993" w:left="1418" w:header="964" w:footer="398" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="272"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}
