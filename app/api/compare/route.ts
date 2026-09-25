import { NextRequest, NextResponse } from 'next/server';
import { compareDocumentsWithGemini } from '@/lib/gemini';
import { sanitizeInput } from '@/lib/documentValidator';
import { apiRateLimiter } from '@/lib/rateLimiter';
import { comparisonCache } from '@/lib/cache';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = apiRateLimiter.check(ip);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          details: `Rate limit exceeded. Please wait ${rateCheck.resetTime} seconds.`,
        },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetTime) } }
      );
    }

    const body = await req.json();
    const { docAText, docBText, docAName, docBName, apiKey } = body;

    const cleanA = sanitizeInput(docAText || '', 10000);
    const cleanB = sanitizeInput(docBText || '', 10000);
    const cleanNameA = sanitizeInput(docAName || 'Document A', 100);
    const cleanNameB = sanitizeInput(docBName || 'Document B', 100);

    if (!cleanA || !cleanB) {
      return NextResponse.json(
        { error: 'Both document texts are required for comparison.' },
        { status: 400 }
      );
    }

    const cacheKey = comparisonCache.generateKey('comp', cleanA.slice(0, 1000), cleanB.slice(0, 1000));
    const cached = comparisonCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const result = await compareDocumentsWithGemini(
      cleanA,
      cleanB,
      cleanNameA,
      cleanNameB,
      apiKey
    );

    comparisonCache.set(cacheKey, result);

    return NextResponse.json({ ...result, cached: false });
  } catch (err: any) {
    console.error('Error in /api/compare:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to compare documents.' },
      { status: 500 }
    );
  }
}
