import React, { useState } from 'react';
import {
  MessageSquareText,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Info,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { SingleCommentResponse, SentimentType } from '../types';
import { analyzeSingleComment } from '../services/api';

const MAX_CHARS = 2000;

const EXAMPLE_COMMENTS = [
  {
    title: 'Positive Social Post',
    text: 'I really enjoyed the event! The speakers were inspiring and the atmosphere was wonderful ✨🎉 #blessed',
    expected: 'Positive',
  },
  {
    title: 'Critical Feedback',
    text: 'Terrible customer experience. Waited 4 hours with no support, completely broken product! 😡',
    expected: 'Negative',
  },
  {
    title: 'Informational Update',
    text: 'The quarterly revenue report will be presented on Tuesday at 10:00 AM UTC.',
    expected: 'Neutral',
  },
  {
    title: 'Social with URL & Mentions',
    text: 'Hey @dev_team check out this #awesome new UI feature: https://example.com! Love the clean look 😍',
    expected: 'Positive',
  },
];

export const SingleCommentPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SingleCommentResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setErrorMessage(null);

    // Validation
    const trimmed = inputText.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a comment to analyze. Input cannot be empty or whitespace only.');
      return;
    }

    if (inputText.length > MAX_CHARS) {
      setErrorMessage(`Comment exceeds the maximum length of ${MAX_CHARS} characters (current: ${inputText.length}).`);
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeSingleComment(inputText);
      setResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while analyzing the comment.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setErrorMessage(null);
  };

  const handleSelectExample = (exampleText: string) => {
    setInputText(exampleText);
    setErrorMessage(null);
    setResult(null);
  };

  // Convert polarity score (-1.0 to 1.0) to percentage for gauge positioning (0% to 100%)
  const getMarkerPosition = (polarity: number) => {
    const clamped = Math.max(-1, Math.min(1, polarity));
    return ((clamped + 1) / 2) * 100;
  };

  const sentimentStyles: Record<SentimentType, {
    bg: string;
    border: string;
    text: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = {
    Positive: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200',
      text: 'text-emerald-950',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: TrendingUp,
    },
    Neutral: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-900',
      badge: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: Minus,
    },
    Negative: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200',
      text: 'text-rose-950',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: TrendingDown,
    },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Live Interactive NLP
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Analyze a Single Comment
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter any social media post or comment to run instant Natural Language Processing sentiment classification without uploading a dataset.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="comment-input" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Social Media Comment Text <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-xs font-mono ${
                inputText.length > MAX_CHARS ? 'text-rose-600 font-bold' : 'text-slate-400'
              }`}
            >
              {inputText.length} / {MAX_CHARS}
            </span>
          </div>

          <textarea
            id="comment-input"
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste a social media post here (e.g. 'Loved the presentation today! Fantastic work by the team 🙌 #innovation')..."
            className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50/40 p-4 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all leading-relaxed"
          />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={!inputText && !result && !errorMessage}
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !inputText.trim()}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Sentiment...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Sentiment
              </>
            )}
          </button>
        </div>

        {/* Example Prompts */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-2">Or click an example to test:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLE_COMMENTS.map((ex) => (
              <button
                key={ex.title}
                type="button"
                onClick={() => handleSelectExample(ex.text)}
                className="text-left p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 text-xs transition-all group"
              >
                <div className="flex items-center justify-between font-semibold text-slate-800 group-hover:text-blue-700 mb-0.5">
                  <span>{ex.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal group-hover:text-blue-500">
                    Expected: {ex.expected}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] truncate">{ex.text}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Result Card */}
      {result && (
        <div
          className={`rounded-2xl border ${
            sentimentStyles[result.sentiment].border
          } bg-white p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200`}
        >
          {/* Classification Header Banner */}
          <div
            className={`p-4 rounded-xl border ${sentimentStyles[result.sentiment].border} ${
              sentimentStyles[result.sentiment].bg
            } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl bg-white shadow-2xs ${sentimentStyles[result.sentiment].text}`}
              >
                {React.createElement(sentimentStyles[result.sentiment].icon, { className: 'h-6 w-6' })}
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Predicted Sentiment
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-slate-900">{result.sentiment}</h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      sentimentStyles[result.sentiment].badge
                    }`}
                  >
                    Polarity: {result.polarity > 0 ? `+${result.polarity.toFixed(3)}` : result.polarity.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 sm:text-right">
              <span className="font-semibold text-slate-800 block">Classification Rule Applied</span>
              <span className="font-mono text-[11px] text-slate-500">
                {result.polarity > 0.05 && 'Polarity > +0.05 → Positive'}
                {result.polarity < -0.05 && 'Polarity < -0.05 → Negative'}
                {result.polarity >= -0.05 && result.polarity <= 0.05 && '-0.05 ≤ Polarity ≤ +0.05 → Neutral'}
              </span>
            </div>
          </div>

          {/* Polarity Gauge & Explanation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Sentiment Polarity Gauge</span>
              <span className="font-mono font-bold text-slate-900">
                Score: {result.polarity > 0 ? `+${result.polarity.toFixed(4)}` : result.polarity.toFixed(4)}
              </span>
            </div>

            {/* Gradient Bar with Marker */}
            <div className="relative pt-1 pb-2">
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-rose-500 via-slate-300 to-emerald-500 shadow-inner" />
              {/* Pin indicator */}
              <div
                className="absolute top-0 -ml-2 transition-all duration-300"
                style={{ left: `${getMarkerPosition(result.polarity)}%` }}
              >
                <div className="h-5 w-4 rounded-sm bg-slate-900 border-2 border-white shadow-md flex items-center justify-center">
                  <div className="h-2 w-0.5 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span className="text-rose-600 font-semibold">-1.0 (Strongly Negative)</span>
              <span className="text-slate-600 font-semibold">0.0 (Neutral)</span>
              <span className="text-emerald-600 font-semibold">+1.0 (Strongly Positive)</span>
            </div>

            {/* Scale Meaning Caveat */}
            <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/60 flex items-start gap-2 text-xs text-blue-900">
              <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Important Note:</strong> This score represents <strong>sentiment polarity</strong> (emotional valence on a continuous scale from -1.0 to +1.0) calculated by TextBlob's pattern lexicon, <em>not</em> classification probability or model confidence.
              </p>
            </div>
          </div>

          {/* Original vs Preprocessed Text Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
                Original Input Text
              </span>
              <p className="text-slate-900 text-sm leading-relaxed whitespace-pre-wrap">
                {result.original_text}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200 space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-blue-600 block">
                Preprocessed / Cleaned Text
              </span>
              <p className="text-blue-950 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {result.cleaned_text}
              </p>
              <p className="text-[10px] text-slate-400 pt-1">
                Normalized URLs, handles, and whitespace while preserving hashtag semantic words and emojis.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
