import React, { useState } from 'react';
import { User, Sparkles } from 'lucide-react';
import { Persona } from '@/lib/types';
import { SAMPLE_PERSONAS } from '@/lib/samples';

interface PersonaFormProps {
  currentPersona: Persona;
  onPersonaChange: (updated: Persona) => void;
}

export const PersonaForm: React.FC<PersonaFormProps> = ({ currentPersona, onPersonaChange }) => {
  const [description, setDescription] = useState(currentPersona.description);
  const [role, setRole] = useState(currentPersona.role);

  const handleApplyCustom = () => {
    onPersonaChange({
      ...currentPersona,
      role: role || 'Individual User',
      description: description,
    });
  };

  const handleSelectPreset = (p: Persona) => {
    setRole(p.role);
    setDescription(p.description);
    onPersonaChange(p);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Step 2: Describe Your Life Situation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tell Clause2Life about your plans, hardware, budget, or timeline so risk rankings adapt to you.
          </p>
        </div>
      </div>

      {/* Preset Persona Buttons */}
      <div>
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
          Or Select Preset Persona:
        </label>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PERSONAS.map((p) => {
            const isActive = currentPersona.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                {p.name} ({p.role})
              </button>
            );
          })}
        </div>
      </div>

      {/* Persona Custom Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Your Role / Context:</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Freelance Developer, Apartment Tenant"
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Your Specific Situation / Concerns:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. I might quit in 6 months, using my own laptop, relocating to another state..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleApplyCustom}
              className="bg-indigo-600 text-white text-xs px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 shrink-0 transition"
            >
              Update Risk Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
