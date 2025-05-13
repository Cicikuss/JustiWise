import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DocumentSummaryChat: React.FC = () => {
  const [summary, setSummary] = useState<string>('📄 Henüz bir belge yüklenmedi.');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const handleSend = () => {
    if (!fileName) {
      setShowAlert(true);
      return;
    }

    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    // Simüle edilmiş AI cevabı
    setTimeout(() => {
      const aiReply: Message = {
        role: 'assistant',
        content: `AI cevabı: "${input}" ile ilgili detaylı bilgi burada yer alır.`,
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSummary("⏳ AI özet çıkarıyor...");

    setTimeout(() => {
      setSummary(`📄 Yüklenen belge: ${file.name}\n\nBu belge, hukuk sisteminde yer alan kavramlar üzerine detaylı bilgiler içermektedir. AI tarafından çıkarılan özet burada gösterilir.`);
    }, 1000);
  };

  return (
    <Box maxWidth="md" mx="auto" p={2}>
      {/* Belge Yükleme */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardHeader title="📤 Belge Yükle" />
        <CardContent>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              Belge Seç (.pdf, .docx)
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
            </Button>
            {fileName && (
              <Typography variant="body2" color="text.secondary">
                Seçilen belge: {fileName}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Belge Özeti */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardHeader title="📄 AI Özet" />
        <CardContent>
          <Typography variant="body1" whiteSpace="pre-line">
            {summary}
          </Typography>
        </CardContent>
      </Card>

      {/* Mesaj Geçmişi */}
      <Paper variant="outlined" sx={{ maxHeight: 300, overflowY: 'auto', p: 2, mb: 2 }}>
        <Stack spacing={2}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
              sx={{
                backgroundColor: msg.role === 'user' ? '#1976d2' : '#e0e0e0',
                color: msg.role === 'user' ? 'white' : 'black',
                px: 2,
                py: 1,
                borderRadius: 2,
                maxWidth: '70%',
              }}
            >
              <Typography variant="body2">{msg.content}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Mesaj Giriş */}
      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="Belge hakkında soru sorun..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          Gönder
        </Button>
      </Stack>

      {/* Uyarı Mesajı */}
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setShowAlert(false)}>
          Önce bir belge yüklemelisiniz!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentSummaryChat;
