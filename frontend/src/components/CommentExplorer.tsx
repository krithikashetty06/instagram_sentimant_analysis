import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Sparkles,
  Loader2,
  FileDown
} from 'lucide-react';
import { PaginatedCommentsResponse, SentimentItem, SentimentType } from '../types';
import { getAnalysisPosts } from '../services/api';

interface CommentExplorerProps {
  analysisId: string;
  hasExistingLabels: boolean;
  onExportClick: () => void;
}

export const CommentExplorer: React.FC<CommentExplorerProps> = ({
  analysisId,
  hasExistingLabels,
  onExportClick,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PaginatedCommentsResponse | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Inspector modal for single post
  const [inspectedItem, setInspectedItem] = useState<SentimentItem | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await getAnalysisPosts(analysisId, {
        search,
        sentiment: selectedSentiment,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: pageSize,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [analysisId, selectedSentiment, sortBy, sortOrder, page, pageSize]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComments();
  };

  const getBadgeStyle = (sentiment: SentimentType) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Negative':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Post & Comment Explorer</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, and inspect original vs. preprocessed text and polarity scores.
          </p>
        </div>

        <button
          onClick={onExportClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors self-start md:self-auto"
        >
          <FileDown className="h-4 w-4 text-blue-600" />
          Export Dataset
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords in comments..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </form>

        {/* Sentiment Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(['all', 'Positive', 'Neutral', 'Negative'] as const).map((sent) => (
            <button
              key={sent}
              onClick={() => {
                setSelectedSentiment(sent);
                setPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedSentiment === sent
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sent === 'all' ? 'All' : sent}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('_');
              setSortBy(sb);
              setSortOrder(so);
              setPage(1);
            }}
            className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="id_asc">Default Order</option>
            <option value="sentiment_score_desc">Score (Highest First)</option>
            <option value="sentiment_score_asc">Score (Lowest First)</option>
            <option value="sentiment_asc">Sentiment (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="px-4 py-3 w-14"># ID</th>
              <th className="px-4 py-3">Original Post Content</th>
              <th className="px-4 py-3 w-32">Predicted Sentiment</th>
              <th className="px-4 py-3 w-24 text-right">Polarity Score</th>
              {hasExistingLabels && <th className="px-4 py-3 w-28">Original Label</th>}
              <th className="px-4 py-3 w-20 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span>Loading posts...</span>
                  </div>
                </td>
              </tr>
            ) : data && data.items.length > 0 ? (
              data.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400">{item.id}</td>
                  <td className="px-4 py-3 max-w-md">
                    <p className="text-slate-800 line-clamp-2 leading-relaxed">{item.original_text}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeStyle(
                        item.predicted_sentiment
                      )}`}
                    >
                      {item.predicted_sentiment}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    <span
                      className={
                        item.sentiment_score > 0.05
                          ? 'text-emerald-600'
                          : item.sentiment_score < -0.05
                          ? 'text-rose-600'
                          : 'text-slate-600'
                      }
                    >
                      {item.sentiment_score > 0 ? `+${item.sentiment_score.toFixed(3)}` : item.sentiment_score.toFixed(3)}
                    </span>
                  </td>
                  {hasExistingLabels && (
                    <td className="px-4 py-3 text-slate-500">
                      {item.existing_label ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-mono">
                          {item.existing_label}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setInspectedItem(item)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Inspect cleaned text & metadata"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No posts matched your search or sentiment filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data && data.total_pages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2">
          <div>
            Showing <span className="font-semibold text-slate-900">{((page - 1) * pageSize) + 1}</span> to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(page * pageSize, data.filtered_items)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{data.filtered_items.toLocaleString()}</span> filtered posts
            {data.filtered_items !== data.total_items && ` (total ${data.total_items.toLocaleString()})`}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs rounded border border-slate-200 px-2 py-1 text-slate-700 bg-white"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>

            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="font-medium text-slate-700 px-2">
              Page {page} of {data.total_pages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Inspect Item Modal */}
      {inspectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">Post #{inspectedItem.id}</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
                    inspectedItem.predicted_sentiment
                  )}`}
                >
                  {inspectedItem.predicted_sentiment}
                </span>
              </div>
              <button
                onClick={() => setInspectedItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  Original Text
                </label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 text-sm whitespace-pre-wrap leading-relaxed">
                  {inspectedItem.original_text}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  Cleaned / Preprocessed Text
                </label>
                <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-200 text-blue-950 text-sm whitespace-pre-wrap leading-relaxed">
                  {inspectedItem.cleaned_text}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Polarity Score</p>
                  <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {inspectedItem.sentiment_score}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Range: -1.0 (Negative) to +1.0 (Positive)</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Subjectivity Score</p>
                  <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {inspectedItem.subjectivity_score !== null ? inspectedItem.subjectivity_score : 'N/A'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Range: 0.0 (Objective) to 1.0 (Subjective)</p>
                </div>
              </div>

              {inspectedItem.existing_label && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-semibold">Original Dataset Label: </span>
                  <span className="font-mono">{inspectedItem.existing_label}</span>
                  {inspectedItem.existing_score !== null && (
                    <span className="ml-2 font-mono">(Score: {inspectedItem.existing_score})</span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setInspectedItem(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
