import { NextRequest, NextResponse } from 'next/server';
import { generateICSContent } from '@/lib/icsGenerator';
import { ObligationDate } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, obligations } = body as { title: string; obligations: ObligationDate[] };

    if (!obligations || !Array.isArray(obligations)) {
      return NextResponse.json({ error: 'Valid obligations list is required.' }, { status: 400 });
    }

    const icsText = generateICSContent(title || 'Legal Obligations', obligations);

    return new NextResponse(icsText, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${(title || 'obligations').replace(/\s+/g, '_')}_deadlines.ics"`,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/export-ics:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to export .ics calendar file.' },
      { status: 500 }
    );
  }
}
