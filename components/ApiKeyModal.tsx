import React, { useState, useEffect } from 'react';
import { Key, X, Check, Shield, ExternalLink, Network } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  currentKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  currentKey,
}) => {
  const [keyInput, setKeyInput] = useState(currentKey);

  useEffect(() => {
    setKeyInput(currentKey);
  }, [currentKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 relative animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">LLM Provider API Key Settings</h3>
            <p className="text-xs text-slate-500">Nara Router API & Google Gemini API Configuration</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Clause2Life supports <strong>Nara Router API Gateway</strong> (<code className="bg-slate-100 px-1 py-0.5 rounded">https://router.bynara.id/v1</code>) and <strong>Google Gemini API</strong>.
          </p>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">API Key (Nara Router <code className="text-blue-600">sk-nry-...</code> or Gemini <code className="text-emerald-600">AIza...</code>):</label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-nry-... or AIzaSy..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="bg-blue-50/60 border border-blue-200 p-3 rounded-xl text-blue-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Network className="w-3.5 h-3.5 text-blue-600" /> Pre-Configured Provider:
            </span>
            <p className="text-[11px] text-blue-800">
              Nara Router API Key (<code className="font-mono text-blue-900">sk-nry-HV1B...</code>) at <code className="font-mono text-blue-900">https://router.bynara.id/v1</code> is configured by default.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSaveKey(keyInput);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1"
          >
            <Check className="w-4 h-4" /> Save Key
          </button>
        </div>
      </div>
    </div>
  );
};
