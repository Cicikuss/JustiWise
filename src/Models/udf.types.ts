// udf.types.ts

export interface UdfStyleAttribute {
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

export interface UdfPageFormat {
  "@_mediaSizeName": string;
  "@_leftMargin": string;
  "@_rightMargin": string;
  "@_topMargin": string;
  "@_bottomMargin": string;
  "@_paperOrientation": string;
  "@_headerFOffset": string;
  "@_footerFOffset": string;
}

export interface UdfTextSegmentProps {
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

export interface UdfImageProps {
  "@_imageData": string;
  "@_startOffset"?: string;
  "@_length"?: string;
  "@_Alignment"?: "0" | "1" | "2" | "3" | 0 | 1 | 2 | 3;
}

export interface UdfParagraphElement {
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
  image?: UdfImageProps | UdfImageProps[]; // Inline images within a paragraph
}

export interface UdfCellElement extends UdfStyleAttribute { // If cell can inherit/override styles
  "@_Alignment"?: "0" | "1" | "2" | "3" | 0 | 1 | 2 | 3;
  "@_vAlign"?: "0" | "1" | "2" | 0 | 1 | 2; // Vertical Alignment (0:Top, 1:Middle, 2:Bottom)
  // Other potential cell-specific attributes like @_colspan, @_rowspan, @_bgColor etc.
  paragraph?: UdfParagraphElement | UdfParagraphElement[];
  image?: UdfImageProps | UdfImageProps[]; // Block images directly in a cell
  table?: UdfTableElement | UdfTableElement[];
}

export interface UdfRowElement {
  "@_rowType"?: string;
  "@_rowName"?: string;
  "@_height"?: string;
  cell: UdfCellElement | UdfCellElement[];
  [key: string]: any; // For potential other attributes
}

export interface UdfTableElement {
  "@_tableName"?: string;
  "@_columnCount"?: string;
  "@_border"?: string;
  "@_columnSpans"?: string;
  "@_rowSpans"?: string;
  row: UdfRowElement | UdfRowElement[];
  [key: string]: any; // For potential other attributes
}

// Represents a concrete top-level element in the 'elements' node
export interface UdfConcreteElement {
  paragraph?: UdfParagraphElement;
  table?: UdfTableElement;
  image?: UdfImageProps; // Block-level image
}

export interface UdfElementsNode {
  "@_resolver"?: string;
  element?: UdfConcreteElement[]; // Used if elements are wrapped in <element>
  // Or, elements can be direct children:
  paragraph?: UdfParagraphElement | UdfParagraphElement[];
  table?: UdfTableElement | UdfTableElement[];
  image?: UdfImageProps | UdfImageProps[];
}

export interface UdfFooterNode {
  paragraph: UdfParagraphElement | UdfParagraphElement[];
}

export interface UdfTemplate {
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

export interface ParsedUdfXml {
  template: UdfTemplate;
}

// Helper type for children within a paragraph
export type UdfParagraphChild = 
  | { type: 'content'; props: UdfTextSegmentProps; startOffset?: number; origIndex: number }
  | { type: 'field'; props: UdfTextSegmentProps; startOffset?: number; origIndex: number }
  | { type: 'space'; props: UdfTextSegmentProps; startOffset?: number; origIndex: number }
  | { type: 'tab'; props: UdfTextSegmentProps; startOffset?: number; origIndex: number }
  | { type: 'image'; props: UdfImageProps; startOffset?: number; origIndex: number };