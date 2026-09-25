import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocumentWithGemini } from '@/lib/gemini';
import { parseDocumentFile } from '@/lib/documentParser';
import { validateLegalDocument, sanitizeInput } from '@/lib/documentValidator';
import { apiRateLimiter, RateLimiter } from '@/lib/rateLimiter';
import { analysisCache } from '@/lib/cache';

/** Maximum allowed file upload size: 5MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Allowed file MIME types for upload */
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/octet-stream', // Fallback for unknown types
]);

/**
 * POST /api/analyze
 * Accepts a legal document (file upload or pasted text) and returns
 * a structured clause analysis with risk levels and obligation dates.
 */
export async function POST(req: NextRequest) {
  try {
    // ──── Rate Limiting ────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateCheck = apiRateLimiter.check(ip);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          details: `Rate limit exceeded. Please wait ${rateCheck.resetTime} seconds before submitting again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetTime),
            ...RateLimiter.getHeaders(rateCheck),
          },
        }
      );
    }

    // ──── Request Method Validation ────
    const contentType = req.headers.get('content-type') || '';

    let text = '';
    let persona = '';
    let apiKey = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      persona = (formData.get('persona') as string) || '';
      apiKey = (formData.get('apiKey') as string) || '';

      if (file) {
        // File size validation
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: 'File size exceeds maximum limit of 5MB.' },
            { status: 400 }
          );
        }
        // File type validation
        if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
          return NextResponse.json(
            { error: `Unsupported file type: ${file.type}. Please upload PDF or TXT files only.` },
            { status: 400 }
          );
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        text = await parseDocumentFile(buffer, file.name);
      } else {
        text = (formData.get('text') as string) || '';
      }
    } else {
      const body = await req.json();
      text = body.text || '';
      persona = body.persona || '';
      apiKey = body.apiKey || '';
    }

    // ──── Input Validation ────
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No document text provided. Please upload or paste a legal contract.' },
        { status: 400 }
      );
    }

    const cleanText = sanitizeInput(text);
    const cleanPersona = sanitizeInput(persona);

    // ──── Document Type Validation ────
    const validation = validateLegalDocument(cleanText);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Irrelevant / Non-Legal Document Detected',
          details: validation.rejectionReason,
          isLegalDocument: false,
          legalConfidenceScore: validation.legalConfidenceScore,
        },
        { status: 422 }
      );
    }

    // ──── Cache Lookup ────
    const cacheKey = analysisCache.generateKey('analysis', cleanText.slice(0, 1000), cleanPersona);
    const cachedResult = analysisCache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json(
        {
          ...cachedResult,
          extractedText: cleanText,
          isLegalDocument: true,
          documentType: validation.documentType,
          cached: true,
        },
        { headers: { ...RateLimiter.getHeaders(rateCheck), 'X-Cache': 'HIT' } }
      );
    }

    // ──── AI Analysis ────
    const result = await analyzeDocumentWithGemini(cleanText, cleanPersona, apiKey);

    // Store in cache
    analysisCache.set(cacheKey, result);

    return NextResponse.json(
      {
        ...result,
        extractedText: cleanText,
        isLegalDocument: true,
        documentType: validation.documentType,
        cached: false,
      },
      { headers: { ...RateLimiter.getHeaders(rateCheck), 'X-Cache': 'MISS' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    console.error('Error in /api/analyze:', message);
    return NextResponse.json(
      { error: 'Failed to analyze legal document. Please try again.' },
      { status: 500 }
    );
  }
}
