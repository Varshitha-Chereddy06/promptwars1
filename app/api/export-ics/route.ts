import { NextRequest, NextResponse } from 'next/server';
import { generateICSContent } from '@/lib/icsGenerator';
import { ObligationDate } from '@/lib/types';
import { sanitizeInput } from '@/lib/documentValidator';
import { apiRateLimiter, RateLimiter } from '@/lib/rateLimiter';

/**
 * POST /api/export-ics
 * Generates a downloadable RFC 5545 .ics iCalendar file
 * from the parsed legal obligation dates.
 */
export async function POST(req: NextRequest) {
  try {
    // ──── Rate Limiting ────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateCheck = apiRateLimiter.check(ip);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetTime),
            ...RateLimiter.getHeaders(rateCheck),
          },
        }
      );
    }

    const body = await req.json();
    const { title, obligations } = body as { title: string; obligations: ObligationDate[] };

    // ──── Validation ────
    if (!obligations || !Array.isArray(obligations) || obligations.length === 0) {
      return NextResponse.json(
        { error: 'Valid obligations list is required.' },
        { status: 400 }
      );
    }

    // Limit obligations to 100 to prevent abuse
    if (obligations.length > 100) {
      return NextResponse.json(
        { error: 'Obligations list exceeds maximum of 100 items.' },
        { status: 400 }
      );
    }

    const cleanTitle = sanitizeInput(title || 'Legal Obligations', 200);
    const icsText = generateICSContent(cleanTitle, obligations);

    // Sanitize filename to prevent header injection
    const safeFilename = cleanTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);

    return new NextResponse(icsText, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeFilename}_deadlines.ics"`,
        'X-Content-Type-Options': 'nosniff',
        ...RateLimiter.getHeaders(rateCheck),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    console.error('Error in /api/export-ics:', message);
    return NextResponse.json(
      { error: 'Failed to export .ics calendar file. Please try again.' },
      { status: 500 }
    );
  }
}
