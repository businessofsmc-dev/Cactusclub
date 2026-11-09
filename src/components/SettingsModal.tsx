import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  DollarSign, 
  Users, 
  Volume2, 
  Globe, 
  Check 
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'commissions' | 'chatters' | 'security' | 'audio'>('general');

  // Form states
  const [agencyName, setAgencyName] = useState('CactusClub Agency');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [timezone, setTimezone] = useState('UTC+01:00');
  const [creatorShare, setCreatorShare] = useState(70);
  const [agencyShare, setAgencyShare] = useState(20);
  const [chatterShare, setChatterShare] = useState(10);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [shieldActive, setShieldActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onSave) onSave();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-[#151926] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#20263b]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Agency Settings & Operations
              </h2>
              <p className="text-[11px] text-gray-400">Configure global workflows, commission splits & security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-gray-100 dark:border-[#20263b] bg-gray-50/50 dark:bg-[#121622] text-xs">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'commissions', label: 'Commissions', icon: DollarSign },
            { id: 'chatters', label: 'Chatters', icon: Users },
            { id: 'security', label: 'Shield Security', icon: ShieldCheck },
            { id: 'audio', label: 'Sound FX', icon: Volume2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Agency Commercial Name
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#29324d] text-gray-900 dark:text-white outline-hidden focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Operating Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#29324d] text-gray-900 dark:text-white outline-hidden font-semibold"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Primary Timezone
                  </label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#29324d] text-gray-900 dark:text-white outline-hidden font-mono-numbers font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] leading-relaxed">
                Total must equal 100%. Automatically splits every tip and PPV unlocked between the model, agency management, and active on-shift chatter.
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Creator Cut</span>
                    <span className="font-mono-numbers text-blue-500">{creatorShare}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    value={creatorShare}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCreatorShare(val);
                      setAgencyShare(100 - val - chatterShare);
                    }}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Agency Gross</span>
                    <span className="font-mono-numbers text-purple-500">{agencyShare}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={agencyShare}
                    onChange={(e) => setAgencyShare(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Chatter Commission</span>
                    <span className="font-mono-numbers text-emerald-500">{chatterShare}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    value={chatterShare}
                    onChange={(e) => setChatterShare(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chatters' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#272f47]">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Auto-Translate Incoming Messages</span>
                  <span className="text-[11px] text-gray-400">Instantly translate German, Spanish or French fans into operator language</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoTranslate(!autoTranslate)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoTranslate ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    autoTranslate ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#272f47]">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Idle Timeout Operator Lock</span>
                  <span className="text-[11px] text-gray-400">Automatically pause chatter shift after 15 minutes of inactivity</span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-500 font-bold font-mono-numbers">15 min</span>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#272f47]">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Shield AI Real-Time Protection</span>
                  <span className="text-[11px] text-gray-400">Block known chargeback abusers and flag suspicious credit card behaviors</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShieldActive(!shieldActive)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    shieldActive ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    shieldActive ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#272f47]">
                <span className="font-bold text-gray-900 dark:text-white block mb-1">Fan Data Retention</span>
                <span className="text-[11px] text-gray-400">GDPR & CCPA encrypted logs stored in secure European datacenter (Frankfurt)</span>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#272f47]">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Synthesized Sound Effects</span>
                  <span className="text-[11px] text-gray-400">Play subtle auditory cues on message sent, received, and cash tip/PPV unlock</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    soundEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    soundEnabled ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-[#20263b] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
