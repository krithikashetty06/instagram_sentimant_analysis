import React from 'react';
import {
  MessageSquare,
  ThumbsUp,
  MinusCircle,
  ThumbsDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Filter,
  Layers,
  Database
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { SentimentCharts } from '../components/SentimentCharts';
import { AnalysisResultResponse, ActiveTab } from '../types';

interface OverviewPageProps {
  currentAnalysis: AnalysisResultResponse | null;
  setActiveTab: (tab: ActiveTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  currentAnalysis,
  setActiveTab,
}) => {
  if (!currentAnalysis) {
    return (
      <div className="space-y-6">
        {/* Welcome Empty State Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 md:p-12 text-center shadow-xs">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-inner">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            Welcome to SocialPulse
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed mb-6">
            Empower your research with deep social media sentiment analysis. Clean text, normalize user mentions, extract hashtags, classify comments into Positive, Neutral, and Negative sentiments, and visualize audience perception.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('analyze')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 inline-flex items-center gap-2 transition-all"
            >
              <Database className="h-4 w-4" />
              Upload or Select Dataset
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
            >
              View Project Methodology
            </button>
          </div>
        </div>

        {/* Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 w-fit mb-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Standardized Cleaning</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Preserves hashtags and emojis while purging URLs, repetitive whitespace, and formatting noise.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 w-fit mb-3">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">TextBlob NLP Algorithm</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Uses the original project notebook's polarity thresholds (&gt;0.05 Positive, &lt;-0.05 Negative, else Neutral).
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 w-fit mb-3">
              <Filter className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Post Explorer & Export</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Filter by keyword or sentiment, inspect original vs. cleaned text, and export certified results to CSV or Excel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { summary } = currentAnalysis;

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards (Section 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Posts Analyzed"
          count={summary.total_analyzed}
          subtitle={`From ${summary.preprocessing.rows_before.toLocaleString()} raw rows`}
          icon={MessageSquare}
          variant="total"
        />

        <MetricCard
          title="Positive Sentiment"
          count={summary.positive_count}
          percentage={summary.positive_percentage}
          subtitle="Favorable user comments"
          icon={ThumbsUp}
          variant="positive"
        />

        <MetricCard
          title="Neutral Sentiment"
          count={summary.neutral_count}
          percentage={summary.neutral_percentage}
          subtitle="Informational or balanced"
          icon={MinusCircle}
          variant="neutral"
        />

        <MetricCard
          title="Negative Sentiment"
          count={summary.negative_count}
          percentage={summary.negative_percentage}
          subtitle="Critical user feedback"
          icon={ThumbsDown}
          variant="negative"
        />
      </div>

      {/* Preprocessing Summary Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Data Preprocessing Breakdown</p>
            <p className="text-slate-500">
              Cleaned using notebook's URL removal, hashtag preservation, mention normalization, and deduplication.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-slate-400">Duplicates Removed:</span>{' '}
            <span className="font-mono font-semibold text-slate-800">
              {summary.preprocessing.duplicates_removed}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Empty Filtered:</span>{' '}
            <span className="font-mono font-semibold text-slate-800">
              {summary.preprocessing.empty_removed}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Net Retention Rate:</span>{' '}
            <span className="font-mono font-semibold text-emerald-600">
              {((summary.preprocessing.rows_after / summary.preprocessing.rows_before) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Sentiment Charts View */}
      <SentimentCharts summary={summary} />

      {/* Quick Navigation to Explorer CTA */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-blue-950">Examine Individual Posts & Scores</h4>
          <p className="text-xs text-blue-700/80">
            Use the Comment Explorer to search keywords, inspect cleaned text, or download the full dataset.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('dataset')}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <span>Open Explorer</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
