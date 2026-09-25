import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  FileText,
  UserCheck,
  Play,
  ShieldAlert,
  Calendar,
  MessageSquarePlus,
  GitCompare,
  FileCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Cpu,
  Key,
} from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample?: (index: number) => void;
  onOpenApiKeyModal?: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  onOpenApiKeyModal,
}) => {
  const [activeStepTab, setActiveStepTab] = useState<number>(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Load or Select a Contract',
      subtitle: 'Upload PDF / Text or Pick a Pre-analyzed Sample',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      badgeBg: 'bg-blue-100 text-blue-800',
      description:
        'Start with a real-world legal document. You can instantly select from pre-analyzed benchmark contracts (Freelance Dev, Rental Lease, SaaS Terms) or upload your own PDF or paste raw contract text.',
      keyActions: [
        'Select any pre-configured template to explore without needing an API key.',
        'Upload your own contract (.pdf or .txt) or paste raw text into the box.',
        'Toggle "View Full Document Text" to inspect the raw clause passages anytime.',
      ],
      proTip: 'Pre-loaded sample contracts come with instant parsed risks, timelines, and ready-to-test scenarios!',
    },
    {
      step: 2,
      title: 'Set Your Persona & Context',
      subtitle: 'Personalize the Legal Consequences to You',
      icon: UserCheck,
      color: 'from-purple-500 to-indigo-500',
      badgeBg: 'bg-purple-100 text-purple-800',
      description:
        'Clause2Life translates abstract legal jargon into personalized impacts. Set your role, risk tolerance, and jurisdiction so the AI knows who you are and highlights consequences that matter to your situation.',
      keyActions: [
        'Choose or customize your role (e.g., Freelance Developer, Tenant, Startup Founder).',
        'Set your Risk Tolerance (Conservative, Balanced, Aggressive).',
        'Specify your Jurisdiction / Location to contextualize local statutory rules.',
      ],
      proTip: 'Changing your persona automatically re-analyzes the contract to highlight risks specific to your role.',
    },
    {
      step: 3,
      title: 'Run "What-If?" Simulations',
      subtitle: 'Ask Real Life Scenarios & Get Grounded Answers',
      icon: Play,
      color: 'from-emerald-500 to-teal-500',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      description:
        'Test real-world life and business events against your contract. Get grounded answers with direct citations to clauses, actionable steps, and immediate risk levels.',
      keyActions: [
        'Click quick-test prompts like "What if I terminate early?" or "What if client delays payment?".',
        'Type any custom scenario question in plain English.',
        'Inspect exact clause quotes, severity tags, and step-by-step action plans.',
      ],
      proTip: 'Every answer is strictly grounded in the document text—preventing AI hallucinations!',
    },
    {
      step: 4,
      title: 'Explore Risk Map & Timeline',
      subtitle: 'Audit Red Flags & Never Miss Deadlines',
      icon: ShieldAlert,
      color: 'from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-100 text-amber-800',
      description:
        'Inspect the Risk Map to uncover hidden gotchas and one-sided clauses. View the Timeline & Calendar tab to see all chronological milestones, notice periods, and renewal deadlines.',
      keyActions: [
        'Check the Risk Map for High, Medium, and Low severity clause classifications.',
        'View the Timeline for payment dates, cure periods, and auto-renewal cutoffs.',
        'Click "Negotiate This" on any risky clause to instantly draft revisions.',
      ],
      proTip: 'Use the Timeline view to note 30-day or 60-day written notice requirements before auto-renewal locks in.',
    },
    {
      step: 5,
      title: 'Negotiate, Compare & Brief',
      subtitle: 'Generate Counter-Proposals & Lawyer Briefs',
      icon: MessageSquarePlus,
      color: 'from-rose-500 to-pink-500',
      badgeBg: 'bg-rose-100 text-rose-800',
      description:
        'Arm yourself with professional negotiation kits and redlined counter-proposals. Compare two contract versions side-by-side or export an executive brief for your attorney.',
      keyActions: [
        'Negotiation Kit: Generate balanced counter-language with polite email drafts and fallback options.',
        'Document Compare: Compare original vs redlined version to spot additions, deletions, and risk changes.',
        'Lawyer Brief: Export a concise summary with flagged ambiguities to save billable attorney hours.',
      ],
      proTip: 'Copy ready-to-send emails straight from the Negotiation Kit to reply to recruiters or clients!',
    },
    {
      step: 6,
      title: 'API Key Setup (Optional)',
      subtitle: 'Nara Router or Google Gemini for Custom Docs',
      icon: Key,
      color: 'from-blue-600 to-slate-700',
      badgeBg: 'bg-slate-100 text-slate-800',
      description:
        'Sample contracts work immediately out-of-the-box. When analyzing custom uploaded contracts or custom prompts, you can provide your own Nara Router or Gemini API key in the top navigation bar.',
      keyActions: [
        'Click the "Configure API Key" button in the top navigation bar.',
        'Enter your Nara Router key (sk-nry-...) or Google Gemini key (AIza...).',
        'Keys are securely saved in your local browser session storage.',
      ],
      proTip: 'Nara Router provides fast, multi-model routing with strict schema adherence for legal analysis.',
    },
  ];

  const currentStep = steps[activeStepTab - 1];
  const IconComponent = currentStep.icon;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-2xl shadow-lg">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  How to Use Clause2Life
                </h2>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 border border-blue-400/40 px-2 py-0.5 rounded-full font-semibold">
                  Interactive Guide
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Master personalized legal consequence simulation in 6 simple steps.
              </p>
            </div>
          </div>

          {/* Step Selector Chips */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
            {steps.map((s) => (
              <button
                key={s.step}
                onClick={() => setActiveStepTab(s.step)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  activeStepTab === s.step
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  {s.step}
                </span>
                <span className="hidden sm:inline">{s.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step Hero Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3.5">
                <div
                  className={`p-3 bg-gradient-to-tr ${currentStep.color} text-white rounded-2xl shadow-md flex-shrink-0`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${currentStep.badgeBg}`}
                    >
                      STEP {currentStep.step} OF {steps.length}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                      {currentStep.title}
                    </h3>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {currentStep.subtitle}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Key Actions List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              What You Do in this Step
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {currentStep.keyActions.map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip Box */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start space-x-3">
            <div className="p-1.5 bg-amber-500 text-white rounded-lg flex-shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-900 block">Pro Tip</span>
              <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                {currentStep.proTip}
              </p>
            </div>
          </div>

          {/* Quick Feature Overview Matrix */}
          <div className="border-t border-slate-100 pt-4">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Available Feature Tabs at a Glance:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center space-x-2">
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-700">&ldquo;What-If?&rdquo; Sim</span>
              </div>
              <div className="p-2 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center space-x-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold text-slate-700">Risk Map</span>
              </div>
              <div className="p-2 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-700">Timeline</span>
              </div>
              <div className="p-2 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center space-x-2">
                <MessageSquarePlus className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-semibold text-slate-700">Negotiate Kit</span>
              </div>
              <div className="p-2 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center space-x-2">
                <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-slate-700">Doc Compare</span>
              </div>
              <div className="p-2 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center space-x-2">
                <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-semibold text-slate-700">Lawyer Brief</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Navigation */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {activeStepTab > 1 ? (
              <button
                onClick={() => setActiveStepTab((prev) => prev - 1)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Previous Step
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Step 1 of 6</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {activeStepTab < steps.length ? (
              <button
                onClick={() => setActiveStepTab((prev) => prev + 1)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:from-emerald-700 hover:to-teal-700 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Got it, Let&apos;s Start!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
