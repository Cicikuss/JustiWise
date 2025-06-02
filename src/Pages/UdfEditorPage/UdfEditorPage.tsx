import React, { useState, useMemo, useCallback, useRef, FC, useEffect } from "react";
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
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { DEFAULT_UDF_TEMPLATE_CONTENT } from "../../Models/udf.constants";
import { UdfTemplate } from "../../Models/udf.types";
import { parseUdfFileContent, buildUdfXmlForDownload } from "../../Helper/udf.util";



// Add these types at the top of the component
type EditorInstance = {
  getData: () => string;
  // Add other methods you're using
};

const UdfEditor: FC = () => {
  const [udfXmlData, setUdfXmlData] = useState<UdfTemplate | null>(null);
  // mainCdata is mostly for reference now, as parsing directly yields HTML
  // const [mainCdata, setMainCdata] = useState<string>(''); 
  const [editorData, setEditorData] = useState<string>('');
  const [fileName, setFileName] = useState<string>("yeni_belge.udf");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Change the ref type to be more generic
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
    const newDocParsed = JSON.parse(JSON.stringify(DEFAULT_UDF_TEMPLATE_CONTENT)); // Deep copy
    setUdfXmlData(newDocParsed.template);
    // setMainCdata(newDocParsed.template.content['#cdata'] || '');
    setEditorData('<p> </p>'); // Start with an empty paragraph with non-breaking space
    setFileName("yeni_belge.udf");
    setErrorMessage(null);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setEditorData(''); // Clear editor while processing
    setUdfXmlData(null);
    // setMainCdata('');

    if (!file.name.toLowerCase().endsWith('.udf')) {
      setErrorMessage("Lütfen bir .udf dosyası seçin.");
      return;
    }
    setFileName(file.name);

    try {
      const zip = await JSZip.loadAsync(file);
      const xmlFile = zip.file("content.xml");

      if (!xmlFile) {
        throw new Error("UDF dosyasında 'content.xml' bulunamadı.");
      }
      const xmlString = await xmlFile.async("text");
      
      const { html, udfTemplate: parsedTemplate } = parseUdfFileContent(xmlString);
      
      setUdfXmlData(parsedTemplate);
      // setMainCdata(cdata); // cdata is available if needed for other purposes
      setEditorData(html);

    } catch (error: any) {
      console.error("UDF dosyası okunurken hata:", error);
      setErrorMessage(`UDF dosyası okunurken bir hata oluştu: ${error.message}`);
      setUdfXmlData(null);
      // setMainCdata('');
      setEditorData('');
    } finally {
        // Reset file input to allow re-uploading the same file
        if (e.target) {
            e.target.value = '';
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

  // Update the useState to useEffect for initialization
  useEffect(() => {
    handleNewDocument();
  }, [handleNewDocument]); // Add proper dependency


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
            disabled={!udfXmlData} // Disable if no UDF data is loaded
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
            padding: '20px !important', // Override default CKEditor padding
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
            // @ts-expect-error: ClassicEditor type is compatible at runtime, this is a common workaround for CJS module style of CKEditor builds
            editor={ClassicEditor}
            data={editorData}
            onReady={(editor) => {
                editorInstanceRef.current = editor ;
            }}
            onChange={(event: any, editor: any) => {
                // const data = editor.getData();
                // console.log({ event, editor, data });
                // You might want to update some state here if needed for real-time validation or other purposes,
                // but for download, we get the latest data directly from editorInstanceRef.current.getData()
            }}
            config={{
                toolbar: {
                    items: [
                        'undo', 'redo', '|',
                        'heading', '|',
                        'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                        'bold', 'italic', 'underline', 'strikethrough', '|',
                        'alignment', '|', // handles text-align
                        'link', 'blockQuote', '|',
                        'bulletedList', 'numberedList', 'outdent', 'indent', '|',
                        'imageUpload', 'insertTable', /*'mediaEmbed',*/ '|', // MediaEmbed might be too complex for UDF
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
                // Add more configurations as needed
            }}
        />
      </Box>
    </Box>
  );
}

export default UdfEditor;