import React, { useState, useMemo, useCallback, useRef, FC, useEffect } from "react"; // useEffect eklendi
import JSZip from "jszip";
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
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type { Editor as CKEditorCore } from '@ckeditor/ckeditor5-core'; // CKEditorCore olarak yeniden adlandırıldı

import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { DEFAULT_UDF_TEMPLATE_CONTENT } from "../../Models/udf.constants";
import { UdfTemplate } from "../../Models/udf.types";
// Import parseUdfFileContent and buildUdfXmlForDownload from util file
import { parseUdfFileContent, buildUdfXmlForDownload } from "../../Helper/udf.util";

// Type for the editor instance
type EditorInstance = {
  getData: () => string;
  setData: (data: string) => void;
};

const UdfEditor: FC = () => {
  const [udfXmlData, setUdfXmlData] = useState<UdfTemplate | null>(null);
  const [editorData, setEditorData] = useState<string>('');
  const [fileName, setFileName] = useState<string>("yeni_belge.udf");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const editorInstanceRef = useRef<EditorInstance | null>(null);

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const themeColors = useMemo(() => ({
    background: theme.palette.background.default,
    surface: theme.palette.background.paper,
    surfaceVariant: isDark ? '#303030' : '#f5f5f5',
    text: theme.palette.text.primary,
    primary: theme.palette.primary.main,
    secondary: theme.palette.success.main,
    border: theme.palette.divider,
  }), [theme, isDark]);

  const handleNewDocument = useCallback(() => {
    const newDocParsed = JSON.parse(JSON.stringify(DEFAULT_UDF_TEMPLATE_CONTENT));
    setUdfXmlData(newDocParsed.template);
    setEditorData('<p> </p>');
    setFileName("yeni_belge.udf");
    setErrorMessage(null);
    if (editorInstanceRef.current) {
        editorInstanceRef.current.setData('<p> </p>');
    }
  }, []);

  // Bileşen ilk yüklendiğinde yeni bir belge başlat
  useEffect(() => {
    handleNewDocument();
  }, [handleNewDocument]);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setEditorData('');
    setUdfXmlData(null);

    if (!file.name.toLowerCase().endsWith('.udf')) {
      setErrorMessage("Lütfen bir .udf dosyası seçin.");
      if (e.target) e.target.value = ''; // Reset file input
      return;
    }
    setFileName(file.name);

    try {
      console.log("Dosya yükleme başlıyor...");
      const zip = await JSZip.loadAsync(file);
      console.log("JSZip.loadAsync başarılı.");
      const xmlFile = zip.file("content.xml");
      console.log("zip.file('content.xml') alındı:", xmlFile ? "Bulundu" : "Bulunamadı");

      if (!xmlFile) {
        throw new Error("UDF dosyasında 'content.xml' bulunamadı.");
      }
      const xmlString = await xmlFile.async("text");
      console.log("xmlFile.async('text') başarılı, XML uzunluğu:", xmlString.length);
      
      // Use imported parseUdfFileContent function
      const { html, udfTemplate, mainCdata } = parseUdfFileContent(xmlString);
      console.log("parseUdfFileContent başarılı.");
      
      setUdfXmlData(udfTemplate);
      setEditorData(html);
      if (editorInstanceRef.current) {
        editorInstanceRef.current.setData(html);
      }

    } catch (error: any) {
      console.error("handleFileUpload içinde hata:", error.message, error.stack, error); // Daha fazla detay
      setErrorMessage(`UDF dosyası okunurken bir hata oluştu: ${error.message}`);
    } finally {
        if (e.target) {
            e.target.value = ''; // Allow re-uploading the same file
        }
    }
  };

  const handleDownload = async () => {
    if (!udfXmlData) {
      setErrorMessage("Belge verisi yüklenmedi. Lütfen bir belge açın veya yeni belge oluşturun.");
      return;
    }
    if (!editorInstanceRef.current) {
      setErrorMessage("Editör hazır değil.");
      return;
    }
    setErrorMessage(null);

    const currentEditorHtml = editorInstanceRef.current.getData();

    try {
      // Use imported buildUdfXmlForDownload function
      const contentXmlString = buildUdfXmlForDownload(udfXmlData, currentEditorHtml);

      const zip = new JSZip();
      zip.file("content.xml", contentXmlString);
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
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: themeColors.background,
    }}>
      <AppBar position="static" sx={{ bgcolor: themeColors.surface, borderBottom: `1px solid ${themeColors.border}` }}>
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

      {errorMessage && (
        <Alert severity="error" sx={{ m: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{
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
            editor={ClassicEditor as any} // Use type assertion as a workaround for the TypeScript error
            data={editorData}
            onReady={(editor) => {
                // Properly store the editor instance with the correct type
                editorInstanceRef.current = {
                  getData: () => (editor as unknown as CKEditorCore).getData(),
                  setData: (data: string) => (editor as unknown as CKEditorCore).setData(data)
                };
            }}
            onChange={(event, editor) => {
                // No need to setEditorData here as we're using the editor instance directly for download
            }}
            config={{
                toolbar: {
                    items: [
                        'undo', 'redo', '|',
                        'heading', '|',
                        'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                        'bold', 'italic', 'underline', 'strikethrough', '|',
                        'alignment', '|',
                        'link', 'blockQuote', '|',
                        'bulletedList', 'numberedList', 'outdent', 'indent', '|',
                        'imageUpload', 'insertTable', '|',
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
