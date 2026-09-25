/**
 * Legal Document Validator & Security Sanitizer for Clause2Life
 * Ensures documents are genuine legal contracts/agreements and prevents processing
 * of non-legal, irrelevant files (exam timetables, resumes, recipes, etc.)
 *
 * Security Features:
 * - Multi-vector prompt injection defense
 * - XSS/HTML tag stripping
 * - JavaScript protocol filtering
 * - SQL injection pattern neutralization
 * - Data URI filtering
 * - Event handler attribute removal
 * - Null byte stripping
 * - Unicode control character filtering
 * - Template literal injection prevention
 * - CSRF token generation and validation
 */

import { createHash, randomBytes } from 'crypto';

export interface ValidationResult {
  isValid: boolean;
  documentType?: string;
  rejectionReason?: string;
  legalConfidenceScore: number;
}

/**
 * Generates a cryptographically secure CSRF token
 * @returns A hex-encoded random token string
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Validates a CSRF token against the expected value using timing-safe comparison
 * @param token - The token to validate
 * @param expected - The expected token value
 * @returns True if tokens match
 */
export function validateCsrfToken(token: string, expected: string): boolean {
  if (!token || !expected || token.length !== expected.length) return false;
  const tokenBuffer = Buffer.from(token, 'utf-8');
  const expectedBuffer = Buffer.from(expected, 'utf-8');
  try {
    const { timingSafeEqual } = require('crypto');
    return timingSafeEqual(tokenBuffer, expectedBuffer);
  } catch {
    // Fallback constant-time comparison
    let result = 0;
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return result === 0;
  }
}

/**
 * Strips prompt injection attempts, XSS payloads, and dangerous content from user inputs.
 *
 * Defense layers:
 * 1. Null byte and control character removal
 * 2. HTML/script tag stripping
 * 3. JavaScript protocol filtering
 * 4. Event handler attribute removal
 * 5. Prompt injection payload neutralization
 * 6. ChatML/system delimiter stripping
 * 7. SQL injection pattern detection
 * 8. Data URI filtering
 * 9. Template literal injection prevention
 * 10. Length enforcement
 *
 * @param input - The raw user input string
 * @param maxLength - Maximum allowed length (default: 25000)
 * @returns Sanitized string safe for processing
 */
export function sanitizeInput(input: string, maxLength = 25000): string {
  if (!input) return '';
  let clean = input.trim();

  // Layer 1: Strip null bytes and Unicode control characters (except newline, tab, carriage return)
  clean = clean.replace(/\0/g, '');
  clean = clean.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // Strip Unicode directional override characters (used for bidi attacks)
  clean = clean.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');

  // Layer 2: Strip script and style blocks entirely (including contents)
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  // Strip ALL HTML tags (comprehensive XSS prevention)
  clean = clean.replace(/<\/?[a-zA-Z][^>]*>/gi, '');
  // Also strip incomplete tags and encoded variants
  clean = clean.replace(/<[^>]*$/gm, '');

  // Layer 3: Strip javascript: protocol URIs (case-insensitive, whitespace-tolerant)
  clean = clean.replace(/j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, '');
  clean = clean.replace(/vbscript\s*:/gi, '');

  // Layer 4: Strip on-event handler attributes (onclick, onerror, onload, etc.)
  clean = clean.replace(/\bon\w+\s*=\s*(['"]?).*?\1/gi, '');

  // Layer 5: Strip common prompt injection payloads
  clean = clean.replace(/---+\s*(system|assistant|user):?/gi, '');
  clean = clean.replace(/ignore\s+(all\s+)?previous\s+instructions/gi, '[filtered instruction]');
  clean = clean.replace(/you\s+are\s+now\s+a/gi, '[filtered prompt]');
  clean = clean.replace(/act\s+as\s+(a|an|if)\s/gi, '[filtered prompt] ');
  clean = clean.replace(/pretend\s+(you\s+are|to\s+be)/gi, '[filtered prompt]');
  clean = clean.replace(/disregard\s+(all\s+)?(above|prior|previous)/gi, '[filtered instruction]');
  clean = clean.replace(/forget\s+(all\s+)?(your|the|prior)\s+(instructions|rules|guidelines)/gi, '[filtered instruction]');
  clean = clean.replace(/new\s+instructions?\s*:/gi, '[filtered instruction]');
  clean = clean.replace(/override\s+(system|safety|security)\s+(prompt|instructions|rules|settings)/gi, '[filtered instruction]');

  // Layer 6: Strip ChatML and system prompt delimiters
  clean = clean.replace(/<\|im_start\|>|<\|im_end\|>/gi, '');
  clean = clean.replace(/<\|system\|>|<\|user\|>|<\|assistant\|>/gi, '');
  clean = clean.replace(/\[INST\]|\[\/INST\]/gi, '');
  clean = clean.replace(/<<SYS>>|<<\/SYS>>/gi, '');

  // Layer 7: Neutralize SQL injection patterns (common attack vectors)
  clean = clean.replace(/(\b)(DROP\s+TABLE|DELETE\s+FROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|UNION\s+SELECT|OR\s+1\s*=\s*1|AND\s+1\s*=\s*1|;\s*--)/gi, '[filtered sql]');

  // Layer 8: Strip data: URIs (used for XSS and content injection)
  clean = clean.replace(/data:\s*[a-zA-Z]+\/[a-zA-Z0-9+.-]+\s*[;,]/gi, '');

  // Layer 9: Neutralize template literal injection
  clean = clean.replace(/\$\{[^}]*\}/g, '[filtered expression]');

  // Layer 10: Length enforcement (DoS prevention)
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }

  return clean;
}

/**
 * Generates a content fingerprint hash for integrity verification
 * @param content - The content to hash
 * @returns SHA-256 hex digest of the content
 */
export function generateContentHash(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('hex');
}

/**
 * Validates if the given text represents a legitimate legal contract or agreement.
 * Uses a multi-signal heuristic scoring approach:
 * - Structural signals (high weight): Headers, formal legal phrasing
 * - Operational signals (medium weight): Legal provisions and terms
 * - Disqualifier patterns: Blocks non-legal document types
 *
 * @param rawText - The raw document text to validate
 * @returns Validation result with confidence score and detected document type
 */
export function validateLegalDocument(rawText: string): ValidationResult {
  if (!rawText || rawText.trim().length < 50) {
    return {
      isValid: false,
      rejectionReason: 'Document is too short or empty. Please provide a complete contract or agreement.',
      legalConfidenceScore: 0,
    };
  }

  const text = rawText.toLowerCase();

  // 1. Check for immediate disqualifiers (irrelevant non-legal documents)
  const disqualifiers = [
    { name: 'Exam Timetable / Academic Schedule', patterns: ['exam time table', 'exam timetable', 'mid sem exam', 'end sem exam', 'date sheet', 'semester exam', 'roll no', 'course code', 'hall ticket', 'invigilator', '1st shift', '2nd shift'] },
    { name: 'Resume / Curriculum Vitae', patterns: ['curriculum vitae', 'resume', 'work experience', 'education', 'skills', 'hobbies', 'projects summary', 'academic background', 'extracurricular'] },
    { name: 'Recipe / Cooking Guide', patterns: ['ingredients', 'tablespoon', 'teaspoon', 'preheat oven', 'cooking time', 'servings:', 'recipe yield', 'bake at'] },
    { name: 'Medical Prescription / Clinical Lab Report', patterns: ['patient name', 'rx only', 'blood test report', 'hemoglobin', 'dosage instructions', 'pathology report'] },
    { name: 'Code Snippet / Log File', patterns: ['npm error', 'stack trace', 'exception in thread', 'console.log(', 'import react from', 'function main()'] }
  ];

  for (const group of disqualifiers) {
    const matched = group.patterns.filter(p => text.includes(p));
    // If multiple disqualifying patterns match and no strong contract headers exist
    if (matched.length >= 2 && !text.includes('agreement') && !text.includes('contract') && !text.includes('lease agreement')) {
      return {
        isValid: false,
        rejectionReason: `Irrelevant document detected: Content matches an ${group.name}. Clause2Life is exclusively designed for legal contracts, leases, and agreements.`,
        legalConfidenceScore: 10,
      };
    }
  }

  // 2. Structural & Formal Legal Signals (High Weight)
  const structuralSignals = [
    'agreement', 'contract', 'by and between', 'parties hereto', 'whereas',
    'now, therefore', 'in witness whereof', 'terms and conditions', 'master services agreement',
    'non-disclosure agreement', 'lease agreement', 'employment agreement', 'independent contractor',
    'software as a service', 'license agreement', 'confidentiality agreement', 'severability',
    'governing law', 'entire agreement', 'counterparts', 'indemnification'
  ];

  // 3. Operational Legal Provisions (Medium Weight)
  const operationalSignals = [
    'shall', 'covenants', 'obligations', 'termination', 'breach', 'default',
    'remedy', 'warranties', 'representations', 'confidential information',
    'intellectual property', 'liability', 'indemnify', 'hold harmless',
    'notice period', 'cure period', 'dispute resolution', 'jurisdiction',
    'arbitration', 'payment terms', 'invoice', 'liquidated damages', 'force majeure',
    'non-solicitation', 'non-competition', 'effective date', 'expiration date'
  ];

  let score = 0;
  const matchedCategories: string[] = [];

  for (const signal of structuralSignals) {
    if (text.includes(signal)) {
      score += 15;
      matchedCategories.push(signal);
    }
  }

  for (const signal of operationalSignals) {
    if (text.includes(signal)) {
      score += 5;
    }
  }

  // Detect likely document type
  let documentType = 'General Legal Agreement';
  if (text.includes('lease') || text.includes('landlord') || text.includes('tenant') || text.includes('premises')) {
    documentType = 'Residential / Commercial Lease';
  } else if (text.includes('employment') || text.includes('employer') || text.includes('employee') || text.includes('salary')) {
    documentType = 'Employment Agreement';
  } else if (text.includes('contractor') || text.includes('freelance') || text.includes('statement of work') || text.includes('sow') || text.includes('client')) {
    documentType = 'Independent Contractor / Service Agreement';
  } else if (text.includes('non-disclosure') || text.includes('confidentiality') || text.includes('proprietary information')) {
    documentType = 'Non-Disclosure Agreement (NDA)';
  } else if (text.includes('software as a service') || text.includes('saas') || text.includes('subscription') || text.includes('service level agreement')) {
    documentType = 'SaaS / Software License Agreement';
  }

  // Threshold check: Genuine legal documents easily score >= 35
  if (score < 30) {
    return {
      isValid: false,
      rejectionReason: 'The provided document does not contain sufficient contractual language, obligations, or binding terms. Please provide a formal legal contract or agreement.',
      legalConfidenceScore: Math.min(score, 100),
    };
  }

  return {
    isValid: true,
    documentType,
    legalConfidenceScore: Math.min(score, 100),
  };
}
