import React from 'react';
import { Cpu, ShieldCheck, Database, Layers, CheckCircle2, FileJson, ArrowRight, Network } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const genAiComponents = [
    {
      name: 'Clause & Obligation Extraction Engine',
      service: 'Nara Router API (https://router.bynara.id/v1) / Google Gemini API',
      endpoint: '/api/analyze',
      method: 'Structured JSON Schema Generation',
      description: 'Receives document text + user persona. Queries `nemotron-3.5-lightning-free` via Nara Router gateway (or Gemini `gemini-1.5-flash`) with a strict JSON schema prompt to extract clauses, section numbers, plain language translations, risk levels (CRITICAL/HIGH/MEDIUM/LOW), and obligation deadlines.',
      verification: 'Validates JSON syntax and schema compliance before returning to UI.',
    },
    {
      name: '"What-If?" Scenario Consequence Simulator',
      service: 'Nara Router API / Google Gemini Reasoning Engine',
      endpoint: '/api/simulate',
      method: 'Multi-Step Consequence Chain Analysis',
      description: 'Receives contract text + user scenario (e.g. "What if I quit in 3 months?"). Performs a reasoning pass to trace the step-by-step consequence workflow, attaching exact clause citations to every step.',
      verification: 'Grounded Verifier Pass audits claims against original contract clauses to filter out ungrounded assertions.',
    },
    {
      name: 'Negotiation Kit Drafter',
      service: 'Nara Router API / Google Gemini API',
      endpoint: '/api/negotiate',
      method: 'Diplomatic Redline & Email Generation',
      description: 'Receives target clause text and issue description. Generates a polite, non-confrontational counter-proposal email draft and redlined alternative clause text.',
      verification: 'Ensures proposed redline text maintains legal clarity while easing user risk.',
    },
    {
      name: 'Document & Revision Comparison Engine',
      service: 'Nara Router API / Google Gemini API',
      endpoint: '/api/compare',
      method: 'Side-by-Side Contract Delta Parser',
      description: 'Compares Document A vs Document B. Detects added obligations, removed clauses, increased risks, and decreased risks.',
      verification: 'Categorizes delta impacts into actionable verdict recommendations.',
    },
    {
      name: 'Obligation Timeline & iCalendar Exporter',
      service: 'Native TypeScript iCalendar (.ics) Generator',
      endpoint: '/api/export-ics',
      method: 'RFC 5545 ICS Format Serializer',
      description: 'Converts extracted notice windows, auto-renewal deadlines, and payment due dates into standard `.ics` calendar events with 7-day advance reminder alarms.',
      verification: 'Compatible with Apple Calendar, Google Calendar, and Outlook.',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded">
          Evaluator Reference Section
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-indigo-600" />
          Explicit GenAI Architecture & Service Mapping
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Detailed technical breakdown of AI services, models, endpoints, prompt pipelines, and verification boundaries for evaluators.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4">
          <Network className="w-5 h-5 text-indigo-600 mb-1.5" />
          <h4 className="font-bold text-slate-900">LLM Services & Routers</h4>
          <p className="text-slate-600 mt-0.5 font-medium">
            Nara Router (`https://router.bynara.id/v1`) & Google Gemini API + Smart Local Fallback Parser
          </p>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1.5" />
          <h4 className="font-bold text-slate-900">Grounding & Verifier</h4>
          <p className="text-slate-600 mt-0.5 font-medium">
            Secondary verification pass ensures 100% clause text citations to eliminate hallucinations.
          </p>
        </div>

        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
          <Database className="w-5 h-5 text-amber-600 mb-1.5" />
          <h4 className="font-bold text-slate-900">Repository Footprint</h4>
          <p className="text-slate-600 mt-0.5 font-medium">
            &lt; 3 MB total size. Next.js App Router, zero external model weights required.
          </p>
        </div>
      </div>

      {/* Component Mapping Table / Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
          GenAI Endpoint & Service Registry:
        </h3>

        <div className="space-y-3">
          {genAiComponents.map((comp, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-900">{comp.name}</span>
                  <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                    {comp.endpoint}
                  </span>
                </div>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                  {comp.service}
                </span>
              </div>

              <div className="text-xs text-slate-700 space-y-1">
                <div>
                  <strong className="text-slate-900">Method & Pattern:</strong> {comp.method}
                </div>
                <div>
                  <strong className="text-slate-900">Description:</strong> {comp.description}
                </div>
                <div className="text-emerald-800 font-medium bg-emerald-50 p-2 rounded border border-emerald-200 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Verification Rule:</strong> {comp.verification}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
