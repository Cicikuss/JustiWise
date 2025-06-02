// udf.utils.ts
import JSZip from "jszip";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import type {
  UdfStyleAttribute,
  UdfParagraphElement,
  UdfImageProps,
  UdfTableElement,
  UdfCellElement,
  UdfRowElement,
  UdfConcreteElement,
  UdfTextSegmentProps,
  ParsedUdfXml,
  UdfTemplate,
  UdfElementsNode,
  UdfParagraphChild,
} from "../Models/udf.types";
import { DEFAULT_UDF_TEMPLATE_CONTENT } from "../Models/udf.constants";

/**
 * Escapes HTML special characters in a string.
 * @param text The string to escape.
 * @returns The escaped string.
 */
export const escapeHtml = (text: string | undefined | null): string => {
  if (text === undefined || text === null) return '';
  return String(text)
    .replace(/&/g, '&') // Must be first
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '\'')
};

/**
 * Generates a CSS style string from UDF element properties.
 * @param props The UDF element properties.
 * @param stylesMap A map of named styles.
 * @param hvlDefaultStyle The default style to fallback to.
 * @param isInline Whether the style is for an inline element (affects which CSS properties are applied).
 * @returns A CSS style string.
 */
export const getElementStyles = (
  props: Partial<UdfParagraphElement & UdfImageProps & UdfTableElement & UdfCellElement & UdfRowElement & UdfStyleAttribute>,
  stylesMap: Map<string, UdfStyleAttribute>,
  hvlDefaultStyle: UdfStyleAttribute | undefined,
  isInline: boolean = false
): string => {
  if (!props) return '';
  let styleString = '';

  const currentStyleName = props['@_resolver'];
  const styleFromMap = currentStyleName ? stylesMap.get(currentStyleName) : undefined;
  const baseStyle = styleFromMap || hvlDefaultStyle;

  const effectiveStyle: Partial<typeof props> = { ...(baseStyle || {}), ...props };

  const fontFamily = effectiveStyle['@_family'];
  if (fontFamily) styleString += `font-family: "${fontFamily}";`;

  const fontSize = effectiveStyle['@_size'];
  if (fontSize) styleString += `font-size: ${fontSize}pt;`;

  if (String(effectiveStyle['@_bold']) === 'true') {
    styleString += 'font-weight: bold;';
  }
  if (String(effectiveStyle['@_italic']) === 'true') {
    styleString += 'font-style: italic;';
  }
  if (String(effectiveStyle['@_underline']) === 'true') {
    styleString += 'text-decoration: underline;';
  }

  if (!isInline) {
    const alignment = String(effectiveStyle['@_Alignment']);
    if (alignment) {
      const alignmentMap: Record<string, string> = { '1': 'center', '3': 'right', '0': 'left', '2': 'justify' };
      if (alignmentMap[alignment]) styleString += `text-align: ${alignmentMap[alignment]};`;
    }

    const leftIndent = effectiveStyle['@_LeftIndent'];
    if (leftIndent && parseFloat(leftIndent) > 0) {
      styleString += `padding-left: ${leftIndent}pt;`;
    }
    const rightIndent = effectiveStyle['@_RightIndent'];
    if (rightIndent && parseFloat(rightIndent) > 0) {
      styleString += `padding-right: ${rightIndent}pt;`;
    }
    const spaceAbove = effectiveStyle['@_SpaceAbove'];
    if (spaceAbove && parseFloat(spaceAbove) > 0) {
      styleString += `margin-top: ${spaceAbove}pt;`;
    }
    const spaceBelow = effectiveStyle['@_SpaceBelow'];
    if (spaceBelow && parseFloat(spaceBelow) > 0) {
      styleString += `margin-bottom: ${spaceBelow}pt;`;
    }
    const firstLineIndent = effectiveStyle['@_FirstLineIndent'];
    if (firstLineIndent && parseFloat(firstLineIndent) > 0) {
      styleString += `text-indent: ${firstLineIndent}pt;`;
    }
    const lineSpacing = effectiveStyle['@_LineSpacing'];
    if (lineSpacing && parseFloat(lineSpacing) >= 0) {
      const lineHeightMap: { [key: string]: string } = { '0': 'normal', '1': '1.5', '2': '2' };
      styleString += `line-height: ${lineHeightMap[lineSpacing] || lineSpacing};`;
    }
  }
  return styleString;
};

/**
 * Sorts UDF paragraph children primarily by startOffset, then by original index.
 * @param a First child.
 * @param b Second child.
 * @returns Sort order.
 */
export const sortAllChildren = (
    a: { startOffset?: number; origIndex: number },
    b: { startOffset?: number; origIndex: number }
  ) => {
    if (typeof a.startOffset === 'number' && typeof b.startOffset === 'number') {
      return a.startOffset - b.startOffset;
    }
    
    // If one has offset and other doesn't, prioritize the one with offset (earlier)
    if (typeof a.startOffset === 'number') return -1;
    if (typeof b.startOffset === 'number') return 1;
    // Fallback to original XML order if no offsets
    return a.origIndex - b.origIndex;
  };

/**
 * Generates an HTML span for a UDF text segment (content, field, space, tab).
 * @param itemProps Properties of the text segment.
 * @param elementType Type of the segment.
 * @param cdataText The main CDATA string from the UDF.
 * @param stylesMap A map of named styles.
 * @returns HTML string for the span.
 */
export const generateSpanForUdfTextSegment = (
  itemProps: UdfTextSegmentProps,
  elementType: 'content' | 'field' | 'space' | 'tab',
  cdataText: string,
  stylesMap: Map<string, UdfStyleAttribute>
): string => {
  const startOffset = parseInt(itemProps['@_startOffset'], 10);
  const length = parseInt(itemProps['@_length'], 10);
  let textContent: string;

  if (isNaN(startOffset) || isNaN(length) || !cdataText || startOffset < 0 || length < 0 || (startOffset + length > cdataText.length)) {
    console.warn(`Invalid offset/length for ${elementType}:`, itemProps, `CDATALen: ${cdataText?.length}`);
    if (length === 0 && !isNaN(startOffset) && startOffset <= cdataText.length) {
      textContent = ""; // Valid zero-length segment
    } else {
      textContent = `[${elementType} ERR]`;
    }
  } else {
    textContent = cdataText.substring(startOffset, startOffset + length);
  }

  if (elementType === 'space') {
    return ' '.repeat(Math.max(0, length || 1)); // Non-breaking space
  }
  if (elementType === 'tab') {
    return '\u0009'.repeat(Math.max(0, length || 1)); // Tab character
  }

  const spanStyles = getElementStyles(itemProps, stylesMap, undefined, true);

  if (spanStyles) {
    return `<span style="${spanStyles}">${escapeHtml(textContent)}</span>`;
  }
  return escapeHtml(textContent);
};

/**
 * Generates HTML content for a UDF paragraph element.
 * @param paraProps The paragraph properties.
 * @param mainCdataText The main CDATA string.
 * @param stylesMap A map of named styles.
 * @returns HTML string for the paragraph's inner content.
 */
function generateHtmlForUdfParagraphContent(
  paraProps: UdfParagraphElement,
  mainCdataText: string,
  stylesMap: Map<string, UdfStyleAttribute>
): string {
  let paragraphInnerHTML = '';
  const allChildren: UdfParagraphChild[] = [];
  let childIndex = 0;

  // Collect all text segments and inline images, preserving original order via origIndex
  (['content', 'field', 'space', 'tab'] as const).forEach(type => {
    const items = paraProps[type];
    if (items) {
      (Array.isArray(items) ? items : [items]).forEach(item => {
        if (item) {
          allChildren.push({
            type,
            props: item,
            startOffset: item['@_startOffset'] !== undefined ? Number(item['@_startOffset']) : undefined,
            origIndex: childIndex++,
          });
        }
      });
    }
  });

  if (paraProps.image) {
    const items = Array.isArray(paraProps.image) ? paraProps.image : [paraProps.image];
    items.forEach(item => {
      if (item) {
        allChildren.push({
          type: 'image',
          props: item,
          startOffset: item['@_startOffset'] !== undefined ? Number(item['@_startOffset']) : undefined,
          origIndex: childIndex++,
        });
      }
    });
  }

  // Sort children (primarily by startOffset, then by original index)
  allChildren.sort(sortAllChildren);

  allChildren.forEach(child => {
    if (child.type === 'image' && (child.props as UdfImageProps)['@_imageData']) {
      const imgProps = child.props as UdfImageProps;
      let mime = 'image/png';
      if (String(imgProps['@_imageData']).startsWith('/9j/')) mime = 'image/jpeg';
      // Inline images are typically smaller and flow with text
      paragraphInnerHTML += `<img src="data:${mime};base64,${imgProps['@_imageData']}" alt="Gömülü Resim" style="max-height: 1.5em; vertical-align: text-bottom; margin: 0 0.1em;" />`;
    } else if (['content', 'field', 'space', 'tab'].includes(child.type)) {
      paragraphInnerHTML += generateSpanForUdfTextSegment(
        child.props as UdfTextSegmentProps,
        child.type as 'content' | 'field' | 'space' | 'tab',
        mainCdataText,
        stylesMap
      );
    }
  });

  return paragraphInnerHTML || ' '; // Ensure paragraph isn't empty for rendering
}

/**
 * Generates HTML for a single UDF concrete element (paragraph, table, or block image).
 * @param udfElement The UDF element.
 * @param stylesMap A map of named styles.
 * @param hvlDefaultStyle The default style.
 * @param mainCdataText The main CDATA string.
 * @returns HTML string for the element.
 */
export function generateHtmlForUdfElement(
  udfElement: UdfConcreteElement,
  stylesMap: Map<string, UdfStyleAttribute>,
  hvlDefaultStyle: UdfStyleAttribute | undefined,
  mainCdataText: string
): string {
  if (!udfElement) return '';
  let html = '';

  if (udfElement.paragraph) {
    const paraProps = udfElement.paragraph;
    const paragraphInnerHTML = generateHtmlForUdfParagraphContent(paraProps, mainCdataText, stylesMap);
    const paragraphBlockStyle = getElementStyles(paraProps, stylesMap, hvlDefaultStyle, false);
    html += `<p style="${paragraphBlockStyle}">${paragraphInnerHTML}</p>`;
  }
  else if (udfElement.image) { // Block-level image
    const props = udfElement.image;
    if (props['@_imageData']) {
      let mime = 'image/png';
      if (String(props['@_imageData']).startsWith('/9j/')) mime = 'image/jpeg';
      
      let figureStyles = getElementStyles(props, stylesMap, hvlDefaultStyle, false);
      // Ensure block images are centered by default if no alignment specified
      if (!figureStyles.includes('text-align:')) {
        figureStyles += 'text-align: center;'; 
      }
      figureStyles += 'margin: 0.5em auto;'; // Standard margin for block images
      html += `<figure class="image" style="${figureStyles}"><img src="data:${mime};base64,${props['@_imageData']}" alt="UDF Resmi" style="max-width: 100%; height: auto; display: inline-block;" /></figure>`;
    }
  }
  else if (udfElement.table) {
    const tableProps = udfElement.table;
    let tableBlockStyle = 'border-collapse: collapse; width: 100%; margin: 1em 0;';
    if (tableProps['@_border'] && tableProps['@_border'] !== 'borderNone') {
      tableBlockStyle += 'border: 1px solid #ccc;'; // Default border for tables with border
    }
    tableBlockStyle += getElementStyles(tableProps, stylesMap, hvlDefaultStyle, false);

    html += `<table style="${tableBlockStyle}">`;

    if (Array.isArray(tableProps.row)) {
      tableProps.row.forEach((rowNode: UdfRowElement) => {
        let rowStyle = getElementStyles(rowNode, stylesMap, hvlDefaultStyle, false);
        html += `<tr style="${rowStyle}">`;

        if (Array.isArray(rowNode.cell)) {
          rowNode.cell.forEach((cellNode: UdfCellElement) => {
            let tdStyles = '';
            if (tableProps['@_border'] && tableProps['@_border'] !== 'borderNone') {
              tdStyles += 'border: 1px solid #ccc; padding: 5px;';
            } else {
              tdStyles += 'padding: 5px;'; // Padding even without border
            }
            tdStyles += getElementStyles(cellNode, stylesMap, hvlDefaultStyle, false);
            html += `<td style="${tdStyles}">`;

            // Process paragraphs within the cell
            if (cellNode.paragraph) {
              const paras = Array.isArray(cellNode.paragraph) ? cellNode.paragraph : [cellNode.paragraph];
              paras.forEach(p => {
                // Create a temporary UdfConcreteElement to reuse the generation logic
                html += generateHtmlForUdfElement({ paragraph: p }, stylesMap, hvlDefaultStyle, mainCdataText);
              });
            }

            // Process block images directly within the cell
            if (cellNode.image) {
              const images = Array.isArray(cellNode.image) ? cellNode.image : [cellNode.image];
              images.forEach(img => {
                 // Create a temporary UdfConcreteElement
                html += generateHtmlForUdfElement({ image: img }, stylesMap, hvlDefaultStyle, mainCdataText);
              });
            }
            // Process nested tables within the cell
            if (cellNode.table) {
                const tables = Array.isArray(cellNode.table) ? cellNode.table : [cellNode.table];
                tables.forEach(tab => {
                    html += generateHtmlForUdfElement({ table: tab }, stylesMap, hvlDefaultStyle, mainCdataText);
                });
            }
            html += "</td>";
          });
        }
        html += "</tr>";
      });
    }
    html += "</table>";
  }
  return html;
}

/**
 * Parses the UDF file content (XML string) and generates HTML.
 * @param xmlString The XML content of the UDF file.
 * @returns An object containing the generated HTML, parsed UDF template, and main CDATA.
 */
export const parseUdfFileContent = (xmlString: string): {
  html: string;
  udfTemplate: UdfTemplate;
  mainCdata: string;
  stylesMap: Map<string, UdfStyleAttribute>;
  hvlDefaultStyle?: UdfStyleAttribute;
} => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "#cdata",
    parseTagValue: true,
    trimValues: false,
    // Important: Define how arrays are handled based on tagName and jPath
    isArray: (tagName: string, jPath: string): boolean => {
      if (jPath === "template.elements" && tagName === "element") return true;
      if (jPath === "template.elements" && ["paragraph", "table", "image"].includes(tagName)) return true;
      if (jPath === "template.styles" && tagName === "style") return true;
      const parentPath = jPath.substring(0, jPath.lastIndexOf('.'));
      if (parentPath.endsWith("paragraph") && ["content", "field", "space", "tab", "image"].includes(tagName)) return true;
      if (parentPath.endsWith("table") && tagName === "row") return true;
      if (parentPath.endsWith("row") && tagName === "cell") return true;
      if (parentPath.endsWith("cell") && ["paragraph", "image", "table"].includes(tagName)) return true;
      if (jPath === "template.footer" && tagName === "paragraph") return true;
      return false;
    }
  });

  const parsedXml: ParsedUdfXml = parser.parse(xmlString);

  if (!parsedXml.template) {
    throw new Error("UDF dosyasının şablon yapısı geçerli değil.");
  }

  const udfTemplate = parsedXml.template;
  const cdataFromUdf = udfTemplate.content?.['#cdata'] || '';

  const stylesMap = new Map<string, UdfStyleAttribute>();
  if (udfTemplate.styles?.style) {
    (Array.isArray(udfTemplate.styles.style) ? udfTemplate.styles.style : [udfTemplate.styles.style])
      .forEach((s: UdfStyleAttribute) => stylesMap.set(s['@_name'], s));
  }

  const hvlDefaultStyleFromParsed = stylesMap.get('hvl-default') || stylesMap.get('default');
  const defaultTemplateStyles = DEFAULT_UDF_TEMPLATE_CONTENT.template.styles.style;
  const hvlDefaultStyleFromConstant = (Array.isArray(defaultTemplateStyles)
    ? defaultTemplateStyles.find(s => s['@_name'] === 'hvl-default')
    : (defaultTemplateStyles['@_name'] === 'hvl-default' ? defaultTemplateStyles : undefined));
  const hvlDefaultStyle = hvlDefaultStyleFromParsed || hvlDefaultStyleFromConstant;

  let htmlResult = "";
  const elementsNode = udfTemplate.elements;
  if (elementsNode) {
    const elementsToProcess: UdfConcreteElement[] = [];
    // Handle <element> wrapper if present
    if (Array.isArray(elementsNode.element)) {
      elementsToProcess.push(...elementsNode.element);
    } else {
      // Handle direct paragraph, table, image children
      (['paragraph', 'table', 'image'] as const).forEach(elementType => {
        const items = elementsNode[elementType];
        if (items) {
          (Array.isArray(items) ? items : [items]).forEach(item => {
            elementsToProcess.push({ [elementType]: item } as unknown as UdfConcreteElement);
          });
        }
      });
    }
    elementsToProcess.forEach((el) => {
      htmlResult += generateHtmlForUdfElement(el, stylesMap, hvlDefaultStyle, cdataFromUdf);
    });
  }

  if (udfTemplate.footer?.paragraph) {
    htmlResult += "<hr style='margin: 20px 0; border-top: 1px dashed #ccc;' /><div><strong>--- Footer ---</strong></div>";
    const footerParas = Array.isArray(udfTemplate.footer.paragraph)
      ? udfTemplate.footer.paragraph
      : [udfTemplate.footer.paragraph];
    footerParas.forEach(p => {
      htmlResult += generateHtmlForUdfElement({ paragraph: p }, stylesMap, hvlDefaultStyle, cdataFromUdf);
    });
  }

  return {
    html: htmlResult || '<p> </p>', // Default to non-breaking space para if empty
    udfTemplate,
    mainCdata: cdataFromUdf,
    stylesMap,
    hvlDefaultStyle
  };
};


/**
 * Extracts text from HTML for CDATA, with simple placeholders for images/tables.
 * @param editorHtml The HTML content from the editor.
 * @returns A string representation for the UDF CDATA.
 */
export const extractTextForCdataFromHtml = (editorHtml: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorHtml;
    let extractedText = "";

    // This querySelectorAll aims to get block-level elements in document order
    tempDiv.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, pre, blockquote, figure.image, table').forEach((el, index, arr) => {
        if (el.tagName === 'FIGURE' && el.classList.contains('image')) {
            // UDF often uses a special character (like object replacement character) for embedded objects in CDATA
            extractedText += "￼"; // Object Replacement Character
        } else if (el.tagName === 'TABLE') {
            extractedText += "[TABLO]"; // Placeholder for table
        }
        else {
             extractedText += el.textContent || "";
        }
        // Add a newline after most block elements to simulate paragraph breaks
        // Avoid double newlines if the next element also implies a break
        if (index < arr.length -1 || el.tagName.startsWith('H') || ['P', 'DIV', 'LI', 'BLOCKQUOTE', 'FIGURE', 'TABLE'].includes(el.tagName)) {
            extractedText += "\n";
        }
    });
    // Normalize newlines: replace multiple newlines with a single one, and trim.
    return extractedText.replace(/\n\n+/g, '\n').trim();
};


/**
 * Builds the UDF XML content for download.
 * @param currentUdfData The current UDF template data.
 * @param editorHtml The HTML content from the CKEditor.
 * @returns The XML string for content.xml.
 */
export const buildUdfXmlForDownload = (
  currentUdfData: UdfTemplate,
  editorHtml: string
): string => {
  const extractedTextForCdata = extractTextForCdataFromHtml(editorHtml);

  // Create a deep copy to avoid mutating the state directly
  const dataToBuild: UdfTemplate = JSON.parse(JSON.stringify(currentUdfData));
  
  // Update CDATA
  dataToBuild.content = { '#cdata': extractedTextForCdata };

  // Ensure essential parts from default template exist if missing
  if (!dataToBuild.elements) dataToBuild.elements = JSON.parse(JSON.stringify(DEFAULT_UDF_TEMPLATE_CONTENT.template.elements));
  if (!dataToBuild.styles) dataToBuild.styles = JSON.parse(JSON.stringify(DEFAULT_UDF_TEMPLATE_CONTENT.template.styles));
  if (!dataToBuild.properties) dataToBuild.properties = JSON.parse(JSON.stringify(DEFAULT_UDF_TEMPLATE_CONTENT.template.properties));

  // Note: This simplistic approach updates only the CDATA.
  // A more sophisticated approach would parse the HTML from CKEditor
  // and reconstruct the UDF 'elements' structure. This is a complex task.

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true, // Pretty print XML
    cdataPropName: "#cdata",
    suppressEmptyNode: true, // Don't output empty tags like <image/> if not needed
  });

  const contentXml = builder.build({ template: dataToBuild });
  return `<?xml version="1.0" encoding="UTF-8"?>\n${contentXml}`;
};