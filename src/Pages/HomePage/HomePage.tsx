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
import RuleFolderIcon from "@mui/icons-material/RuleFolder";
import QuizIcon from "@mui/icons-material/Quiz";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      title: t("features.summarize.title"),
      description: t("features.summarize.description"),
      icon: <SummarizeIcon fontSize="large" />,
      path: "/summarize",
    },
    {
      title: t("features.requestedCasePage.title"),
      description: t("features.requestedCasePage.description"),
      icon: <RuleFolderIcon fontSize="large" />,
      path: "/client-request-page",
    },
    {
      title: t("features.courtroom.title"),
      description: t("features.courtroom.description"),
      icon: <GavelIcon fontSize="large" />,
      path: "/courtroom",
    },
    {
      title: t("features.qna.title"),
      description: t("features.qna.description"),
      icon: <QuestionAnswerIcon fontSize="large" />,
      path: "/qa",
    },
    {
      title: t("features.tinyCats.title"),
      description: t("features.tinyCats.description"),
      icon: <AutoStoriesIcon fontSize="large" />,

      path: "/legalcats",
    },
    {
      title: t("features.quiz.title"),
      description: t("features.quiz.description"),
      icon: <QuizIcon fontSize="large" />,
      path: "/quiz",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        👩‍⚖️ {t("aiPanelTitle")}
      </Typography>

      <Typography
        variant="subtitle1"
        align="center"
        color="text.secondary"
        sx={{ mb: 6 }}
      >
        {t("aiPanelSubtitle")}
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => navigate(feature.path)}
                >
                  {t("go")}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
