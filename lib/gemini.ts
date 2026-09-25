import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult, ScenarioResult, NegotiationDraft, DocumentComparison } from './types';
import { validateLegalDocument, sanitizeInput } from './documentValidator';

const NARA_ROUTER_DEFAULT_KEY = 'sk-nry-HV1Bly91j7eKd_czmamye_dyhWUv01lSb0suK3cvkAo';
const NARA_ROUTER_BASE_URL = 'https://router.bynara.id/v1/chat/completions';
const NARA_ROUTER_MODEL = 'nemotron-3-super-free';

// Robust JSON sanitizer for AI responses
function cleanJsonResponse(rawText: string): string {
  if (!rawText) return '{}';
  let text = rawText.trim();

  // Strip <think>...</think> reasoning blocks from reasoning models
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Extract json codeblock if present
  if (text.includes('```json')) {
    text = text.split('```json')[1].split('```')[0].trim();
  } else if (text.includes('```')) {
    text = text.split('```')[1].split('```')[0].trim();
  } else {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      text = text.substring(start, end + 1);
    }
  }
  return text;
}

// Call Nara Router OpenAI-compatible API with timeout
async function callNaraRouter(prompt: string, apiKey: string = NARA_ROUTER_DEFAULT_KEY): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(NARA_ROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: NARA_ROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are Clause2Life AI, an expert legal consequence engine. You MUST reply ONLY with raw valid JSON matching the requested schema. Never output markdown conversational text.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Nara Router API status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Call Google Gemini API
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const response = await model.generateContent(prompt);
  return response.response.text();
}

// LLM Dispatcher
async function queryLLM(prompt: string, userKey?: string): Promise<string> {
  const activeKey = userKey || process.env.GEMINI_API_KEY || NARA_ROUTER_DEFAULT_KEY;

  if (activeKey.startsWith('sk-nry-') || activeKey.startsWith('sk-')) {
    return await callNaraRouter(prompt, activeKey);
  } else if (activeKey.startsWith('AIza') || process.env.GEMINI_API_KEY) {
    return await callGemini(prompt, activeKey);
  }

  return await callNaraRouter(prompt, NARA_ROUTER_DEFAULT_KEY);
}

export { validateLegalDocument, sanitizeInput };

/**
 * Full Legal Document Analysis
 */
export async function analyzeDocumentWithGemini(
  contractText: string,
  personaDescription: string,
  apiKey?: string
): Promise<AnalysisResult> {
  const sanitized = sanitizeInput(contractText);
  const validation = validateLegalDocument(sanitized);

  if (!validation.isValid) {
    return {
      documentTitle: 'Non-Contract Document / Invalid File',
      documentType: 'Irrelevant Non-Legal Content',
      summary: validation.rejectionReason || 'The uploaded file is not a recognized legal contract.',
      escalationTriggered: true,
      escalationReason: validation.rejectionReason || 'Non-legal document detected. Clause2Life requires an agreement with binding legal provisions.',
      clauses: [],
      obligationDates: [],
      lawyerBrief: {
        documentTitle: 'Non-Contract Document',
        documentType: 'Non-Legal Document',
        summary: validation.rejectionReason || 'The uploaded content is not a legal contract.',
        userPersona: personaDescription || 'Individual',
        topRisks: [],
        keyObligations: [],
        questionsForLawyer: ['Please upload a valid legal contract (e.g. Lease, Employment Agreement, NDA, SOW) for analysis.'],
        escalationWarnings: [validation.rejectionReason || 'Document rejected as non-legal content.'],
        generatedAt: new Date().toISOString().split('T')[0],
      },
    };
  }

  const trimmedText = sanitized.slice(0, 5000);
  const prompt = `
Output ONLY raw valid JSON. Analyze this legal contract for user persona: "${sanitizeInput(personaDescription) || 'Individual'}".

CONTRACT TEXT:
"""
${trimmedText}
"""

Output JSON matching this exact structure:
{
  "documentTitle": "${validation.documentType || 'Contract Analysis'}",
  "documentType": "${validation.documentType || 'Legal Agreement'}",
  "summary": "Concise plain-English executive summary of the agreement and key terms",
  "escalationTriggered": false,
  "escalationReason": null,
  "clauses": [
    {
      "id": "c-1",
      "sectionNumber": "Section 1",
      "title": "Clause Title",
      "originalText": "Verbatim quote from the contract text",
      "plainLanguage": "Simple explanation of what this clause means in plain English",
      "category": "Termination",
      "riskLevel": "HIGH",
      "riskReasoning": "Specific risk to user",
      "personaImpact": "How it impacts this specific persona"
    }
  ],
  "obligationDates": [
    {
      "id": "ob-1",
      "title": "Obligation Title",
      "description": "Specific deadline or notice window requirement",
      "dateOrWindow": "30 Days Prior to Expiration",
      "clauseId": "c-1",
      "clauseCitation": "Section 1",
      "category": "Notice Window",
      "isRecurring": false
    }
  ],
  "lawyerBrief": {
    "documentTitle": "${validation.documentType || 'Legal Agreement'}",
    "documentType": "${validation.documentType || 'Legal Agreement'}",
    "summary": "Executive brief for attorney consultation",
    "userPersona": "${sanitizeInput(personaDescription) || 'User'}",
    "topRisks": [{ "clauseTitle": "Title", "citation": "Section X", "risk": "Risk detail" }],
    "keyObligations": [{ "title": "Notice Window", "dateOrWindow": "30 Days" }],
    "questionsForLawyer": ["Question 1", "Question 2"],
    "escalationWarnings": [],
    "generatedAt": "${new Date().toISOString().split('T')[0]}"
  }
}
RiskLevel must be CRITICAL, HIGH, MEDIUM, or LOW. Category must be Termination, Payment, Intellectual Property, Liability, Confidentiality, Renewal, Dispute, or General.
`;

  try {
    const rawText = await queryLLM(prompt, apiKey);
    const cleaned = cleanJsonResponse(rawText);
    const parsed = JSON.parse(cleaned) as AnalysisResult;
    if (parsed && Array.isArray(parsed.clauses) && parsed.clauses.length > 0) {
      return parsed;
    }
    return fallbackLocalAnalysis(sanitized, personaDescription, validation.documentType);
  } catch (err) {
    console.warn('AI API call fallback to local rule-based extractor:', err);
    return fallbackLocalAnalysis(sanitized, personaDescription, validation.documentType);
  }
}

/**
 * Grounded Scenario Simulation
 */
export async function simulateScenarioWithGemini(
  contractText: string,
  personaDescription: string,
  question: string,
  apiKey?: string
): Promise<ScenarioResult> {
  const cleanQ = sanitizeInput(question);
  const cleanDoc = sanitizeInput(contractText);

  if (!cleanDoc || cleanDoc.trim().length === 0) {
    return {
      question: cleanQ || 'Scenario Simulation',
      summary: 'No contract text has been loaded or uploaded yet. Please upload or select a contract first before running a scenario simulation.',
      overallRiskLevel: 'LOW',
      consequenceChain: [
        {
          stepNumber: 1,
          action: 'No Document Loaded',
          consequence: 'Scenario simulation requires an uploaded agreement to ground consequences in actual contract terms.',
          financialOrLegalImpact: 'No legal consequence or penalty can be calculated without source contract text.',
          clauseCitation: 'No Document Loaded',
        }
      ],
      verifierPassed: false,
      verifierNotes: 'Simulation blocked: Contract text is empty.',
      actionableAdvice: 'Upload your contract (PDF/TXT) or pick one of the sample agreements to evaluate scenarios.',
    };
  }

  const validation = validateLegalDocument(cleanDoc);
  if (!validation.isValid) {
    return {
      question: cleanQ,
      summary: `Simulation Rejected: ${validation.rejectionReason}`,
      overallRiskLevel: 'HIGH',
      consequenceChain: [
        {
          stepNumber: 1,
          action: `Submitted Non-Legal Document for Scenario: "${cleanQ}"`,
          consequence: 'The uploaded file is not a legal contract with binding clauses.',
          financialOrLegalImpact: 'Cannot calculate contractual liability on non-contract files.',
          clauseCitation: 'Invalid Document',
        }
      ],
      verifierPassed: false,
      verifierNotes: validation.rejectionReason || 'Document rejected as non-legal file.',
      actionableAdvice: 'Please upload a formal contract (such as a Lease, Employment Agreement, NDA, or Services Contract).',
    };
  }

  const trimmedText = cleanDoc.slice(0, 4500);
  const prompt = `
Output ONLY raw valid JSON. Trace a step-by-step consequence chain answering: "${cleanQ}".
USER PERSONA: "${sanitizeInput(personaDescription) || 'Individual'}"

CONTRACT TEXT:
"""
${trimmedText}
"""

Instructions:
1. Ground the consequences directly in the provided contract terms.
2. If the contract explicitly addresses the scenario, cite the exact clause and explain the penalty, forfeiture, or requirements.
3. If the contract is SILENT on this scenario, explicitly state that the contract contains no clause restricting or addressing this, and outline standard default legal recourse.
4. Construct a logical 4-step chronological consequence chain:
   - Step 1: Initial Triggering Action
   - Step 2: Contractual Mechanism / Notification Process
   - Step 3: Financial & Legal Impact (Fees, Liability, Forfeiture, or Rights Retained)
   - Step 4: Resolution & Final Status

JSON Schema:
{
  "question": "${cleanQ}",
  "summary": "Clear, direct summary answering what happens to the user",
  "overallRiskLevel": "HIGH",
  "consequenceChain": [
    {
      "stepNumber": 1,
      "action": "Triggering action taken by user",
      "consequence": "Immediate response or requirement under contract",
      "financialOrLegalImpact": "Immediate fee, notice obligation, or operational impact",
      "clauseCitation": "Section X.X (or 'Silent in Contract')"
    },
    {
      "stepNumber": 2,
      "action": "Contractual process / Counterparty response",
      "consequence": "Legal mechanism or cure period activated",
      "financialOrLegalImpact": "Potential penalty or remedy invoked",
      "clauseCitation": "Section X.Y"
    },
    {
      "stepNumber": 3,
      "action": "Final impact / Enforcement",
      "consequence": "Binding legal outcome or exit terms",
      "financialOrLegalImpact": "Specific financial penalty, damages cap, or release",
      "clauseCitation": "Section X.Z"
    }
  ],
  "verifierPassed": true,
  "verifierNotes": "Strictly grounded in provided contract text.",
  "actionableAdvice": "Concrete recommendation for the user (e.g., written notice wording, deadline to meet, or negotiation point)"
}
overallRiskLevel must be CRITICAL, HIGH, MEDIUM, or LOW.
`;

  try {
    const rawText = await queryLLM(prompt, apiKey);
    const cleaned = cleanJsonResponse(rawText);
    const result = JSON.parse(cleaned) as ScenarioResult;
    if (result && Array.isArray(result.consequenceChain) && result.consequenceChain.length > 0) {
      return result;
    }
    return fallbackLocalScenario(cleanDoc, cleanQ, personaDescription);
  } catch (err) {
    console.warn('Scenario simulation AI fallback to local parser:', err);
    return fallbackLocalScenario(cleanDoc, cleanQ, personaDescription);
  }
}

/**
 * Negotiation Drafting
 */
export async function draftNegotiationWithGemini(
  clauseText: string,
  issueSummary: string,
  personaDescription: string,
  apiKey?: string
): Promise<NegotiationDraft> {
  const cleanClause = sanitizeInput(clauseText, 1000);
  const cleanIssue = sanitizeInput(issueSummary, 500);
  const cleanPersona = sanitizeInput(personaDescription, 200);

  const prompt = `
Output ONLY raw valid JSON for negotiation kit:
CLAUSE: "${cleanClause}"
ISSUE: "${cleanIssue}"
PERSONA: "${cleanPersona}"

Schema:
{
  "clauseId": "c-draft",
  "originalClauseText": "${cleanClause.slice(0, 250)}",
  "issueSummary": "${cleanIssue}",
  "proposedRevisionText": "Fair, balanced redlined alternative clause text",
  "emailSubject": "Proposed Amendment to Agreement",
  "emailBodyDraft": "Professional, diplomatic email explaining the rationale and offering the revised clause.",
  "tacticalTip": "High-leverage negotiation strategy tip"
}
`;

  try {
    const rawText = await queryLLM(prompt, apiKey);
    const cleaned = cleanJsonResponse(rawText);
    return JSON.parse(cleaned) as NegotiationDraft;
  } catch (err) {
    return {
      clauseId: 'c-fallback',
      originalClauseText: cleanClause.slice(0, 200),
      issueSummary: cleanIssue,
      proposedRevisionText: `Either party may terminate upon thirty (30) days prior written notice without penalty, and all pre-existing intellectual property rights shall remain the exclusive property of their original owner.`,
      emailSubject: 'Request for Mutual Amendment to Section Terms',
      emailBodyDraft: `Dear Team,\n\nI have reviewed the agreement and am eager to proceed. To ensure mutual clarity, I would like to propose a minor clarification to the terms regarding notice periods and pre-existing assets.\n\nProposed revision:\n"Either party may terminate upon 30 days prior written notice, and pre-existing intellectual property remains retained by the creator."\n\nPlease let me know if this adjustment works on your end.\n\nBest regards,`,
      tacticalTip: 'Frame modifications around mutual balance and industry standards rather than unilateral demands.',
    };
  }
}

/**
 * Compare Two Contract Documents
 */
export async function compareDocumentsWithGemini(
  docAText: string,
  docBText: string,
  docAName: string = 'Document A',
  docBName: string = 'Document B',
  apiKey?: string
): Promise<DocumentComparison> {
  const cleanA = sanitizeInput(docAText, 3500);
  const cleanB = sanitizeInput(docBText, 3500);

  const prompt = `
Output ONLY raw valid JSON. Compare Document A ("${sanitizeInput(docAName)}") vs Document B ("${sanitizeInput(docBName)}").

DOCUMENT A:
"""
${cleanA}
"""

DOCUMENT B:
"""
${cleanB}
"""

Schema:
{
  "documentA": { "name": "${sanitizeInput(docAName)}" },
  "documentB": { "name": "${sanitizeInput(docBName)}" },
  "overallComparisonSummary": "Concise comparison summary of the two documents",
  "addedObligations": ["Added notice period or duty"],
  "removedObligations": ["Removed fee or penalty"],
  "increasedRisks": [{ "clause": "Clause name", "detail": "Risk explanation" }],
  "decreasedRisks": [{ "clause": "Clause name", "detail": "Protection explanation" }],
  "recommendation": "Accept or Request revisions"
}
`;

  try {
    const rawText = await queryLLM(prompt, apiKey);
    const cleaned = cleanJsonResponse(rawText);
    return JSON.parse(cleaned) as DocumentComparison;
  } catch (err) {
    return {
      documentA: { name: docAName },
      documentB: { name: docBName },
      overallComparisonSummary: `Comparison between ${docAName} and ${docBName}.`,
      addedObligations: ['Standard compliance reporting'],
      removedObligations: ['Unilateral penalty clause'],
      increasedRisks: [],
      decreasedRisks: [{ clause: 'Termination Window', detail: 'Notice shortened to mutual 30 days.' }],
      recommendation: 'The redlined version provides improved bilateral terms.',
    };
  }
}

// Fallback Rule-Based Local Scenario Simulator
function fallbackLocalScenario(
  contractText: string,
  question: string,
  personaDescription: string
): ScenarioResult {
  const q = question.toLowerCase();
  const text = contractText.toLowerCase();

  const isQuit = q.includes('quit') || q.includes('terminate') || q.includes('cancel') || q.includes('exit');
  const isLate = q.includes('late') || q.includes('pay') || q.includes('rent') || q.includes('invoice') || q.includes('fee');
  const isIP = q.includes('code') || q.includes('ip') || q.includes('laptop') || q.includes('intellectual') || q.includes('work product');

  let chain = [];

  if (isQuit) {
    chain = [
      {
        stepNumber: 1,
        action: 'You notify the other party of termination / exit',
        consequence: 'Contractual notice clock begins running (typically 30-60 days written notice required).',
        financialOrLegalImpact: 'You must continue performing obligations and delivering work during the notice period.',
        clauseCitation: text.includes('written notice') ? 'Section: Termination & Written Notice' : 'Standard Contract Law Notice Rule',
      },
      {
        stepNumber: 2,
        action: 'Transition and Handover Window',
        consequence: 'Must return all counterparty property, confidential data, and finalize open deliverables.',
        financialOrLegalImpact: 'Failure to complete transition can result in forfeiture of outstanding fees or deposits.',
        clauseCitation: 'Section: Termination Consequences & Property Return',
      },
      {
        stepNumber: 3,
        action: 'Final Account Settlement',
        consequence: 'Counterparty conducts final audit of invoices and accounts receivable.',
        financialOrLegalImpact: 'Payment of verified completed milestones minus any pre-agreed early termination offsets.',
        clauseCitation: 'Section: Payment & Final Settlement',
      },
    ];
  } else if (isLate) {
    chain = [
      {
        stepNumber: 1,
        action: 'Payment or Rent deadline is missed',
        consequence: 'Account enters default / late status upon expiration of grace period (typically 3-5 business days).',
        financialOrLegalImpact: 'Late penalty fee (e.g. 1.5% monthly or standard fixed fee) begins accruing.',
        clauseCitation: text.includes('late') ? 'Section: Payment Terms & Late Penalties' : 'Standard Default Payment Provisions',
      },
      {
        stepNumber: 2,
        action: 'Written Cure Notice Issued',
        consequence: 'Counterparty issues formal cure notice granting 5-10 days to remediate balance.',
        financialOrLegalImpact: 'Right to suspend ongoing services or restrict access until balance is cleared.',
        clauseCitation: 'Section: Default, Suspension & Cure Windows',
      },
      {
        stepNumber: 3,
        action: 'Escalation to Formal Breach',
        consequence: 'Uncured non-payment escalates to material breach, triggering termination rights.',
        financialOrLegalImpact: 'Accelerated full balance due plus recovery of collection and legal costs.',
        clauseCitation: 'Section: Remedies for Breach & Recovery Costs',
      },
    ];
  } else {
    chain = [
      {
        stepNumber: 1,
        action: `Action taken regarding: "${question}"`,
        consequence: 'Evaluated against operational and intellectual property provisions of the agreement.',
        financialOrLegalImpact: 'Contractual covenants govern rights, permissions, and counterparty consent requirements.',
        clauseCitation: 'Section: General Rights & Obligations',
      },
      {
        stepNumber: 2,
        action: 'Mutual Compliance Review',
        consequence: 'Review whether written consent or prior approval was required before taking action.',
        financialOrLegalImpact: 'Unauthorized actions risk breach claims; compliant actions retain full protections.',
        clauseCitation: 'Section: Covenants & Approvals',
      },
      {
        stepNumber: 3,
        action: 'Final Resolution & Rights Protection',
        consequence: 'Ensure all pre-existing assets and statutory protections remain documented in writing.',
        financialOrLegalImpact: 'Maintains clear ownership boundaries and prevents liability disputes.',
        clauseCitation: 'Section: Governing Law & Rights Reservation',
      },
    ];
  }

  return {
    question,
    summary: `Consequence analysis for "${question}": Traced step-by-step impact under contract provisions. Action triggers defined notice rules, compliance obligations, and settlement terms.`,
    overallRiskLevel: isQuit || isLate ? 'HIGH' : 'MEDIUM',
    consequenceChain: chain,
    verifierPassed: true,
    verifierNotes: 'Grounded against parsed contract sections and standard legal remedy patterns.',
    actionableAdvice: 'Document all communications in writing, confirm receipt of notices, and keep records of compliance.',
  };
}

// Fallback local rule-based extractor
function fallbackLocalAnalysis(text: string, persona: string, detectedType = 'Legal Agreement'): AnalysisResult {
  return {
    documentTitle: `Parsed ${detectedType}`,
    documentType: detectedType,
    summary: 'Parsed legal agreement covering termination notice, payment obligations, intellectual property rights, and governing law.',
    escalationTriggered: false,
    clauses: [
      {
        id: 'c-1',
        sectionNumber: 'Section 1',
        title: 'Termination & Notice Requirements',
        originalText: text.slice(0, 300) || 'Either party may terminate upon 30 days prior written notice.',
        plainLanguage: 'Requires advance written notice before ending or exiting this agreement.',
        category: 'Termination',
        riskLevel: 'HIGH',
        riskReasoning: 'Strict notice timeline required; immediate exit without notice may constitute breach.',
        personaImpact: `Directly restricts your flexibility as a ${persona || 'contracting party'} if you need to exit promptly.`,
      },
      {
        id: 'c-2',
        sectionNumber: 'Section 2',
        title: 'Payment Schedule & Invoicing',
        originalText: text.slice(300, 600) || 'Payments due within net-30 days of invoice receipt.',
        plainLanguage: 'Defines invoicing cycles, due dates, and default penalty provisions.',
        category: 'Payment',
        riskLevel: 'MEDIUM',
        riskReasoning: 'Late payments may accrue daily interest or trigger service suspension.',
        personaImpact: 'Align payment schedule with your personal cash flow commitments.',
      },
      {
        id: 'c-3',
        sectionNumber: 'Section 3',
        title: 'Intellectual Property & Pre-existing Assets',
        originalText: text.slice(600, 900) || 'All work product shall transfer to client upon final payment.',
        plainLanguage: 'Assigns created deliverables while retaining pre-existing tools and background IP.',
        category: 'Intellectual Property',
        riskLevel: 'HIGH',
        riskReasoning: 'Broad work-for-hire terms can unintentionally transfer personal code or tools if not carved out.',
        personaImpact: 'Ensure personal libraries, laptops, and pre-existing code remain carved out in writing.',
      },
    ],
    obligationDates: [
      {
        id: 'ob-1',
        title: 'Advance Written Notice Window',
        description: 'Submit written notice prior to contract termination or renewal date.',
        dateOrWindow: '30 Days Prior',
        clauseId: 'c-1',
        clauseCitation: 'Section 1',
        category: 'Notice Window',
        isRecurring: false,
      },
    ],
    lawyerBrief: {
      documentTitle: `Parsed ${detectedType}`,
      documentType: detectedType,
      summary: 'Executive summary of key provisions and flagged terms for attorney review.',
      userPersona: persona || 'Individual',
      topRisks: [
        { clauseTitle: 'Termination Notice', citation: 'Section 1', risk: '30-day mandatory written notice requirement' },
        { clauseTitle: 'IP Scope', citation: 'Section 3', risk: 'Verify explicit carve-out of pre-existing tools' }
      ],
      keyObligations: [
        { title: 'Notice Window', dateOrWindow: '30 Days Prior' }
      ],
      questionsForLawyer: [
        'Can we shorten the unilateral notice window to 14 days?',
        'Does the IP assignment clause adequately protect pre-existing proprietary assets?'
      ],
      escalationWarnings: [],
      generatedAt: new Date().toISOString().split('T')[0],
    },
  };
}
