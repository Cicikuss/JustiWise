// src/types.ts

// 1. Adım API Yanıtı
export interface FirstStepResponse {
  required_variables: string[];
  optional_variables: string[];
}

// Form verilerini tutmak için genel bir tip
export interface FormData {
  [key: string]: string;
}

// 2. Adım API İsteği
export interface SecondStepRequest {
  user_name: string;
  required_variables: FormData;
  optional_variables: FormData;
  custom_instructions: string;
}

// 2. Adım API Yanıtı
export interface SecondStepResponse {
  status: string;
  document_type: string;
  generated_document: string;
  disclaimer: string;
}