import React, { JSX, useState, useRef, useEffect } from "react";
import {
  Container,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Paper,
  Box,
  TextField, // Kullanıcı girdisi için TextField ekliyoruz
  CircularProgress, // Yükleme göstergesi için
  useTheme,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";

// API'den gelecek rolleri yansıtacak şekilde güncelleyelim
const roles = ["davacı", "davalı", "savunma makamı", "iddia makamı"] as const;
type Role = (typeof roles)[number];



export default function CourtroomPage(): JSX.Element {
  // State'ler
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Simülasyon verilerini saklamak için tek bir state
  const [simulationState, setSimulationState] = useState<SimulationResponse | null>(null);
  const [userInput, setUserInput] = useState<string>("");

  const theme = useTheme();
  const chatEndRef = useRef<null | HTMLDivElement>(null); // Otomatik kaydırma için ref

  // Sohbet geçmişi değiştiğinde en alta kaydır
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simulationState?.history]);

  // Helper: API çağrıları için genel bir fonksiyon
  const apiCall = async (endpoint: string, body: object): Promise<SimulationResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCalltoSimulation(endpoint, body);
      if (!response || (response as any).detail) {
        const errMsg = (response && (response as any).detail) ? (response as any).detail : 'API tarafında bir hata oluştu.';
        throw new Error(errMsg);
      }
      return response;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Simülasyonu başlatma
  const handleStart = async () => {
    if (!selectedRole) return;
    
    const response = await apiCall('/api/v1/simulation/start', { role: selectedRole });
    if (response) {
      setSessionId(response.session_id);
      setSimulationState(response);
      setIsStarted(true);
    }
  };

  // Kullanıcı cevabını gönderme
  const handleRespond = async () => {
    if (!userInput.trim() || !sessionId) return;
    
    const response = await apiCall('/api/v1/simulation/respond', { 
      session_id: sessionId, 
      message: userInput 
    });
    
    if (response) {
      setSimulationState(response);
      setUserInput(""); // Girdiyi temizle
    }
  };

  const isUserTurn = simulationState?.next_speaker === selectedRole;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        <GavelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Mahkeme Simülasyonu
      </Typography>

      {/* Rol Seçim Ekranı */}
      {!isStarted && (
        <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            Rolünüzü seçin ve duruşmayı başlatın.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <RadioGroup row value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as Role)}>
              {roles.map((role) => (
                <FormControlLabel key={role} value={role} control={<Radio />} label={role.charAt(0).toUpperCase() + role.slice(1)} />
              ))}
            </RadioGroup>
          </Box>
          <Box textAlign="center">
            <Button variant="contained" color="primary" disabled={!selectedRole || isLoading} onClick={handleStart}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Duruşmayı Başlat"}
            </Button>
            {error && <Typography color="error" sx={{ mt: 2 }}>Hata: {error}</Typography>}
          </Box>
        </Paper>
      )}

      {/* Simülasyon Ekranı */}
      {isStarted && simulationState && (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>Duruşma Kaydı</Typography>
          <Box sx={{ maxHeight: "400px", overflowY: "auto", border: `1px solid ${theme.palette.divider}`, p: 2, borderRadius: 2, background: theme.palette.background.default, mb: 3 }}>
            {simulationState.history.map((line, index) => (
              <Typography key={index} sx={{ mb: 1, whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: line.replace(/\n/g, '<br/>') }}/>
            ))}
            <div ref={chatEndRef} />
          </Box>

          {/* Durum Bilgisi */}
          <Box sx={{ textAlign: 'center', mb: 2, p: 1, borderRadius: 1, bgcolor: 'info.light', color: 'info.contrastText' }}>
            {simulationState.simulation_over ? (
              <Typography>Simülasyon Sona Erdi.</Typography>
            ) : (
              <Typography>Sıradaki Konuşmacı: <strong>{simulationState.next_speaker?.toUpperCase()}</strong></Typography>
            )}
          </Box>
          
          {error && <Typography color="error" align="center" sx={{ mb: 2 }}>Hata: {error}</Typography>}

          {/* Kullanıcı Giriş Alanı */}
          {!simulationState.simulation_over && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
                label={isUserTurn ? "Cevabınızı yazın..." : "Sıranızı bekleyin..."}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={!isUserTurn || isLoading}
                onKeyPress={(e) => {
                    if(e.key === 'Enter' && isUserTurn && !isLoading) {
                        handleRespond();
                    }
                }}
              />
              <Button
                variant="contained"
                onClick={handleRespond}
                disabled={!isUserTurn || isLoading || !userInput.trim()}
                sx={{ height: '56px' }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Gönder"}
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
}