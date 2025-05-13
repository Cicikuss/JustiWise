import React, { JSX, useState } from "react";
import {
  Container,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Paper,
  Box,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";

const roles = ["Sanık", "Avukat", "Tanık"] as const;
type Role = (typeof roles)[number];

export default function CourtroomPage(): JSX.Element {
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [started, setStarted] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleStart = () => {
    if (!selectedRole) return;

    setStarted(true);
    setLogs([
      "Hakim: Duruşma başlamıştır.",
      `Hakim: ${selectedRole} hazır mısınız?`,
    ]);
  };

  const handleRespond = () => {
    if (!selectedRole) return;

    setLogs((prev) => [...prev, `${selectedRole}: Hazırım, Sayın Hakim.`]);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        <GavelIcon sx={{ mr: 1 }} />
        Mahkeme Simülasyonu
      </Typography>

      {!started && (
        <>
          <Typography variant="subtitle1" align="center" sx={{ mb: 3 }}>
            Rolünüzü seçin ve duruşmayı başlatın.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <RadioGroup
              row
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
            >
              {roles.map((role) => (
                <FormControlLabel
                  key={role}
                  value={role}
                  control={<Radio />}
                  label={role}
                />
              ))}
            </RadioGroup>
          </Box>

          <Box textAlign="center">
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedRole}
              onClick={handleStart}
            >
              Duruşmayı Başlat
            </Button>
          </Box>
        </>
      )}

      {started && (
        <Paper elevation={3} sx={{ p: 3, mt: 5 }}>
          <Typography variant="h6" gutterBottom>
            Duruşma Kaydı
          </Typography>
          <Box
            sx={{
              maxHeight: "300px",
              overflowY: "auto",
              border: "1px solid #ddd",
              p: 2,
              borderRadius: 2,
              background: "#fafafa",
            }}
          >
            {logs.map((line, index) => (
              <Typography key={index} sx={{ mb: 1 }}>
                {line}
              </Typography>
            ))}
          </Box>

          <Box textAlign="center" mt={3}>
            <Button
              variant="outlined"
              onClick={handleRespond}
              disabled={logs.some((l) => l.includes(`${selectedRole}:`))}
            >
              Cevapla
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
