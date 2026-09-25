import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, FileX, AlertTriangle } from 'lucide-react';
import { ScenarioResult, Clause } from '@/lib/types';

interface ScenarioSimulatorProps {
  contractText: string;
  userPersona: string;
  clauses: Clause[];
  apiKey?: string;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  contractText,
  userPersona,
  clauses,
  apiKey,
}) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasContract = Boolean(contractText && contractText.trim().length > 0);

  const presetQuestions = [
    'What if I quit or terminate the contract in 3 months?',
    'What if I pay rent / invoice 10 days late?',
    'What if I use my own pre-existing code or laptop for project work?',
    'What if the other party breaches confidentiality or non-solicit terms?',
  ];

  const handleRunSimulation = async (questionToRun: string) => {
    if (!questionToRun.trim()) return;

    if (!hasContract) {
      setErrorMessage('Please upload or select a legal contract above before running a scenario simulation.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText,
          persona: userPersona,
          question: questionToRun,
          apiKey,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.details || data.error || 'Failed to simulate scenario.');
        setScenarioResult(null);
        return;
      }

      setScenarioResult(data);
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Scenario simulation error:', err);
      setErrorMessage('Network or server error during scenario simulation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Play className="w-5 h-5 text-emerald-600 fill-emerald-600" />
            &ldquo;What If?&rdquo; Life Scenario Consequence Simulator
          </h2>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Grounded Verifier Enabled
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Ask what happens to <em>you</em> if an event occurs. Clause2Life chains clauses together to trace step-by-step financial & legal consequences.
        </p>
      </div>

      {/* No Contract Warning Notice */}
      {!hasContract && (
        <div
          role="alert"
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-900"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-amber-950 block">No Contract Document Loaded</strong>
            <p className="text-amber-800 leading-relaxed">
              To run grounded consequence simulations, please select a pre-analyzed sample contract or upload your agreement (PDF/TXT) in <strong>Step 1</strong> above.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert Box */}
      {errorMessage && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-red-900 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-red-950 block">Simulation Blocked</strong>
            <p className="text-red-700 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Preset Questions */}
      <div>
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
          Click a Scenario to Simulate:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCustomQuestion(q);
                handleRunSimulation(q);
              }}
              disabled={isLoading || !hasContract}
              className={`text-left text-xs p-3 rounded-xl border transition flex items-center justify-between group ${
                hasContract
                  ? 'border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 font-medium text-slate-700'
                  : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <span>{q}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Freeform Query Box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          disabled={!hasContract}
          placeholder={
            hasContract
              ? "Ask any scenario: e.g. What if I want to sub-lease my apartment?"
              : "Upload a contract first to ask scenario questions..."
          }
          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium disabled:bg-slate-100 disabled:text-slate-400"
          aria-label="Scenario question input"
        />
        <button
          onClick={() => handleRunSimulation(customQuestion)}
          disabled={isLoading || !customQuestion.trim() || !hasContract}
          className="bg-emerald-600 text-white text-xs px-5 py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition shrink-0 flex items-center gap-1.5 shadow-xs"
        >
          {isLoading ? (
            'Simulating...'
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Simulate
            </>
          )}
        </button>
      </div>

      {/* Simulation Result Output */}
      {scenarioResult && (
        <div className="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Grounded Scenario Assessment
              </span>
              <h3 className="font-bold text-slate-900 text-base">&ldquo;{scenarioResult.question}&rdquo;</h3>
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded ${
                  scenarioResult.overallRiskLevel === 'HIGH' || scenarioResult.overallRiskLevel === 'CRITICAL'
                    ? 'bg-red-100 text-red-800'
                    : scenarioResult.overallRiskLevel === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Risk: {scenarioResult.overallRiskLevel}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            {scenarioResult.summary}
          </p>

          {/* Consequence Timeline Chain */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Step-by-Step Consequence Chain:
            </h4>
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-emerald-300">
              {scenarioResult.consequenceChain.map((step, i) => (
                <div key={i} className="relative flex items-start space-x-3 text-xs pl-8">
                  <div className="absolute left-0 top-0 bg-emerald-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                    {step.stepNumber}
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 w-full shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{step.action}</span>
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Citation: {step.clauseCitation}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{step.consequence}</p>
                    <div className="bg-amber-50 p-2 rounded text-amber-900 font-medium text-[11px] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Impact: {step.financialOrLegalImpact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verifier Badge & Actionable Advice */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {scenarioResult.verifierPassed
                  ? 'Verifier Pass: Grounded in source contract terms'
                  : 'Verifier Notice: ' + (scenarioResult.verifierNotes || 'Default law applied')}
              </span>
            </div>
            <div className="text-slate-700">
              <strong>Recommended Action:</strong> {scenarioResult.actionableAdvice}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
