import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocumentWithGemini } from '@/lib/gemini';
import { parseDocumentFile } from '@/lib/documentParser';
import { validateLegalDocument, sanitizeInput } from '@/lib/documentValidator';
import { apiRateLimiter } from '@/lib/rateLimiter';
import { analysisCache } from '@/lib/cache';

export async function POST(req: NextRequest) {
  try {
    // Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = apiRateLimiter.check(ip);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          details: `Rate limit exceeded. Please wait ${rateCheck.resetTime} seconds before submitting again.`,
        },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetTime) } }
      );
    }

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
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File size exceeds maximum limit of 5MB.' },
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

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No document text provided. Please upload or paste a legal contract.' },
        { status: 400 }
      );
    }

    const cleanText = sanitizeInput(text);
    const cleanPersona = sanitizeInput(persona);

    // Document Validation
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

    // Check In-Memory Cache for Sub-Millisecond Response
    const cacheKey = analysisCache.generateKey('analysis', cleanText.slice(0, 1000), cleanPersona);
    const cachedResult = analysisCache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        extractedText: cleanText,
        isLegalDocument: true,
        documentType: validation.documentType,
        cached: true,
      });
    }

    const result = await analyzeDocumentWithGemini(cleanText, cleanPersona, apiKey);
    
    // Store in cache
    analysisCache.set(cacheKey, result);

    return NextResponse.json({
      ...result,
      extractedText: cleanText,
      isLegalDocument: true,
      documentType: validation.documentType,
      cached: false,
    });
  } catch (err: any) {
    console.error('Error in /api/analyze:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to analyze legal document.' },
      { status: 500 }
    );
  }
}
