import axios, { AxiosError } from "axios";
import { SimulationResponse } from "../Models/Courtroom";
import { FirstStepResponse, SecondStepRequest, SecondStepResponse } from "../Models/document-generat.types";
import { SummarizeRequestPayload, SummarizeResponse, ApiError } from "../Models/summarizer.types";

const API_BASE_URL = 'http://127.0.0.1:8000';

export const apiCalltoSimulation = async (endpoint: string, body: object): Promise<SimulationResponse | null> => {

    const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || 'API tarafında bir hata oluştu.');
    }
    return await response.json();

};



const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail: string }>;
        // FastAPI'nin standart hata formatı: { "detail": "..." }
        if (axiosError.response?.data?.detail) {
            return axiosError.response.data.detail;
        }
        return axiosError.message;
    }
    return 'Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.';
};


export const requestFirstStep = async (userName: string, userInput: string): Promise<FirstStepResponse> => {
    try {
        const response = await axios.post<FirstStepResponse>(`${API_BASE_URL}/api/v1/generate-document-first-step`, {
            user_name: userName,
            user_input: userInput,
        });
        return response.data;
    } catch (error) {
        // Hata işleme mantığını merkezileştirip, bileşene sadece mesajı iletiyoruz.
        throw new Error(getErrorMessage(error));
    }
};

export const requestSecondStep = async (requestData: SecondStepRequest): Promise<SecondStepResponse> => {
    try {
        const response = await axios.post<SecondStepResponse>(`${API_BASE_URL}/api/v1/generate-document-second-step`, requestData);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};


export const postSummarizeRequest = async (
  payload: SummarizeRequestPayload
): Promise<SummarizeResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/summarizer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.detail || 'Bilinmeyen bir sunucu hatası oluştu.');
  }

  // Backend'in response'u Pydantic'ten dolayı direkt string dönebilir.
  // response.json() bu durumda hata verir.
  // Bu yüzden response'u metin olarak alıp kendimiz bir nesneye saralım.
  const resultText = await response.text();
  
  // FastAPI'de `return "metin"` yerine `return PlainTextResponse("metin")` kullanılırsa,
  // response header'ında `Content-Type: text/plain` olur.
  // Eğer `return JSONResponse({"result": "metin"})` kullanılırsa `application/json` olur.
  // Biz her iki duruma da hazırlıklı olalım.
  try {
      // Önce JSON olarak ayrıştırmayı dene (en iyi pratik)
      const jsonData = JSON.parse(resultText);
      // Eğer backend `{"result": "..."}` gibi bir yapı dönerse, onu kullan.
      // Ya da direkt string'i JSON olarak döndürdüyse (örn: `"sonuç metni"`), onu da yakala.
      return { result: jsonData.result || jsonData };
  } catch (e) {
      // JSON değilse, düz metindir.
      return { result: resultText };
  }
};