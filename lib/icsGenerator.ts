import { ObligationDate } from './types';

export function generateICSContent(title: string, obligations: ObligationDate[]): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let icsString = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Clause2Life//Legal Obligation Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${title} - Legal Deadlines`,
  ].join('\r\n');

  obligations.forEach((ob, idx) => {
    // Generate ISO date or fallback to 30 days from now
    let eventDate = new Date();
    if (ob.isoDate) {
      const parsed = new Date(ob.isoDate);
      if (!isNaN(parsed.getTime())) {
        eventDate = parsed;
      }
    } else {
      // Default offset 30 days out for demo if no hard ISO date
      eventDate.setDate(eventDate.getDate() + 30 + idx * 7);
    }

    const dateStr = eventDate.toISOString().replace(/-/g, '').split('T')[0];
    const uid = `clause2life-${ob.id || idx}-${Date.now()}@clause2life.app`;

    icsString += '\r\n' + [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `SUMMARY:[Clause2Life] ${ob.title}`,
      `DESCRIPTION:${ob.description}\\nClause Citation: ${ob.clauseCitation}\\nDate/Window: ${ob.dateOrWindow}\\nCategory: ${ob.category}`,
      `CATEGORIES:${ob.category}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${ob.title} deadline in 7 days`,
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });

  icsString += '\r\nEND:VCALENDAR';
  return icsString;
}
