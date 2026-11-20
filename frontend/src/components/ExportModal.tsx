import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, X, Check, Loader2 } from 'lucide-react';
import { getExportDownloadUrl } from '../services/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  filename: string;
  totalRecords: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  analysisId,
  filename,
  totalRecords,
}) => {
  const [downloading, setDownloading] = useState<'csv' | 'excel' | null>(null);

  if (!isOpen) return null;

  const handleDownload = (format: 'csv' | 'excel') => {
    setDownloading(format);
    const url = getExportDownloadUrl(analysisId, format);
    
    // Create an invisible anchor to trigger direct download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Export Sentiment Results</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Download the full sentiment classification output for <span className="font-semibold text-slate-800">{filename}</span> ({totalRecords.toLocaleString()} analyzed posts).
        </p>

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200/80 space-y-1">
          <p className="font-semibold text-slate-800">Exported Data Columns:</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-500 text-[11px]">
            <li>Original_Text (Unprocessed post)</li>
            <li>Cleaned_Text (Normalized tokens)</li>
            <li>Sentiment (Positive / Neutral / Negative)</li>
            <li>Sentiment_Score_Polarity (-1.0 to 1.0)</li>
            <li>Subjectivity_Score (0.0 to 1.0)</li>
            <li>Original_Dataset_Labels (when provided)</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* CSV Download Button */}
          <button
            onClick={() => handleDownload('csv')}
            disabled={downloading !== null}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-2 transition-all group disabled:opacity-50"
          >
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              {downloading === 'csv' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </div>
            <span className="text-xs font-bold text-slate-900">Download CSV</span>
            <span className="text-[10px] text-slate-400">Universal comma-separated</span>
          </button>

          {/* Excel Download Button */}
          <button
            onClick={() => handleDownload('excel')}
            disabled={downloading !== null}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-2 transition-all group disabled:opacity-50"
          >
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              {downloading === 'excel' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-5 w-5" />
              )}
            </div>
            <span className="text-xs font-bold text-slate-900">Download Excel</span>
            <span className="text-[10px] text-slate-400">Microsoft Excel (.xlsx)</span>
          </button>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
