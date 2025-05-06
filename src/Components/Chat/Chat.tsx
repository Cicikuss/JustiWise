import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Avatar, 
  Paper, 
  InputAdornment, 
  CircularProgress,
  useTheme,
  Fade,
  Zoom,
  Container,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { fileprocess } from '../../service/openai';

// Mesaj tipi
type Message = {
  text: string;
  sender: 'user' | 'ai';
  isFile?: boolean;
};

const Chat: React.FC = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { text: "Merhaba! Ben JustiWise asistanıyım. Size nasıl yardımcı olabilirim?", sender: "ai" },
  ]);
  const [input, setInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
   
    if (selectedFile) {
      setMessages((prev) => [...prev, { text: selectedFile.name, sender: "user" }]);
      setMessages((prev) => [...prev, { text: input, sender: "user" }]);
      setInput('');
      const temp = selectedFile;
      setSelectedFile(null);
      setLoading(true);
      const response = await fileprocess(temp, input); 
      setMessages((prev) => [
        ...prev,
        { text: ` ${response}`, sender: "ai", isFile: true }
      ]);
      setLoading(false); 
    } else if (input.trim()) {
      setMessages((prev) => [...prev, { text: input, sender: "user" }]);
      setInput('');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', py: 3 }}>
      <Paper 
        elevation={3}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'white',
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'primary.main',
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              textAlign: 'center',
              color: theme.palette.mode === 'dark' ? 'text.primary' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <SmartToyOutlinedIcon />
            JustiWise Chat
          </Typography>
        </Box>

        {/* Messages Container */}
        <Box
          ref={chatContainerRef}
          sx={{ 
            flex: 1,
            overflowY: 'auto',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              '&:hover': {
                background: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.3)'
                  : 'rgba(0, 0, 0, 0.3)',
              },
            },
          }}
        >
          {messages.map((msg, index) => (
            <Zoom in={true} key={index} style={{ transitionDelay: '100ms' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'secondary.main',
                    width: 36,
                    height: 36,
                  }}
                >
                  {msg.sender === 'user' 
                    ? <PersonOutlineOutlinedIcon /> 
                    : <SmartToyOutlinedIcon />
                  }
                </Avatar>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: msg.sender === 'user' 
                      ? theme.palette.primary.main 
                      : theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.05)',
                    color: msg.sender === 'user' 
                      ? 'white' 
                      : 'text.primary',
                    borderRadius: 3,
                    borderTopLeftRadius: msg.sender === 'ai' ? 0 : 3,
                    borderTopRightRadius: msg.sender === 'user' ? 0 : 3,
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.text}
                  </Typography>
                </Paper>
              </Box>
            </Zoom>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {/* File Attachment Preview */}
        {selectedFile && (
          <Fade in={true}>
            <Paper
              sx={{
                mx: 3,
                mb: 2,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFileIcon color="primary" />
                <Typography variant="body2">{selectedFile.name}</Typography>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setSelectedFile(null)}
                color="error"
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Paper>
          </Fade>
        )}

        {/* Input Area */}
        <Box sx={{ 
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'dark' 
            ? 'background.paper' 
            : 'rgba(0, 0, 0, 0.02)',
        }}>
          <Box sx={{ 
            display: 'flex',
            gap: 1,
          }}>
            <TextField
              fullWidth
              variant="outlined"
              size="medium"
              placeholder={loading ? "Yanıt bekleniyor..." : "Mesajınızı yazın..."}
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              multiline
              maxRows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'white',
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      component="label"
                      disabled={loading}
                      color="primary"
                      sx={{ mr: -1 }}
                    >
                      <AttachFileIcon />
                      <input type="file" hidden onChange={handleFileChange} disabled={loading} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <IconButton 
              color="primary"
              onClick={handleSend}
              disabled={loading}
              sx={{ 
                width: 56,
                height: 56,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'action.disabled',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat;

