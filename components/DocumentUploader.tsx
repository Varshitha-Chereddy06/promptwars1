import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Sparkles, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { SAMPLE_CONTRACTS, SampleContract } from '@/lib/samples';
import { AnalysisResult } from '@/lib/types';

interface DocumentUploaderProps {
  onDocumentLoaded: (text: string, title: string, sample?: SampleContract, precomputedResult?: AnalysisResult) => void;
  onClearDocument: () => void;
  isLoading: boolean;
  isProcessingDocument: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onDocumentLoaded,
  onClearDocument,
  isLoading,
  isProcessingDocument,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_CONTRACTS[0].id);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setStatusMessage(`Scanning and validating ${file.name}...`);
    setErrorMessage(null);
    setSelectedSampleId('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setStatusMessage('');
        setErrorMessage(data.details || data.error || 'Failed to validate legal document.');
        onClearDocument();
        return;
      }

      const extractedText = data.extractedText || (await file.text());
      setStatusMessage('');
      setErrorMessage(null);
      await onDocumentLoaded(extractedText, file.name, undefined, data);
    } catch (err: any) {
      console.error('File read error', err);
      setStatusMessage('');
      setErrorMessage('Unable to process this file. Please ensure it is a valid PDF or text contract.');
      onClearDocument();
    }
  };

  const handleSampleSelect = (sample: SampleContract) => {
    setSelectedSampleId(sample.id);
    setStatusMessage('');
    setErrorMessage(null);
    onDocumentLoaded(sample.content, sample.title, sample);
  };

  const handleTextSubmit = async () => {
    if (!pastedText.trim()) return;
    setStatusMessage('Validating pasted contract text...');
    setErrorMessage(null);
    setSelectedSampleId('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setStatusMessage('');
        setErrorMessage(data.details || data.error || 'The pasted text is not a valid legal contract.');
        onClearDocument();
        return;
      }

      setStatusMessage('');
      setErrorMessage(null);
      await onDocumentLoaded(pastedText, 'Custom Pasted Document', undefined, data);
    } catch (err) {
      setStatusMessage('');
      setErrorMessage('Failed to analyze document text.');
      onClearDocument();
    }
  };

  const handleClear = () => {
    setSelectedSampleId('');
    setPastedText('');
    setStatusMessage('');
    setErrorMessage(null);
    onClearDocument();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Step 1: Upload Legal Document
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload contract (PDF, TXT, DOCX) or select a sample agreement below for instant evaluation.
          </p>
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-2 text-xs text-red-900 animate-in fade-in duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 font-bold text-red-800">
              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>Document Rejected / Non-Legal Content</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 font-bold text-xs"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
          <p className="text-red-700 leading-relaxed">{errorMessage}</p>
          <div className="bg-white/80 rounded-xl p-2.5 border border-red-200 text-[11px] text-red-800 space-y-1">
            <strong>Accepted formats:</strong> Service Agreements, Lease Contracts, Employment Agreements, NDAs, SaaS Terms of Service.
          </div>
        </div>
      )}

      {/* Preset Sample Selector */}
      <div>
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
          Or Pick a Pre-analyzed Sample Contract:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_CONTRACTS.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSampleSelect(sample)}
                disabled={isLoading || isProcessingDocument}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-white'
                }`}
                aria-pressed={isSelected}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {sample.category}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 mt-2">{sample.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {sample.preparsedResult.summary}
                  </p>
                </div>
                <div className="mt-3 text-[11px] text-blue-600 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Click to evaluate immediately
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {(isLoading || isProcessingDocument || statusMessage) && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800 font-medium flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>{statusMessage || 'Processing uploaded document and extracting legal clauses...'}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="relative flex items-center my-4 flex-1">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium uppercase">Or Upload Custom Document</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-[11px] font-semibold text-slate-600 hover:text-red-600 transition"
        >
          Clear
        </button>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragActive ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-xs font-medium text-slate-700">
          Drag & drop your contract file here, or{' '}
          <label className="text-blue-600 hover:underline cursor-pointer font-semibold">
            browse files
            <input
              type="file"
              accept=".txt,.pdf,.docx,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </label>
        </p>
        <p className="text-[11px] text-slate-400 mt-1">Supports PDF, TXT, DOCX, Markdown (Max 5MB)</p>
      </div>

      {/* Direct Text Paste Option */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600 block">Or Paste Contract Text Directly:</label>
        <textarea
          rows={3}
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste contract clauses or agreement text here..."
          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          aria-label="Paste contract text"
        />
        {pastedText.trim() && (
          <button
            onClick={handleTextSubmit}
            disabled={isLoading || isProcessingDocument}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isLoading ? 'Analyzing Document...' : 'Analyze Pasted Contract Text'}
          </button>
        )}
      </div>
    </div>
  );
};
