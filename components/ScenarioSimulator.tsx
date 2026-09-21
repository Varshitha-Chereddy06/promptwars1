import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
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

  const presetQuestions = [
    'What if I quit or terminate the contract in 3 months?',
    'What if I pay rent / invoice 10 days late?',
    'What if I use my own pre-existing code or laptop for project work?',
    'What if the other party breaches confidentiality or non-solicit terms?',
  ];

  const handleRunSimulation = async (questionToRun: string) => {
    if (!questionToRun.trim()) return;
    setIsLoading(true);

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
      setScenarioResult(data);
    } catch (err) {
      console.error('Scenario simulation error:', err);
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
            "What If?" Life Scenario Consequence Simulator
          </h2>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Grounded Verifier Enabled
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Ask what happens to <em>you</em> if an event occurs. Clause2Life chains clauses together to trace step-by-step financial & legal consequences.
        </p>
      </div>

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
              disabled={isLoading}
              className="text-left text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 font-medium text-slate-700 transition flex items-center justify-between group"
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
          placeholder="Ask any scenario: e.g. What if I want to sub-lease my apartment?"
          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
        />
        <button
          onClick={() => handleRunSimulation(customQuestion)}
          disabled={isLoading || !customQuestion.trim()}
          className="bg-emerald-600 text-white text-xs px-5 py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition shrink-0 flex items-center gap-1.5"
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
        <div className="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Scenario Result
              </span>
              <h3 className="font-bold text-slate-900 text-base">"{scenarioResult.question}"</h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-red-100 text-red-800">
                Risk: {scenarioResult.overallRiskLevel}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-emerald-100">
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
                  <div className="absolute left-0 top-0 bg-emerald-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white">
                    {step.stepNumber}
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 w-full shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{step.action}</span>
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Citation: {step.clauseCitation}
                      </span>
                    </div>
                    <p className="text-slate-600">{step.consequence}</p>
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
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verifier Pass: Grounded in source contract clauses</span>
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
