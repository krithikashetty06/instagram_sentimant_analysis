import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Play,
  Loader2,
  Database,
  Sparkles,
  Info
} from 'lucide-react';
import { DatasetPreviewResponse, AnalysisSettings, SampleDatasetInfo } from '../types';
import { previewDataset, analyzeDataset, analyzeSampleDataset } from '../services/api';

interface FileUploadProps {
  onAnalysisComplete: (result: any) => void;
  sampleDatasets: SampleDatasetInfo[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onAnalysisComplete,
  sampleDatasets,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<DatasetPreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Settings
  const [settings, setSettings] = useState<AnalysisSettings>({
    text_column: undefined,
    remove_duplicates: true,
    clean_text: true,
    positive_threshold: 0.05,
    negative_threshold: -0.05,
    use_existing_labels: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    setErrorMessage(null);
    setSelectedFile(file);
    setLoadingPreview(true);
    setPreviewData(null);

    // Validate extension
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMessage('Invalid file format. Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.');
      setLoadingPreview(false);
      return;
    }

    try {
      const preview = await previewDataset(file);
      setPreviewData(preview);
      // Auto-set detected text column
      if (preview.detected_text_column) {
        setSettings((prev) => ({ ...prev, text_column: preview.detected_text_column || undefined }));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to inspect file.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await analyzeDataset(selectedFile, settings);
      onAnalysisComplete(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed. Please check the dataset and column settings.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadSample = async (sample: SampleDatasetInfo) => {
    setAnalyzing(true);
    setErrorMessage(null);
    try {
      const result = await analyzeSampleDataset(sample.filename, settings);
      onAnalysisComplete(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze sample dataset.');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Upload Social Media Dataset</h2>
        <p className="text-sm text-slate-500 mb-5">
          Select or drop a CSV or Excel dataset containing social media posts, comments, or tweets.
        </p>

        {/* Drag & Drop Area */}
        {!selectedFile ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Drag & drop your dataset here, or <span className="text-blue-600 hover:underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports CSV, XLSX, XLS (up to 20 MB)</p>
          </div>
        ) : (
          /* File Selected Card */
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 truncate max-w-sm">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)} •{' '}
                    {previewData ? `${previewData.total_rows.toLocaleString()} rows detected` : 'Reading structure...'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRemoveFile}
                disabled={analyzing}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Remove dataset"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingPreview && (
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Validating dataset schema and auto-detecting columns...
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Column Configuration & Preview */}
        {previewData && (
          <div className="mt-6 space-y-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Text / Comment Column <span className="text-rose-500">*</span>
                </label>
                <select
                  value={settings.text_column || ''}
                  onChange={(e) => setSettings({ ...settings, text_column: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Select text column
                  </option>
                  {previewData.columns.map((col) => (
                    <option key={col} value={col}>
                      {col} {col === previewData.detected_text_column ? '(Auto-detected)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Selected column contains the social post content to classify.
                </p>
              </div>

              {previewData.has_existing_labels && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Original Dataset Labels Found
                  </label>
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200/60 flex items-center justify-between text-xs">
                    <span className="text-blue-900 font-medium">
                      Column: <code className="font-mono">{previewData.detected_label_column}</code>
                    </span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.use_existing_labels}
                        onChange={(e) =>
                          setSettings({ ...settings, use_existing_labels: e.target.checked })
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-700 font-medium">Use original labels</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Settings Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Sliders className="h-3.5 w-3.5" />
                {showAdvanced ? 'Hide Preprocessing & Model Thresholds' : 'Configure Preprocessing & Thresholds'}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.clean_text}
                        onChange={(e) => setSettings({ ...settings, clean_text: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>Normalize URLs, mentions, emojis & hashtags</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.remove_duplicates}
                        onChange={(e) =>
                          setSettings({ ...settings, remove_duplicates: e.target.checked })
                        }
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>Remove duplicate comments (Deduplication)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Positive Threshold (Polarity &gt;)</span>
                        <span className="font-mono text-emerald-600">{settings.positive_threshold}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.5"
                        step="0.01"
                        value={settings.positive_threshold}
                        onChange={(e) =>
                          setSettings({ ...settings, positive_threshold: parseFloat(e.target.value) })
                        }
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Negative Threshold (Polarity &lt;)</span>
                        <span className="font-mono text-rose-600">{settings.negative_threshold}</span>
                      </div>
                      <input
                        type="range"
                        min="-0.5"
                        max="0"
                        step="0.01"
                        value={settings.negative_threshold}
                        onChange={(e) =>
                          setSettings({ ...settings, negative_threshold: parseFloat(e.target.value) })
                        }
                        className="w-full accent-rose-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Data Preview Table */}
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Dataset Preview (First 5 Rows)</p>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200">
                      {previewData.columns.slice(0, 6).map((col) => (
                        <th
                          key={col}
                          className={`px-3 py-2 font-semibold ${
                            col === settings.text_column
                              ? 'text-blue-700 bg-blue-50/70'
                              : 'text-slate-700'
                          }`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewData.preview_rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        {previewData.columns.slice(0, 6).map((col) => (
                          <td
                            key={col}
                            className={`px-3 py-2 max-w-[200px] truncate ${
                              col === settings.text_column
                                ? 'font-medium text-slate-900 bg-blue-50/20'
                                : 'text-slate-600'
                            }`}
                          >
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Run Analysis Action Button */}
            <div className="pt-2">
              <button
                onClick={handleRunAnalysis}
                disabled={analyzing || !settings.text_column}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cleaning Text & Classifying Sentiments...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    Analyze Posts & Generate Insights
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Test with Sample Datasets */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-5 w-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Preloaded Sample Datasets</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Want to test the platform instantly? Click on any sample dataset below to run the complete sentiment analysis pipeline.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleDatasets.map((sample) => (
            <div
              key={sample.filename}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{sample.name}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                    {sample.row_count} rows
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sample.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {sample.columns.slice(0, 4).map((col) => (
                    <span
                      key={col}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600"
                    >
                      {col}
                    </span>
                  ))}
                  {sample.columns.length > 4 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{sample.columns.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleLoadSample(sample)}
                disabled={analyzing}
                className="mt-4 w-full py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Analyze This Sample
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
