export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Clause {
  id: string;
  sectionNumber: string;
  title: string;
  originalText: string;
  plainLanguage: string;
  category: 'Termination' | 'Payment' | 'Intellectual Property' | 'Liability' | 'Confidentiality' | 'Renewal' | 'Dispute' | 'General';
  riskLevel: RiskLevel;
  riskReasoning: string;
  personaImpact: string;
}

export interface ObligationDate {
  id: string;
  title: string;
  description: string;
  dateOrWindow: string; // e.g., "30 days before auto-renewal", "2026-10-15"
  isoDate?: string;
  clauseId: string;
  clauseCitation: string;
  category: 'Notice Window' | 'Payment Due' | 'Auto-Renewal' | 'Termination Deadline' | 'Deliverable';
  isRecurring: boolean;
}

export interface Persona {
  id: string;
  name: string;
  role: string; // e.g., "Freelance Software Engineer", "Residential Tenant", "Borrower"
  description: string; // User situation
  concerns: string[];
}

export interface ScenarioStep {
  stepNumber: number;
  action: string;
  consequence: string;
  financialOrLegalImpact: string;
  clauseCitation: string;
  clauseId?: string;
}

export interface ScenarioResult {
  question: string;
  summary: string;
  consequenceChain: ScenarioStep[];
  overallRiskLevel: RiskLevel;
  verifierPassed: boolean;
  verifierNotes: string;
  actionableAdvice: string;
}

export interface NegotiationDraft {
  clauseId: string;
  originalClauseText: string;
  issueSummary: string;
  proposedRevisionText: string;
  emailSubject: string;
  emailBodyDraft: string;
  tacticalTip: string;
}

export interface DocumentComparison {
  documentA: { name: string };
  documentB: { name: string };
  overallComparisonSummary: string;
  addedObligations: string[];
  removedObligations: string[];
  increasedRisks: { clause: string; detail: string }[];
  decreasedRisks: { clause: string; detail: string }[];
  recommendation: string;
}

export interface LawyerBriefData {
  documentTitle: string;
  documentType: string;
  summary: string;
  userPersona: string;
  topRisks: { clauseTitle: string; citation: string; risk: string }[];
  keyObligations: { title: string; dateOrWindow: string }[];
  questionsForLawyer: string[];
  escalationWarnings: string[];
  generatedAt: string;
}

export interface AnalysisResult {
  documentTitle: string;
  documentType: string;
  summary: string;
  clauses: Clause[];
  obligationDates: ObligationDate[];
  escalationTriggered: boolean;
  escalationReason?: string;
  lawyerBrief: LawyerBriefData;
}
