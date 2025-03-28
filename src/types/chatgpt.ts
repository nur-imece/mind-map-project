export interface ChatGptRequest {
  question?: string;
  language?: string;
  type?: number;
}

export interface ChatGpt4ORequest {
  question?: string;
  language?: string;
  type?: number;
  level?: number;
  documentIds?: number[];
}

export interface ChatGptEmbedingRequest {
  question?: string;
  language?: string;
  documentIds?: number[];
} 