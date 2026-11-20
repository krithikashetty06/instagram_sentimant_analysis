import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ExportModal } from './components/ExportModal';
import { OverviewPage } from './pages/OverviewPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { SingleCommentPage } from './pages/SingleCommentPage';
import { ResultsPage } from './pages/ResultsPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { AboutPage } from './pages/AboutPage';

import { ActiveTab, AnalysisResultResponse, SampleDatasetInfo } from './types';
import { checkHealth, getSampleDatasets } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResultResponse | null>(null);
  const [sampleDatasets, setSampleDatasets] = useState<SampleDatasetInfo[]>([]);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Check health and load samples on mount
  useEffect(() => {
    const init = async () => {
      try {
        await checkHealth();
        setBackendHealthy(true);
      } catch {
        setBackendHealthy(false);
      }

      try {
        const samples = await getSampleDatasets();
        setSampleDatasets(samples);
      } catch (err) {
        console.error('Failed to load sample datasets', err);
      }
    };
    init();
  }, []);

  const handleAnalysisComplete = (result: AnalysisResultResponse) => {
    setCurrentAnalysis(result);
    setActiveTab('overview');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasAnalysis={currentAnalysis !== null}
        backendHealthy={backendHealthy}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          currentAnalysis={currentAnalysis}
          onAnalyzeNewClick={() => setActiveTab('analyze')}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'overview' && (
            <OverviewPage
              currentAnalysis={currentAnalysis}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'analyze' && (
            <AnalyzePage
              onAnalysisComplete={handleAnalysisComplete}
              sampleDatasets={sampleDatasets}
            />
          )}

          {activeTab === 'single' && <SingleCommentPage />}

          {activeTab === 'results' && (
            <ResultsPage
              currentAnalysis={currentAnalysis}
              onExportClick={() => setIsExportOpen(true)}
              onAnalyzeNewClick={() => setActiveTab('analyze')}
            />
          )}

          {activeTab === 'dataset' && (
            <ExplorerPage
              currentAnalysis={currentAnalysis}
              onExportClick={() => setIsExportOpen(true)}
              onAnalyzeNewClick={() => setActiveTab('analyze')}
            />
          )}

          {activeTab === 'about' && <AboutPage />}
        </main>
      </div>

      {/* Export Modal */}
      {currentAnalysis && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          analysisId={currentAnalysis.analysis_id}
          filename={currentAnalysis.filename}
          totalRecords={currentAnalysis.summary.total_analyzed}
        />
      )}
    </div>
  );
};

export default App;
