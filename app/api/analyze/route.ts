import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocumentWithGemini } from '@/lib/gemini';
import { parseDocumentFile } from '@/lib/documentParser';

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'No contract text provided.' }, { status: 400 });
    }

    const result = await analyzeDocumentWithGemini(text, persona, apiKey);
    return NextResponse.json({ ...result, extractedText: text });
  } catch (err: any) {
    console.error('Error in /api/analyze:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to analyze legal document.' },
      { status: 500 }
    );
  }
}
