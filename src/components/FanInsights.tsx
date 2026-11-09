import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Tag, 
  FileText, 
  ShieldCheck, 
  Info, 
  Plus, 
  Sparkles,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Fan } from '../types/crm';
import { useLanguage } from '../i18n/LanguageContext';

interface FanInsightsProps {
  fan: Fan;
  onAddNote: (note: string) => void;
  onSimulateTip?: (amount: number) => void;
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
}

export const FanInsights: React.FC<FanInsightsProps> = ({ 
  fan, 
  onAddNote,
  onSimulateTip,
  onAddTag,
  onRemoveTag,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'insights' | 'sales' | 'notes'>('insights');
  const [openSections, setOpenSections] = useState({
    spending: true,
    organization: true,
    subscription: true,
    profile: true,
  });

  const [newNoteText, setNewNoteText] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    onAddNote(newNoteText.trim());
    setNewNoteText('');
  };

  const handleTip = (amount: number) => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7, x: 0.85 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
    });
    if (onSimulateTip) {
      onSimulateTip(amount);
    }
  };

  const handleCreateTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      if (onAddTag) onAddTag(newTagInput.trim().replace(/^#/, ''));
      setNewTagInput('');
      setShowAddTag(false);
    }
  };

  return (
    <aside className="w-[310px] flex-shrink-0 flex flex-col h-full bg-[#fafbfc] dark:bg-[#121522] border-l border-gray-200 dark:border-[#222738] select-none transition-colors duration-200">
      {/* Pane Title Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#202538] bg-white dark:bg-[#151926] flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center space-x-1.5">
          <span>{t.fanInsights}</span>
        </h2>
        <div className="flex items-center space-x-1.5">
          {/* Quick Tip Trigger Button */}
          <button
            onClick={() => handleTip(25)}
            title="Simulate fan sending a $25 tip"
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold border border-emerald-500/20 cursor-pointer transition-all active:scale-95"
          >
            <Sparkles className="w-3 h-3" />
            <span>{t.tipQuickBtn}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'insights' && (
          <>
            {/* Section 1: Spending Behavior */}
            <div className="rounded-xl bg-white dark:bg-[#161a29] border border-gray-200/90 dark:border-[#23293e] shadow-xs overflow-hidden transition-all">
              <button
                onClick={() => toggleSection('spending')}
                className="w-full flex items-center justify-between p-3 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 font-mono text-[10px]">:::</span>
                  <span className="text-[12px]">{t.spendingBehavior}</span>
                </div>
                {openSections.spending ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              {openSections.spending && (
                <div className="p-3 pt-0 space-y-3 text-xs border-t border-gray-100 dark:border-[#20263b]">
                  {/* Top Spending Big Cards */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-[#1b2033] border border-gray-200/60 dark:border-[#262c45]">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {t.totalSpend}
                      </span>
                      <div className="text-lg font-bold font-mono-numbers text-gray-900 dark:text-white mt-0.5">
                        ${fan.spendingBehavior.totalSpend}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-[#1b2033] border border-gray-200/60 dark:border-[#262c45]">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {t.lastSpend}
                      </span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-xs font-bold font-mono-numbers text-gray-900 dark:text-white">
                          {fan.spendingBehavior.lastSpend.timeAgo}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-numbers text-gray-500 dark:text-gray-400">
                        {fan.spendingBehavior.lastSpend.type} | ${fan.spendingBehavior.lastSpend.amount}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Table */}
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-[#20263b]">
                      <span className="text-gray-500 dark:text-gray-400">{t.ppv}</span>
                      <div className="font-mono-numbers text-right">
                        <span className="font-bold text-gray-900 dark:text-white">
                          ${fan.spendingBehavior.ppvTotal} Total
                        </span>
                        <span className="text-gray-400 text-[10px] ml-2">
                          ${fan.spendingBehavior.ppvAvg} Avg
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-[#20263b]">
                      <span className="text-gray-500 dark:text-gray-400">{t.tip}</span>
                      <div className="font-mono-numbers text-right">
                        <span className="font-bold text-gray-900 dark:text-white">
                          ${fan.spendingBehavior.tipTotal} Total
                        </span>
                        <span className="text-gray-400 text-[10px] ml-2">
                          {fan.spendingBehavior.tipAvg > 0 ? `$${fan.spendingBehavior.tipAvg} Avg` : '- Avg'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">{t.highestSpendTitle}</span>
                      <div className="font-mono-numbers text-right">
                        <span className="font-bold text-gray-900 dark:text-white">
                          ${fan.spendingBehavior.highestSpend.amount}
                        </span>
                        <div className="text-[10px] text-gray-400">
                          {fan.spendingBehavior.highestSpend.type} | {fan.spendingBehavior.highestSpend.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Organization Metrics */}
            <div className="rounded-xl bg-white dark:bg-[#161a29] border border-gray-200/90 dark:border-[#23293e] shadow-xs overflow-hidden">
              <button
                onClick={() => toggleSection('organization')}
                className="w-full flex items-center justify-between p-3 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 font-mono text-[10px]">:::</span>
                  <span className="text-[12px]">{t.organizationMetrics}</span>
                </div>
                {openSections.organization ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              {openSections.organization && (
                <div className="p-3 pt-0 space-y-2 text-xs border-t border-gray-100 dark:border-[#20263b]">
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                      <span>{t.spendingPower}</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="font-bold text-xs text-blue-600 dark:text-blue-400 font-mono-numbers">
                      {fan.spendingPower}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t.chargebackRisk}</span>
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{fan.chargebackRisk}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Subscription */}
            <div className="rounded-xl bg-white dark:bg-[#161a29] border border-gray-200/90 dark:border-[#23293e] shadow-xs overflow-hidden">
              <button
                onClick={() => toggleSection('subscription')}
                className="w-full flex items-center justify-between p-3 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 font-mono text-[10px]">:::</span>
                  <span className="text-[12px]">{t.subscription}</span>
                </div>
                {openSections.subscription ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              {openSections.subscription && (
                <div className="p-3 pt-0 space-y-1.5 text-[11px] border-t border-gray-100 dark:border-[#20263b]">
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-gray-500 dark:text-gray-400">{t.status}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      {fan.subscription.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t.cost}</span>
                    <span className="font-mono-numbers text-gray-800 dark:text-gray-200 font-medium">
                      {fan.subscription.cost}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t.duration}</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {fan.subscription.duration}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t.autoRenewal}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {fan.subscription.autoRenewal ? t.on : t.off}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Profile & Preferences */}
            <div className="rounded-xl bg-white dark:bg-[#161a29] border border-gray-200/90 dark:border-[#23293e] shadow-xs overflow-hidden">
              <button
                onClick={() => toggleSection('profile')}
                className="w-full flex items-center justify-between p-3 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 font-mono text-[10px]">:::</span>
                  <span className="text-[12px]">{t.profileAndTags}</span>
                </div>
                {openSections.profile ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              {openSections.profile && (
                <div className="p-3 pt-0 space-y-2 text-xs border-t border-gray-100 dark:border-[#20263b]">
                  <div className="pt-2 text-[11px] text-gray-600 dark:text-gray-300">
                    <span className="text-gray-400 block text-[10px]">{t.tierClassification}</span>
                    <span className="font-bold text-amber-500 dark:text-amber-400">
                      {fan.profile.tier}
                    </span>
                  </div>

                  {fan.profile.location && (
                    <div className="text-[11px] text-gray-600 dark:text-gray-300">
                      <span className="text-gray-400 block text-[10px]">{t.locationAndZone}</span>
                      <span>{fan.profile.location} ({fan.profile.timezone})</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-[10px]">{t.fanPreferences}</span>
                      <button
                        onClick={() => setShowAddTag(!showAddTag)}
                        className="text-[10px] text-blue-500 hover:underline cursor-pointer"
                      >
                        {t.addTag}
                      </button>
                    </div>

                    {showAddTag && (
                      <div className="mb-2">
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={handleCreateTag}
                          placeholder={t.typeTagEnter}
                          autoFocus
                          className="w-full px-2 py-1 text-[11px] rounded bg-gray-100 dark:bg-[#1e2438] border border-blue-500 text-gray-800 dark:text-gray-100 outline-hidden"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {fan.profile.preferences.map((tag, i) => (
                        <span
                          key={i}
                          className="group inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 text-[10px] font-medium"
                        >
                          <span>#{tag}</span>
                          {onRemoveTag && (
                            <button
                              onClick={() => onRemoveTag(tag)}
                              className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity ml-0.5 cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab 2: Sales Purchase History */}
        {activeTab === 'sales' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-gray-200 dark:border-[#20263b]">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t.purchasedContent} ({fan.salesHistory.length})
              </span>
              <span className="text-[10px] font-mono-numbers font-bold text-emerald-500">
                Total: ${fan.totalSpend}
              </span>
            </div>

            {fan.salesHistory.length > 0 ? (
              fan.salesHistory.map((sale) => (
                <div
                  key={sale.id}
                  className="p-2.5 rounded-lg bg-white dark:bg-[#161a29] border border-gray-200/80 dark:border-[#22283d] text-xs shadow-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 truncate pr-2">
                      {sale.title}
                    </span>
                    <span className="font-mono-numbers font-bold text-amber-500 dark:text-amber-400">
                      ${sale.amount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>{sale.date}</span>
                    <span className="text-emerald-500 font-medium">{sale.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">
                No purchases yet. Send a PPV script to convert this fan!
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Agency Chatter Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t.sharedAgencyNotes}
              </span>
              {fan.profile.notes.map((note, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-white dark:bg-[#161a29] border-l-2 border-l-blue-500 border border-gray-200/80 dark:border-[#22283d] text-xs text-gray-700 dark:text-gray-300 shadow-xs"
                >
                  {note}
                </div>
              ))}
            </div>

            {/* Add note input */}
            <div className="pt-2 border-t border-gray-200 dark:border-[#20263b] space-y-2">
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder={t.addChatterNotePlaceholder}
                className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#181d2c] border border-gray-200 dark:border-[#252c42] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 outline-hidden"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNoteText.trim()}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.saveNote}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Tabs: Insights / Sales / Notes */}
      <footer className="grid grid-cols-3 border-t border-gray-200 dark:border-[#202538] bg-white dark:bg-[#151926] p-1 text-xs">
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'insights'
              ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-500/10'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Eye className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">{t.insightsTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'sales'
              ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-500/10'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Tag className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">{t.salesTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-500/10'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">{t.notesTab}</span>
        </button>
      </footer>
    </aside>
  );
};
