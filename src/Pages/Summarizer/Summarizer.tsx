// src/components/SummarizerPage.tsx

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  SelectChangeEvent,
  Divider,
} from '@mui/material';
import { SummarizeRequestPayload } from '../../Models/summarizer.types';
import { postSummarizeRequest } from '../../service/aiBackendService';

const SummarizerPage: React.FC = () => {
  const [mainContent, setMainContent] = useState<string>('');
  const [qaContext, setQaContext] = useState<string>(''); 
  const [choice, setChoice] = useState<number>(1);
  const [question, setQuestion] = useState<string>('');
  const [summaryMode, setSummaryMode] = useState<string>('DETAILED');
  const [summaryLength, setSummaryLength] = useState<string>('MEDIUM');
  const [summaryTone, setSummaryTone] = useState<string>('FORMAL');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleChoiceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChoice(Number((event.target as HTMLInputElement).value));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    let payload: SummarizeRequestPayload = {
      choice,
    };

    switch (choice) {
      case 1: // Özetleme
        payload = {
          ...payload,
          user_main_content: mainContent,
          summary_mode: summaryMode,
          summary_length: summaryLength,
          summary_tone: summaryTone,
        };
        break;

      case 2: // Soru Cevap
        payload = {
          ...payload,
          user_main_content: question,
          actual_user_question: `Bağlam: ${qaContext}\n\nSoru: ${question}`,
        };
        break;

      case 3: // Hukuki Metni Basitleştir
        payload = {
          ...payload,
          user_main_content: mainContent,
        };
        break;
        
      case 4: // Hukuki Dile Çevir
        payload = {
          ...payload,
          user_main_content: mainContent,
        };
        break;
    }

    console.log("API'ye gönderilen payload:", payload);

    try {
      const response = await postSummarizeRequest(payload);
      setResult(response.result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Bilinmeyen bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const isButtonDisabled = loading || !(choice === 2 ? (qaContext.trim() && question.trim()) : mainContent.trim());

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Hukuk Asistanı
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Metinlerinizi özetleyin, basitleştirin veya metinler hakkında soru sorun.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Yapmak istediğiniz işlemi seçin:</FormLabel>
              <RadioGroup row value={choice} onChange={handleChoiceChange}>
                <FormControlLabel value={1} control={<Radio />} label="Özetle" />
                <FormControlLabel value={2} control={<Radio />} label="Soru Cevapla" />
                <FormControlLabel value={3} control={<Radio />} label="Hukuki Metni Basitleştir" />
                <FormControlLabel value={4} control={<Radio />} label="Hukuki Dile Çevir" />
              </RadioGroup>
            </FormControl>
          </Box>
          
          {choice === 2 ? (
            <>
              <TextField
                label="Bağlam Metni (Hakkında Soru Sorulacak Metin)"
                multiline
                rows={8}
                fullWidth
                variant="outlined"
                value={qaContext}
                onChange={(e) => setQaContext(e.target.value)}
                required
                sx={{ mb: 3 }}
                placeholder="Lütfen hakkında soru sormak istediğiniz metni buraya girin..."
              />
              <TextField
                label="Sorunuz"
                fullWidth
                variant="outlined"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                sx={{ mb: 3 }}
                placeholder="Yukarıdaki bağlam metni ile ilgili sorunuzu buraya yazın..."
                multiline
                rows={3}
              />
            </>
          ) : (
            <TextField
              label="İşlenecek Ana Metin"
              multiline
              rows={10}
              fullWidth
              variant="outlined"
              value={mainContent}
              onChange={(e) => setMainContent(e.target.value)}
              required
              sx={{ mb: 3 }}
              placeholder="Lütfen işlenecek metni buraya girin..."
            />
          )}

          {choice === 1 && (
            <Box sx={{ 
              border: '1px solid', 
              borderColor: 'divider', 
              p: 3, 
              borderRadius: 2, 
              mb: 3,
              backgroundColor: 'background.paper'
            }}>
              <Typography variant="h6" gutterBottom>
                Özetleme Seçenekleri
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Özet Modu</InputLabel>
                    <Select 
                      value={summaryMode} 
                      label="Özet Modu" 
                      onChange={(e) => setSummaryMode(e.target.value)}
                    >
                      <MenuItem value="DETAILED">Detaylı</MenuItem>
                      <MenuItem value="EXECUTIVE">Yönetici Özeti</MenuItem>
                      <MenuItem value="KEY_POINTS">Anahtar Noktalar</MenuItem>
                      <MenuItem value="LEGAL_ANALYSIS">Hukuki Analiz</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Özet Uzunluğu</InputLabel>
                    <Select 
                      value={summaryLength} 
                      label="Özet Uzunluğu" 
                      onChange={(e) => setSummaryLength(e.target.value)}
                    >
                      <MenuItem value="SHORT">Kısa</MenuItem>
                      <MenuItem value="MEDIUM">Orta</MenuItem>
                      <MenuItem value="LONG">Uzun</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Özet Tonu</InputLabel>
                    <Select 
                      value={summaryTone} 
                      label="Özet Tonu" 
                      onChange={(e) => setSummaryTone(e.target.value)}
                    >
                      <MenuItem value="FORMAL">Resmi</MenuItem>
                      <MenuItem value="INFORMAL">Samimi</MenuItem>
                      <MenuItem value="LEGAL_JARGON">Hukuki Jargon</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              disabled={isButtonDisabled}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Gönder'}
            </Button>
          </Box>
        </form>

        {(loading || error || result) && <Divider sx={{ my: 3 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography fontWeight="bold">Hata:</Typography>
            {error}
          </Alert>
        )}
        
        {result && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              Asistan Yanıtı:
            </Typography>
            <Paper 
              elevation={0} 
              variant="outlined" 
              sx={{ 
                p: 3, 
                backgroundColor: 'action.hover', 
                maxHeight: '500px', 
                overflow: 'auto',
                borderRadius: 2
              }}
            >
              <Typography 
                component="div" 
                sx={{ 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: 1.6,
                  fontSize: '0.95rem'
                }}
              >
                {result}
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SummarizerPage;