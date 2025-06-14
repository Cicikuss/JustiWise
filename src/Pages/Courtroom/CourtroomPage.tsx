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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";

// API'den gelecek rolleri yansıtacak şekilde güncelleyelim
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
        // Seçilen senaryoyu bul
        const selectedScenario = predefinedScenarios.find(s => s.id === selectedScenarioId);
        if (!selectedRole || !selectedScenario) return;

        // Senaryo metnini belirle
        let scenarioText = selectedScenario.text;
        if (selectedScenario.id === 'custom' && !customScenario.trim()) {
            setError("Lütfen özel senaryonuzu girin.");
            return;
        }
        if (selectedScenario.id === 'custom') {
            scenarioText = customScenario;
        }

        // Backend'e hem rolü hem de senaryoyu gönder
        const response = await apiCall('/simulation/start', { 
            role: selectedRole,
            scenario: scenarioText 
        });
        
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
        <Container maxWidth="md" /* ... */>
            <Typography /* ... */>Mahkeme Simülasyonu</Typography>

            {/* Rol ve Senaryo Seçim Ekranı */}
            {!isStarted && (
                <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                        Duruşma Ayarları
                    </Typography>

                    {/* 1. Rol Seçimi */}
                    <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                        <Typography component="legend" sx={{ mb: 1 }}>1. Rolünüzü Seçin:</Typography>
                        <RadioGroup row value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as Role)}>
                            {roles.map((role) => (
                                <FormControlLabel key={role} value={role} control={<Radio />} label={role.charAt(0).toUpperCase() + role.slice(1)} />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    {/* 2. Senaryo Seçimi */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="scenario-select-label">2. Bir Senaryo Seçin</InputLabel>
                        <Select
                            labelId="scenario-select-label"
                            value={selectedScenarioId}
                            label="2. Bir Senaryo Seçin"
                            onChange={(e) => setSelectedScenarioId(e.target.value)}
                        >
                            {predefinedScenarios.map((scenario) => (
                                <MenuItem key={scenario.id} value={scenario.id}>{scenario.title}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* 3. Özel Senaryo Metin Alanı (gerekirse görünür) */}
                    {selectedScenarioId === 'custom' && (
                        <TextField
                            label="3. Kendi Senaryonuzu Buraya Yazın"
                            multiline
                            rows={4}
                            fullWidth
                            value={customScenario}
                            onChange={(e) => setCustomScenario(e.target.value)}
                            sx={{ mb: 3 }}
                            helperText="Davanın ana konusunu kısaca özetleyin."
                        />
                    )}

                    {/* Başlat Butonu */}
                    <Box textAlign="center">
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={!selectedRole || !selectedScenarioId || isLoading}
                            onClick={handleStart}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Duruşmayı Başlat"}
                        </Button>
                        {error && <Typography color="error" sx={{ mt: 2 }}>Hata: {error}</Typography>}
                    </Box>
                </Paper>
            )}

            {/* Simülasyon Ekranı (değişiklik yok) */}
            {isStarted && simulationState && (
                <Paper /* ... */>
                    {/* ... (mevcut sohbet ekranı kodunuz) ... */}
                </Paper>
            )}
        </Container>
    );
}