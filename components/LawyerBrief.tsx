import React from 'react';
import { FileCheck, Printer, HelpCircle, AlertTriangle, UserCheck, AlertCircle } from 'lucide-react';
import { LawyerBriefData } from '@/lib/types';

interface LawyerBriefProps {
  briefData?: LawyerBriefData | null;
}

export const LawyerBrief: React.FC<LawyerBriefProps> = ({ briefData }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!briefData || !briefData.summary) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="font-bold text-slate-800 text-sm">No Lawyer Brief Available</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please upload or select a legal contract to generate an executive legal consultation brief.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-blue-700 bg-blue-100 px-2.5 py-1 rounded">
            Lawyer-Ready Consultation Brief
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{briefData.documentTitle}</h2>
          <p className="text-xs text-slate-500">
            Document Type: {briefData.documentType} • Prepared on {briefData.generatedAt}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="bg-slate-900 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-1.5 print:hidden"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF Brief
        </button>
      </div>

      {/* User Context */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1">
        <span className="font-bold text-slate-700 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-slate-500" /> Client Persona & Context:
        </span>
        <p className="text-slate-700">{briefData.userPersona || 'Standard Individual'}</p>
      </div>

      {/* Executive Summary */}
      <div className="text-xs space-y-1">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Executive Overview:</h4>
        <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-200">
          {briefData.summary}
        </p>
      </div>

      {/* Flagged Risks */}
      <div className="space-y-2 text-xs">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-600" /> Key Flagged Risks for Attorney Review:
        </h4>
        <div className="space-y-2">
          {(briefData.topRisks || []).map((risk, idx) => (
            <div key={idx} className="border border-red-200 bg-red-50/30 rounded-xl p-3">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{risk.clauseTitle}</span>
                <span className="text-[11px] font-semibold text-red-700">{risk.citation}</span>
              </div>
              <p className="text-slate-600 mt-1">{risk.risk}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Obligations */}
      <div className="space-y-2 text-xs">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider">Crucial Milestones & Notice Windows:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(briefData.keyObligations || []).map((ob, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
              <span className="font-bold text-slate-800 block">{ob.title}</span>
              <span className="text-slate-600 text-[11px]">{ob.dateOrWindow}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Targeted Questions for Lawyer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs space-y-2">
        <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-blue-700" /> Targeted Questions to Ask Your Attorney:
        </h4>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          {(briefData.questionsForLawyer || []).map((q, idx) => (
            <li key={idx}>{q}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
