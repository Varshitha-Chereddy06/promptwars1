import React, { useState } from 'react';
import { GitCompare, Plus, Minus, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { DocumentComparison } from '@/lib/types';
import { SAMPLE_CONTRACTS } from '@/lib/samples';

interface DocumentCompareProps {
  currentDocText: string;
  currentDocName: string;
  apiKey?: string;
}

export const DocumentCompare: React.FC<DocumentCompareProps> = ({
  currentDocText,
  currentDocName,
  apiKey,
}) => {
  const [docBText, setDocBText] = useState<string>(SAMPLE_CONTRACTS[1].content);
  const [docBName, setDocBName] = useState<string>(SAMPLE_CONTRACTS[1].title);
  const [isLoading, setIsLoading] = useState(false);
  const [comparison, setComparison] = useState<DocumentComparison | null>(null);

  const handleRunComparison = async () => {
    if (!currentDocText || !docBText) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docAText: currentDocText,
          docBText: docBText,
          docAName: currentDocName || 'Current Document',
          docBName: docBName || 'Second Document',
          apiKey,
        }),
      });

      const data = await res.json();
      setComparison(data);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-indigo-600" />
          Document & Revision Comparison Engine
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Compare two contracts or revisions side-by-side to highlight added/removed obligations and risk changes.
        </p>
      </div>

      {/* Select Document B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="font-bold text-slate-700 block">Document A (Current):</span>
          <p className="font-semibold text-slate-900">{currentDocName || 'Current Loaded Document'}</p>
          <p className="font-mono text-[11px] text-slate-500 line-clamp-3">
            {currentDocText ? currentDocText.slice(0, 200) + '...' : 'No text loaded'}
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="font-bold text-slate-700 block">Document B (To Compare Against):</span>
          <select
            value={docBName}
            onChange={(e) => {
              const sample = SAMPLE_CONTRACTS.find((s) => s.title === e.target.value);
              if (sample) {
                setDocBName(sample.title);
                setDocBText(sample.content);
              }
            }}
            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none"
          >
            {SAMPLE_CONTRACTS.map((s) => (
              <option key={s.id} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
          <textarea
            rows={2}
            value={docBText}
            onChange={(e) => setDocBText(e.target.value)}
            placeholder="Or paste text for Version B..."
            className="w-full p-2 rounded-lg border border-slate-200 text-[11px] font-mono"
          />
        </div>
      </div>

      <button
        onClick={handleRunComparison}
        disabled={isLoading || !currentDocText || !docBText}
        className="w-full bg-indigo-600 text-white text-xs py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          'Comparing Documents...'
        ) : (
          <>
            <Sparkles className="w-4 h-4" /> Run Side-by-Side Comparison
          </>
        )}
      </button>

      {/* Comparison Delta Results */}
      {comparison && (
        <div className="border border-indigo-200 bg-indigo-50/20 rounded-2xl p-5 space-y-4">
          <div className="border-b border-indigo-200/60 pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
              Comparison Summary
            </span>
            <p className="text-xs text-slate-800 mt-1 leading-relaxed font-medium">
              {comparison.overallComparisonSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Added Obligations */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-red-700 flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Added Obligations in Version B
              </h4>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
                {comparison.addedObligations.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Removed Obligations */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-emerald-700 flex items-center gap-1.5">
                <Minus className="w-4 h-4" /> Removed / Eased Terms
              </h4>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
                {comparison.removedObligations.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Risk Changes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-orange-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Increased Risks
              </h4>
              {comparison.increasedRisks.map((r, i) => (
                <div key={i} className="text-orange-900">
                  <strong>{r.clause}:</strong> {r.detail}
                </div>
              ))}
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" /> Decreased Risks
              </h4>
              {comparison.decreasedRisks.map((r, i) => (
                <div key={i} className="text-emerald-900">
                  <strong>{r.clause}:</strong> {r.detail}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950">
            <strong>Verdict Recommendation:</strong> {comparison.recommendation}
          </div>
        </div>
      )}
    </div>
  );
};
