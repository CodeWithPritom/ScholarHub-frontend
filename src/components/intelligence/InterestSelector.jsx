import React, { useState } from 'react';
import { Search, X, Check, Sparkles, Compass } from 'lucide-react';

export const MASTER_DISCIPLINES = [
  "Molecular Biology & Genetics",
  "Quantum Computing & Physics",
  "Artificial Intelligence & Machine Learning",
  "Neuroscience & Brain Science",
  "Climate Change & Environmental Science",
  "Clinical Medicine & Epidemiology",
  "Renewable Energy & Sustainability",
  "Organic & Inorganic Chemistry",
  "Astrophysics & Cosmology",
  "Materials Science & Nanotechnology",
  "Oncology & Cancer Research",
  "Robotics & Autonomous Systems",
  "Bioinformatics & Computational Biology",
  "Econometrics & Microeconomics",
  "Cognitive Science & Psychology",
  "Public Health & Global Medicine",
  "Paleontology & Evolutionary Biology",
  "Cybersecurity & Cryptography",
  "Behavioral Economics & Decision Science",
  "Immunology & Vaccine Research",
  "Genomics & Precision Medicine",
  "Structural Engineering & Smart Materials",
  "Marine Biology & Oceanography",
  "Renewable Biofuels & Synthetic Biology",
  "Microelectronics & Semiconductors",
  "Biomechanics & Biomedical Engineering",
  "Applied Mathematics & Chaos Theory",
  "Soil Science & Agricultural Tech",
  "Nuclear Physics & Fusion Energy",
  "Pharmacology & Drug Discovery",
  "Space Exploration & Planetary Science",
  "Social Psychology & Sociology",
  "Computational Linguistics & NLP",
  "Virology & Infectious Diseases",
  "Geophysics & Seismology",
  "Cellular Biology & Stem Cells",
  "Autonomous Vehicles & Transport Tech",
  "Data Science & Big Data Analytics",
  "Polymer Science & Biomaterials",
  "Environmental Toxicology",
  "Renewable Grid & Energy Storage",
  "Developmental Psychology",
  "Quantum Information & Optics",
  "Neurobiology & Synaptic Plasticity",
  "Macroeconomics & Monetary Policy",
  "Tissue Engineering & Regenerative Medicine",
  "Plant Biotechnology & Crop Science",
  "Medical Imaging & Radiology",
  "Computational Fluid Dynamics",
  "Philosophy of Mind & AI Ethics"
];

const InterestSelector = ({ 
  initialSelected = [], 
  onSave, 
  onClose,
  isModal = true 
}) => {
  const [selected, setSelected] = useState(initialSelected || []);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = MASTER_DISCIPLINES.filter(item => 
    item.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (item) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      if (selected.length >= 7) {
        alert("Maximum limit of 7 research interests reached.");
        return;
      }
      setSelected([...selected, item]);
    }
  };

  const handleRemove = (item) => {
    setSelected(selected.filter(i => i !== item));
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(selected);
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5 max-w-xl w-full mx-auto">
      {/* Title */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1">
            Personalization Engine
          </span>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Select Your Research Interests
          </h3>
          <p className="text-xs text-slate-600 font-normal mt-0.5 leading-relaxed">
            Pick up to 7 academic fields to personalize your literature signals and breakthrough feeds.
          </p>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Selected Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Selected Interests ({selected.length} / 7)</span>
          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="text-slate-400 hover:text-slate-600 underline"
            >
              Clear All
            </button>
          )}
        </div>

        {selected.length === 0 ? (
          <div className="p-3 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl text-center font-normal">
            No disciplines selected yet. Search and click below to add.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
            {selected.map(item => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs"
              >
                <span>{item}</span>
                <button
                  onClick={() => handleRemove(item)}
                  className="hover:text-slate-300 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search 50+ academic disciplines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
        />
        <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
      </div>

      {/* Master List Options */}
      <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl p-2 space-y-1">
        {filtered.length === 0 ? (
          <p className="p-4 text-xs text-slate-400 text-center">No matching disciplines found.</p>
        ) : (
          filtered.map(item => {
            const isSel = selected.includes(item);
            return (
              <button
                key={item}
                onClick={() => handleToggle(item)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                  isSel
                    ? 'bg-slate-100 font-semibold text-slate-900'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item}</span>
                {isSel && <Check size={14} className="text-slate-800 shrink-0" />}
              </button>
            );
          })
        )}
      </div>

      {/* Save Action */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || selected.length === 0}
          className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Interests & Refresh Feed'}
        </button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
};

export default InterestSelector;
