import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, FileCode } from 'lucide-react';
import { Clause, RiskLevel } from '@/lib/types';

interface RiskMatrixProps {
  clauses: Clause[];
  userPersona: string;
  onSelectClauseForNegotiation?: (clause: Clause) => void;
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({
  clauses,
  userPersona,
  onSelectClauseForNegotiation,
}) => {
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(clauses[0]?.id || null);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-700 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-700 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredClauses = clauses.filter((c) => {
    if (filterRisk === 'ALL') return true;
    return c.riskLevel === filterRisk;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            Personalized Risk Map & Plain Language Translation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clauses ranked by risk to your persona context ({userPersona || 'Standard Context'}).
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
            <button
              key={risk}
              type="button"
              onClick={() => setFilterRisk(risk)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                filterRisk === risk
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {risk} ({risk === 'ALL' ? clauses.length : clauses.filter((c) => c.riskLevel === risk).length})
            </button>
          ))}
        </div>
      </div>

      {/* Clause Cards List */}
      <div className="space-y-3 pt-2">
        {clauses.length === 0 && (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Contract Clauses Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              The uploaded file does not contain legal contract clauses or agreements. Please upload a valid legal document (lease, NDA, MSA, employment agreement) to analyze risks.
            </p>
          </div>
        )}
        {filteredClauses.map((clause) => {
          const isExpanded = expandedClauseId === clause.id;
          return (
            <div
              key={clause.id}
              className={`border rounded-xl transition-all overflow-hidden ${
                clause.riskLevel === 'CRITICAL'
                  ? 'border-red-200 bg-red-50/20'
                  : clause.riskLevel === 'HIGH'
                  ? 'border-orange-200 bg-orange-50/10'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedClauseId(isExpanded ? null : clause.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 transition"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getRiskBadge(
                      clause.riskLevel
                    )}`}
                  >
                    {clause.riskLevel}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 mr-2">{clause.sectionNumber}</span>
                    <h3 className="font-semibold text-sm text-slate-900 inline">{clause.title}</h3>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 hidden sm:inline">
                    {clause.category}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Card Details */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/30 space-y-3 text-xs">
                  {/* Plain Language Translation Box */}
                  <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3">
                    <span className="font-bold text-blue-900 block mb-1">
                      💡 Plain Language Translation:
                    </span>
                    <p className="text-blue-900 text-xs leading-relaxed">{clause.plainLanguage}</p>
                  </div>

                  {/* Impact on User's Persona */}
                  <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3">
                    <span className="font-bold text-amber-900 block mb-1">
                      ⚠️ Why it matters to your situation:
                    </span>
                    <p className="text-amber-900 text-xs leading-relaxed">{clause.personaImpact}</p>
                  </div>

                  {/* Original Legalese Quote */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3">
                    <span className="font-bold text-slate-600 block mb-1 flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5 text-slate-400" /> Exact Legalese Text:
                    </span>
                    <p className="font-mono text-slate-700 text-[11px] leading-relaxed italic bg-slate-50 p-2 rounded">
                      "{clause.originalText}"
                    </p>
                  </div>

                  {/* Action Button: Draft Counter-Proposal */}
                  {onSelectClauseForNegotiation && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => onSelectClauseForNegotiation(clause)}
                        className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1.5"
                      >
                        Draft Counter-Proposal for this Clause →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
