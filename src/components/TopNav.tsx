import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Home, 
  ShieldCheck, 
  Languages as LanguagesIcon, 
  Minus, 
  Square, 
  X, 
  Sun, 
  Moon, 
  Sparkles, 
  Check,
  Zap,
  ChevronDown,
  MessageSquare,
  DollarSign,
  Trophy
} from 'lucide-react';
import type { CreatorAccount } from '../types/crm';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';

interface TopNavProps {
  accounts: CreatorAccount[];
  activeAccountId: string;
  onSelectAccount: (id: string) => void;
  sfwMode: boolean;
  onToggleSfw: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  chatters: { id: string; name: string }[];
  activeChatter: string;
  onSelectChatter: (name: string) => void;
  onBackToDashboard?: () => void;
  onOpenAddAccount?: () => void;
  onSimulateFanMessage?: () => void;
  onSimulateTip?: (amount: number) => void;
}

const LANGUAGES_LIST: { code: Language; name: string; flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const TopNav: React.FC<TopNavProps> = ({
  accounts,
  activeAccountId,
  onSelectAccount,
  sfwMode,
  onToggleSfw,
  darkMode,
  onToggleDarkMode,
  chatters,
  activeChatter,
  onSelectChatter,
  onBackToDashboard,
  onOpenAddAccount,
  onSimulateFanMessage,
  onSimulateTip,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [simMenuOpen, setSimMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const simMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (simMenuRef.current && !simMenuRef.current.contains(e.target as Node)) {
        setSimMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = LANGUAGES_LIST.find((l) => l.code === language) || LANGUAGES_LIST[0];

  return (
    <header className="flex flex-col select-none border-b border-[#282d3d] bg-[#161a29] text-gray-200">
      {/* Top OS & Model Account Tab Strip */}
      <div className="flex items-center justify-between px-2 pt-1.5 pb-0 bg-[#0e111a] text-xs">
        {/* Account Tabs */}
        <div className="flex items-end space-x-1 overflow-x-auto no-scrollbar">
          {accounts.map((acc) => {
            const isActive = acc.id === activeAccountId;
            return (
              <button
                key={acc.id}
                onClick={() => onSelectAccount(acc.id)}
                className={`group relative flex items-center space-x-2 px-3 py-1.5 rounded-t-lg transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#1e2336] text-white shadow-sm font-medium border-t-2 border-blue-500'
                    : 'bg-[#131622] text-gray-400 hover:bg-[#1a1e2e] hover:text-gray-200'
                }`}
              >
                <div className="relative">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/20"
                  />
                  {acc.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm">
                      {acc.unreadCount}
                    </span>
                  )}
                </div>
                <span className="truncate max-w-[110px]">{acc.name}</span>
                <span className="text-[10px] text-gray-400 group-hover:text-gray-200 transition-colors">
                  {acc.unreadCount}
                </span>
                <span className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-gray-400 text-[10px] ml-1 transition-opacity">
                  ✕
                </span>
              </button>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={onOpenAddAccount}
            title="Add creator account"
            className="flex items-center justify-center w-7 h-6 mb-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Window controls & Global Toggles */}
        <div className="flex items-center space-x-2 text-gray-400 mb-1">
          {/* SFW Toggle */}
          <button
            onClick={onToggleSfw}
            title="Toggle Safe For Work blur filter"
            className={`flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all duration-150 cursor-pointer ${
              sfwMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-current" />
            <span>{sfwMode ? t.sfwOn : t.sfwOff}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              title="Changer la langue / Change Language"
              className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer border border-white/10"
            >
              <span className="text-xs">{currentLangObj.flag}</span>
              <span className="text-[11px] font-bold uppercase">{currentLangObj.code}</span>
              <LanguagesIcon className="w-3 h-3 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {langMenuOpen && (
              <div className="absolute right-0 top-7 mt-1 w-36 rounded-xl bg-[#181d2e] border border-gray-700 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                  Langue / Language
                </div>
                {LANGUAGES_LIST.map((langItem) => {
                  const isSelected = langItem.code === language;
                  return (
                    <button
                      key={langItem.code}
                      onClick={() => {
                        setLanguage(langItem.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-blue-600/20 hover:text-blue-300 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-600/30 text-blue-300 font-bold' : 'text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{langItem.flag}</span>
                        <span>{langItem.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Native OS window icons */}
          <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-white/10">
            <button className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white cursor-pointer">
              <Minus className="w-3 h-3" />
            </button>
            <button className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white cursor-pointer">
              <Square className="w-2.5 h-2.5" />
            </button>
            <button className="p-1 hover:bg-rose-500 rounded transition-colors text-gray-400 hover:text-white cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Sub-Bar: Home & Agency Chatter Team Tabs */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#1e2336] text-xs border-t border-[#2a3047]">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
          {/* Home Active Tab */}
          <button 
            onClick={onBackToDashboard}
            title="Return to Admin Dashboard"
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#2c334e] hover:bg-[#343d5c] text-white font-medium shadow-sm transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold tracking-wide">{t.home}</span>
          </button>

          {/* Chatters list with active shift */}
          {chatters.map((chatter) => {
            const isCurrent = chatter.name === activeChatter;
            return (
              <button
                key={chatter.id}
                onClick={() => onSelectChatter(chatter.name)}
                className={`flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <span>{chatter.name}</span>
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
              </button>
            );
          })}
        </div>

        {/* Global Online/Activity Counter & Live Simulator */}
        <div className="flex items-center space-x-2 pl-3">
          {/* Live Simulator Dropdown */}
          <div className="relative" ref={simMenuRef}>
            <button
              onClick={() => setSimMenuOpen(!simMenuOpen)}
              title="Test & Demo Live Events"
              className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold cursor-pointer transition-all shadow-xs"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Simulate</span>
              <ChevronDown className={`w-3 h-3 text-amber-400 transition-transform ${simMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {simMenuOpen && (
              <div className="absolute right-0 top-7 mt-1 w-56 rounded-xl bg-[#181d2e] border border-gray-700 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                  Live Event Simulator
                </div>
                <button
                  onClick={() => {
                    if (onSimulateFanMessage) onSimulateFanMessage();
                    setSimMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-left text-gray-200 hover:bg-blue-600/20 hover:text-blue-300 cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Incoming Fan Message</span>
                </button>
                <button
                  onClick={() => {
                    if (onSimulateTip) onSimulateTip(50);
                    setSimMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-left text-gray-200 hover:bg-emerald-600/20 hover:text-emerald-300 cursor-pointer transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Incoming $50 Tip</span>
                </button>
                <button
                  onClick={() => {
                    if (onSimulateTip) onSimulateTip(150);
                    setSimMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-left text-gray-200 hover:bg-amber-600/20 hover:text-amber-300 cursor-pointer transition-colors"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Whale Fan Spend ($150)</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono-numbers text-[11px] font-semibold">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{t.activeFans}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
