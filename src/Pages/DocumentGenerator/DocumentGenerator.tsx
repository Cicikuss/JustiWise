import React, { useState, useMemo, useRef } from 'react';
import {
  TextField, Button, Box, Typography, CircularProgress,
  Alert, Paper, Divider, Grid, ButtonGroup,
  Popper, Grow, ClickAwayListener, MenuList, MenuItem
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { PDFDownloadLink, Document as PdfDoc, Page, Text, StyleSheet } from '@react-pdf/renderer';
import { Document as WordDoc, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { FirstStepResponse, SecondStepResponse } from '../../Models/document-generat.types';
import { requestFirstStep, requestSecondStep } from '../../service/aiBackendService';

enum GenerationStep {
  Initial,
  FormFilling,
  Result,
}

const styles = StyleSheet.create({
  page: { padding: 30 },
  text: { fontSize: 14 },
});

const stripHtml = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const PdfDocument: React.FC<{ content: string }> = ({ content }) => (
  <PdfDoc>
    <Page style={styles.page}>
      <Text>{stripHtml(content)}</Text>
    </Page>
  </PdfDoc>
);

const DocumentGenerator: React.FC = () => {
  const [step, setStep] = useState<GenerationStep>(GenerationStep.Initial);
  const [userInput, setUserInput] = useState<string>('');
  const [formFields, setFormFields] = useState<FirstStepResponse | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [result, setResult] = useState<SecondStepResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');

  const userName = useMemo(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleFirstStep = async () => {
    if (!userInput.trim()) {
      setError("Lütfen oluşturmak istediğiniz belge türünü açıklayın.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const responseData = await requestFirstStep(userName, userInput);
      setFormFields(responseData);
      const initialFormData = [...responseData.required_variables, ...responseData.optional_variables]
        .reduce((acc, field) => ({ ...acc, [field]: '' }), {});
      setFormData(initialFormData);
      setStep(GenerationStep.FormFilling);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecondStep = async () => {
    if (!formFields) return;
    setIsLoading(true);
    setError(null);
    const required_variables: Record<string, string> = {};
    const optional_variables: Record<string, string> = {};
    for (const key in formData) {
      if (formFields.required_variables.includes(key)) {
        if (!formData[key].trim()) {
          setError(`Zorunlu alan olan '${key}' boş bırakılamaz.`);
          setIsLoading(false);
          return;
        }
        required_variables[key] = formData[key];
      } else if (formFields.optional_variables.includes(key) && formData[key].trim()) {
        optional_variables[key] = formData[key];
      }
    }
    try {
      const responseData = await requestSecondStep({
        user_name: userName,
        required_variables,
        optional_variables,
        custom_instructions: customInstructions,
      });
      setResult(responseData);
      setEditorContent(responseData.generated_document);
      setStep(GenerationStep.Result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDocx = async () => {
    const plainText = stripHtml(editorContent);
    const doc = new WordDoc({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: plainText, font: 'Arial' }),
              ],
            }),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${result?.document_type || 'belge'}.docx`);
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setStep(GenerationStep.Initial);
    setUserInput('');
    setFormFields(null);
    setFormData({});
    setCustomInstructions('');
    setResult(null);
    setError(null);
    setIsLoading(false);
    setEditorContent('');
  };

  const downloadOptions = [
    { label: 'İndir (PDF)', action: null },
    { label: 'İndir (DOCX)', action: handleDownloadDocx }
  ];

  const handleMenuItemClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
    setSelectedIndex(index);
    setOpen(false);
    if (downloadOptions[index].action) {
      downloadOptions[index].action?.();
    }
  };

  const handleToggle = () => setOpen((prevOpen) => !prevOpen);
  const handleClose = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) return;
    setOpen(false);
  };

  const handleOptionClick = (index: number) => {
    setOpen(false);
    downloadOptions[index].action?.();
  };

  const renderInitialStep = () => (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Hukuki Belge Asistanı</Typography>
      <TextField fullWidth label="Belge Türü Açıklaması" value={userInput} onChange={(e) => setUserInput(e.target.value)} disabled={isLoading} onKeyPress={(e) => e.key === 'Enter' && handleFirstStep()}/>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleFirstStep} disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : 'İleri'}</Button>
      </Box>
    </Paper>
  );

  const renderFormFillingStep = () => (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>Gerekli Bilgileri Doldurun</Typography>
      <Grid container spacing={3}>
        {formFields?.required_variables.map((field) => (
          <Grid item xs={12} sm={6} key={field}>
            <TextField required fullWidth name={field} label={field} value={formData[field] || ''} onChange={handleFormInputChange} disabled={isLoading}/>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ my: 4 }}>Ekstra Talimatlar</Divider>
      <TextField fullWidth multiline rows={4} label="Belgeye eklenmesini istediğiniz özel talimatlar var mı?" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} disabled={isLoading}/>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={handleReset} disabled={isLoading}>Baştan Başla</Button>
        <Button variant="contained" onClick={handleSecondStep} disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : 'Belgeyi Oluştur'}</Button>
      </Box>
    </Paper>
  );

  const renderResultStep = () => (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>Oluşturulan Belge</Typography>
      <Alert severity="warning" sx={{ mb: 3 }}>
       <Box>
          <Typography variant="body2">
            <strong>Not:</strong> İndirilen PDF veya DOCX dosyasının görünümü editördekiyle birebir aynı olmayabilir.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Yasal Uyarı:</strong> {result?.disclaimer}
          </Typography>
        </Box>
      </Alert>
      <Box sx={{ my: 3, '.ck-editor__editable': { minHeight: '400px' } }}>
        <CKEditor editor={ClassicEditor as any} data={editorContent} onChange={(event, editor) => setEditorContent(editor.getData())}/>
      </Box>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Button variant="outlined" onClick={handleReset}>Yeni Belge Oluştur</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <PDFDownloadLink
            document={<PdfDocument content={editorContent} />}
            fileName={`${result?.document_type || 'belge'}.pdf`}
          >
            {({ loading }) => (
              <Button variant="contained" color="primary">
                {loading ? 'Hazırlanıyor...' : 'PDF İndir'}
              </Button>
            )}
          </PDFDownloadLink>
          <Button variant="contained" color="secondary" onClick={handleDownloadDocx}>
            DOCX İndir
          </Button>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {step === GenerationStep.Initial && renderInitialStep()}
      {step === GenerationStep.FormFilling && renderFormFillingStep()}
      {step === GenerationStep.Result && renderResultStep()}
    </Box>
  );
};

export default DocumentGenerator;
