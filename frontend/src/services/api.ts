import {
  DatasetPreviewResponse,
  AnalysisResultResponse,
  PaginatedCommentsResponse,
  SampleDatasetInfo,
  AnalysisSettings,
  SingleCommentResponse
} from '../types';

const API_BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend server is unreachable');
  return res.json();
}

export async function previewDataset(file: File): Promise<DatasetPreviewResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/dataset/preview`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to preview dataset' }));
    throw new Error(errorData.detail || 'Failed to preview dataset');
  }

  return res.json();
}

export async function analyzeDataset(
  file: File,
  settings?: AnalysisSettings
): Promise<AnalysisResultResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (settings) {
    formData.append('settings', JSON.stringify(settings));
  }

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to analyze dataset' }));
    throw new Error(errorData.detail || 'Failed to analyze dataset');
  }

  return res.json();
}

export async function getAnalysisResult(analysisId: string): Promise<AnalysisResultResponse> {
  const res = await fetch(`${API_BASE}/results/${analysisId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Analysis not found' }));
    throw new Error(errorData.detail || 'Analysis not found');
  }
  return res.json();
}

export async function getAnalysisPosts(
  analysisId: string,
  params: {
    search?: string;
    sentiment?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    page_size?: number;
  } = {}
): Promise<PaginatedCommentsResponse> {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.sentiment && params.sentiment !== 'all') query.append('sentiment', params.sentiment);
  if (params.sort_by) query.append('sort_by', params.sort_by);
  if (params.sort_order) query.append('sort_order', params.sort_order);
  if (params.page) query.append('page', params.page.toString());
  if (params.page_size) query.append('page_size', params.page_size.toString());

  const res = await fetch(`${API_BASE}/results/${analysisId}/posts?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to fetch comments' }));
    throw new Error(errorData.detail || 'Failed to fetch comments');
  }
  return res.json();
}

export function getExportDownloadUrl(analysisId: string, format: 'csv' | 'excel' = 'csv'): string {
  return `${API_BASE}/results/${analysisId}/export?format=${format}`;
}

export async function getSampleDatasets(): Promise<SampleDatasetInfo[]> {
  const res = await fetch(`${API_BASE}/sample-datasets`);
  if (!res.ok) throw new Error('Failed to load sample datasets');
  return res.json();
}

export async function analyzeSampleDataset(
  filename: string,
  settings?: AnalysisSettings
): Promise<AnalysisResultResponse> {
  const formData = new FormData();
  if (settings) {
    formData.append('settings', JSON.stringify(settings));
  }

  const res = await fetch(`${API_BASE}/analyze-sample/${encodeURIComponent(filename)}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to analyze sample dataset' }));
    throw new Error(errorData.detail || 'Failed to analyze sample dataset');
  }

  return res.json();
}

export async function analyzeSingleComment(text: string): Promise<SingleCommentResponse> {
  const res = await fetch(`${API_BASE}/analyze-single`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to analyze single comment' }));
    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : Array.isArray(errorData.detail)
        ? errorData.detail.map((e: any) => e.msg).join(', ')
        : 'Failed to analyze single comment'
    );
  }

  return res.json();
}
