export interface TimelineEvent {
  label: string;
  date: string;
  description: string;
}

export interface AppealInfo {
  method: string;
  email?: string;
  website?: string;
  phone?: string;
  address?: string;
}

export interface DocumentAnalysis {
  summary: string;
  key_points: string[];
  urgency: "low" | "medium" | "high";
  deadline: string;
  actions: string[];
  recommended_action: string;
  response_letter: string;
  timeline: TimelineEvent[];
  appeal_info: AppealInfo;
}

export interface UploadResponse {
  success: boolean;
  data?: DocumentAnalysis;
  error?: string;
}