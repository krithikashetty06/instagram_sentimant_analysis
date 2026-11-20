import React from 'react';
import { SentimentCharts } from '../components/SentimentCharts';
import { AnalysisResultResponse } from '../types';
import { Download, Sparkles, FileText, ArrowRight } from 'lucide-react';

interface ResultsPageProps {
  currentAnalysis: AnalysisResultResponse | null;
  onExportClick: () => void;
  onAnalyzeNewClick: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  currentAnalysis,
  onExportClick,
  onAnalyzeNewClick,
}) => {
  if (!currentAnalysis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-2">No Analysis Results Found</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Please upload or select a social media dataset in the "Analyze Posts" section to view sentiment distributions and visualizations.
        </p>
        <button
          onClick={onAnalyzeNewClick}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 inline-flex items-center gap-2 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          Go to Analyze Posts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Sentiment Analytics & Visualizations</h2>
          <p className="text-xs text-slate-500 mt-1">
            Visual distribution of analyzed social media posts categorized into Positive, Neutral, and Negative.
          </p>
        </div>

        <button
          onClick={onExportClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-blue-600" />
          Export Classified Data
        </button>
      </div>

      <SentimentCharts summary={currentAnalysis.summary} />
    </div>
  );
};
