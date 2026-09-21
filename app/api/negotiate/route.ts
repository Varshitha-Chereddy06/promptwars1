import { NextRequest, NextResponse } from 'next/server';
import { draftNegotiationWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clauseText, issueSummary, persona, apiKey } = body;

    const result = await draftNegotiationWithGemini(
      clauseText || '',
      issueSummary || '',
      persona || '',
      apiKey
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error in /api/negotiate:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to draft negotiation.' },
      { status: 500 }
    );
  }
}
