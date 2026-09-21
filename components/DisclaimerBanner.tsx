import React from 'react';
import { AlertTriangle, ShieldCheck, Info, Scale } from 'lucide-react';

interface DisclaimerBannerProps {
  escalationTriggered?: boolean;
  escalationReason?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  escalationTriggered,
  escalationReason,
}) => {
  return (
    <div className="w-full space-y-2 mb-4">
      {/* Permanent Information vs Legal Advice Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 px-4 flex items-center justify-between text-amber-900 text-xs sm:text-sm">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-amber-500/20 rounded-lg shrink-0">
            <Scale className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <span className="font-semibold text-amber-900">Legal Information Disclaimer:</span>{' '}
            Clause2Life provides AI-driven analytical information and scenario simulations. It is <strong className="underline">not</strong> legal advice and does not form an attorney-client relationship.
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-1.5 text-xs bg-amber-500/20 px-2.5 py-1 rounded-full text-amber-800 shrink-0 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Grounded Verifier Active</span>
        </div>
      </div>

      {/* Escalation Alert if Criminal / Massive Monetary / Litigation Terms Detected */}
      {escalationTriggered && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3 text-red-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-900">Attorney Consultation Strongly Recommended</h4>
            <p className="mt-0.5 text-xs text-red-800">
              {escalationReason ||
                'This document contains high-liability, court litigation, or complex indemnity provisions. You should consult a licensed attorney before signing.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
