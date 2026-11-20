export type SentimentType = 'Positive' | 'Neutral' | 'Negative';

export interface SentimentBreakdown {
  sentiment: SentimentType;
  count: number;
  percentage: number;
}

export interface PreprocessingStats {
  rows_before: number;
  rows_after: number;
  rows_excluded: number;
  duplicates_removed: number;
  empty_removed: number;
}

export interface AnalysisSummary {
  total_analyzed: number;
  positive_count: number;
  positive_percentage: number;
  neutral_count: number;
  neutral_percentage: number;
  negative_count: number;
  negative_percentage: number;
  dominant_sentiment: SentimentType;
  average_polarity: number;
  average_subjectivity: number;
  preprocessing: PreprocessingStats;
  distribution: SentimentBreakdown[];
  dominant_explanation: string;
}

export interface SentimentItem {
  id: number;
  original_text: string;
  cleaned_text: string;
  predicted_sentiment: SentimentType;
  sentiment_score: number;
  subjectivity_score: number | null;
  existing_label: string | null;
  existing_score: number | null;
  metadata: Record<string, any>;
}

export interface AnalysisResultResponse {
  analysis_id: string;
  filename: string;
  created_at: string;
  used_algorithm: string;
  text_column_used: string;
  summary: AnalysisSummary;
  has_existing_labels: boolean;
  preview_items: SentimentItem[];
}

export interface DatasetPreviewResponse {
  filename: string;
  total_rows: number;
  columns: string[];
  preview_rows: Record<string, any>[];
  detected_text_column: string | null;
  detected_label_column: string | null;
  detected_score_column: string | null;
  has_existing_labels: boolean;
}

export interface PaginatedCommentsResponse {
  analysis_id: string;
  total_items: number;
  filtered_items: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: SentimentItem[];
}

export interface SampleDatasetInfo {
  name: string;
  filename: string;
  description: string;
  row_count: number;
  columns: string[];
  sample_type: string;
}

export interface AnalysisSettings {
  text_column?: string;
  label_column?: string;
  score_column?: string;
  remove_duplicates: boolean;
  clean_text: boolean;
  positive_threshold: number;
  negative_threshold: number;
  use_existing_labels: boolean;
}

export interface SingleCommentResponse {
  original_text: string;
  cleaned_text: string;
  polarity: number;
  sentiment: SentimentType;
  subjectivity?: number | null;
}

export type ActiveTab = 'overview' | 'analyze' | 'single' | 'results' | 'dataset' | 'about';
