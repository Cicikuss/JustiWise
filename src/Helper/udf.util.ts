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
    .replace(/&/g, '&amp;') // MUST BE FIRST!
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Generates a CSS style string from UDF element properties.
 */
export const getElementStyles = (
  props: any,
  stylesMap: Map<string, UdfStyleAttribute>,
  hvlDefaultStyle?: UdfStyleAttribute,
  isInline: boolean = false
): string => {
  if (!props) return '';
  let styleString = '';

  const currentStyleName = props['@_resolver'];
  const styleFromMap = currentStyleName ? stylesMap.get(currentStyleName) : undefined;
  const baseStyle = styleFromMap || hvlDefaultStyle;

  // Create effective style by merging base style (from resolver or default) with direct props
  const effectiveStyle: any = { ...(baseStyle || {}), ...props };

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
    if (leftIndent && parseFloat(leftIndent) > 0) styleString += `padding-left: ${leftIndent}pt;`;
    
    const rightIndent = effectiveStyle['@_RightIndent'];
    if (rightIndent && parseFloat(rightIndent) > 0) styleString += `padding-right: ${rightIndent}pt;`;
    
    const spaceAbove = effectiveStyle['@_SpaceAbove'];
    if (spaceAbove && parseFloat(spaceAbove) > 0) styleString += `margin-top: ${spaceAbove}pt;`;
    
    const spaceBelow = effectiveStyle['@_SpaceBelow'];
    if (spaceBelow && parseFloat(spaceBelow) > 0) styleString += `margin-bottom: ${spaceBelow}pt;`;
    
    const firstLineIndent = effectiveStyle['@_FirstLineIndent'];
    if (firstLineIndent && parseFloat(firstLineIndent) > 0) styleString += `text-indent: ${firstLineIndent}pt;`;
    
    const lineSpacing = effectiveStyle['@_LineSpacing'];
    if (lineSpacing && parseFloat(lineSpacing) >= 0) { 
      const lineHeightMap: { [key: string]: string } = { '0': 'normal', '1': '1.5', '2': '2' }; 
      styleString += `line-height: ${lineHeightMap[lineSpacing] || lineSpacing};`;
    }
  }
  return styleString;
};

/**
 * Sorts UDF paragraph children.
 */
export const sortAllChildren = (
  a: { startOffset?: number; origIndex: number },
  b: { startOffset?: number; origIndex: number }
): number => {
  const aHasValidOffset = typeof a.startOffset === 'number' && !isNaN(a.startOffset);
  const bHasValidOffset = typeof b.startOffset === 'number' && !isNaN(b.startOffset);
 
  if (aHasValidOffset && bHasValidOffset) {
    // Both have valid numerical offsets.
    if (a.startOffset! === b.startOffset!) { // Non-null assertion as they are validated
      return a.origIndex - b.origIndex; // Stability sort
    }
    return a.startOffset! - b.startOffset!; // Sort by offset
  }
  // Prioritize elements with valid offsets
  if (aHasValidOffset) return -1; // a comes before b
  if (bHasValidOffset) return 1;  // b comes before a
  // Neither has a valid offset, sort by original index
  return a.origIndex - b.origIndex;
};

/**
 * Generates an HTML span for a UDF text segment (content, field, space, tab).
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
    if (length === 0 && !isNaN(startOffset) && startOffset >=0 && startOffset <= cdataText.length) {
      textContent = ""; 
    } else {
      textContent = `[${elementType.toUpperCase()} ERR: Invalid offset/length]`;
    }
  } else {
    textContent = cdataText.substring(startOffset, startOffset + length);
  }

  if (elementType === 'space') {
    return ' '.repeat(Math.max(0, isNaN(length) || length <= 0 ? 1 : length));
  }
  if (elementType === 'tab') {
    return '\u0009'.repeat(Math.max(0, isNaN(length) || length <= 0 ? 1 : length));
  }

  const spanStyles = getElementStyles(itemProps, stylesMap, undefined, true);

  if (spanStyles) {
    return `<span style="${spanStyles}">${escapeHtml(textContent)}</span>`;
  }
  return escapeHtml(textContent);
};

/**
 * Generates HTML content for a UDF paragraph element.
 */
function generateHtmlForUdfParagraphContent(
  paraProps: UdfParagraphElement,
  mainCdataText: string,
  stylesMap: Map<string, UdfStyleAttribute>
): string {
  let paragraphInnerHTML = '';
  const allChildren: UdfParagraphChild[] = [];
  let childIndex = 0;

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

  if (paraProps.image) { // Inline images within paragraph
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

  allChildren.sort(sortAllChildren);

  allChildren.forEach(child => {
    if (child.type === 'image' && (child.props as UdfImageProps)['@_imageData']) { 
      const imgProps = child.props as UdfImageProps;
      let mime = 'image/png'; 
      if (String(imgProps['@_imageData']).startsWith('/9j/')) mime = 'image/jpeg';
      paragraphInnerHTML += `<img src="data:${mime};base64,${imgProps['@_imageData']}" alt="Gömülü Resim" style="max-height: 1.5em; vertical-align: middle; margin: 0 0.1em;" />`;
    } else if (['content', 'field', 'space', 'tab'].includes(child.type)) {
      paragraphInnerHTML += generateSpanForUdfTextSegment(
        child.props as UdfTextSegmentProps,
        child.type as 'content' | 'field' | 'space' | 'tab',
        mainCdataText,
        stylesMap
      );
    }
  });
  return paragraphInnerHTML || ' '; // Ensure paragraph isn't empty for rendering
}

/**
 * Generates HTML for a single UDF concrete element (paragraph, table, or block image).
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
      if (!figureStyles.includes('text-align:')) {
        figureStyles += 'text-align: center;'; 
      }
      figureStyles += 'margin-top: 0.5em; margin-bottom: 0.5em;'; 
      html += `<figure class="image" style="${figureStyles}"><img src="data:${mime};base64,${props['@_imageData']}" alt="UDF Resmi" style="max-width: 100%; height: auto; display: inline-block;" /></figure>`;
    }
  }
  else if (udfElement.table) {
    const tableProps = udfElement.table;
    let tableBlockStyle = 'border-collapse: collapse; width: 100%; margin: 1em 0;'; 
    if (tableProps['@_border'] && tableProps['@_border'] !== 'borderNone') { 
      tableBlockStyle += 'border: 1px solid #ccc;'; 
    }
    tableBlockStyle += getElementStyles(tableProps, stylesMap, hvlDefaultStyle, false);

    html += `<table style="${tableBlockStyle}">`;

    const rows = Array.isArray(tableProps.row) ? tableProps.row : (tableProps.row ? [tableProps.row] : []);
    rows.forEach((rowNode: UdfRowElement) => {
      let rowStyle = getElementStyles(rowNode, stylesMap, hvlDefaultStyle, false);
      html += `<tr style="${rowStyle}">`;

      const cells = Array.isArray(rowNode.cell) ? rowNode.cell : (rowNode.cell ? [rowNode.cell] : []);
      cells.forEach((cellNode: UdfCellElement) => {
        let tdStyles = 'padding: 5px;'; 
        if (tableProps['@_border'] && tableProps['@_border'] !== 'borderNone') {
          tdStyles += 'border: 1px solid #ccc;'; 
        }
        tdStyles += getElementStyles(cellNode, stylesMap, hvlDefaultStyle, false); 
        
        const vAlign = (cellNode as any)['@_vAlign']; // Cast to any if @_vAlign is not in UdfCellElement
        const vAlignMap: Record<string,string> = { '0': 'top', '1': 'middle', '2': 'bottom' };
        if (vAlign && vAlignMap[vAlign]) {
            tdStyles += `vertical-align: ${vAlignMap[vAlign]};`;
        } else {
            tdStyles += 'vertical-align: top;'; 
        }

        html += `<td style="${tdStyles}">`;
        
        const cellContentElements: UdfConcreteElement[] = [];
        if (cellNode.paragraph) {
            (Array.isArray(cellNode.paragraph) ? cellNode.paragraph : [cellNode.paragraph])
                .forEach(p => { if(p) cellContentElements.push({ paragraph: p }); });
        }
        if (cellNode.image) { // Block images in cells
            (Array.isArray(cellNode.image) ? cellNode.image : [cellNode.image])
                .forEach(img => { if(img) cellContentElements.push({ image: img }); });
        }
        if (cellNode.table) { // Nested tables
            (Array.isArray(cellNode.table) ? cellNode.table : [cellNode.table])
                .forEach(tab => { if(tab) cellContentElements.push({ table: tab }); });
        }
        
        // Process cell content elements in their XML order
        cellContentElements.forEach(el => {
            html += generateHtmlForUdfElement(el, stylesMap, hvlDefaultStyle, mainCdataText);
        });
        if (cellContentElements.length === 0) {
            html += ' '; // Non-breaking space for empty cells
        }

        html += "</td>";
      });
      html += "</tr>";
    });
    html += "</table>";
  }
  return html;
}

// Helper to reconstruct UDF element data from preserveOrder parser output
function reconstructUdfElementData(orderedItemDataArray: any[]): any {
    if (!orderedItemDataArray || !Array.isArray(orderedItemDataArray) || orderedItemDataArray.length === 0) {
        return {};
    }
    // The first item usually contains attributes.
    // Subsequent items might represent children, which themselves would be arrays of tag definitions.
    // This is a simplified reconstruction. For deeply nested structures, this needs more robust parsing.
    let reconstructedData: any = { ...orderedItemDataArray[0] }; // Start with attributes

    // Iterate over the rest of the array to find child elements
    for (let i = 1; i < orderedItemDataArray.length; i++) {
        const childGroup = orderedItemDataArray[i];
        if (typeof childGroup === 'object' && childGroup !== null) {
            for (const childTagName in childGroup) {
                if (Object.prototype.hasOwnProperty.call(childGroup, childTagName) && childTagName !== '#text') {
                    const childDataArray = childGroup[childTagName];
                    if (Array.isArray(childDataArray)) {
                        // Reconstruct each child and add it to the parent
                        reconstructedData[childTagName] = childDataArray.map(childItemParts => 
                            reconstructUdfElementData(childItemParts)
                        );
                        // If only one child of this type, don't make it an array unless isArray says so for this path
                        // This part depends heavily on how `isArray` is configured for `preserveOrder` too.
                        // For simplicity now, we'll keep it as an array if multiple exist.
                        if (reconstructedData[childTagName].length === 1) {
                           // Check standard isArray logic if this specific child should be an array
                           // This is complex; for now, let's assume parser's isArray handles it if children are multiple
                        }
                    }
                }
            }
        }
    }
    return reconstructedData;
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
  const commonParserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "#cdata",
    parseTagValue: true, // Parses numbers and booleans if possible
    trimValues: false,   // Preserve spaces unless CDATA
  };

  const orderedParserOptions = {
    ...commonParserOptions,
    preserveOrder: true,
    isArray: (tagName: string, jPath: string): boolean => {
      // For preserveOrder, parser output for children is an array of objects like { tagName: [attributes, children] }
      // We primarily need to define what UDF considers an array (e.g., multiple <style> or <row>)
      if (jPath === "template.styles" && tagName === "style") return true;
      const parentPath = jPath.substring(0, jPath.lastIndexOf('.'));
      if (parentPath.endsWith("paragraph") && ["content", "field", "space", "tab", "image"].includes(tagName)) return true;
      if ((parentPath.endsWith("table") || parentPath.endsWith("table_no")) && tagName === "row") return true;
      if (parentPath.endsWith("row") && tagName === "cell") return true;
      if (parentPath.endsWith("cell") && ["paragraph", "image", "table", "table_no"].includes(tagName)) return true;
      if (jPath === "template.footer" && tagName === "paragraph") return true;
      return false; // Most other things are single or handled by preserveOrder's structure
    },
    // Stop nodes might not be necessary if we filter text nodes during processing
  };

  const standardParserOptions = {
    ...commonParserOptions,
    isArray: (tagName: string, jPath: string): boolean => {
      // When not preserving order, explicitly define arrays for multiple elements at the same level
      if (jPath === "template.elements" && ["element", "paragraph", "table", "image", "table_no"].includes(tagName)) return true;
      // Other array definitions are the same as in orderedParserOptions
      if (jPath === "template.styles" && tagName === "style") return true;
      const parentPath = jPath.substring(0, jPath.lastIndexOf('.'));
      if (parentPath.endsWith("paragraph") && ["content", "field", "space", "tab", "image"].includes(tagName)) return true;
      if ((parentPath.endsWith("table") || parentPath.endsWith("table_no")) && tagName === "row") return true;
      if (parentPath.endsWith("row") && tagName === "cell") return true;
      if (parentPath.endsWith("cell") && ["paragraph", "image", "table", "table_no"].includes(tagName)) return true;
      if (jPath === "template.footer" && tagName === "paragraph") return true;
      return false;
    }
  };

  let parsedXmlObj: any;
  let usesPreserveOrder = false;
  try {
    console.log("parseUdfFileContent: Standart parser ile deneme başlıyor.");
    const tempStandardParser = new XMLParser(standardParserOptions);
    const tempParsed = tempStandardParser.parse(xmlString);
    console.log("parseUdfFileContent: Standart parser ile deneme başarılı.");

    const elementsNodeTest = tempParsed.template?.elements;
    if (elementsNodeTest && !Array.isArray(elementsNodeTest.element) &&
        (elementsNodeTest.paragraph || elementsNodeTest.table || elementsNodeTest.image || elementsNodeTest.table_no)) {
      console.log("parseUdfFileContent: preserveOrder ile yeniden parse ediliyor.");
      const orderedParser = new XMLParser(orderedParserOptions);
      parsedXmlObj = orderedParser.parse(xmlString);
      usesPreserveOrder = true;
      console.log("parseUdfFileContent: preserveOrder ile yeniden parse etme başarılı.");
    } else {
      parsedXmlObj = tempParsed;
      console.log("parseUdfFileContent: Standart parse yeterli oldu.");
    }
  } catch (error: any) {
    console.error("parseUdfFileContent içinde XML parser hatası:", error.message, error.stack, error); // Daha fazla detay
    throw new Error(`UDF XML dosyası ayrıştırılamadı: ${(error as Error).message}`);
  }

  if (!parsedXmlObj || !parsedXmlObj.template) {
    throw new Error("UDF dosyasının şablon yapısı geçerli değil veya ayrıştırma başarısız.");
  }

  // The root 'template' object. With preserveOrder, it's often the first element of an array.
  const udfTemplateSource = usesPreserveOrder ? parsedXmlObj.template[0] : parsedXmlObj.template;

  // Construct the UdfTemplate object that the rest of the code expects
  const udfTemplate: UdfTemplate = {
    "@_format_id": udfTemplateSource["@_format_id"],
    content: udfTemplateSource.content,
    properties: udfTemplateSource.properties,
    styles: udfTemplateSource.styles,
    footer: udfTemplateSource.footer,
    elements: { // elements will be populated based on parsing strategy
        // For standard parsing, udfTemplateSource.elements can be used directly if it matches UdfElementsNode
        // For preserveOrder, it will be constructed from the ordered list.
    },
  };

  const elementsToProcess: UdfConcreteElement[] = [];
  const rawElementsContainer = udfTemplateSource.elements; // This is template.elements node

  if (rawElementsContainer) {
    if (usesPreserveOrder) {
        // rawElementsContainer with preserveOrder is an array of element definitions like [{tagName: [attrObj, childObj]}, ...]
        // or an object like { '#text': [{tagName: [...]}, ...] } if mixed with text nodes (should be rare at this level)
        let orderedElementDefinitions: any[] = [];
        
        if (Array.isArray(rawElementsContainer)) { // e.g. elements: [ {p:...}, {table:...} ]
            orderedElementDefinitions = rawElementsContainer;
        } else if (typeof rawElementsContainer === 'object' && rawElementsContainer !== null) {
            // It might be nested, e.g., elements: { '#text': [ {p:...}, {table:...} ] }
            // Or elements: { element: [ {p:...}, {table:...} ] } if <element> tags are used WITH preserveOrder
            const keys = Object.keys(rawElementsContainer);
            if (keys.length > 0 && Array.isArray(rawElementsContainer[keys[0]])) {
                orderedElementDefinitions = rawElementsContainer[keys[0]];
            }
        }

        orderedElementDefinitions.forEach((elementDef) => {
            const tagName = Object.keys(elementDef)[0]; // "paragraph", "table", "element", etc.
            // elementDef[tagName] is an array: [attributesObject, childrenObject1, childrenObject2, ...]
            const itemPartsArray = elementDef[tagName]; 
            
            if (itemPartsArray && Array.isArray(itemPartsArray)) {
                 const itemData = reconstructUdfElementData(itemPartsArray);

                if (tagName === "element" && itemData) {
                     // If <element> wrapper itself is in the ordered list
                    const concreteChildTag = Object.keys(itemData).find(key => !key.startsWith('@_')); // Find first non-attribute key
                    if (concreteChildTag && itemData[concreteChildTag]) {
                        const actualElementName = (concreteChildTag === 'table_no' ? 'table' : concreteChildTag) as keyof UdfConcreteElement;
                        if (['paragraph', 'table', 'image'].includes(actualElementName)) {
                           elementsToProcess.push({ [actualElementName]: itemData[concreteChildTag] } as UdfConcreteElement);
                        }
                    }
                } else if (['paragraph', 'table', 'image', 'table_no'].includes(tagName)) {
                    const actualElementName = (tagName === 'table_no' ? 'table' : tagName) as keyof UdfConcreteElement;
                    elementsToProcess.push({ [actualElementName]: itemData } as UdfConcreteElement);
                }
            }
        });
        // Assign the processed (and now ordered) elements back to our udfTemplate.elements
        // This structure might not perfectly match UdfElementsNode if we only fill `element` array
        udfTemplate.elements = { element: elementsToProcess };


    } else { // Standard parsing was sufficient (likely <element> wrappers or non-mixed direct children)
        const stdElementsNode = udfTemplateSource.elements; // This should conform to UdfElementsNode
        udfTemplate.elements = stdElementsNode; // Assign directly

        if (Array.isArray(stdElementsNode.element)) {
            elementsToProcess.push(...stdElementsNode.element.filter((el: any) => el));
        } else { // Fallback for direct children if no <element> array
            (['paragraph', 'table', 'table_no', 'image'] as const).forEach(elementType => {
                const items = stdElementsNode[elementType as keyof typeof stdElementsNode];
                if (items) {
                    const itemsArray = Array.isArray(items) ? items : [items];
                    itemsArray.forEach(item => {
                        if (item) {
                            const type = (elementType === 'table_no' ? 'table' : elementType) as keyof UdfConcreteElement;
                            elementsToProcess.push({ [type]: item } as UdfConcreteElement);
                        }
                    });
                }
            });
             if (stdElementsNode.element && !Array.isArray(stdElementsNode.element)) { // Single <element>
                 if (stdElementsNode.element) elementsToProcess.push(stdElementsNode.element);
            }
        }
    }
  }


  const cdataFromUdf = udfTemplate.content?.['#cdata'] || '';
  const stylesMap = new Map<string, UdfStyleAttribute>();
  // ... (stylesMap and hvlDefaultStyle logic remains the same)
  if (udfTemplate.styles?.style) {
    const stylesArray = Array.isArray(udfTemplate.styles.style) ? udfTemplate.styles.style : [udfTemplate.styles.style];
    stylesArray.forEach((s: UdfStyleAttribute) => {
      if (s && s['@_name']) { stylesMap.set(s['@_name'], s); }
    });
  }
  const hvlDefaultStyleFromParsed = stylesMap.get('hvl-default') || stylesMap.get('default');
  const defaultTemplateStylesArray = Array.isArray(DEFAULT_UDF_TEMPLATE_CONTENT.template.styles.style)
    ? DEFAULT_UDF_TEMPLATE_CONTENT.template.styles.style
    : [DEFAULT_UDF_TEMPLATE_CONTENT.template.styles.style];
  const hvlDefaultStyleFromConstant = defaultTemplateStylesArray.find(s => s && s['@_name'] === 'hvl-default');
  const hvlDefaultStyle = hvlDefaultStyleFromParsed || hvlDefaultStyleFromConstant;

  let htmlResult = "";
  elementsToProcess.forEach((el) => {
    if (el) { // Ensure element is not null/undefined
      htmlResult += generateHtmlForUdfElement(el, stylesMap, hvlDefaultStyle, cdataFromUdf);
    }
  });

  if (udfTemplate.footer?.paragraph) {
    htmlResult += "<hr style='margin: 20px 0; border-top: 1px dashed #ccc;' /><div><strong>--- Footer ---</strong></div>";
    const footerParas = Array.isArray(udfTemplate.footer.paragraph)
      ? udfTemplate.footer.paragraph
      : [udfTemplate.footer.paragraph];
    footerParas.forEach(p => {
      if (p) { // Ensure paragraph object is valid
        htmlResult += generateHtmlForUdfElement({ paragraph: p }, stylesMap, hvlDefaultStyle, cdataFromUdf);
      }
    });
  }

  return {
    html: htmlResult || '<p> </p>',
    udfTemplate: udfTemplate, // Return the (potentially reconstructed) UdfTemplate
    mainCdata: cdataFromUdf,
    stylesMap,
    hvlDefaultStyle
  };
};

/**
 * Extracts text from HTML for CDATA.
 */
export const extractTextForCdataFromHtml = (editorHtml: string): string => {
    if (typeof document === 'undefined') {
        console.warn("document is not defined. extractTextForCdataFromHtml might not work as expected.");
        return editorHtml.replace(/<[^>]+>/g, ''); // Basic strip tags
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorHtml;
    let extractedText = "";
    const blockElements = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'PRE', 'BLOCKQUOTE', 'FIGURE', 'TABLE', 'HR'];

    function getTextNodes(node: Node, currentBlockText: string[]): void {
        if (node.nodeType === Node.TEXT_NODE) {
            currentBlockText.push(node.textContent || "");
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.tagName === 'BR') {
                currentBlockText.push('\n');
            } else if (element.tagName === 'FIGURE' && element.classList.contains('image')) {
                currentBlockText.push("￼"); // Object Replacement Character
            } else if (element.tagName === 'TABLE') {
                currentBlockText.push("[TABLO]");
            } else {
                if (blockElements.includes(element.tagName) && extractedText.length > 0 && !extractedText.endsWith('\n\n')) {
                     if(!extractedText.endsWith('\n')) extractedText += '\n';
                }
                let childBlockText: string[] = [];
                node.childNodes.forEach(child => getTextNodes(child, childBlockText));
                currentBlockText.push(childBlockText.join(""));
                if (blockElements.includes(element.tagName)) {
                    currentBlockText.push('\n');
                }
            }
        }
    }
    let rootText: string[] = [];
    tempDiv.childNodes.forEach(child => getTextNodes(child, rootText));
    extractedText = rootText.join("");
    extractedText = extractedText.replace(/\n\s*\n\s*\n+/g, '\n\n'); 
    extractedText = extractedText.replace(/\n\n+/g, '\n'); 
    return extractedText.trim();
};

/**
 * Builds the UDF XML content for download.
 */
export const buildUdfXmlForDownload = (
  currentUdfData: UdfTemplate,
  editorHtml: string
): string => {
  const extractedTextForCdata = extractTextForCdataFromHtml(editorHtml);
  // It's safer to work with a deep copy to avoid mutating the original state object
  const dataToBuild: UdfTemplate = JSON.parse(JSON.stringify(currentUdfData));
  
  if (!dataToBuild.content) {
    dataToBuild.content = { '#cdata': extractedTextForCdata };
  } else {
    dataToBuild.content['#cdata'] = extractedTextForCdata;
  }

  // Ensure essential parts from default template exist if missing
  if (!dataToBuild.elements) dataToBuild.elements = JSON.parse(JSON.stringify(DEFAULT_UDF_TEMPLATE_CONTENT.template.elements));
  if (!dataToBuild.styles) dataToBuild.styles = JSON.parse(JSON.stringify(DEFAULT_UDF_TEMPLATE_CONTENT.template.styles));
  if (!dataToBuild.properties) dataToBuild.properties = JSON.parse(JSON.stringify(DEFAULT_UDF_TEMPLATE_CONTENT.template.properties));

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true, 
    cdataPropName: "#cdata",
    suppressEmptyNode: true, 
    suppressBooleanAttributes: false, 
    processEntities: false, 
  });

  const xmlObjectToBuild = { template: dataToBuild };
  const contentXml = builder.build(xmlObjectToBuild);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${contentXml}`;
};