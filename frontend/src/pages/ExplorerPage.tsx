import React from 'react';
import { CommentExplorer } from '../components/CommentExplorer';
import { AnalysisResultResponse } from '../types';
import { Sparkles } from 'lucide-react';

interface ExplorerPageProps {
  currentAnalysis: AnalysisResultResponse | null;
  onExportClick: () => void;
  onAnalyzeNewClick: () => void;
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({
  currentAnalysis,
  onExportClick,
  onAnalyzeNewClick,
}) => {
  if (!currentAnalysis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Dataset</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Upload and analyze a dataset to browse, filter, search, and inspect individual comment predictions.
        </p>
        <button
          onClick={onAnalyzeNewClick}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 inline-flex items-center gap-2 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          Analyze a Dataset
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CommentExplorer
        analysisId={currentAnalysis.analysis_id}
        hasExistingLabels={currentAnalysis.has_existing_labels}
        onExportClick={onExportClick}
      />
    </div>
  );
};
