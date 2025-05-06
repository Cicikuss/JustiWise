import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

export async function fileprocess(file: File, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];

        const contents = [
          { text: prompt  },
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          }
        ];

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: contents
        });

        resolve(response.text || "Bir şeyler ters gitti, sonuç alınamadı!");
      } catch (error) {
        console.error(error);
        reject("Hmph… Dosya işlenemedi 🙄");
      }
    };

    reader.onerror = () => {
      reject("Dosya okunamadı! 😠");
    };

    reader.readAsDataURL(file);
  });
}