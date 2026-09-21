import { NextRequest, NextResponse } from 'next/server';
import { simulateScenarioWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractText, persona, question, apiKey } = body;

    if (!question) {
      return NextResponse.json({ error: 'Scenario question is required.' }, { status: 400 });
    }

    const result = await simulateScenarioWithGemini(
      contractText || '',
      persona || '',
      question,
      apiKey
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error in /api/simulate:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to simulate scenario.' },
      { status: 500 }
    );
  }
}
