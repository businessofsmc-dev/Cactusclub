import React, { useState } from 'react';
import { X, Search, Zap, DollarSign, Check } from 'lucide-react';
import type { CannedScript } from '../types/crm';
import { CANNED_SCRIPTS } from '../data/mockData';

interface ScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScript: (script: CannedScript) => void;
}

export const ScriptsModal: React.FC<ScriptsModalProps> = ({
  isOpen,
  onClose,
  onApplyScript,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'PPV Tease', 'Greeting', 'Upsell', 'Kinky', 'Re-engage'];

  const filtered = CANNED_SCRIPTS.filter((s) => {
    const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.text.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleInsert = (script: CannedScript) => {
    setCopiedId(script.id);
    onApplyScript(script);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-[#151926] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#22283d]">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Canned Scripts & Agency Cues
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-gray-200 dark:border-[#22283d] space-y-3 bg-gray-50/50 dark:bg-[#181d2c]/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scripts by keyword (e.g. douche, lingerie, whale, custom)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#121522] border border-gray-200 dark:border-[#2b334d] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#20263b] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272e47] border border-gray-200 dark:border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Script Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length > 0 ? (
            filtered.map((script) => (
              <div
                key={script.id}
                className="group p-3.5 rounded-xl bg-white dark:bg-[#1a1f30] border border-gray-200 dark:border-[#293149] hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-xs transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {script.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {script.category}
                    </span>
                  </div>

                  {script.price && (
                    <span className="flex items-center text-xs font-bold font-mono-numbers text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      <DollarSign className="w-3 h-3" />
                      {script.price}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed my-2 select-text">
                  {script.text}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#22283d]">
                  <div className="flex items-center space-x-1">
                    {script.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleInsert(script)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    {copiedId === script.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Applied!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" />
                        <span>Insert Script</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-xs text-gray-400">
              No canned responses matching your query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
