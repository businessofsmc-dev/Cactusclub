import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  ChevronDown, 
  LayoutDashboard, 
  Settings, 
  HelpCircle, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  FolderLock, 
  FileText, 
  Radio, 
  BarChart3, 
  Bookmark, 
  FileCheck, 
  Lightbulb, 
  Share2, 
  ExternalLink, 
  ShieldCheck, 
  Bell, 
  Minus, 
  Square, 
  X, 
  Info, 
  Mic, 
  MoreHorizontal, 
  Clock, 
  Languages as LanguagesIcon, 
  Sun, 
  Moon, 
  Check,
  Trophy,
  Award,
  Zap,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/sound';

interface AdminDashboardProps {
  onNavigateToMessages: () => void;
  onNavigateToFan?: () => void;
  sfwMode: boolean;
  onToggleSfw: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenVault: () => void;
  onOpenScripts: () => void;
  onOpenBroadcast: () => void;
  onOpenSettings?: () => void;
}

const LANGUAGES_LIST: { code: Language; name: string; flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToMessages,
  onNavigateToFan,
  sfwMode,
  onToggleSfw,
  darkMode,
  onToggleDarkMode,
  onOpenVault,
  onOpenScripts,
  onOpenBroadcast,
  onOpenSettings,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [period, setPeriod] = useState<'yesterday' | 'today' | 'week' | 'month'>('week');
  const [earningsType, setEarningsType] = useState<'net' | 'gross'>('net');
  const [growthOpen, setGrowthOpen] = useState(true);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; val: number; x: number; y: number } | null>(null);

  const [platform, setPlatform] = useState<'OnlyFans' | 'Fanvue' | 'Fansly'>('OnlyFans');
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [ofManagerOpen, setOfManagerOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [employeesOpen, setEmployeesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chartMode, setChartMode] = useState<'curve' | 'leaderboard'>('curve');
  const [micActive, setMicActive] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (platformRef.current && !platformRef.current.contains(e.target as Node)) {
        setPlatformDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = LANGUAGES_LIST.find((l) => l.code === language) || LANGUAGES_LIST[0];

  // Dynamic metrics per period
  const metricsData = {
    yesterday: {
      total: '$840.50',
      subs: '$45.00',
      posts: '$30.00',
      messages: '$560.50',
      tips: '$205.00',
      referrals: '$0.00',
      streams: '$0.00',
    },
    today: {
      total: '$1,295.40',
      subs: '$75.00',
      posts: '$60.00',
      messages: '$840.40',
      tips: '$320.00',
      referrals: '$0.00',
      streams: '$0.00',
    },
    week: {
      total: '$6,739.07',
      subs: '$352.70',
      posts: '$356.79',
      messages: '$4,165.56',
      tips: '$1,864.02',
      referrals: '$0.00',
      streams: '$0.00',
    },
    month: {
      total: '$28,490.80',
      subs: '$1,840.00',
      posts: '$1,420.00',
      messages: '$18,930.80',
      tips: '$6,300.00',
      referrals: '$0.00',
      streams: '$0.00',
    },
  }[period];

  // Chart data points (Matches screenshot bezier curve!)
  const chartPoints = [
    { day: 'Oct 25', val: 125, cx: 30, cy: 195 },
    { day: 'Oct 26', val: 350, cx: 120, cy: 45 },
    { day: 'Oct 27', val: 275, cx: 210, cy: 90 },
    { day: 'Oct 28', val: 130, cx: 300, cy: 190 },
    { day: 'Oct 29', val: 45, cx: 390, cy: 245 },
    { day: 'Oct 30', val: 110, cx: 480, cy: 205 },
    { day: 'Oct 31', val: 35, cx: 570, cy: 252 },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#f3f4f8] dark:bg-[#0c0e17] text-gray-800 dark:text-gray-100 font-sans overflow-hidden select-none transition-colors duration-200">
      {/* Left Sidebar */}
      <aside className="w-[230px] flex-shrink-0 flex flex-col h-full bg-white dark:bg-[#131624] border-r border-gray-200 dark:border-[#1f2438] z-20">
        {/* Top: Hamburger & Platform Selector */}
        <div className="p-3 border-b border-gray-100 dark:border-[#1c2238] flex items-center space-x-2 relative" ref={platformRef}>
          <button 
            title="Menu"
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* OnlyFans Dropdown Pill */}
          <button
            onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
            className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs cursor-pointer hover:bg-blue-100/50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-black">
                {platform === 'OnlyFans' ? 'OF' : platform.substring(0, 2).toUpperCase()}
              </div>
              <span className="truncate">{platform}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <ChevronDown className={`w-3.5 h-3.5 text-blue-500 transition-transform ${platformDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Platform Switcher Dropdown */}
          {platformDropdownOpen && (
            <div className="absolute left-3 right-3 top-14 bg-white dark:bg-[#1a2033] border border-gray-200 dark:border-[#2a324d] rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
              {(['OnlyFans', 'Fanvue', 'Fansly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPlatform(p);
                    setPlatformDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                    platform === p
                      ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-[9px] font-black">
                      {p.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{p}</span>
                  </div>
                  {platform === p && <Check className="w-3.5 h-3.5 text-blue-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 text-xs">
          {/* Dashboard (Active) */}
          <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-[#1f253d] text-gray-900 dark:text-white font-bold transition-all shadow-xs cursor-pointer">
            <LayoutDashboard className="w-4 h-4 text-blue-500" />
            <span>{t.dashboard}</span>
          </button>

          {/* OF Manager */}
          <div>
            <button 
              onClick={() => setOfManagerOpen(!ofManagerOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <FolderLock className="w-4 h-4" />
                <span>{t.ofManager}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${ofManagerOpen ? 'rotate-180' : ''}`} />
            </button>
            {ofManagerOpen && (
              <div className="pl-6 pr-2 py-1 space-y-1">
                <div className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer rounded hover:bg-blue-50/50 dark:hover:bg-blue-500/10">
                  Auto-Scheduler (12 queued)
                </div>
                <div 
                  onClick={onOpenVault}
                  className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer rounded hover:bg-blue-50/50 dark:hover:bg-blue-500/10"
                >
                  Vault Storage (14.2 GB)
                </div>
                <div className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer rounded hover:bg-blue-50/50 dark:hover:bg-blue-500/10">
                  Pricing & Promotions
                </div>
              </div>
            )}
          </div>

          {/* Analytics */}
          <div>
            <button 
              onClick={() => setAnalyticsOpen(!analyticsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>{t.analytics}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${analyticsOpen ? 'rotate-180' : ''}`} />
            </button>
            {analyticsOpen && (
              <div className="pl-6 pr-2 py-1 space-y-1">
                <div className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer rounded hover:bg-blue-50/50 dark:hover:bg-blue-500/10">
                  Fan Retention (87.4%)
                </div>
                <div className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer rounded hover:bg-blue-50/50 dark:hover:bg-blue-500/10">
                  PPV Conversion Funnel
                </div>
                <div className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer rounded hover:bg-blue-50/50 dark:hover:bg-blue-500/10">
                  Peak Traffic Heatmap
                </div>
              </div>
            )}
          </div>

          {/* Messages Pro (Direct link to Live Chat!) */}
          <button
            onClick={onNavigateToMessages}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-semibold cursor-pointer group"
          >
            <div className="flex items-center space-x-2.5">
              <MessageSquare className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
              <span>{t.messagesPro}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[10px] shadow-xs">
                28
              </span>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
            </div>
          </button>

          {/* Espace Fan / Visiteur (Direct link to Fan Portal!) */}
          {onNavigateToFan && (
            <button
              onClick={onNavigateToFan}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-800 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400 transition-all font-semibold cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-base group-hover:scale-110 transition-transform">👑</span>
                <span>Portail Fan</span>
              </div>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-pink-500" />
            </button>
          )}

          {/* Growth Collapsible */}
          <div>
            <button
              onClick={() => setGrowthOpen(!growthOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <TrendingUp className="w-4 h-4" />
                <span>{t.growth}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${growthOpen ? 'rotate-180' : ''}`} />
            </button>

            {growthOpen && (
              <div className="pl-6 pr-2 py-1 space-y-1">
                <button 
                  onClick={onOpenBroadcast}
                  className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 text-[11px] transition-all cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{t.smartMessages}</span>
                </button>
                <button 
                  onClick={onOpenVault}
                  className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 text-[11px] transition-all cursor-pointer"
                >
                  <FolderLock className="w-3.5 h-3.5" />
                  <span>{t.vaultPro}</span>
                </button>
                <button 
                  onClick={onOpenScripts}
                  className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 text-[11px] transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t.scripts}</span>
                </button>
              </div>
            )}
          </div>

          {/* Employees */}
          <div>
            <button 
              onClick={() => setEmployeesOpen(!employeesOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4" />
                <span>{t.employees}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${employeesOpen ? 'rotate-180' : ''}`} />
            </button>
            {employeesOpen && (
              <div className="pl-6 pr-2 py-1 space-y-1">
                <div className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer rounded hover:bg-blue-50/50 dark:hover:bg-blue-500/10">
                  Active Operators (2 online)
                </div>
                <div className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer rounded hover:bg-blue-50/50 dark:hover:bg-blue-500/10">
                  Commission Payouts
                </div>
                <div className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer rounded hover:bg-blue-50/50 dark:hover:bg-blue-500/10">
                  Shift Schedule & Swaps
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-[#1c2238] space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center space-x-2 px-2 py-1 rounded-lg hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t.settings}</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-2 py-1 rounded-lg hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.helpCenter}</span>
          </button>

          <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400">
            <span>{t.version}</span>
            <button
              onClick={() => setMicActive(!micActive)}
              title={micActive ? "Stop Voice Mode" : "Start Voice Dictation"}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                micActive
                  ? 'border-rose-500 bg-rose-500/20 text-rose-500 shadow-sm animate-pulse'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Mic className="w-3 h-3 text-current" />
              <MoreHorizontal className="w-3 h-3 text-gray-400" />
              <span className="text-gray-300 dark:text-gray-600">|</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-12 px-5 bg-white dark:bg-[#131624] border-b border-gray-200 dark:border-[#1f2438] flex items-center justify-end space-x-3 text-xs select-none">
          {/* Operational Status */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t.operational}</span>
          </div>

          {/* Timezone */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#1b2033] text-gray-600 dark:text-gray-300 font-mono-numbers text-[11px]">
            <Clock className="w-3 h-3" />
            <span>UTC+01:00</span>
            <Info className="w-3 h-3 text-gray-400 ml-0.5" />
          </div>

          {/* SFW Toggle */}
          <button
            onClick={onToggleSfw}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              sfwMode
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                : 'bg-gray-100 dark:bg-[#1b2033] text-gray-600 dark:text-gray-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{sfwMode ? t.sfwOn : t.sfwOff}</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-[#1b2033] text-gray-700 dark:text-gray-300 hover:text-white cursor-pointer"
            >
              <span>{currentLangObj.flag}</span>
              <span className="font-bold text-[10px] uppercase">{currentLangObj.code}</span>
              <LanguagesIcon className="w-3 h-3" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 top-8 w-32 rounded-xl bg-white dark:bg-[#1a2035] border border-gray-200 dark:border-gray-700 shadow-xl py-1 z-50">
                {LANGUAGES_LIST.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer hover:bg-blue-500/10 ${
                      l.code === language ? 'text-blue-500 font-bold' : ''
                    }`}
                  >
                    <span>{l.flag} {l.name}</span>
                    {l.code === language && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 cursor-pointer relative"
              title="Agency notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-9 w-80 rounded-2xl bg-white dark:bg-[#191f33] border border-gray-200 dark:border-[#28314e] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-[#222942] flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Agency Live Alerts</span>
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">3 new</span>
                </div>
                <div className="p-2 space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center space-x-1.5 font-bold text-blue-600 dark:text-blue-300">
                      <Zap className="w-3.5 h-3.5" />
                      <span>PPV Unlocked ($25.00)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Valentin bought Shower Tease from Margot</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center space-x-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <Award className="w-3.5 h-3.5" />
                      <span>Shift Target Reached</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Nella reached $2,120 sales on afternoon shift</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center space-x-1.5 font-bold text-purple-600 dark:text-purple-300">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Weekly Top Chatter</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Simon leads with 98.4% satisfaction score</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User initials pill */}
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-xs">
            WE
          </div>

          {/* Window control buttons */}
          <div className="flex items-center space-x-1 pl-2 border-l border-gray-200 dark:border-white/10">
            <button className="p-1 text-gray-400 hover:text-white">
              <Minus className="w-3 h-3" />
            </button>
            <button className="p-1 text-gray-400 hover:text-white">
              <Square className="w-2.5 h-2.5" />
            </button>
            <button className="p-1 text-gray-400 hover:text-rose-500">
              <X className="w-3 h-3" />
            </button>
          </div>
        </header>

        {/* Dashboard Body Scroll Area with Ambient Dynamic Glow */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4 relative">
          {/* Subtle Dynamic Ambient Mesh & Lights */}
          <div className="absolute top-10 right-20 w-96 h-96 bg-blue-500/8 dark:bg-blue-600/12 rounded-full blur-3xl pointer-events-none -z-0 animate-mesh" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-500/8 dark:bg-purple-600/8 rounded-full blur-3xl pointer-events-none -z-0" />

          {/* Card 1: Creator Earnings Overview */}
          <section className="bg-white dark:bg-[#131624] rounded-2xl border border-gray-200/90 dark:border-[#1e2338] shadow-xs p-5 relative z-10 fade-up-1 card-lift">
            {/* Overview Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-[#1c2238] gap-3">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t.creatorEarningsOverview}
                </h2>
                <Info className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] text-gray-400 font-mono-numbers">UTC+01:00</span>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>

              <div className="flex items-center space-x-3">
                {/* Net / Gross Dropdown */}
                <div className="relative cursor-pointer">
                  <button 
                    onClick={() => setEarningsType(earningsType === 'net' ? 'gross' : 'net')}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-50 dark:bg-[#1b2033] border border-gray-200 dark:border-[#252c42] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-500/40 transition-colors"
                  >
                    <span>{earningsType === 'net' ? t.netEarnings : t.grossEarnings}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {/* Period Selector Pills */}
                <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-[#1b2033] text-xs font-medium">
                  {(['yesterday', 'today', 'week', 'month'] as const).map((p) => {
                    const label = {
                      yesterday: t.yesterday,
                      today: t.today,
                      week: t.thisWeek,
                      month: t.thisMonth,
                    }[p];
                    const isActive = period === p;
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setPeriod(p);
                          sounds.playReceive();
                        }}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white dark:bg-[#252b45] text-blue-600 dark:text-blue-400 font-bold shadow-xs scale-102'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 pt-5 items-center">
              {/* Highlight Big Total (Interactive with Confetti!) */}
              <div 
                onClick={() => {
                  sounds.playCash();
                  confetti({
                    particleCount: 65,
                    spread: 70,
                    origin: { y: 0.35, x: 0.28 },
                    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
                  });
                }}
                title="Click to celebrate revenue milestone!"
                className="lg:col-span-2 flex flex-col justify-center pr-4 border-r border-gray-100 dark:border-[#1c2238] group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <span className="font-black text-xs">OF</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {t.totalEarnings}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <div 
                    key={period}
                    className="text-3xl font-black font-mono-numbers text-blue-600 dark:text-blue-400 tracking-tight group-hover:scale-102 transition-transform duration-200 animate-in fade-in zoom-in-95"
                  >
                    {metricsData.total}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                    ↗ +18.4%
                  </span>
                </div>
              </div>

              {/* Subscriptions */}
              <div className="flex items-center space-x-3 p-2 rounded-xl card-lift hover:bg-gray-50/80 dark:hover:bg-[#181d2f] cursor-pointer">
                <div className="flex-1">
                  <div key={period} className="text-base font-bold font-mono-numbers text-gray-900 dark:text-white animate-in fade-in">
                    {metricsData.subs}
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {t.subscriptions}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>

              {/* Posts */}
              <div className="flex items-center space-x-3 p-2 rounded-xl card-lift hover:bg-gray-50/80 dark:hover:bg-[#181d2f] cursor-pointer">
                <div className="flex-1">
                  <div key={period} className="text-base font-bold font-mono-numbers text-gray-900 dark:text-white animate-in fade-in">
                    {metricsData.posts}
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {t.posts}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>

              {/* Messages (Dominant! with subtle pulse) */}
              <div className="flex items-center space-x-3 p-2 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 card-lift hover:bg-purple-500/15 cursor-pointer">
                <div className="flex-1">
                  <div key={period} className="text-base font-bold font-mono-numbers text-purple-600 dark:text-purple-400 animate-in fade-in">
                    {metricsData.messages}
                  </div>
                  <span className="text-[11px] text-purple-500 font-semibold">
                    {t.messagesEarnings}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>

              {/* Tips */}
              <div className="flex items-center space-x-3 p-2 rounded-xl card-lift hover:bg-gray-50/80 dark:hover:bg-[#181d2f] cursor-pointer">
                <div className="flex-1">
                  <div key={period} className="text-base font-bold font-mono-numbers text-gray-900 dark:text-white animate-in fade-in">
                    {metricsData.tips}
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {t.tipsEarnings}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
              </div>

              {/* Referrals & Streams */}
              <div className="flex items-center space-x-3 p-2 rounded-xl card-lift hover:bg-gray-50/80 dark:hover:bg-[#181d2f] cursor-pointer">
                <div className="flex-1">
                  <div key={period} className="text-base font-bold font-mono-numbers text-gray-900 dark:text-white animate-in fade-in">
                    {metricsData.referrals}
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {t.referrals}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          </section>

          {/* Lower Grid: Shifts (Left) and Employee Sales Curve (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Card 2: My Shifts (Col 4) */}
            <section className="lg:col-span-4 bg-white dark:bg-[#131624] rounded-2xl border border-gray-200/90 dark:border-[#1e2338] shadow-xs p-5 flex flex-col justify-between relative z-10 fade-up-2 card-lift">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                  {t.myShifts}
                </h3>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>

              {/* Illustration and No Data State (Matches screenshot) */}
              <div className="my-10 flex flex-col items-center justify-center text-center">
                <div className="relative mb-3 group cursor-pointer">
                  <div className="w-16 h-20 rounded-xl bg-gray-50 dark:bg-[#1b2033] border-2 border-dashed border-gray-300 dark:border-[#2b334d] flex flex-col items-center justify-center shadow-xs group-hover:border-blue-500/60 group-hover:scale-105 transition-all duration-300">
                    <div className="w-7 h-1.5 bg-blue-500 rounded-full mb-1"></div>
                    <div className="w-5 h-1.5 bg-gray-400 rounded-full mb-2"></div>
                    <div className="text-sm font-bold text-gray-400 font-mono tracking-widest">
                      _ _
                    </div>
                  </div>
                  <span className="absolute -top-1 -right-1 text-xs text-amber-500 animate-bounce">✨</span>
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {t.noData}
                </span>
                <span className="text-[11px] text-gray-400 max-w-[180px] mt-1">
                  No active shift registered for this operator.
                </span>
              </div>

              {/* Action Button */}
              <button 
                onClick={onNavigateToMessages}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Launch Operator Workstation</span>
                <span>→</span>
              </button>
            </section>

            {/* Card 3: Employee Sales Area Curve Chart (Col 8) */}
            <section className="lg:col-span-8 bg-white dark:bg-[#131624] rounded-2xl border border-gray-200/90 dark:border-[#1e2338] shadow-xs p-5 relative z-10 fade-up-3 card-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    {t.employeeSales}
                  </h3>
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center p-0.5 rounded-lg bg-gray-100 dark:bg-[#1b2033] text-[11px]">
                    <button
                      onClick={() => setChartMode('curve')}
                      className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        chartMode === 'curve'
                          ? 'bg-white dark:bg-[#252b45] text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Bézier Curve
                    </button>
                    <button
                      onClick={() => setChartMode('leaderboard')}
                      className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        chartMode === 'leaderboard'
                          ? 'bg-white dark:bg-[#252b45] text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Leaderboard
                    </button>
                  </div>
                  <span className="text-[11px] font-mono-numbers text-blue-500 dark:text-blue-400 font-bold hidden sm:inline">
                    Peak: $350 (Oct 26)
                  </span>
                </div>
              </div>

              {chartMode === 'curve' ? (
                /* SVG Bezier Area Chart matching screenshot */
                <div className="relative w-full h-64 select-none">
                  <svg className="w-full h-full" viewBox="0 0 600 280">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Y Axis Grid Lines */}
                    {[
                      { label: '400', y: 30 },
                      { label: '300', y: 85 },
                      { label: '200', y: 140 },
                      { label: '100', y: 195 },
                      { label: '0', y: 250 },
                    ].map((grid, i) => (
                      <g key={i}>
                        <text x="5" y={grid.y + 4} fill="#8892a4" fontSize="10" fontFamily="JetBrains Mono">
                          {grid.label}
                        </text>
                        <line
                          x1="30"
                          y1={grid.y}
                          x2="590"
                          y2={grid.y}
                          stroke="#e2e8f0"
                          strokeDasharray="3 3"
                          className="dark:stroke-[#1f263d]"
                        />
                      </g>
                    ))}

                    {/* Interactive Vertical Guideline */}
                    {hoveredPoint && (
                      <line
                        x1={hoveredPoint.x}
                        y1="25"
                        x2={hoveredPoint.x}
                        y2="250"
                        stroke="#3b82f6"
                        strokeDasharray="3 3"
                        strokeWidth="1.5"
                        className="opacity-75"
                      />
                    )}

                    {/* Smooth Area Path */}
                    <path
                      d="M 30,195 C 75,45 75,45 120,45 C 165,45 165,90 210,90 C 255,90 255,190 300,190 C 345,190 345,245 390,245 C 435,245 435,205 480,205 C 525,205 525,252 570,252 L 570,250 L 30,250 Z"
                      fill="url(#areaGradient)"
                    />

                    {/* Pulsing Radar Ring on Peak Day (Oct 26) */}
                    <circle
                      cx="120"
                      cy="45"
                      r="12"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      className="animate-ping opacity-60"
                      style={{ transformOrigin: '120px 45px' }}
                    />

                    {/* Smooth Line Curve */}
                    <path
                      d="M 30,195 C 75,45 75,45 120,45 C 165,45 165,90 210,90 C 255,90 255,190 300,190 C 345,190 345,245 390,245 C 435,245 435,205 480,205 C 525,205 525,252 570,252"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      className="animate-chart-line"
                    />

                    {/* Data Points on Curve */}
                    {chartPoints.map((pt, idx) => (
                      <circle
                        key={idx}
                        cx={pt.cx}
                        cy={pt.cy}
                        r="4.5"
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        className="cursor-pointer hover:r-6.5 transition-all duration-200"
                        onMouseEnter={() => setHoveredPoint({ day: pt.day, val: pt.val, x: pt.cx, y: pt.cy })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}

                    {/* X Axis Labels */}
                    {chartPoints.map((pt, idx) => (
                      <text
                        key={idx}
                        x={pt.cx}
                        y="270"
                        textAnchor="middle"
                        fill="#8892a4"
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                      >
                        {pt.day}
                      </text>
                    ))}
                  </svg>

                  {/* Floating Holographic Tooltip */}
                  {hoveredPoint && (
                    <div
                      style={{ left: `${(hoveredPoint.x / 600) * 100}%`, top: `${(hoveredPoint.y / 280) * 100 - 18}%` }}
                      className="absolute -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl bg-gray-950/90 dark:bg-[#1a2138]/95 backdrop-blur-md text-white text-xs font-mono-numbers font-bold shadow-2xl border border-blue-500/40 pointer-events-none z-20 animate-in fade-in zoom-in-90 duration-150 flex items-center space-x-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                      <span>{hoveredPoint.day}:</span>
                      <span className="text-emerald-400">${hoveredPoint.val}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Leaderboard Table View */
                <div className="h-64 overflow-y-auto space-y-2 pt-1">
                  {[
                    { rank: 1, name: 'Simon G.', sales: '$2,840.00', deals: 342, score: '98.4%', active: true },
                    { rank: 2, name: 'Nella R.', sales: '$2,120.00', deals: 260, score: '97.2%', active: true },
                    { rank: 3, name: 'Florent M.', sales: '$1,420.00', deals: 180, score: '95.8%', active: false },
                    { rank: 4, name: 'Heron D.', sales: '$359.07', deals: 44, score: '92.0%', active: false },
                  ].map((lead) => (
                    <div
                      key={lead.rank}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200/60 dark:border-[#252c42] hover:border-blue-500/40 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          lead.rank === 1 ? 'bg-amber-400 text-amber-950 shadow-xs' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {lead.rank}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white text-xs block">{lead.name}</span>
                          <span className="text-[10px] text-gray-400">{lead.deals} PPV/Tips converted</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs font-mono-numbers">
                        <div className="text-right">
                          <span className="font-bold text-gray-900 dark:text-white block">{lead.sales}</span>
                          <span className="text-[10px] text-emerald-500 font-semibold">{lead.score} satisfaction</span>
                        </div>
                        {lead.active && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active on shift"></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Card 4: Scheduled Hours */}
          <section className="bg-white dark:bg-[#131624] rounded-2xl border border-gray-200/90 dark:border-[#1e2338] shadow-xs p-5 relative z-10 fade-up-4 card-lift">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1c2238]">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                  {t.scheduledHours}
                </h3>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Week 44 • 5 Chatters Scheduled</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 text-xs">
              {[
                { name: 'Simon G.', shift: '08:00 - 16:00', status: 'Active', color: 'emerald' },
                { name: 'Nella R.', shift: '14:00 - 22:00', status: 'Active', color: 'emerald' },
                { name: 'Florent M.', shift: '18:00 - 02:00', status: 'Upcoming', color: 'blue' },
                { name: 'Heron D.', shift: '22:00 - 06:00', status: 'Scheduled', color: 'gray' },
                { name: 'Ilan T.', shift: 'Day Off', status: 'Off', color: 'rose' },
              ].map((worker, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-gray-50/70 dark:bg-[#1b2033] border border-gray-200/70 dark:border-[#252c42] card-lift hover:bg-white dark:hover:bg-[#1f263d] hover:border-blue-500/40 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 dark:text-white">{worker.name}</span>
                    <span className={`w-2 h-2 rounded-full ${worker.color === 'emerald' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  </div>
                  <span className="text-[11px] font-mono-numbers text-gray-500 dark:text-gray-400 block">{worker.shift}</span>
                  <span className="text-[10px] font-bold text-blue-500 uppercase mt-1 block">{worker.status}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Floating Assistant Widget (Bottom Right with smiley, red dot & floating animation) */}
      <button 
        onClick={onNavigateToMessages}
        title="Open Messages Pro Workstation"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer animate-float"
      >
        <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="white"/>
          <path d="M9 13a3 3 0 0 0 6 0" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white dark:border-[#131624]"></span>
      </button>
    </div>
  );
};
