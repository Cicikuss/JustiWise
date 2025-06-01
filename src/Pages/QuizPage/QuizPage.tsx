import React, { useState } from "react";
import { fetchQuizFromGemini } from "../../service/quizService";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";

interface Quiz {
  question: string;
  options: string[];
  answer: string;
}

const QuizPage = () => {
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartQuiz = async () => {
    console.log("Gemini Key:", process.env.REACT_APP_GEMINI_API_KEY);
    setLoading(true);
    const data = await fetchQuizFromGemini();
    setQuizList(data);
    setQuizStarted(true);
    setLoading(false);
  };

  const handleOptionClick = (option: string) => {
    setSelected(option);
    setShowAnswer(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setSelected(null);
    setShowAnswer(false);
  };

  const currentQuiz = quizList[currentIndex];

  if (!quizStarted) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <Card sx={{ width: 400, p: 4, textAlign: "center", boxShadow: 6 }}>
          <Typography variant="h5" gutterBottom>
            🎓 Hukuk Bilginizi Test Edin!
          </Typography>
          <Typography variant="body1" mb={2}>
            Başlamak için butona tıklayın.
          </Typography>
          <Button
            variant="contained"
            onClick={handleStartQuiz}
            disabled={loading}
            sx={{
              color: "#fff",
              "&.Mui-disabled": {
                color: "#fff",
              },
            }}
          >
            {loading ? "Yükleniyor..." : "Quiz'e Başla"}
          </Button>
        </Card>
      </Box>
    );
  }


  if (!currentQuiz) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <Typography variant="h5">🎉 Test bitti!</Typography>
      </Box>
    );
  }

  
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="80vh"
    >
      <Card sx={{ width: 500, padding: 3, textAlign: "center", boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentQuiz.question}
          </Typography>
          {currentQuiz.options.map((option, idx) => (
            <Button
              key={idx}
              onClick={() => handleOptionClick(option)}
              variant="contained"
              fullWidth
              sx={{
                my: 1,
                backgroundColor: "#1a1a1a",
                color: "#fff",
                pointerEvents: showAnswer ? "none" : "auto",
                "&:hover": {
                  backgroundColor: "#333",
                },
              }}
            >
              {option}
            </Button>
          ))}

          {showAnswer && (
            <Box mt={2}>
              <Typography variant="body1" fontWeight="bold">
                {selected === currentQuiz.answer
                  ? "✅ Doğru!"
                  : `❌ Yanlış. Doğru cevap: ${currentQuiz.answer}`}
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={handleNext}>
                Sonraki Soru
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuizPage;
