import { NextRequest, NextResponse } from 'next/server';
import { simulateScenarioWithGemini } from '@/lib/gemini';
import { validateLegalDocument, sanitizeInput } from '@/lib/documentValidator';
import { apiRateLimiter, RateLimiter } from '@/lib/rateLimiter';
import { simulationCache } from '@/lib/cache';

/**
 * POST /api/simulate
 * Runs a grounded "What-If?" scenario simulation against a loaded legal contract.
 * Returns a chronological consequence chain with exact clause citations.
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

    // ──── Input Parsing & Sanitization ────
    const body = await req.json();
    const { contractText, persona, question, apiKey } = body;

    const cleanQ = sanitizeInput(question || '', 500);
    const cleanDoc = sanitizeInput(contractText || '', 25000);
    const cleanPersona = sanitizeInput(persona || '', 500);

    // ──── Validation ────
    if (!cleanQ) {
      return NextResponse.json(
        { error: 'Scenario question is required.' },
        { status: 400 }
      );
    }

    if (!cleanDoc || cleanDoc.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'No contract document loaded.',
          details: 'Please upload or select a contract before simulating a scenario.',
        },
        { status: 400 }
      );
    }

    const validation = validateLegalDocument(cleanDoc);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid / Non-Legal Document',
          details: validation.rejectionReason,
        },
        { status: 422 }
      );
    }

    // ──── Cache Lookup ────
    const cacheKey = simulationCache.generateKey('sim', cleanDoc.slice(0, 1000), cleanQ, cleanPersona);
    const cachedResult = simulationCache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json(
        { ...cachedResult, cached: true },
        { headers: { ...RateLimiter.getHeaders(rateCheck), 'X-Cache': 'HIT' } }
      );
    }

    // ──── AI Simulation ────
    const result = await simulateScenarioWithGemini(
      cleanDoc,
      cleanPersona,
      cleanQ,
      apiKey
    );

    // Cache the successful scenario result
    simulationCache.set(cacheKey, result);

    return NextResponse.json(
      { ...result, cached: false },
      { headers: { ...RateLimiter.getHeaders(rateCheck), 'X-Cache': 'MISS' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    console.error('Error in /api/simulate:', message);
    return NextResponse.json(
      { error: 'Failed to simulate scenario. Please try again.' },
      { status: 500 }
    );
  }
}
