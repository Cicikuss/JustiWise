import axios, { AxiosError } from "axios";
import { SimulationResponse } from "../Models/Courtroom";
import { FirstStepResponse, SecondStepRequest, SecondStepResponse } from "../Models/document-generat.types";

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