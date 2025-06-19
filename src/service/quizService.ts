import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Quiz {
  question: string;
  options: string[];
  answer: string;
}

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || "");

export const fetchQuizFromGemini = async (): Promise<Quiz[]> => {
  const prompt = `
Lütfen aşağıdaki yönergeleri tamamen Türkçe olarak yerine getir.

Ticaret hukuku konulu 10 adet çoktan seçmeli soru oluştur. 
Her bir sorunun 4 farklı cevabı ve yalnızca 1 doğru cevabı olsun.

Sadece aşağıdaki formatta, açıklama yapmadan yanıt ver:

[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "answer": "string"
  }
]
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text();

  
    const cleanedText = text.replace(/```json|```/g, "").trim();

    console.log("Gemini'den gelen JSON:", cleanedText);

    const json: Quiz[] = JSON.parse(cleanedText);
    return json;
  } catch (error) {
    console.error("Gemini Quiz API hatası:", error);
    return [];
  }
};
