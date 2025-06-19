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
  TextField,
  CircularProgress,
  useTheme,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";

// Bu tipleri ve fonksiyonu kendi projenizdeki doğru yoldan import ettiğinizden emin olun
// Örneğin: import { SimulationResponse } from '../models/Simulation';
// import { apiCalltoSimulation } from '../services/apiService';

// Geçici olarak tipleri ve fonksiyonu burada tanımlayalım
interface SimulationResponse {
  session_id: string;
  history: string[];
  next_speaker: string | null;
  simulation_over: boolean;
}

async function apiCalltoSimulation(endpoint: string, body: object): Promise<any> {
    const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    // Eğer cevapta içerik yoksa veya hata varsa json() patlayabilir
    const text = await response.text();
    if (!response.ok) {
        try {
            // Hata cevabı JSON formatında olabilir
            const jsonError = JSON.parse(text);
            throw new Error(jsonError.detail || 'API Hatası');
        } catch (e) {
            // Değilse, ham metni hata olarak fırlat
            throw new Error(text || 'Bilinmeyen API hatası');
        }
    }
    return text ? JSON.parse(text) : {};
}


// --- Component Başlangıcı ---

const roles = ["davacı", "davalı", "savunma makamı", "iddia makamı"] as const;
type Role = (typeof roles)[number];

const predefinedScenarios = [
    { id: 'injury', title: 'Adam Yaralama Davası', text: 'Bir tartışma sonucu meydana gelen fiziksel saldırı ve yaralama olayı.' },
    { id: 'theft', title: 'Hırsızlık Davası', text: 'Bir mağazadan değerli bir eşyanın çalınması ve şüphelinin yakalanması.' },
    { id: 'traffic', title: 'Trafik Kazası Davası', text: 'Kırmızı ışık ihlali sonucu meydana gelen maddi hasarlı bir trafik kazası.' },
    { id: 'custom', title: 'Kendi Senaryomu Yazacağım', text: '' }
];

export default function CourtroomPage(): JSX.Element {
  // State'ler
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [customScenario, setCustomScenario] = useState<string>("");
  const [simulationState, setSimulationState] = useState<SimulationResponse | null>(null);
  const [userInput, setUserInput] = useState<string>("");

  const theme = useTheme();
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simulationState?.history]);

  const apiCall = async (endpoint: string, body: object): Promise<SimulationResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCalltoSimulation(endpoint, body);
      // API'den dönen cevabın beklenen yapıda olduğunu varsayıyoruz
      return response as SimulationResponse;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    const selectedScenario = predefinedScenarios.find(s => s.id === selectedScenarioId);
    if (!selectedRole || !selectedScenario) return;

    let scenarioText = selectedScenario.text;
    if (selectedScenario.id === 'custom') {
        if (!customScenario.trim()) {
            setError("Lütfen özel senaryonuzu girin.");
            return;
        }
        scenarioText = customScenario;
    }

    const response = await apiCall('/api/v1/simulation/start', { 
        role: selectedRole,
        scenario: scenarioText 
    });
    
    if (response) {
        setSessionId(response.session_id);
        setSimulationState(response);
        setIsStarted(true);
    }
  };

  const handleRespond = async () => {
    if (!userInput.trim() || !sessionId) return;
    
    const response = await apiCall('/api/v1/simulation/respond', { 
      session_id: sessionId, 
      message: userInput 
    });
    
    if (response) {
      setSimulationState(response);
      setUserInput("");
    }
  };

  const isUserTurn = simulationState?.next_speaker === selectedRole;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        <GavelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Mahkeme Simülasyonu
      </Typography>

      {/* --- ROL VE SENARYO SEÇİM EKRANI --- */}
      {!isStarted && (
        <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" align="center" sx={{ mb: 3 }}>
            Duruşma Ayarları
          </Typography>
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <Typography component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>1. Rolünüzü Seçin:</Typography>
            <RadioGroup row value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as Role)} sx={{ justifyContent: 'center' }}>
              {roles.map((role) => (
                <FormControlLabel key={role} value={role} control={<Radio />} label={role.charAt(0).toUpperCase() + role.slice(1)} />
              ))}
            </RadioGroup>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="scenario-select-label">2. Bir Senaryo Seçin</InputLabel>
            <Select labelId="scenario-select-label" value={selectedScenarioId} label="2. Bir Senaryo Seçin" onChange={(e) => setSelectedScenarioId(e.target.value)}>
              {predefinedScenarios.map((scenario) => (
                <MenuItem key={scenario.id} value={scenario.id}>{scenario.title}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedScenarioId === 'custom' && (
           <TextField
    variant="outlined"
    label="3. Kendi Senaryonuzu Buraya Yazın"
    multiline
    rows={4}
    fullWidth
    value={customScenario}
    onChange={(e) => setCustomScenario(e.target.value)}
    sx={{ mb: 3 }}
    helperText="Davanın ana konusunu kısaca özetleyin."
    InputLabelProps={{
        shrink: true, // <-- Etiketi her zaman yukarıda ve küçük tutar
    }}
/>
          )}
          <Box textAlign="center">
            <Button variant="contained" color="primary" disabled={!selectedRole || !selectedScenarioId || isLoading} onClick={handleStart}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Duruşmayı Başlat"}
            </Button>
            {error && <Typography color="error" sx={{ mt: 2 }}>Hata: {error}</Typography>}
          </Box>
        </Paper>
      )}

      {/* --- SİMÜLASYON SOHBET EKRANI --- */}
      {isStarted && simulationState && (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>Duruşma Kaydı</Typography>
          <Box sx={{ maxHeight: "400px", overflowY: "auto", border: `1px solid ${theme.palette.divider}`, p: 2, borderRadius: 2, background: theme.palette.background.default, mb: 3 }}>
            {simulationState.history.map((line, index) => (
              <Typography key={index} sx={{ mb: 1, whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: line.replace(/\n/g, '<br/>') }}/>
            ))}
            <div ref={chatEndRef} />
          </Box>
          <Box sx={{ textAlign: 'center', mb: 2, p: 1, borderRadius: 1, bgcolor: theme.palette.info.light, color: theme.palette.info.contrastText }}>
            {simulationState.simulation_over ? (
              <Typography>Simülasyon Sona Erdi.</Typography>
            ) : (
              <Typography>Sıradaki Konuşmacı: <strong>{simulationState.next_speaker?.toUpperCase() || 'Bilinmiyor'}</strong></Typography>
            )}
          </Box>
          {error && <Typography color="error" align="center" sx={{ mb: 2 }}>Hata: {error}</Typography>}
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
                    if (e.key === 'Enter' && isUserTurn && !isLoading && userInput.trim()) {
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