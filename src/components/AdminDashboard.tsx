import React, { useState, useRef, useEffect } from 'react';
import {
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
  ExternalLink,
  ShieldCheck,
  X,
  Info,
  Sun,
  Moon,
  Check,
  Plus,
  Hash,
  Search,
  Trash2,
  Copy,
  Sparkles,
  ArrowLeft,
  Tag as TagIcon
} from 'lucide-react';
import type { CannedScript, ScriptMediaTag } from '../types/crm';
import { CANNED_SCRIPTS } from '../data/mockData';
import { useLanguage } from '../i18n/LanguageContext';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/sound';

interface AdminDashboardProps {
  onNavigateToMessages: () => void;
  onNavigateToFan?: () => void;
  onNavigateToLogin?: () => void;
  sfwMode: boolean;
  onToggleSfw: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenVault: () => void;
  onOpenBroadcast: () => void;
  onOpenSettings?: () => void;
  scripts?: CannedScript[];
  onAddScript?: (script: Omit<CannedScript, 'id'>) => void;
  onDeleteScript?: (id: string) => void;
}

const PRESET_DASHBOARD_MEDIA_TAGS = [
  {
    name: 'douche_video',
    type: 'video' as const,
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
    price: 15,
    title: 'Extrait Douche Chaude 4K (45s)',
  },
  {
    name: 'douche_photo',
    type: 'photo' as const,
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    price: 10,
    title: 'Selfie Miroir Buée',
  },
  {
    name: 'lingerie_pack',
    type: 'photo' as const,
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    price: 25,
    title: 'Pack 5 Photos Dentelle',
  },
  {
    name: 'lingerie_video',
    type: 'video' as const,
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    price: 35,
    title: 'Vidéo Essayage Privé (2min)',
  },
  {
    name: 'regard_sensuel',
    type: 'photo' as const,
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    price: 12,
    title: 'Photo Regard Braise',
  },
  {
    name: 'kinky_clip',
    type: 'video' as const,
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    price: 20,
    title: 'Clip Teasing Soirée',
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToMessages,
  onNavigateToFan,
  onNavigateToLogin,
  sfwMode,
  onToggleSfw,
  darkMode,
  onToggleDarkMode,
  onOpenVault,
  onOpenBroadcast,
  onOpenSettings,
  scripts = CANNED_SCRIPTS,
  onAddScript,
  onDeleteScript,
}) => {
  const { t } = useLanguage();
  const dashboardScripts = scripts.length > 0 ? scripts : CANNED_SCRIPTS;

  // View state: 'overview' (main dashboard) vs 'scripts' (dedicated inline scripts & tags manager)
  const [adminSection, setAdminSection] = useState<'overview' | 'scripts'>('overview');
  const [isCreatingScriptInline, setIsCreatingScriptInline] = useState(false);
  const [scriptSearch, setScriptSearch] = useState('');
  const [scriptCategoryFilter, setScriptCategoryFilter] = useState('All');
  const [scriptTagFilter, setScriptTagFilter] = useState<string | null>(null);
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  // Form state for creating a script inline (NO POPUP!)
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<CannedScript['category']>('PPV Tease');
  const [formText, setFormText] = useState('');
  const [formMediaTags, setFormMediaTags] = useState<ScriptMediaTag[]>([]);

  // Media tag input state
  const [tagInputName, setTagInputName] = useState('');
  const [tagInputType, setTagInputType] = useState<'photo' | 'video'>('video');
  const [tagInputPrice, setTagInputPrice] = useState('15.00');
  const [tagInputUrl, setTagInputUrl] = useState('');
  const [tagInputTitle, setTagInputTitle] = useState('');
  const [formErrorMsg, setFormErrorMsg] = useState<string | null>(null);

  const [period, setPeriod] = useState<'yesterday' | 'today' | 'week' | 'month'>('week');
  const [earningsType, setEarningsType] = useState<'net' | 'gross'>('net');
  const [growthOpen, setGrowthOpen] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; val: number; x: number; y: number } | null>(null);

  const [platform, setPlatform] = useState<'Cactusclub' | 'Fanvue' | 'Fansly'>('Cactusclub');
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [ofManagerOpen, setOfManagerOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [employeesOpen, setEmployeesOpen] = useState(false);
  const [chartMode, setChartMode] = useState<'curve' | 'leaderboard'>('curve');

  const platformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (platformRef.current && !platformRef.current.contains(e.target as Node)) {
        setPlatformDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // SVG Chart points
  const chartPoints = [
    { day: 'Oct 23', val: 120, cx: 30, cy: 195 },
    { day: 'Oct 24', val: 240, cx: 75, cy: 120 },
    { day: 'Oct 25', val: 310, cx: 120, cy: 45 },
    { day: 'Oct 26', val: 350, cx: 165, cy: 45 },
    { day: 'Oct 27', val: 290, cx: 210, cy: 90 },
    { day: 'Oct 28', val: 210, cx: 255, cy: 140 },
    { day: 'Oct 29', val: 180, cx: 300, cy: 190 },
    { day: 'Oct 30', val: 95, cx: 345, cy: 220 },
    { day: 'Oct 31', val: 20, cx: 390, cy: 245 },
    { day: 'Nov 01', val: 80, cx: 435, cy: 225 },
    { day: 'Nov 02', val: 140, cx: 480, cy: 205 },
    { day: 'Nov 03', val: 90, cx: 525, cy: 235 },
    { day: 'Nov 04', val: 0, cx: 570, cy: 252 },
  ];

  // Filter scripts for inline view
  const filteredInlineScripts = dashboardScripts.filter((s) => {
    const matchCat = scriptCategoryFilter === 'All' || s.category === scriptCategoryFilter;
    const matchTag =
      !scriptTagFilter ||
      s.tags.includes(scriptTagFilter) ||
      (s.mediaTags && s.mediaTags.some((mt) => mt.name === scriptTagFilter));
    const matchSearch =
      s.title.toLowerCase().includes(scriptSearch.toLowerCase()) ||
      s.text.toLowerCase().includes(scriptSearch.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(scriptSearch.toLowerCase())) ||
      (s.mediaTags && s.mediaTags.some((mt) => mt.name.toLowerCase().includes(scriptSearch.toLowerCase())));
    return matchCat && matchTag && matchSearch;
  });

  // Calculate stats for scripts
  const allMediaTags = dashboardScripts.flatMap((s) => s.mediaTags || []);
  const videoTagsCount = allMediaTags.filter((mt) => mt.type === 'video').length;
  const photoTagsCount = allMediaTags.filter((mt) => mt.type === 'photo').length;
  const avgPpvPrice = allMediaTags.length > 0
    ? (allMediaTags.reduce((acc, curr) => acc + curr.price, 0) / allMediaTags.length).toFixed(2)
    : '18.50';

  // Handle adding media tag inside creation form
  const handleAddMediaTagToForm = () => {
    if (!tagInputName.trim()) {
      setFormErrorMsg('Veuillez renseigner un nom de tag (ex: douche_video, lingerie_pack).');
      return;
    }
    if (!tagInputUrl.trim()) {
      setFormErrorMsg('Veuillez spécifier une URL de photo ou vidéo pour ce tag.');
      return;
    }
    const priceNum = parseFloat(tagInputPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormErrorMsg('Veuillez renseigner un prix valide en dollars.');
      return;
    }

    const cleanTag = tagInputName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const newTag: ScriptMediaTag = {
      id: `mt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanTag,
      type: tagInputType,
      url: tagInputUrl.trim(),
      price: priceNum,
      title: tagInputTitle.trim() || undefined,
    };

    setFormMediaTags([...formMediaTags, newTag]);
    setTagInputName('');
    setTagInputUrl('');
    setTagInputPrice('15.00');
    setTagInputTitle('');
    setFormErrorMsg(null);
    sounds.playReceive();
  };

  // Handle saving the full script inline
  const handleSaveScriptInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormErrorMsg('Le titre du script est obligatoire.');
      return;
    }
    if (!formText.trim()) {
      setFormErrorMsg('Le texte du script ne peut pas être vide.');
      return;
    }

    const extractedTags = Array.from(
      new Set([
        formCategory.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        ...formMediaTags.map((mt) => mt.name),
      ])
    );

    const firstMedia = formMediaTags[0];

    const scriptPayload: Omit<CannedScript, 'id'> = {
      title: formTitle.trim(),
      category: formCategory,
      text: formText.trim(),
      price: firstMedia ? firstMedia.price : undefined,
      tags: extractedTags,
      mediaTags: formMediaTags,
      media: firstMedia
        ? {
            type: firstMedia.type === 'video' ? 'video' : 'image',
            url: firstMedia.url,
            isLocked: true,
            price: firstMedia.price,
          }
        : undefined,
    };

    if (onAddScript) {
      onAddScript(scriptPayload);
    }

    sounds.playCash();
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981'],
    });

    // Reset form
    setFormTitle('');
    setFormText('');
    setFormMediaTags([]);
    setFormErrorMsg(null);
    setIsCreatingScriptInline(false);
  };

  const handleCopyScriptText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedScriptId(id);
    sounds.playReceive();
    setTimeout(() => setCopiedScriptId(null), 1800);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8f9fc] dark:bg-[#0c0e17] overflow-hidden select-none font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-60 bg-white dark:bg-[#131624] border-r border-gray-200 dark:border-[#1f2438] flex flex-col justify-between flex-shrink-0 z-20">
        {/* Top Platform Switcher Header */}
        <div className="p-3 border-b border-gray-100 dark:border-[#1c2238] relative" ref={platformRef}>
          <button
            onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-[#1a2033] hover:bg-gray-100 dark:hover:bg-[#20273d] transition-all text-xs font-semibold cursor-pointer border border-gray-200/60 dark:border-[#28324e]"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                {platform === 'Cactusclub' ? 'CC' : platform.substring(0, 2).toUpperCase()}
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{platform}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Platform Switcher Dropdown */}
          {platformDropdownOpen && (
            <div className="absolute top-14 left-3 right-3 bg-white dark:bg-[#191f33] border border-gray-200 dark:border-[#27314d] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
              {(['Cactusclub', 'Fanvue', 'Fansly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPlatform(p);
                    setPlatformDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                    platform === p
                      ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300 font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                      {p === 'Cactusclub' ? 'CC' : p.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold">{p}</span>
                  </div>
                  {platform === p && <Check className="w-3.5 h-3.5 text-pink-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 text-xs">
          {/* Dashboard (Active/Overview) */}
          <button
            onClick={() => {
              setAdminSection('overview');
              sounds.playReceive();
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              adminSection === 'overview'
                ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold shadow-xs border border-blue-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
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

          {/* Page Connexion Cactusclub */}
          {onNavigateToLogin && (
            <button
              onClick={onNavigateToLogin}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-[#00aff0] transition-all font-semibold cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-base group-hover:scale-110 transition-transform">🔐</span>
                <span>Login Cactusclub</span>
              </div>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#00aff0]" />
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
                  onClick={() => {
                    setAdminSection('scripts');
                    sounds.playReceive();
                  }}
                  className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                    adminSection === 'scripts'
                      ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t.scripts}</span>
                  <span className="ml-auto px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 text-[9px] font-bold">
                    {dashboardScripts.length}
                  </span>
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
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-[#1c2238] space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span>{t.settings}</span>
          </button>
          <button className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer">
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <span>{t.helpCenter}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-12 px-5 bg-white dark:bg-[#131624] border-b border-gray-200 dark:border-[#1f2438] flex items-center justify-between text-xs select-none">
          {/* Breadcrumb Section Tracker */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 font-medium">Agence</span>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {adminSection === 'overview' ? 'Tableau de bord' : 'Scripts de Vente & Tags Médias'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Operational Status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t.operational}</span>
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

            {/* User initials pill */}
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-xs">
              CC
            </div>
          </div>
        </header>

        {/* ============================================================== */}
        {/* VIEW A: DEDICATED INLINE SCRIPTS & TAGS WORKSPACE (ZERO POPUP!) */}
        {/* ============================================================== */}
        {adminSection === 'scripts' ? (
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative bg-[#f8f9fc] dark:bg-[#0c0e17]">
            {/* Header & Back Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-[#1e2338]">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setAdminSection('overview');
                    sounds.playReceive();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#151928] border border-gray-200 dark:border-[#222942] text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs hover:border-blue-400"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Vue d'ensemble</span>
                </button>

                <div>
                  <h1 className="text-base sm:text-lg font-black text-gray-900 dark:text-white flex items-center space-x-2">
                    <span>Gestion des Scripts, Photos/Vidéos & Tags</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-xs font-black">
                      {dashboardScripts.length} scripts
                    </span>
                  </h1>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Chaque tag est associé à une photo ou une vidéo exclusive avec son prix PPV verrouillé.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCreatingScriptInline(!isCreatingScriptInline);
                  sounds.playReceive();
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{isCreatingScriptInline ? 'Masquer le Formulaire' : '+ Créer un Nouveau Script'}</span>
              </button>
            </div>

            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131624] border border-gray-200/90 dark:border-[#1e2338] shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Scripts Actifs</span>
                <span className="text-xl font-black text-gray-900 dark:text-white font-mono-numbers mt-1 block">
                  {dashboardScripts.length}
                </span>
                <span className="text-[10px] text-blue-500 font-bold">Disponibles pour les chatters</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131624] border border-gray-200/90 dark:border-[#1e2338] shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tags avec Vidéos</span>
                <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono-numbers mt-1 block flex items-center space-x-1">
                  <span>🎬</span>
                  <span>{videoTagsCount}</span>
                </span>
                <span className="text-[10px] text-purple-500 font-bold">Clips & teasers PPV</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131624] border border-gray-200/90 dark:border-[#1e2338] shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tags avec Photos</span>
                <span className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono-numbers mt-1 block flex items-center space-x-1">
                  <span>📸</span>
                  <span>{photoTagsCount}</span>
                </span>
                <span className="text-[10px] text-pink-500 font-bold">Photos & packs exclusifs</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131624] border border-gray-200/90 dark:border-[#1e2338] shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Prix Moyen Tag PPV</span>
                <span className="text-xl font-black text-amber-500 font-mono-numbers mt-1 block">
                  ${avgPpvPrice}
                </span>
                <span className="text-[10px] text-amber-500 font-bold">Revenu moyen par envoi</span>
              </div>
            </div>

            {/* INLINE SCRIPT CREATION FORM (NO POPUP!) */}
            {isCreatingScriptInline && (
              <section className="p-5 rounded-3xl bg-white dark:bg-[#131624] border-2 border-blue-500/40 shadow-xl space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1e2338]">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-gray-900 dark:text-white">
                        Créer un Script avec ses Tags Photos/Vidéos & Prix
                      </h2>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Rédigez le texte et associez un ou plusieurs tags média payants.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreatingScriptInline(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveScriptInline} className="space-y-4">
                  {formErrorMsg && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                      ⚠️ {formErrorMsg}
                    </div>
                  )}

                  {/* Title & Category Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Titre du Script <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Ex: 🚿 Tease Douche Chaude 4K"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Catégorie Stratégique <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as CannedScript['category'])}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                      >
                        <option value="PPV Tease">🚿 PPV Tease (Média payant à débloquer)</option>
                        <option value="Greeting">👋 Greeting (Premier contact / Bienvenue)</option>
                        <option value="Upsell">💎 Upsell (Vente additionnelle / Pack VIP)</option>
                        <option value="Kinky">🔥 Kinky (Jeu de rôle / Fantasmes & désirs)</option>
                        <option value="Follow-up">⏳ Follow-up (Relance après silence)</option>
                        <option value="Re-engage">💫 Re-engage (Réactivation fan inactif)</option>
                      </select>
                    </div>
                  </div>

                  {/* SOUS-SECTION : LES TAGS QUI ONT DES PHOTOS, VIDÉOS AVEC LES PRIX */}
                  <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-[#151a2a] border border-blue-500/25 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TagIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          Tags Médias Associés (Photos / Vidéos avec Prix en $)
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                        {formMediaTags.length} tag{formMediaTags.length > 1 ? 's' : ''} configuré{formMediaTags.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Tags List */}
                    {formMediaTags.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {formMediaTags.map((mt) => (
                          <div
                            key={mt.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#101422] border border-gray-200 dark:border-[#222a42] shadow-2xs"
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-black flex-shrink-0">
                                <img src={mt.url} alt={mt.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-[10px]">
                                  {mt.type === 'video' ? '🎬' : '📸'}
                                </div>
                              </div>
                              <div className="min-w-0">
                                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 block truncate">
                                  #{mt.name}
                                </span>
                                <span className="text-[10px] text-gray-400 block truncate">
                                  {mt.title || (mt.type === 'video' ? 'Vidéo' : 'Photo')}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="font-mono-numbers text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                                ${mt.price.toFixed(2)}
                              </span>
                              <button
                                type="button"
                                onClick={() => setFormMediaTags(formMediaTags.filter((t) => t.id !== mt.id))}
                                className="p-1 text-gray-400 hover:text-rose-500 cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Tag Sub-inputs */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#101320] border border-gray-200 dark:border-[#1e253c] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          + Ajouter un Tag avec Photo ou Vidéo & Prix :
                        </span>

                        {/* Presets in 1 click */}
                        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar max-w-sm">
                          <span className="text-[9px] text-gray-400">Exemples :</span>
                          {PRESET_DASHBOARD_MEDIA_TAGS.slice(0, 3).map((p, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setTagInputName(p.name);
                                setTagInputType(p.type);
                                setTagInputPrice(p.price.toString());
                                setTagInputUrl(p.url);
                                setTagInputTitle(p.title);
                                sounds.playReceive();
                              }}
                              className="px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-[9px] font-bold cursor-pointer"
                            >
                              #{p.name} (${p.price})
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            value={tagInputName}
                            onChange={(e) => setTagInputName(e.target.value)}
                            placeholder="Nom du tag (#douche_video)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-gray-900 dark:text-white font-mono text-xs outline-none"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <select
                            value={tagInputType}
                            onChange={(e) => setTagInputType(e.target.value as 'photo' | 'video')}
                            className="w-full px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-gray-900 dark:text-white text-xs outline-none cursor-pointer"
                          >
                            <option value="video">🎬 Vidéo PPV</option>
                            <option value="photo">📸 Photo PPV</option>
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-500 font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={tagInputPrice}
                              onChange={(e) => setTagInputPrice(e.target.value)}
                              placeholder="15.00"
                              className="w-full pl-5 pr-2 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-gray-900 dark:text-white font-mono-numbers text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={handleAddMediaTagToForm}
                            className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                          >
                            + Ajouter
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={tagInputUrl}
                        onChange={(e) => setTagInputUrl(e.target.value)}
                        placeholder="URL de la photo ou vidéo (ou cliquez sur un preset ci-dessus)..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-gray-900 dark:text-white font-mono text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Script Text */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Texte du Script <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      placeholder="Message de vente persuasif à envoyer aux fans..."
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-[#1e2338]">
                    <button
                      type="button"
                      onClick={() => setIsCreatingScriptInline(false)}
                      className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#1a2033] text-gray-700 dark:text-gray-300 text-xs font-bold cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      Enregistrer dans la Bibliothèque
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#131624] border border-gray-200/90 dark:border-[#1e2338] shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={scriptSearch}
                  onChange={(e) => setScriptSearch(e.target.value)}
                  placeholder="Rechercher un script par mot-clé ou par tag (#douche, #lingerie, #ppv)..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-1 pb-1 border-b border-gray-100 dark:border-[#1e2338]">
                {['All', 'PPV Tease', 'Greeting', 'Upsell', 'Kinky', 'Follow-up', 'Re-engage'].map((cat) => {
                  const isSelected = scriptCategoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setScriptCategoryFilter(cat);
                        sounds.playReceive();
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-[#1a2033] text-gray-600 dark:text-gray-400 hover:text-blue-500'
                      }`}
                    >
                      {cat === 'All' ? 'Tous les scripts' : cat}
                    </button>
                  );
                })}
              </div>

              {/* Tag Quick Filters */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1 mr-1 flex-shrink-0">
                  <Hash className="w-3 h-3" />
                  <span>Filtrer par Tag Média :</span>
                </span>

                {scriptTagFilter && (
                  <button
                    onClick={() => setScriptTagFilter(null)}
                    className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold cursor-pointer flex items-center space-x-1 flex-shrink-0"
                  >
                    <span>#{scriptTagFilter}</span>
                    <span>×</span>
                  </button>
                )}

                {['douche_video', 'douche_photo', 'lingerie_pack', 'lingerie_video', 'regard_sensuel', 'kinky_clip'].map((tName) => {
                  const isSelected = scriptTagFilter === tName;
                  return (
                    <button
                      key={tName}
                      onClick={() => {
                        setScriptTagFilter(isSelected ? null : tName);
                        sounds.playReceive();
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-[#1a2033] text-gray-600 dark:text-gray-400 hover:text-blue-500 border border-gray-200/80 dark:border-transparent'
                      }`}
                    >
                      #{tName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid of Scripts with their Media Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
              {filteredInlineScripts.map((script) => (
                <div
                  key={script.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#131624] border border-gray-200/90 dark:border-[#1e2338] shadow-xs flex flex-col justify-between hover:border-blue-500/50 transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                        {script.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
                        {script.category}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed select-text font-normal line-clamp-3">
                      {script.text}
                    </p>

                    {/* MEDIA TAGS SHELF (Photos / Vidéos avec Prix) */}
                    {script.mediaTags && script.mediaTags.length > 0 && (
                      <div className="my-3 p-2.5 rounded-xl bg-gray-50/80 dark:bg-[#181d2e] border border-gray-200/60 dark:border-[#222940] space-y-1.5">
                        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">
                          Tags avec Photo / Vidéo & Prix :
                        </span>
                        <div className="space-y-1.5">
                          {script.mediaTags.map((mt) => (
                            <div
                              key={mt.id}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-[#131624] border border-gray-200/80 dark:border-[#20273d]"
                            >
                              <div className="flex items-center space-x-2 min-w-0">
                                <div className="relative w-7 h-7 rounded-md overflow-hidden bg-black flex-shrink-0">
                                  <img src={mt.url} alt={mt.name} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-[9px]">
                                    {mt.type === 'video' ? '🎬' : '📸'}
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 truncate block">
                                    #{mt.name}
                                  </span>
                                  <span className="text-[9px] text-gray-400 truncate block">
                                    {mt.title || (mt.type === 'video' ? 'Vidéo' : 'Photo')}
                                  </span>
                                </div>
                              </div>

                              <span className="font-mono-numbers text-xs font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded flex-shrink-0">
                                ${mt.price.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 dark:border-[#1e2338]">
                    <div className="flex items-center space-x-1">
                      {onDeleteScript && script.id.startsWith('s-') && (
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer le script "${script.title}" ?`)) {
                              onDeleteScript(script.id);
                              sounds.playReceive();
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-rose-500 cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyScriptText(script.text, script.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#1a2033] dark:hover:bg-[#252e49] text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      {copiedScriptId === script.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copier Texte</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        ) : (
          /* ============================================================== */
          /* VIEW B: MAIN OVERVIEW DASHBOARD                                */
          /* ============================================================== */
          <main className="flex-1 overflow-y-auto p-5 space-y-4 relative">
            {/* Subtle Dynamic Ambient Mesh & Lights */}
            <div className="absolute top-10 right-20 w-96 h-96 bg-blue-500/8 dark:bg-blue-600/12 rounded-full blur-3xl pointer-events-none -z-0 animate-mesh" />
            <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-500/8 dark:bg-purple-600/8 rounded-full blur-3xl pointer-events-none -z-0" />

            {/* Card 1: Creator Earnings Overview */}
            <section className="bg-white dark:bg-[#131624] rounded-2xl border border-gray-200/90 dark:border-[#1e2338] shadow-xs p-5 relative z-10 fade-up-1 card-lift">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-[#1c2238] gap-3">
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t.creatorEarningsOverview}
                  </h2>
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] text-gray-400 font-mono-numbers">UTC+01:00</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative cursor-pointer">
                    <button
                      onClick={() => setEarningsType(earningsType === 'net' ? 'gross' : 'net')}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-50 dark:bg-[#1b2033] border border-gray-200 dark:border-[#252c42] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-500/40 transition-colors"
                    >
                      <span>{earningsType === 'net' ? t.netEarnings : t.grossEarnings}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>

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
                <div
                  onClick={() => {
                    sounds.playCash();
                    confetti({
                      particleCount: 65,
                      spread: 70,
                      origin: { y: 0.35, x: 0.28 },
                      colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
                    });
                  }}
                  className="lg:col-span-2 flex flex-col justify-center pr-4 border-r border-gray-100 dark:border-[#1c2238] group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-pink-500/30 group-hover:scale-110 transition-transform">
                      <span className="font-black text-xs">CC</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {t.totalEarnings} Cactusclub
                    </span>
                  </div>
                  <div className="text-3xl font-black font-mono-numbers text-gray-900 dark:text-white tracking-tight">
                    {metricsData.total}
                  </div>
                </div>

                <div className="p-2">
                  <div className="text-base font-bold font-mono-numbers text-gray-900 dark:text-white">
                    {metricsData.subs}
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{t.subscriptions}</span>
                </div>

                <div className="p-2">
                  <div className="text-base font-bold font-mono-numbers text-gray-900 dark:text-white">
                    {metricsData.messages}
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{t.messagesEarnings}</span>
                </div>

                <div className="p-2">
                  <div className="text-base font-bold font-mono-numbers text-gray-900 dark:text-white">
                    {metricsData.tips}
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{t.tipsEarnings}</span>
                </div>

                <div className="p-2">
                  <div className="text-base font-bold font-mono-numbers text-gray-900 dark:text-white">
                    {metricsData.posts}
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{t.posts}</span>
                </div>

                <div className="p-2">
                  <div className="text-base font-bold font-mono-numbers text-gray-900 dark:text-white">
                    {metricsData.referrals}
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{t.referrals}</span>
                </div>
              </div>
            </section>

            {/* Lower Grid: Shifts and Employee Sales Curve */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Card 2: My Shifts */}
              <section className="lg:col-span-4 bg-white dark:bg-[#131624] rounded-2xl border border-gray-200/90 dark:border-[#1e2338] shadow-xs p-5 flex flex-col justify-between relative z-10 fade-up-2 card-lift">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    {t.myShifts}
                  </h3>
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>

                <div className="my-10 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-3 group cursor-pointer">
                    <div className="w-16 h-20 rounded-xl bg-gray-50 dark:bg-[#1b2033] border-2 border-dashed border-gray-300 dark:border-[#2b334d] flex flex-col items-center justify-center shadow-xs">
                      <div className="w-7 h-1.5 bg-blue-500 rounded-full mb-1"></div>
                      <div className="w-5 h-1.5 bg-gray-400 rounded-full mb-2"></div>
                      <div className="text-sm font-bold text-gray-400 font-mono tracking-widest">
                        _ _
                      </div>
                    </div>
                    <span className="absolute -top-1 -right-1 text-xs text-amber-500 animate-bounce">✨</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{t.noData}</span>
                </div>
              </section>

              {/* Card 3: Employee Sales Curve */}
              <section className="lg:col-span-8 bg-white dark:bg-[#131624] rounded-2xl border border-gray-200/90 dark:border-[#1e2338] shadow-xs p-5 relative z-10 fade-up-3 card-lift">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1c2238]">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                      {t.employeeSales}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <div className="flex items-center p-0.5 rounded-lg bg-gray-100 dark:bg-[#1b2033]">
                      <button
                        onClick={() => setChartMode('curve')}
                        className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                          chartMode === 'curve'
                            ? 'bg-white dark:bg-[#252b45] text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-gray-500'
                        }`}
                      >
                        Bézier Curve
                      </button>
                      <button
                        onClick={() => setChartMode('leaderboard')}
                        className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                          chartMode === 'leaderboard'
                            ? 'bg-white dark:bg-[#252b45] text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-gray-500'
                        }`}
                      >
                        Leaderboard
                      </button>
                    </div>
                  </div>
                </div>

                {/* SVG Curve Chart */}
                <div className="relative w-full h-64 select-none">
                  {hoveredPoint && (
                    <div
                      style={{
                        left: `${(hoveredPoint.x / 600) * 100}%`,
                        top: `${(hoveredPoint.y / 280) * 100}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-8 px-2 py-0.5 rounded bg-gray-900 text-white text-[10px] font-mono font-bold shadow-lg pointer-events-none z-10 whitespace-nowrap"
                    >
                      {hoveredPoint.day}: ${hoveredPoint.val}
                    </div>
                  )}
                  <svg className="w-full h-full" viewBox="0 0 600 280">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

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
                        <line x1="30" y1={grid.y} x2="590" y2={grid.y} stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-[#1f263d]" />
                      </g>
                    ))}

                    <path
                      d="M 30,195 C 75,45 75,45 120,45 C 165,45 165,90 210,90 C 255,90 255,190 300,190 C 345,190 345,245 390,245 C 435,245 435,205 480,205 C 525,205 525,252 570,252 L 570,250 L 30,250 Z"
                      fill="url(#areaGradient)"
                    />

                    <path
                      d="M 30,195 C 75,45 75,45 120,45 C 165,45 165,90 210,90 C 255,90 255,190 300,190 C 345,190 345,245 390,245 C 435,245 435,205 480,205 C 525,205 525,252 570,252"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {chartPoints.map((pt, idx) => (
                      <circle
                        key={idx}
                        cx={pt.cx}
                        cy={pt.cy}
                        r="4.5"
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        className="cursor-pointer hover:r-6.5 transition-all"
                        onMouseEnter={() => setHoveredPoint({ day: pt.day, val: pt.val, x: pt.cx, y: pt.cy })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}

                    {chartPoints.map((pt, idx) => (
                      <text key={idx} x={pt.cx} y="270" textAnchor="middle" fill="#8892a4" fontSize="10" fontFamily="JetBrains Mono">
                        {pt.day}
                      </text>
                    ))}
                  </svg>
                </div>
              </section>
            </div>
          </main>
        )}
      </div>

      {/* Floating Assistant Widget */}
      <button
        onClick={onNavigateToMessages}
        title="Open Messages Pro Workstation"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer"
      >
        <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="white" />
          <path d="M9 13a3 3 0 0 0 6 0" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white dark:border-[#131624]"></span>
      </button>
    </div>
  );
};
