export interface DocumentAnalysis {
  summary: string;
  key_points: string[];
  urgency: "low" | "medium" | "high";
  deadline: string;
  actions: string[];
  recommended_action: string;
  response_letter: string;
}

export interface UploadResponse {
  success: boolean;
  data?: DocumentAnalysis;
  error?: string;
}