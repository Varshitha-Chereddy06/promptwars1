import React from 'react';
import { Calendar, Download, Clock, BellRing, ArrowUpRight } from 'lucide-react';
import { ObligationDate } from '@/lib/types';

interface TimelineViewProps {
  documentTitle: string;
  obligations: ObligationDate[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ documentTitle, obligations }) => {
  const handleExportICS = async () => {
    try {
      const res = await fetch('/api/export-ics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: documentTitle,
          obligations,
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(documentTitle || 'legal').replace(/\s+/g, '_')}_deadlines.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('ICS Export error:', err);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Obligation Timeline & Calendar Export
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Never get trapped by missed notice windows or auto-renewal deadlines. Export directly to Apple, Google, or Outlook calendar.
          </p>
        </div>

        <button
          onClick={handleExportICS}
          className="bg-purple-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          <Download className="w-4 h-4" /> Export .ics Calendar File
        </button>
      </div>

      {/* Obligations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {obligations.map((ob) => (
          <div
            key={ob.id}
            className="border border-purple-100 bg-purple-50/20 rounded-xl p-4 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  {ob.category}
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" /> {ob.clauseCitation}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-2">{ob.title}</h3>
              <p className="text-xs text-slate-600 mt-1">{ob.description}</p>
            </div>

            <div className="pt-2 border-t border-purple-100/60 flex items-center justify-between text-xs">
              <span className="font-bold text-purple-900 bg-white px-2.5 py-1 rounded border border-purple-200">
                Deadline: {ob.dateOrWindow}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {ob.isRecurring ? '🔄 Recurring' : '📅 One-time'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
