import { NextRequest, NextResponse } from 'next/server';
import { draftNegotiationWithGemini } from '@/lib/gemini';
import { sanitizeInput } from '@/lib/documentValidator';
import { apiRateLimiter, RateLimiter } from '@/lib/rateLimiter';
import { negotiationCache } from '@/lib/cache';

/**
 * POST /api/negotiate
 * Generates counter-proposal language, a redlined clause revision,
 * a ready-to-send email draft, and a tactical negotiation tip.
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
          details: `Rate limit exceeded. Please wait ${rateCheck.resetTime} seconds.`,
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

    // ──── Input Parsing & Sanitization ────
    const body = await req.json();
    const { clauseText, issueSummary, persona, apiKey } = body;

    const cleanClause = sanitizeInput(clauseText || '', 2000);
    const cleanIssue = sanitizeInput(issueSummary || '', 1000);
    const cleanPersona = sanitizeInput(persona || '', 500);

    // ──── Validation ────
    if (!cleanClause) {
      return NextResponse.json(
        { error: 'Clause text is required to generate negotiation counter-proposals.' },
        { status: 400 }
      );
    }

    // ──── Cache Lookup ────
    const cacheKey = negotiationCache.generateKey('neg', cleanClause, cleanIssue, cleanPersona);
    const cached = negotiationCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(
        { ...cached, cached: true },
        { headers: { ...RateLimiter.getHeaders(rateCheck), 'X-Cache': 'HIT' } }
      );
    }

    // ──── AI Negotiation Drafting ────
    const result = await draftNegotiationWithGemini(
      cleanClause,
      cleanIssue,
      cleanPersona,
      apiKey
    );

    negotiationCache.set(cacheKey, result);

    return NextResponse.json(
      { ...result, cached: false },
      { headers: { ...RateLimiter.getHeaders(rateCheck), 'X-Cache': 'MISS' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    console.error('Error in /api/negotiate:', message);
    return NextResponse.json(
      { error: 'Failed to draft negotiation. Please try again.' },
      { status: 500 }
    );
  }
}
