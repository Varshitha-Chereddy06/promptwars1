import { NextRequest, NextResponse } from 'next/server';
import { compareDocumentsWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { docAText, docBText, docAName, docBName, apiKey } = body;

    if (!docAText || !docBText) {
      return NextResponse.json({ error: 'Both document texts are required for comparison.' }, { status: 400 });
    }

    const result = await compareDocumentsWithGemini(
      docAText,
      docBText,
      docAName || 'Document A',
      docBName || 'Document B',
      apiKey
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error in /api/compare:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to compare documents.' },
      { status: 500 }
    );
  }
}
