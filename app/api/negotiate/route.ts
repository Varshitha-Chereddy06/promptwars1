import { NextRequest, NextResponse } from 'next/server';
import { draftNegotiationWithGemini } from '@/lib/gemini';
import { sanitizeInput } from '@/lib/documentValidator';
import { apiRateLimiter } from '@/lib/rateLimiter';
import { negotiationCache } from '@/lib/cache';

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
    const { clauseText, issueSummary, persona, apiKey } = body;

    const cleanClause = sanitizeInput(clauseText || '', 2000);
    const cleanIssue = sanitizeInput(issueSummary || '', 1000);
    const cleanPersona = sanitizeInput(persona || '', 500);

    if (!cleanClause) {
      return NextResponse.json(
        { error: 'Clause text is required to generate negotiation counter-proposals.' },
        { status: 400 }
      );
    }

    const cacheKey = negotiationCache.generateKey('neg', cleanClause, cleanIssue, cleanPersona);
    const cached = negotiationCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const result = await draftNegotiationWithGemini(
      cleanClause,
      cleanIssue,
      cleanPersona,
      apiKey
    );

    negotiationCache.set(cacheKey, result);

    return NextResponse.json({ ...result, cached: false });
  } catch (err: any) {
    console.error('Error in /api/negotiate:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to draft negotiation.' },
      { status: 500 }
    );
  }
}
