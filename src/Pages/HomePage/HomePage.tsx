import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
} from "@mui/material";
import SummarizeIcon from "@mui/icons-material/Summarize";
import GavelIcon from "@mui/icons-material/Gavel";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";

const features = [
  {
    title: "Summarize",
    description: "Uzun belgeleri birkaç saniyede özetle.",
    icon: <SummarizeIcon fontSize="large" />,
    path: "/summarize",
  },
  {
    title: "Courtroom",
    description: "Simülasyon mahkeme ortamına giriş yap.",
    icon: <GavelIcon fontSize="large" />,
    path: "/courtroom",
  },
  {
    title: "Q&A",
    description: "Belgelerden akıllı sorular sor, cevapları al.",
    icon: <QuestionAnswerIcon fontSize="large" />,
    path: "/qa",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        👩‍⚖️ Legal Assistant AI Paneli
      </Typography>

      <Typography
        variant="subtitle1"
        align="center"
        color="text.secondary"
        sx={{ mb: 6 }}
      >
        Belgeleri özetle, mahkeme simülasyonuna katıl veya akıllı sorular sor.
      </Typography>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                boxShadow: 4,
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.03)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h5" component="div">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => navigate(feature.path)}
                >
                  Git
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
