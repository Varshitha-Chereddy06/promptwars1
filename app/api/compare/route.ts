import { NextRequest, NextResponse } from 'next/server';
import { compareDocumentsWithGemini } from '@/lib/gemini';
import { sanitizeInput } from '@/lib/documentValidator';
import { apiRateLimiter, RateLimiter } from '@/lib/rateLimiter';
import { comparisonCache } from '@/lib/cache';

/**
 * POST /api/compare
 * Compares two legal document versions, identifying added obligations,
 * removed penalties, increased/decreased risks, and an overall recommendation.
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
    const { docAText, docBText, docAName, docBName, apiKey } = body;

    const cleanA = sanitizeInput(docAText || '', 10000);
    const cleanB = sanitizeInput(docBText || '', 10000);
    const cleanNameA = sanitizeInput(docAName || 'Document A', 100);
    const cleanNameB = sanitizeInput(docBName || 'Document B', 100);

    // ──── Validation ────
    if (!cleanA || !cleanB) {
      return NextResponse.json(
        { error: 'Both document texts are required for comparison.' },
        { status: 400 }
      );
    }

    // ──── Cache Lookup ────
    const cacheKey = comparisonCache.generateKey('comp', cleanA.slice(0, 1000), cleanB.slice(0, 1000));
    const cached = comparisonCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(
        { ...cached, cached: true },
        { headers: { ...RateLimiter.getHeaders(rateCheck), 'X-Cache': 'HIT' } }
      );
    }

    // ──── AI Comparison ────
    const result = await compareDocumentsWithGemini(
      cleanA,
      cleanB,
      cleanNameA,
      cleanNameB,
      apiKey
    );

    comparisonCache.set(cacheKey, result);

    return NextResponse.json(
      { ...result, cached: false },
      { headers: { ...RateLimiter.getHeaders(rateCheck), 'X-Cache': 'MISS' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    console.error('Error in /api/compare:', message);
    return NextResponse.json(
      { error: 'Failed to compare documents. Please try again.' },
      { status: 500 }
    );
  }
}
