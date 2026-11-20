import React from 'react';
import {
  Users,
  Target,
  GitBranch,
  Cpu,
  Layers,
  AlertTriangle,
  CheckCircle2,
  FileCode2,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const workflowSteps = [
    { step: '1', title: 'Dataset Collection', desc: 'Social media posts collected in structured CSV or Excel format.' },
    { step: '2', title: 'Text Preprocessing', desc: 'URL removal, mention handling, hashtag extraction, emoji preservation & deduplication.' },
    { step: '3', title: 'Sentiment Classification', desc: 'TextBlob NLP polarity calculation with positive (>0.05) & negative (<-0.05) thresholds.' },
    { step: '4', title: 'Statistical Analysis', desc: 'Exact frequency counting, percentage distribution, and polarity averages.' },
    { step: '5', title: 'Visualization', desc: 'Interactive Recharts bar charts, proportion donut charts, and summary metric cards.' },
    { step: '6', title: 'Results Export', desc: 'CSV & Excel exports preserving original post text, cleaned text, and polarity scores.' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Title Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
          Academic Project Showcase
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-3">
          Social Media Sentiment Analysis
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          An end-to-end data analytics system designed to clean unstructured social media comments, perform Natural Language Processing (NLP) sentiment classification, calculate precise sentiment proportions, and generate interactive visualizations.
        </p>

        {/* Student Team Banner */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Project Team & SRN Credentials
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Student 1</p>
                <p className="text-base font-bold text-slate-900">KRITHIKA</p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-md bg-white border border-slate-200 text-blue-700 shadow-2xs">
                R25DG010
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Student 2</p>
                <p className="text-base font-bold text-slate-900">TEJASWINI S</p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-md bg-white border border-slate-200 text-blue-700 shadow-2xs">
                R25DG026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Objective */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Project Objectives</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The primary objective is to analyze social media comments and quantify audience perception by categorizing feedback into three unambiguous classes:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs">
            <span className="font-bold text-emerald-800 block">1. Positive Sentiment</span>
            <span className="text-emerald-700/90 text-[11px]">Expressions of praise, appreciation, excitement, and endorsement.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-100/70 border border-slate-200/80 text-xs">
            <span className="font-bold text-slate-800 block">2. Neutral Sentiment</span>
            <span className="text-slate-600 text-[11px]">Objective statements, factual remarks, questions, and mentions.</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200/80 text-xs">
            <span className="font-bold text-rose-800 block">3. Negative Sentiment</span>
            <span className="text-rose-700/90 text-[11px]">Expressions of criticism, dissatisfaction, bug reports, or complaints.</span>
          </div>
        </div>
      </div>

      {/* Workflow Diagram */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Project Architectural Workflow</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {workflowSteps.map((item, idx) => (
            <div
              key={item.step}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 mb-1 block">
                  Step 0{item.step}
                </span>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology & Technologies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Methodology & Notebook Reuse</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The platform directly integrates the preprocessing rules and sentiment classification methodology established in the project notebook (<code className="font-mono text-blue-600">sentiment_analysis.ipynb</code>):
          </p>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
            <li>
              <strong>Column Auto-Discovery:</strong> Uses candidate matching to find comment columns (<code className="font-mono">text</code>, <code className="font-mono">comment</code>, <code className="font-mono">tweet</code>).
            </li>
            <li>
              <strong>Text Cleaning:</strong> Drops empty/null text, removes URLs, handles mentions, and strips whitespace.
            </li>
            <li>
              <strong>Hashtag and Emoji Retention:</strong> Unlike crude regex scrubbers, hashtag words are extracted to retain semantic sentiment.
            </li>
            <li>
              <strong>Polarity Classification:</strong> TextBlob polarity thresholding:
              <br />
              <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">
                score &gt; 0.05 (Positive) | score &lt; -0.05 (Negative) | else Neutral
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Technology Stack</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-medium text-slate-700">Backend Framework</span>
              <span className="font-mono text-slate-900 font-semibold">FastAPI + Uvicorn (Python 3.13)</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-medium text-slate-700">NLP Engine</span>
              <span className="font-mono text-slate-900 font-semibold">TextBlob + PatternAnalyzer</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-medium text-slate-700">Data Processing</span>
              <span className="font-mono text-slate-900 font-semibold">Pandas & OpenPyXL</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-medium text-slate-700">Frontend UI</span>
              <span className="font-mono text-slate-900 font-semibold">React 18, Vite, TypeScript</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-medium text-slate-700">Styling & Visualization</span>
              <span className="font-mono text-slate-900 font-semibold">Tailwind CSS & Recharts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Limitations and Disclosures */}
      <div className="bg-amber-50/50 rounded-xl border border-amber-200/80 p-6 text-xs text-amber-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          <span>Methodology Scope & Classification Limitations</span>
        </div>
        <p className="leading-relaxed">
          1. <strong>Lexicon-Based Nuance:</strong> TextBlob relies on a sentiment lexicon and pattern matching. Complex linguistic phenomena like heavy sarcasm, irony, cultural idioms, or contextual slang may not always be accurately classified without fine-tuned transformer models.
        </p>
        <p className="leading-relaxed">
          2. <strong>Offline Privacy & Upload Operation:</strong> This system does not claim unauthorized live background scraping from Instagram or Twitter/X APIs. It operates safely on user-supplied or benchmark datasets locally, ensuring data confidentiality and GDPR compliance.
        </p>
      </div>
    </div>
  );
};
