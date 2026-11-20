import React from 'react';
import { Sparkles, FileText, CheckCircle2, Clock } from 'lucide-react';
import { AnalysisResultResponse } from '../types';

interface HeaderProps {
  currentAnalysis: AnalysisResultResponse | null;
  onAnalyzeNewClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentAnalysis, onAnalyzeNewClick }) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              SocialPulse
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Production Build
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Social Media Sentiment Analytics — Natural Language Processing & Comment Classification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAnalyzeNewClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-xs hover:shadow transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Analyze New Dataset
          </button>
        </div>
      </div>

      {/* Dataset Status Banner */}
      {currentAnalysis && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            <span className="truncate max-w-[200px]" title={currentAnalysis.filename}>
              {currentAnalysis.filename}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Total Rows:</span>
            <span className="font-semibold text-slate-900">
              {currentAnalysis.summary.preprocessing.rows_before.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Analyzed Posts:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {currentAnalysis.summary.total_analyzed.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Excluded (cleaned/deduped):</span>
            <span className="font-semibold text-slate-700">
              {currentAnalysis.summary.preprocessing.rows_excluded.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{currentAnalysis.created_at}</span>
          </div>
        </div>
      )}
    </header>
  );
};
