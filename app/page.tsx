'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale,
  Play,
  ShieldAlert,
  Calendar,
  MessageSquarePlus,
  GitCompare,
  FileCheck,
  Cpu,
  Key,
  HelpCircle,
  Sparkles,
  Github,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { DocumentUploader } from '@/components/DocumentUploader';
import { PersonaForm } from '@/components/PersonaForm';
import { RiskMatrix } from '@/components/RiskMatrix';
import { ScenarioSimulator } from '@/components/ScenarioSimulator';
import { TimelineView } from '@/components/TimelineView';
import { NegotiationKit } from '@/components/NegotiationKit';
import { DocumentCompare } from '@/components/DocumentCompare';
import { LawyerBrief } from '@/components/LawyerBrief';
import { ArchitectureView } from '@/components/ArchitectureView';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { HowToUseModal } from '@/components/HowToUseModal';

import { SAMPLE_CONTRACTS, SampleContract } from '@/lib/samples';
import { AnalysisResult, Persona, Clause } from '@/lib/types';

export default function HomePage() {
  const [contractText, setContractText] = useState<string>(SAMPLE_CONTRACTS[0].content);
  const [contractTitle, setContractTitle] = useState<string>(SAMPLE_CONTRACTS[0].title);
  const [persona, setPersona] = useState<Persona>(SAMPLE_CONTRACTS[0].defaultPersona);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    SAMPLE_CONTRACTS[0].preparsedResult
  );

  const [activeTab, setActiveTab] = useState<
    'simulator' | 'risks' | 'timeline' | 'negotiate' | 'compare' | 'brief' | 'architecture'
  >('simulator');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessingDocument, setIsProcessingDocument] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState<boolean>(false);
  const [selectedNegotiationClause, setSelectedNegotiationClause] = useState<Clause | null>(null);
  const [showDocPreview, setShowDocPreview] = useState<boolean>(true);

  useEffect(() => {
    const savedKey = localStorage.getItem('clause2life_gemini_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('clause2life_gemini_key', key);
  };

  const handleDocumentLoaded = async (
    text: string,
    title: string,
    sample?: SampleContract,
    precomputedResult?: AnalysisResult
  ) => {
    setContractText(text);
    setContractTitle(title);
    setShowDocPreview(true);
    setIsProcessingDocument(false);

    if (sample) {
      setPersona(sample.defaultPersona);
      setAnalysisResult(sample.preparsedResult);
      return;
    }

    if (precomputedResult) {
      setAnalysisResult(precomputedResult);
      return;
    }

    if (!text || !text.trim()) {
      setAnalysisResult(null);
      return;
    }

    // Call /api/analyze for custom text/file
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          persona: persona.description,
          apiKey,
        }),
      });

      const data = await res.json();
      if (data && data.clauses) {
        setAnalysisResult(data);
      } else {
        setAnalysisResult(null);
      }
    } catch (err) {
      console.error('Document analysis error:', err);
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDocument = () => {
    setContractText('');
    setContractTitle('');
    setAnalysisResult(null);
    setShowDocPreview(false);
    setIsProcessingDocument(false);
    setSelectedNegotiationClause(null);
    setActiveTab('simulator');
  };

  const handlePersonaChange = async (updatedPersona: Persona) => {
    setPersona(updatedPersona);
    if (!contractText) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: contractText,
          persona: updatedPersona.description,
          apiKey,
        }),
      });

      const data = await res.json();
      if (data && data.clauses) {
        setAnalysisResult(data);
      }
    } catch (err) {
      console.error('Re-analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'simulator', label: '"What-If?" Simulator', icon: Play, count: null },
    { id: 'risks', label: 'Risk Map', icon: ShieldAlert, count: analysisResult?.clauses?.length || 0 },
    { id: 'timeline', label: 'Timeline & Calendar', icon: Calendar, count: analysisResult?.obligationDates?.length || 0 },
    { id: 'negotiate', label: 'Negotiation Kit', icon: MessageSquarePlus, count: null },
    { id: 'compare', label: 'Compare Documents', icon: GitCompare, count: null },
    { id: 'brief', label: 'Lawyer Brief', icon: FileCheck, count: null },
    { id: 'architecture', label: 'GenAI Architecture', icon: Cpu, count: 'AI' },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-xl shadow-lg">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Clause2Life
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  v1.0 GenAI Hackathon
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Personalized Legal Document Consequence Simulator & Grounded AI Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <button
              onClick={() => setIsHowToUseOpen(true)}
              className="text-xs px-3 py-1.5 rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 font-semibold transition flex items-center gap-1.5 shadow-xs"
              title="How to Use Clause2Life"
              aria-label="How to use guide"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span className="inline">How to Use</span>
            </button>

            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition flex items-center gap-1.5 ${
                apiKey
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{apiKey ? 'Nara / Gemini Key' : 'Configure API Key'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow space-y-6 w-full">
        {/* Persistent Legal Disclaimer Banner */}
        <DisclaimerBanner
          escalationTriggered={analysisResult?.escalationTriggered}
          escalationReason={analysisResult?.escalationReason}
        />

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Scale className="w-96 h-96" />
          </div>
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Consequence-Driven Legal AI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Don't ask what a clause says. Ask what happens to <span className="text-blue-400 underline underline-offset-4">YOU</span>.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Clause2Life turns legal agreements into personalized life simulations. Test scenarios like <em>"What if I quit in 3 months?"</em> or <em>"What if I pay late?"</em>, extract calendar deadlines, and generate counter-requests grounded 100% in contract text.
            </p>
          </div>
        </div>

        {/* Step 1 & Step 2 Input Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DocumentUploader
            onDocumentLoaded={handleDocumentLoaded}
            onClearDocument={handleClearDocument}
            isLoading={isLoading || isProcessingDocument}
            isProcessingDocument={isProcessingDocument}
          />
          <PersonaForm currentPersona={persona} onPersonaChange={handlePersonaChange} />
        </div>

        {/* Loaded Document Viewer Section */}
        {contractText && (
          <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div
                onClick={() => setShowDocPreview(!showDocPreview)}
                className="flex items-center justify-between cursor-pointer flex-1"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Loaded Document Text: <span className="text-blue-600">{contractTitle}</span>
                  </h3>
                  <span className="text-[11px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-semibold">
                    {contractText.length} chars • {contractText.split(/\s+/).length} words
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
                  <span>{showDocPreview ? 'Hide Text' : 'View Full Document Text'}</span>
                  {showDocPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearDocument}
                className="px-3 py-1.5 text-[11px] font-semibold rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition"
              >
                Clear text
              </button>
            </div>

            {showDocPreview && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-800 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {contractText}
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                        isActive ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tab View Rendering */}
        <div className="transition-all duration-200">
          {activeTab === 'simulator' && (
            <ScenarioSimulator
              contractText={contractText}
              userPersona={persona.description}
              clauses={analysisResult?.clauses || []}
              apiKey={apiKey}
            />
          )}

          {activeTab === 'risks' && (
            <RiskMatrix
              clauses={analysisResult?.clauses || []}
              userPersona={persona.description}
              onSelectClauseForNegotiation={(clause) => {
                setSelectedNegotiationClause(clause);
                setActiveTab('negotiate');
              }}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineView
              documentTitle={contractTitle}
              obligations={analysisResult?.obligationDates || []}
            />
          )}

          {activeTab === 'negotiate' && (
            <NegotiationKit
              clauses={analysisResult?.clauses || []}
              selectedClause={selectedNegotiationClause}
              userPersona={persona.description}
              apiKey={apiKey}
            />
          )}

          {activeTab === 'compare' && (
            <DocumentCompare
              currentDocText={contractText}
              currentDocName={contractTitle}
              apiKey={apiKey}
            />
          )}

          {activeTab === 'brief' && analysisResult?.lawyerBrief && (
            <LawyerBrief briefData={analysisResult.lawyerBrief} />
          )}

          {activeTab === 'architecture' && <ArchitectureView />}
        </div>
      </main>

      {/* Footer & Submission Info */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white font-bold text-xs">C2L</div>
              <span className="font-bold text-white text-sm">Clause2Life</span>
              <span className="text-slate-500">• Hackathon Submission Project</span>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <button
                onClick={() => setActiveTab('architecture')}
                className="text-slate-300 hover:text-white transition underline"
              >
                GenAI Architecture & Evaluator Docs
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-slate-300 hover:text-white transition flex items-center gap-1"
              >
                <Github className="w-4 h-4" /> GitHub Repository (&lt; 5 MB)
              </a>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center md:text-left leading-relaxed">
            Clause2Life is designed strictly to provide legal information, clause breakdown, and scenario simulation. It does not provide legal advice or act as a substitute for a licensed attorney.
          </p>
        </div>
      </footer>

      {/* Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveKey={handleSaveApiKey}
        currentKey={apiKey}
      />

      {/* Interactive How to Use Guide Modal */}
      <HowToUseModal
        isOpen={isHowToUseOpen}
        onClose={() => setIsHowToUseOpen(false)}
        onOpenApiKeyModal={() => {
          setIsHowToUseOpen(false);
          setIsApiKeyModalOpen(true);
        }}
      />
    </div>
  );
}
