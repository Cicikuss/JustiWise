import React, { useState, useMemo, useCallback, useRef, FC } from "react";
import JSZip from "jszip";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Typography,
  Alert,
  AppBar,
  Toolbar,
} from "@mui/material";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'; // Use default import for compatibility
import type { Editor } from '@ckeditor/ckeditor5-core';       // Generic Editor type for callbacks
import type { EventInfo } from '@ckeditor/ckeditor5-utils';     // Event type for onChange

import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

// --- UDF Type Definitions (Remain the same) ---
interface UdfStyleAttribute {
  "@_name": string;
  "@_description"?: string;
  "@_family"?: string;
  "@_size"?: string;
  "@_bold"?: "true" | "false" | boolean;
  "@_italic"?: "true" | "false" | boolean;
  "@_underline"?: "true" | "false" | boolean;
  "@_foreground"?: string;
  "@_resolver"?: string;
  "@_LineSpacing"?: string;
  "@_SpaceAbove"?: string;
  "@_SpaceBelow"?: string;
  "@_LeftIndent"?: string;
  "@_RightIndent"?: string;
  "@_Alignment"?: "0" | "1" | "2" | "3" | 0 | 1 | 2 | 3;
  "@_FirstLineIndent"?: string;
  "@_TabSet"?: string;
}

interface UdfPageFormat {
  "@_mediaSizeName": string;
  "@_leftMargin": string;
  "@_rightMargin": string;
  "@_topMargin": string;
  "@_bottomMargin": string;
  "@_paperOrientation": string;
  "@_headerFOffset": string;
  "@_footerFOffset": string;
}

interface UdfTextSegmentProps {
  "@_startOffset": string;
  "@_length": string;
  "@_family"?: string;
  "@_size"?: string;
  "@_bold"?: "true" | "false" | boolean;
  "@_italic"?: "true" | "false" | boolean;
  "@_underline"?: "true" | "false" | boolean;
  "@_fieldType"?: string;
  "@_fieldName"?: string;
  "@_isList"?: "true" | "false" | boolean;
  "@_resolver"?: string;
  "@_header"?: "true" | "false" | boolean;
}

interface UdfImageProps {
  "@_imageData": string;
  "@_startOffset"?: string;
  "@_length"?: string;
  "@_Alignment"?: "0" | "1" | "2" | "3" | 0 | 1 | 2 | 3;
}

interface UdfParagraphElement {
  "@_resolver"?: string;
  "@_LeftIndent"?: string;
  "@_RightIndent"?: string;
  "@_Alignment"?: "0" | "1" | "2" | "3" | 0 | 1 | 2 | 3;
  "@_SpaceAbove"?: string;
  "@_SpaceBelow"?: string;
  "@_FirstLineIndent"?: string;
  "@_LineSpacing"?: string;
  "@_TabSet"?: string;
  "@_Numbered"?: "true" | "false" | boolean;
  "@_Bulleted"?: "true" | "false" | boolean;
  "@_ListLevel"?: string;
  "@_ListId"?: string;
  "@_SecListTypeLevel1"?: string;
  "@_NumberType"?: string;
  "@_description"?: string;
  "@_family"?: string;
  "@_size"?: string;
  content?: UdfTextSegmentProps | UdfTextSegmentProps[];
  field?: UdfTextSegmentProps | UdfTextSegmentProps[];
  space?: UdfTextSegmentProps | UdfTextSegmentProps[];
  tab?: UdfTextSegmentProps | UdfTextSegmentProps[];
  image?: UdfImageProps | UdfImageProps[];
}

interface UdfCellElement {
  "@_Alignment"?: "0" | "1" | "2" | "3" | 0 | 1 | 2 | 3;
  paragraph?: UdfParagraphElement | UdfParagraphElement[];
  image?: UdfImageProps | UdfImageProps[];
  table?: UdfTableElement | UdfTableElement[];
}

interface UdfRowElement {
  "@_rowType"?: string;
  "@_rowName"?: string;
  "@_height"?: string;
  cell: UdfCellElement | UdfCellElement[];
  [key: string]: any;
}

interface UdfTableElement {
  "@_tableName"?: string;
  "@_columnCount"?: string;
  "@_border"?: string;
  "@_columnSpans"?: string;
  "@_rowSpans"?: string;
  row: UdfRowElement | UdfRowElement[];
  [key: string]: any;
}

interface UdfConcreteElement {
  paragraph?: UdfParagraphElement;
  table?: UdfTableElement;
  image?: UdfImageProps;
}

interface UdfElementsNode {
  "@_resolver"?: string;
  element?: UdfConcreteElement[];
  paragraph?: UdfParagraphElement | UdfParagraphElement[];
  table?: UdfTableElement | UdfTableElement[];
  image?: UdfImageProps | UdfImageProps[];
}

interface UdfFooterNode {
  paragraph: UdfParagraphElement | UdfParagraphElement[];
}

interface UdfTemplate {
  "@_format_id": string;
  content: { "#cdata": string };
  properties: {
    pageFormat: UdfPageFormat;
  };
  elements: UdfElementsNode;
  styles: {
    style: UdfStyleAttribute[] | UdfStyleAttribute;
  };
  footer?: UdfFooterNode;
}

interface ParsedUdfXml {
  template: UdfTemplate;
}

const DEFAULT_UDF_TEMPLATE_CONTENT: ParsedUdfXml = { /* ... as before ... */
  template: {
    "@_format_id": "1.8",
    content: { "#cdata": "" },
    properties: {
      pageFormat: {
        "@_mediaSizeName": "1",
        "@_leftMargin": "42.51968479156494",
        "@_rightMargin": "28.34645652770996",
        "@_topMargin": "14.17322826385498",
        "@_bottomMargin": "14.17322826385498",
        "@_paperOrientation": "1",
        "@_headerFOffset": "20.0",
        "@_footerFOffset": "20.0",
      },
    },
    elements: {
      "@_resolver": "hvl-default",
      element: [],
    },
    styles: {
      style: [
        {
          "@_name": "default",
          "@_description": "Geçerli",
          "@_family": "Dialog",
          "@_size": "12",
        },
        {
          "@_name": "hvl-default",
          "@_family": "Times New Roman",
          "@_size": "12",
          "@_description": "Gövde",
        },
      ],
    },
  },
};

const escapeHtml = (text: string | undefined | null): string => { /* ... as before ... */
  if (text === undefined || text === null) return '';
  return String(text)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&apos;');
};

const getElementStyles = ( /* ... as before ... */
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
      if (alignment === '1') styleString += 'text-align: center;';
      else if (alignment === '3') styleString += 'text-align: right;';
      else if (alignment === '0') styleString += 'text-align: left;';
      else if (alignment === '2') styleString += 'text-align: justify;';
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

const generateSpanForUdfTextSegment = ( /* ... as before ... */
    itemProps: UdfTextSegmentProps,
    elementType: 'content' | 'field' | 'space' | 'tab',
    cdataText: string,
    stylesMap: Map<string, UdfStyleAttribute>
): string => {
    const startOffset = parseInt(itemProps['@_startOffset'], 10);
    const length = parseInt(itemProps['@_length'], 10);
    let textContent: string;

    if (isNaN(startOffset) || isNaN(length) || !cdataText || startOffset < 0 || length < 0 || (startOffset + length > cdataText.length) ) {
        console.warn(`Invalid offset/length for ${elementType}:`, itemProps, `CDATALen: ${cdataText?.length}`);
        if (length === 0 && !isNaN(startOffset) && startOffset <= cdataText.length) {
             textContent = "";
        } else {
            textContent = `[${elementType} ERR]`;
        }
    } else {
        textContent = cdataText.substring(startOffset, startOffset + length);
    }
    
    if (elementType === 'space') {
        return ' '.repeat(Math.max(0,length || 1)); 
    }
    if (elementType === 'tab') {
        return '\u0009'.repeat(Math.max(0,length || 1));
    }

    const spanStyles = getElementStyles(itemProps, stylesMap, undefined, true);

    if (spanStyles) {
        return `<span style="${spanStyles}">${escapeHtml(textContent)}</span>`;
    }
    return escapeHtml(textContent);
};

const generateHtmlForUdfElement = ( /* ... as before ... */
    udfElement: UdfConcreteElement,
    stylesMap: Map<string, UdfStyleAttribute>,
    hvlDefaultStyle: UdfStyleAttribute | undefined,
    mainCdataText: string
): string => {
  if (!udfElement) return '';
  let html = '';

  if (udfElement.paragraph) {
    const paraProps = udfElement.paragraph;
    let paragraphInnerHTML = '';

    type ParagraphChild = { type: 'content' | 'field' | 'space' | 'tab' | 'image', props: UdfTextSegmentProps | UdfImageProps, startOffset?: number, origIndex: number, isImage?: boolean };
    const allChildren: ParagraphChild[] = [];

    // 1. XML parse edilirken, original index'i her zaman kaydet
    (['content', 'field', 'space', 'tab'] as const).forEach(type => {
      const items = paraProps[type];
      if (items) {
        (Array.isArray(items) ? items : [items]).forEach((item, idx) => {
          if (item) { 
            const offset = item['@_startOffset'] !== undefined ? Number(item['@_startOffset']) : undefined;
            allChildren.push({ 
              type, 
              props: item, 
              startOffset: offset, 
              origIndex: allChildren.length,
              // Resim için bir bayrak ekleyelim
              isImage: false
            });
          }
        });
      }
    });
    if (paraProps.image) {
      const items = Array.isArray(paraProps.image) ? paraProps.image : [paraProps.image];
      items.forEach((item, idx) => {
        if(item) {
          const offset = item['@_startOffset'] !== undefined ? Number(item['@_startOffset']) : undefined;
          allChildren.push({ 
            type: 'image', 
            props: item, 
            startOffset: offset, 
            origIndex: allChildren.length,
            isImage: true
          });
        }
      });
    }

    // 2. Sıralama stratejisi: 
    // - Resimleri ayrı tut, orijinal index'lerine göre sırala
    // - Metin içeriklerini offset'e göre sırala
    const images = allChildren.filter(child => child.isImage);
    const textContents = allChildren.filter(child => !child.isImage);

    // Metin içeriklerini offset'e göre sırala
    textContents.sort((a, b) => {
      if (typeof a.startOffset === 'number' && typeof b.startOffset === 'number') {
        return a.startOffset - b.startOffset;
      }
      // Eğer offset yoksa, orijinal sırayı kullan
      return a.origIndex - b.origIndex;
    });

    // Resimleri orijinal sıralarına göre tut
    images.sort((a, b) => a.origIndex - b.origIndex);

    // Tüm içeriği birleştir
    // const sortedChildren = [...textContents, ...images];

    // Yerine şunu koy:

    // Yeni approach: Hepsini offset'e göre sırala, offset yoksa original index'e göre
    allChildren.sort((a, b) => {
      // Her ikiside offset'e sahipse, offset'e göre sırala
      if (typeof a.startOffset === 'number' && typeof b.startOffset === 'number') {
        return a.startOffset - b.startOffset;
      }
      
      // Sadece biri offset'e sahipse, offset'i olan önce gelsin
      if (typeof a.startOffset === 'number') return -1;
      if (typeof b.startOffset === 'number') return 1;
      
      // İkisinin de offset'i yoksa, orijinal sıraya göre sırala
      return a.origIndex - b.origIndex;
    });

    // Sıralanmış tüm children'ı doğrudan kullan
    const sortedChildren = allChildren;

    sortedChildren.forEach(child => {
      if (child.type === 'image' && (child.props as UdfImageProps)['@_imageData']) {
        const imgProps = child.props as UdfImageProps;
        let mime = 'image/png';
        if (String(imgProps['@_imageData']).startsWith('/9j/')) mime = 'image/jpeg';
        paragraphInnerHTML += `<img src="data:${mime};base64,${imgProps['@_imageData']}" alt="Gömülü Resim" style="max-height: 1.5em; vertical-align: text-bottom; margin: 0 0.1em;" />`;
      } else if (['content', 'field', 'space', 'tab'].includes(child.type)) {
        paragraphInnerHTML += generateSpanForUdfTextSegment(child.props as UdfTextSegmentProps, child.type as 'content' | 'field' | 'space' | 'tab', mainCdataText, stylesMap);
      }
    });

    const paragraphBlockStyle = getElementStyles(paraProps, stylesMap, hvlDefaultStyle, false);
    html += `<p style="${paragraphBlockStyle}">${paragraphInnerHTML || ' '}</p>`;
  }
  else if (udfElement.image) {
    const props = udfElement.image;
    if (props['@_imageData']) {
      let mime = 'image/png';
      if(String(props['@_imageData']).startsWith('/9j/')) mime = 'image/jpeg';
      
      let figureStyles = getElementStyles(props, stylesMap, hvlDefaultStyle, false);
      if (!figureStyles.includes('text-align:')) {
          figureStyles += 'text-align: center;';
      }
      figureStyles += 'margin: 0.5em auto;';
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
                tdStyles += 'padding: 5px;';
            }
            tdStyles += getElementStyles(cellNode, stylesMap, hvlDefaultStyle, false);
            
            html += `<td style="${tdStyles}">`;
            
            const cellChildren: { type: string, props: any, startOffset?: number }[] = [];

if (cellNode.paragraph) {
    const paras = Array.isArray(cellNode.paragraph) ? cellNode.paragraph : [cellNode.paragraph];
    paras.forEach(p => {
        const paraProps = p;
        const paraChildren: { type: string; props: any; xmlIndex: number; }[] = [];
        
        // 1. TÜM ÖĞELER İÇİN KOD DÜZENLE - Resimleri ve metin parçalarını aynı şekilde ele alıyoruz
        
        // XML'de görünen sırada öğeleri ekle (önce resimler)
        if (paraProps.image) {
            const items = Array.isArray(paraProps.image) ? paraProps.image : [paraProps.image];
            items.forEach((item, idx) => {
                if (item) {
                    paraChildren.push({ type: 'image', props: item, xmlIndex: paraChildren.length });
                }
            });
        }
        
        // Ardından metin öğelerini XML'deki sırada ekle
        (['content', 'field', 'space', 'tab'] as const).forEach(type => {
            const items = paraProps[type];
            if (items) {
                (Array.isArray(items) ? items : [items]).forEach((item, idx) => {
                    if (item) {
                        paraChildren.push({ type, props: item, xmlIndex: paraChildren.length });
                    }
                });
            }
        });
        
        // 2. ÖĞELERİ XML'DEKİ SIRAYLA İŞLE - Offset değerlerini kullanmıyoruz
        // paraChildren.sort((a, b) => a.xmlIndex - b.xmlIndex);
        
        // 3. PARAGRAFTAKİ TÜM ÖĞELERİ RENDER ET
        let paraHTML = '';
        paraChildren.forEach(child => {
            if (child.type === 'image' && child.props['@_imageData']) {
                let mime = 'image/png';
                if (String(child.props['@_imageData']).startsWith('/9j/')) mime = 'image/jpeg';
                paraHTML += `<img src="data:${mime};base64,${child.props['@_imageData']}" alt="Gömülü Resim" style="max-height: 5em; vertical-align: middle;" />`;
            } else if (['content', 'field', 'space', 'tab'].includes(child.type)) {
                paraHTML += generateSpanForUdfTextSegment(
                    child.props, 
                    child.type as 'content' | 'field' | 'space' | 'tab',
                    mainCdataText, 
                    stylesMap
                );
            }
        });
        
        const paragraphStyle = getElementStyles(paraProps, stylesMap, hvlDefaultStyle, false);
        html += `<p style="${paragraphStyle}">${paraHTML || '&nbsp;'}</p>`;
    });
}

// Eğer hücrede direkt resim varsa (paragraf içinde değil)
if (cellNode.image) {
    const images = Array.isArray(cellNode.image) ? cellNode.image : [cellNode.image];
    images.forEach(img => {
        if (img['@_imageData']) {
            let mime = 'image/png';
            if (String(img['@_imageData']).startsWith('/9j/')) mime = 'image/jpeg';
            html += `<figure class="image" style="text-align: center;"><img src="data:${mime};base64,${img['@_imageData']}" alt="Tablo İçi Resim" style="max-width: 100%;" /></figure>`;
        }
    });
}
            cellChildren.forEach(childEl => {
                // Convert { type, props } to UdfConcreteElement shape
                let udfElement: UdfConcreteElement | null = null;
                if (childEl.type === 'paragraph') {
                    udfElement = { paragraph: childEl.props };
                } else if (childEl.type === 'image') {
                    udfElement = { image: childEl.props };
                } else if (childEl.type === 'table') {
                    udfElement = { table: childEl.props };
                } else if (['content', 'field', 'space', 'tab'].includes(childEl.type)) {
                    // Wrap in a paragraph for inline text segments
                    udfElement = { paragraph: { [childEl.type]: childEl.props } as UdfParagraphElement };
                }
                if (udfElement) {
                    html += generateHtmlForUdfElement(udfElement, stylesMap, hvlDefaultStyle, mainCdataText);
                }
            });
            html += "</td>";
          });
        }
        html += "</tr>";
      });
    }
    html += "</table>";
  }
  return html;
};

const UdfEditor: FC = () => {
  const [udfXmlData, setUdfXmlData] = useState<UdfTemplate | null>(null);
  const [mainCdata, setMainCdata] = useState<string>('');
  const [editorData, setEditorData] = useState<string>('');
  const [fileName, setFileName] = useState<string>("yeni_belge.udf");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const editorInstanceRef = useRef<ClassicEditor | null>(null); // Store the specific ClassicEditor instance

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const themeColors = useMemo(() => ({ /* ... as before ... */
    background: theme.palette.background.default,
    surface: theme.palette.background.paper,
    surfaceVariant: isDark ? '#303030' : '#f5f5f5',
    text: theme.palette.text.primary,
    primary: theme.palette.primary.main,
    secondary: theme.palette.success.main,
    border: theme.palette.divider,
  }), [theme, isDark]);

  const handleNewDocument = useCallback(() => { /* ... as before ... */
    setEditorData('<p> </p>'); 
    const newDocParsed: ParsedUdfXml = JSON.parse(JSON.stringify(DEFAULT_UDF_TEMPLATE_CONTENT));
    setUdfXmlData(newDocParsed.template);
    setMainCdata(newDocParsed.template.content['#cdata'] || '');
    setFileName("yeni_belge.udf");
    setErrorMessage(null);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { /* ... as before ... */
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setEditorData('');
    setUdfXmlData(null);
    setMainCdata('');

    if (!file.name.toLowerCase().endsWith('.udf')) {
      setErrorMessage("Lütfen bir .udf dosyası seçin.");
      return;
    }

    try {
      const zip = await JSZip.loadAsync(file);
      const xmlFile = zip.file("content.xml");
      
      if (!xmlFile) {
        throw new Error("UDF dosyasında 'content.xml' bulunamadı.");
      }
      const xmlString = await xmlFile.async("text");

      const parser = new XMLParser({ 
        ignoreAttributes: false, 
        attributeNamePrefix: "@_",
        cdataPropName: "#cdata",
        parseTagValue: true, 
        trimValues: false, 
        isArray: (tagName: string, jPath: string, isLeafNode: boolean, isAttribute: boolean): boolean => {
            if (jPath === "template.elements" && tagName === "element") return true; 
            if (jPath === "template.elements") {
                 if (["paragraph", "table", "image"].includes(tagName)) return true;
            }
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
      
      setUdfXmlData(parsedXml.template);
      const cdataFromUdf = parsedXml.template.content?.['#cdata'] || '';
      setMainCdata(cdataFromUdf);

      let htmlResult = "";
      const stylesMap = new Map<string, UdfStyleAttribute>();
      if (parsedXml.template.styles?.style) {
        (Array.isArray(parsedXml.template.styles.style) ? parsedXml.template.styles.style : [parsedXml.template.styles.style])
          .forEach((s: UdfStyleAttribute) => stylesMap.set(s['@_name'], s));
      }

      const hvlDefaultStyleFromParsed = stylesMap.get('hvl-default') || stylesMap.get('default');
      const hvlDefaultStyleFromConstant = (Array.isArray(DEFAULT_UDF_TEMPLATE_CONTENT.template.styles.style)
                                ? DEFAULT_UDF_TEMPLATE_CONTENT.template.styles.style.find(s => s['@_name'] === 'hvl-default')
                                : (DEFAULT_UDF_TEMPLATE_CONTENT.template.styles.style['@_name'] === 'hvl-default'
                                    ? DEFAULT_UDF_TEMPLATE_CONTENT.template.styles.style
                                    : undefined));
      const hvlDefaultStyle = hvlDefaultStyleFromParsed || hvlDefaultStyleFromConstant;


      const elementsNode = parsedXml.template.elements;
      if (elementsNode) {
        const elementsToProcess: UdfConcreteElement[] = [];
        
        if (Array.isArray(elementsNode.element)) {
            elementsToProcess.push(...elementsNode.element);
        } 
        else { 
            (['paragraph', 'table', 'image'] as const).forEach(elementType => {
                const items = elementsNode[elementType];
                if (items) {
                    (Array.isArray(items) ? items : [items]).forEach(item => {
                        elementsToProcess.push({ [elementType]: item } as unknown as UdfConcreteElement);
                    });
                }
            });
        }

        elementsToProcess.forEach((el: UdfConcreteElement) => {
            htmlResult += generateHtmlForUdfElement(el, stylesMap, hvlDefaultStyle, cdataFromUdf);
        });
      }
      
      if (parsedXml.template.footer?.paragraph) {
        htmlResult += "<hr style='margin: 20px 0; border-top: 1px dashed #ccc;' /><div><strong>--- Footer ---</strong></div>";
        const footerParas = Array.isArray(parsedXml.template.footer.paragraph) 
            ? parsedXml.template.footer.paragraph 
            : [parsedXml.template.footer.paragraph];
            
        footerParas.forEach(p => {
            htmlResult += generateHtmlForUdfElement({ paragraph: p }, stylesMap, hvlDefaultStyle, cdataFromUdf);
        });
      }
      
      setEditorData(htmlResult || '<p> </p>');
      setFileName(file.name);

    } catch (error: any) {
      console.error("UDF dosyası okunurken hata:", error);
      setErrorMessage(`UDF dosyası okunurken bir hata oluştu: ${error.message}`);
      setUdfXmlData(null);
      setMainCdata('');
      setEditorData('');
    }
  };

  const handleDownload = async () => { /* ... as before ... */
    if (!udfXmlData) {
      setErrorMessage("Belge verisi yüklenmedi.");
      return;
    }
    setErrorMessage(null);
    
    const currentEditorHtml = editorInstanceRef.current ? editorInstanceRef.current.getData() : '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = currentEditorHtml;    
    let extractedTextForCdata = "";
    tempDiv.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, pre, blockquote, figure.image, table').forEach((el, index, arr) => {
        if (el.tagName === 'FIGURE' && el.classList.contains('image')) {
            extractedTextForCdata += "￼\n";
        } else if (el.tagName === 'TABLE') {
            extractedTextForCdata += "[TABLO]\n";
        }
        else {
             extractedTextForCdata += el.textContent || "";
        }
        if (index < arr.length -1 || el.tagName.startsWith('H') || ['P', 'DIV', 'LI', 'BLOCKQUOTE', 'FIGURE', 'TABLE'].includes(el.tagName)) {
            extractedTextForCdata += "\n";
        }
    });
    extractedTextForCdata = extractedTextForCdata.replace(/\n\n+/g, '\n').trim();


    const dataToBuild: UdfTemplate = { 
      ...udfXmlData,
      content: { '#cdata': extractedTextForCdata },
    };
    if (!dataToBuild.elements) dataToBuild.elements = DEFAULT_UDF_TEMPLATE_CONTENT.template.elements;
    if (!dataToBuild.styles) dataToBuild.styles = DEFAULT_UDF_TEMPLATE_CONTENT.template.styles;
    if (!dataToBuild.properties) dataToBuild.properties = DEFAULT_UDF_TEMPLATE_CONTENT.template.properties;

    try {
      const builder = new XMLBuilder({ 
        ignoreAttributes: false, 
        attributeNamePrefix: "@_",
        format: true,
        cdataPropName: "#cdata",
        suppressEmptyNode: true, 
      });

      const contentXml = builder.build({ template: dataToBuild });

      const zip = new JSZip();
      zip.file("content.xml", `<?xml version="1.0" encoding="UTF-8"?>\n${contentXml}`);
      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName.replace(/\.udf$/i, "_edited.udf") || "edited_document.udf";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { 
        URL.revokeObjectURL(link.href); 
        if (link.parentElement) {
          link.parentElement.removeChild(link);
        }
      }, 100);
    } catch (error: any) {
      console.error("UDF dosyası oluşturulurken hata:", error);
      setErrorMessage(`UDF dosyası oluşturulurken bir hata oluştu: ${error.message}`);
    }
  };

  return (
    <Box sx={{ /* ... as before ... */ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: themeColors.background,
    }}>
      <AppBar position="static" sx={{ bgcolor: themeColors.surface, borderBottom: `1px solid ${themeColors.border}` }}>
        {/* ... Toolbar as before ... */}
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div" sx={{ color: themeColors.primary, display: 'flex', alignItems: 'center' }}>
              UDF Editör (CKEditor 5)
            </Typography>
            <Button size="small" startIcon={<InsertDriveFileIcon />} sx={{ color: themeColors.text }} onClick={handleNewDocument}>Yeni</Button>
            <Button size="small" startIcon={<FolderOpenIcon />} component="label" htmlFor="file-upload-input-ck" sx={{ color: themeColors.text }}>Aç</Button>
            <input
              type="file"
              accept=".udf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload-input-ck"
            />
          </Box>
          <Button
            onClick={handleDownload}
            variant="contained"
            size="small"
            startIcon={<DownloadIcon />}
            sx={{
              backgroundColor: themeColors.secondary,
              color: theme.palette.getContrastText(themeColors.secondary),
              '&:hover': {
                backgroundColor: theme.palette.success.dark,
              },
            }}
            disabled={!udfXmlData}
          >
            UDF İndir
          </Button>
        </Toolbar>
      </AppBar>

      {errorMessage && ( /* ... as before ... */
        <Alert severity="error" sx={{ m: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ /* ... Editor area styling as before ... */ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2 }, 
          display: 'flex', 
          flexDirection: 'column',
          '& .ck-editor__main > .ck-editor__editable:not(.ck-focused)': { 
            borderColor: themeColors.border,
          },
          '& .ck-editor__main > .ck-editor__editable.ck-focused': { 
            borderColor: themeColors.primary,
            boxShadow: `0 0 0 1px ${themeColors.primary}`, 
          },
          '& .ck-editor__main > .ck-editor__editable': { 
            backgroundColor: isDark ? '#2b2b2b' : '#ffffff', 
            color: themeColors.text,
            minHeight: { xs: 'calc(100vh - 200px)', sm: 'calc(100vh - 180px)'}, 
            boxSizing: 'border-box',
            padding: '20px !important', 
            lineHeight: '1.7', 
          },
          '& .ck.ck-toolbar': {
            backgroundColor: themeColors.surfaceVariant,
            border: `1px solid ${themeColors.border}`,
            borderBottom: 'none', 
            boxShadow: 'none',
            '& .ck.ck-button, & .ck.ck-dropdown__button': {
                color: `${themeColors.text} !important`,
                '&:hover:not(.ck-disabled)': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                },
            },
            '& .ck.ck-button_on, & .ck.ck-button.ck-on': { 
                backgroundColor: `${isDark ? theme.palette.action.selected : theme.palette.primary.light} !important`,
                color: `${themeColors.text} !important`,
                 '& .ck-icon': {
                     color: `${themeColors.text} !important`, 
                 }
            },
            '& .ck.ck-icon': { 
                color: `${themeColors.text} !important`,
            },
          }
        }}>
        <CKEditor
            // Use the default import for ClassicEditor to match CKEditor React's expected type
            // @ts-expect-error: ClassicEditor type is compatible at runtime
            editor={ClassicEditor}
            data={editorData}
            onReady={(editor) => {
                // This editor instance is the one initialized by CKEditorReact.
                // It should be compatible with ClassicEditor if that's what was passed to 'editor' prop.
                editorInstanceRef.current = editor as unknown as ClassicEditor; // Cast to ClassicEditor for your ref
            }}
            onChange={(event, editor) => {
                const classicEditorInstance = editor as unknown as ClassicEditor; // Cast if you need ClassicEditor specific methods
                // const data = classicEditorInstance.getData();
            }}
            config={{ /* ... as before ... */
                toolbar: { 
                    items: [
                        'undo', 'redo', '|',
                        'heading', '|',
                        'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                        'bold', 'italic', 'underline', 'strikethrough', '|',
                        'alignment', '|',
                        'link', 'blockQuote', '|',
                        'bulletedList', 'numberedList', 'outdent', 'indent', '|',
                        'imageUpload', 'insertTable', 'mediaEmbed', '|',
                        'removeFormat', 
                    ],
                    shouldNotGroupWhenFull: true
                },
                image: { 
                    toolbar: [
                        'imageTextAlternative', 'toggleImageCaption', '|',
                        'imageStyle:inline', 'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight', 'imageStyle:block', '|',
                        'linkImage'
                    ],
                    styles: { options: [ 'inline', 'alignLeft', 'alignCenter', 'alignRight', 'block' ] }
                },
                table: { 
                    contentToolbar: [ 
                        'tableColumn', 'tableRow', 'mergeTableCells',
                        'tableCellProperties', 'tableProperties' 
                    ]
                },
                heading: { 
                    options: [
                        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
                    ]
                },
            }}
        />
      </Box>
    </Box>
  );
}

export default UdfEditor;