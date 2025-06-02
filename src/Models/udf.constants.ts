// udf.constants.ts
import type { ParsedUdfXml } from "./udf.types";

export const DEFAULT_UDF_TEMPLATE_CONTENT: ParsedUdfXml = {
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
      element: [], // Keep as element array for consistency if preferred, or allow direct para/table/image
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