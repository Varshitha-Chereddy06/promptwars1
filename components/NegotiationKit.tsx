import React, { useState } from 'react';
import { MessageSquarePlus, Copy, Check, Sparkles, Send, FileEdit } from 'lucide-react';
import { Clause, NegotiationDraft } from '@/lib/types';

interface NegotiationKitProps {
  clauses: Clause[];
  selectedClause?: Clause | null;
  userPersona: string;
  apiKey?: string;
}

export const NegotiationKit: React.FC<NegotiationKitProps> = ({
  clauses,
  selectedClause,
  userPersona,
  apiKey,
}) => {
  const [activeClauseId, setActiveClauseId] = useState<string>(
    selectedClause?.id || clauses[0]?.id || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<NegotiationDraft | null>(null);
  const [copied, setCopied] = useState(false);

  const currentClause = clauses.find((c) => c.id === activeClauseId) || clauses[0];

  const handleGenerateDraft = async () => {
    if (!currentClause) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseText: currentClause.originalText,
          issueSummary: currentClause.riskReasoning,
          persona: userPersona,
          apiKey,
        }),
      });

      const data = await res.json();
      setDraft(data);
    } catch (err) {
      console.error('Draft negotiation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEmail = () => {
    if (!draft) return;
    navigator.clipboard.writeText(`Subject: ${draft.emailSubject}\n\n${draft.emailBodyDraft}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MessageSquarePlus className="w-5 h-5 text-teal-600" />
          Negotiation Kit & Counter-Proposal Drafter
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate polite, diplomatic emails and redlined clause alternatives to negotiate better contract terms.
        </p>
      </div>

      {/* Clause Picker */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 block">Select Risky Clause to Amend:</label>
        <select
          value={activeClauseId}
          onChange={(e) => {
            setActiveClauseId(e.target.value);
            setDraft(null);
          }}
          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800"
        >
          {clauses.map((c) => (
            <option key={c.id} value={c.id}>
              [{c.riskLevel}] {c.sectionNumber} - {c.title}
            </option>
          ))}
        </select>
      </div>

      {currentClause && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">Selected Clause Text:</span>
            <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
              Risk: {currentClause.riskLevel}
            </span>
          </div>
          <p className="font-mono text-slate-600 italic bg-white p-2.5 rounded border border-slate-200">
            &ldquo;{currentClause.originalText}&rdquo;
          </p>

          <button
            onClick={handleGenerateDraft}
            disabled={isLoading}
            className="w-full bg-teal-600 text-white text-xs py-2.5 rounded-xl font-bold hover:bg-teal-700 transition flex items-center justify-center gap-1.5 mt-2"
          >
            {isLoading ? (
              'Drafting Counter-Proposal...'
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Counter-Email & Redline
              </>
            )}
          </button>
        </div>
      )}

      {/* Output Draft */}
      {draft && (
        <div className="border border-teal-200 bg-teal-50/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-teal-200/60 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-600" /> Draft Counter-Request Email
            </h3>
            <button
              onClick={handleCopyEmail}
              className="text-xs bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-50 transition flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy Email Text
                </>
              )}
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Subject Line:</span>
              <p className="font-semibold text-slate-900 bg-white p-2.5 rounded-xl border border-teal-100">
                {draft.emailSubject}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Proposed Redline Text:</span>
              <p className="font-mono text-teal-900 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 leading-relaxed">
                &ldquo;{draft.proposedRevisionText}&rdquo;
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Email Body Draft:</span>
              <pre className="font-sans text-slate-800 bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
                {draft.emailBodyDraft}
              </pre>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900">
              <strong>💡 Negotiation Strategy Tip:</strong> {draft.tacticalTip}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
