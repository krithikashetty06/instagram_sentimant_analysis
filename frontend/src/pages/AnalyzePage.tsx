import React from 'react';
import { FileUpload } from '../components/FileUpload';
import { SampleDatasetInfo } from '../types';

interface AnalyzePageProps {
  onAnalysisComplete: (result: any) => void;
  sampleDatasets: SampleDatasetInfo[];
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({
  onAnalysisComplete,
  sampleDatasets,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Analyze Social Media Dataset</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload custom social data in CSV or Excel format, or run analysis on one of our preloaded benchmark datasets.
        </p>
      </div>

      <FileUpload
        onAnalysisComplete={onAnalysisComplete}
        sampleDatasets={sampleDatasets}
      />
    </div>
  );
};
