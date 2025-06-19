export interface SummarizeRequestPayload {
  choice: number;
  user_main_content?: string;
  actual_user_question?: string;
  summary_mode?: string;
  summary_length?: string;
  summary_tone?: string;
}

// Backend doğrudan bir string döndürdüğü için,
// API servis katmanında bunu bir nesneye çevireceğiz.
export interface SummarizeResponse {
  result: string;
}

// API'den dönen hata cevabının tipi.
export interface ApiError {
  detail: string;
}