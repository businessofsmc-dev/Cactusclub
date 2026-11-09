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
  ExternalLink,
  Info,
  Globe,
  Bell,
  Mic,
  MoreHorizontal,
  Minus,
  Square,
  X,
  Bookmark,
  FileCheck,
  Lightbulb,
  Share2,
  Check,
  Plus,
  Hash,
  Search,
  Trash2,
  Copy,
  Sparkles,
  ArrowLeft,
  Pencil,
  Tag as TagIcon
} from 'lucide-react';
import type { CannedScript, ScriptMediaTag } from '../types/crm';
import { CANNED_SCRIPTS } from '../data/mockData';
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
  onUpdateScript?: (script: CannedScript) => void;
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
  sfwMode,
  onToggleSfw,
  onOpenVault,
  onOpenBroadcast,
  onOpenSettings,
  scripts = CANNED_SCRIPTS,
  onAddScript,
  onUpdateScript,
  onDeleteScript,
}) => {
  const dashboardScripts = scripts.length > 0 ? scripts : CANNED_SCRIPTS;

  // View state: 'overview' (main dashboard) vs 'scripts' (dedicated inline workspace)
  const [adminSection, setAdminSection] = useState<'overview' | 'scripts'>('overview');
  const [isCreatingScriptInline, setIsCreatingScriptInline] = useState(false);
  const [scriptSearch, setScriptSearch] = useState('');
  const [scriptCategoryFilter, setScriptCategoryFilter] = useState('All');
  const [scriptTagFilter, setScriptTagFilter] = useState<string | null>(null);
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  // Script editing state: null when creating new, script.id when editing existing
  const [editingScriptId, setEditingScriptId] = useState<string | null>(null);

  // Tag editing state inside form: null when adding new tag, tag.id when modifying tag
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  // Form state for creating / editing a script inline (NO POPUP!)
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

  const [platform, setPlatform] = useState<'Cactusclub' | 'OnlyFans' | 'Fanvue' | 'Fansly'>('Cactusclub');
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [ofManagerOpen, setOfManagerOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [employeesOpen, setEmployeesOpen] = useState(false);

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

  // Dynamic metrics per period matching exemplar values
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

  // SVG Chart points matching exemplar screenshot (Oct 25 to Oct 31)
  const chartPoints = [
    { day: 'Oct 25', val: 120, cx: 45, cy: 175 },
    { day: 'Oct 26', val: 350, cx: 130, cy: 50 },
    { day: 'Oct 27', val: 270, cx: 215, cy: 88 },
    { day: 'Oct 28', val: 130, cx: 300, cy: 170 },
    { day: 'Oct 29', val: 50, cx: 385, cy: 220 },
    { day: 'Oct 30', val: 100, cx: 470, cy: 190 },
    { day: 'Oct 31', val: 30, cx: 555, cy: 235 },
  ];

  // Filter scripts for dedicated inline workspace
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

  const allMediaTags = dashboardScripts.flatMap((s) => s.mediaTags || []);
  const videoTagsCount = allMediaTags.filter((mt) => mt.type === 'video').length;
  const photoTagsCount = allMediaTags.filter((mt) => mt.type === 'photo').length;
  const avgPpvPrice = allMediaTags.length > 0
    ? (allMediaTags.reduce((acc, curr) => acc + curr.price, 0) / allMediaTags.length).toFixed(2)
    : '18.50';

  const handleStartEditScript = (script: CannedScript, targetTagId?: string) => {
    setEditingScriptId(script.id);
    setFormTitle(script.title);
    setFormCategory(script.category);
    setFormText(script.text);
    setFormMediaTags(script.mediaTags ? script.mediaTags.map((mt) => ({ ...mt })) : []);
    setIsCreatingScriptInline(true);
    setFormErrorMsg(null);
    sounds.playReceive();

    if (targetTagId && script.mediaTags) {
      const target = script.mediaTags.find((t) => t.id === targetTagId);
      if (target) {
        handleStartEditTag(target);
      }
    }
  };

  const handleCancelScriptForm = () => {
    setFormTitle('');
    setFormText('');
    setFormMediaTags([]);
    setEditingScriptId(null);
    setEditingTagId(null);
    setFormErrorMsg(null);
    setIsCreatingScriptInline(false);
  };

  const handleStartEditTag = (tag: ScriptMediaTag) => {
    setEditingTagId(tag.id);
    setTagInputName(tag.name);
    setTagInputType(tag.type);
    setTagInputPrice(tag.price.toFixed(2));
    setTagInputUrl(tag.url);
    setTagInputTitle(tag.title || '');
    sounds.playReceive();
  };

  const handleCancelEditTag = () => {
    setEditingTagId(null);
    setTagInputName('');
    setTagInputUrl('');
    setTagInputTitle('');
    setTagInputPrice('15.00');
  };

  const handleAddOrUpdateMediaTagToForm = () => {
    if (!tagInputName.trim()) {
      setFormErrorMsg('Veuillez renseigner un nom de tag (ex: douche_video, lingerie_pack).');
      return;
    }
    if (!tagInputUrl.trim()) {
      setFormErrorMsg('Veuillez spécifier une URL de photo ou vidéo pour ce tag.');
      return;
    }
    const priceNum = parseFloat(tagInputPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum < 0) {
      setFormErrorMsg('Le prix doit être un nombre valide (ex: 15.00).');
      return;
    }

    const cleanTagName = tagInputName.trim().replace(/^#/, '').toLowerCase().replace(/\s+/g, '_');

    if (editingTagId) {
      setFormMediaTags((prev) =>
        prev.map((t) =>
          t.id === editingTagId
            ? {
                ...t,
                name: cleanTagName,
                type: tagInputType,
                url: tagInputUrl.trim(),
                price: priceNum,
                title: tagInputTitle.trim() || undefined,
              }
            : t
        )
      );
      setEditingTagId(null);
    } else {
      const newMediaTag: ScriptMediaTag = {
        id: `mt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: cleanTagName,
        type: tagInputType,
        url: tagInputUrl.trim(),
        price: priceNum,
        title: tagInputTitle.trim() || undefined,
      };
      setFormMediaTags((prev) => [...prev, newMediaTag]);
    }

    setTagInputName('');
    setTagInputUrl('');
    setTagInputTitle('');
    setTagInputPrice('15.00');
    setFormErrorMsg(null);
    sounds.playReceive();
  };

  const handleRemoveMediaTagFromForm = (tagId: string) => {
    setFormMediaTags((prev) => prev.filter((t) => t.id !== tagId));
    if (editingTagId === tagId) {
      handleCancelEditTag();
    }
  };

  const handleSaveScriptInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormErrorMsg('Le titre du script est requis.');
      return;
    }
    if (!formText.trim()) {
      setFormErrorMsg('Le texte du message est requis.');
      return;
    }

    const extractedTags = formMediaTags.map((mt) => mt.name);
    const firstMedia = formMediaTags[0];

    if (editingScriptId) {
      const updatedScript: CannedScript = {
        id: editingScriptId,
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

      if (onUpdateScript) {
        onUpdateScript(updatedScript);
      }
    } else {
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
    }

    sounds.playCash();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#00aff0', '#10b981', '#f59e0b', '#8b5cf6'],
    });

    handleCancelScriptForm();
  };

  const handleCopyScriptText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedScriptId(id);
    sounds.playReceive();
    setTimeout(() => setCopiedScriptId(null), 1800);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f4f5f8] dark:bg-[#0c0e17] overflow-hidden select-none font-sans">
      {/* Top Application Bar matching exemplar layout */}
      <header className="h-12 px-4 bg-white dark:bg-[#131624] border-b border-gray-200/80 dark:border-[#1f2438] flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAdminSection(adminSection === 'overview' ? 'overview' : 'overview')}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-700 dark:text-gray-300 cursor-pointer"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {adminSection === 'scripts' && (
            <button
              onClick={() => {
                setAdminSection('overview');
                sounds.playReceive();
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour au Tableau de bord</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Operational status pill */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] dark:bg-emerald-950/40 text-[#00b074] font-semibold text-xs border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="w-2 h-2 rounded-full bg-[#00b074] animate-pulse"></span>
            <span>Opérationnel</span>
          </div>

          {/* Timezone pill */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#f0f2f5] dark:bg-[#1b2033] text-gray-700 dark:text-gray-300 font-semibold text-xs">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <span>UTC+01:00</span>
            <Info className="w-3 h-3 text-gray-400" />
          </div>

          {/* SFW toggle switch */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-gray-500">SFW</span>
            <button
              onClick={onToggleSfw}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                sfwMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                  sfwMode ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Notification bell */}
          <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>

          {/* User Avatar initials pill */}
          <div className="w-7 h-7 rounded-lg bg-[#e0f0fe] dark:bg-blue-500/20 text-[#0088ff] dark:text-blue-400 font-bold text-xs flex items-center justify-center">
            WE
          </div>

          {/* Window control buttons */}
          <div className="flex items-center space-x-2 text-gray-400 pl-2.5 border-l border-gray-200 dark:border-gray-800">
            <Minus className="w-3.5 h-3.5 hover:text-gray-700 cursor-pointer" />
            <Square className="w-3 h-3 hover:text-gray-700 cursor-pointer" />
            <X className="w-3.5 h-3.5 hover:text-gray-700 cursor-pointer" />
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-56 bg-white dark:bg-[#131624] border-r border-gray-200/80 dark:border-[#1f2438] flex flex-col justify-between flex-shrink-0 select-none">
          <div>
            {/* Platform Selector capsule button */}
            <div className="p-3" ref={platformRef}>
              <button
                onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1a2033] border border-gray-200 dark:border-[#27314d] text-xs font-semibold cursor-pointer hover:border-pink-300 dark:hover:border-pink-500/40 transition-all shadow-2xs"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  {platform === 'Cactusclub' ? (
                    <img src="/cactusclub-logo.png" alt="CactusClub" className="h-5.5 w-auto object-contain" />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 text-white ${
                          platform === 'OnlyFans'
                            ? 'bg-[#00aff0]'
                            : platform === 'Fanvue'
                            ? 'bg-emerald-500'
                            : 'bg-purple-600'
                        }`}
                      >
                        {platform === 'OnlyFans' ? 'of' : platform.substring(0, 2).toLowerCase()}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white truncate">
                        {platform}
                      </span>
                    </div>
                  )}
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 ml-1" />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-1" />
              </button>

              {platformDropdownOpen && (
                <div className="absolute top-26 left-3 w-52 bg-white dark:bg-[#191f33] border border-gray-200 dark:border-[#27314d] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  {(['Cactusclub', 'OnlyFans', 'Fanvue', 'Fansly'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPlatform(p);
                        setPlatformDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                        platform === p
                          ? 'bg-pink-50 dark:bg-pink-500/20 text-[#ec4899] font-bold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {p === 'Cactusclub' ? (
                          <img src="/cactusclub-logo.png" alt="CactusClub" className="h-4.5 w-auto object-contain" />
                        ) : (
                          <>
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white ${
                                p === 'OnlyFans'
                                  ? 'bg-[#00aff0]'
                                  : p === 'Fanvue'
                                  ? 'bg-emerald-500'
                                  : 'bg-purple-600'
                              }`}
                            >
                              {p === 'OnlyFans' ? 'of' : p.substring(0, 2).toLowerCase()}
                            </div>
                            <span>{p}</span>
                          </>
                        )}
                      </div>
                      {platform === p && <Check className="w-3 h-3 text-[#ec4899]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation links */}
            <div className="px-2 space-y-1 text-xs font-medium">
              {/* Dashboard */}
              <button
                onClick={() => {
                  setAdminSection('overview');
                  sounds.playReceive();
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  adminSection === 'overview'
                    ? 'bg-[#edf0f5] dark:bg-[#1e2438] text-gray-900 dark:text-white font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-gray-900 dark:text-white" />
                <span>Tableau de bord</span>
              </button>

              {/* OF Manager */}
              <div>
                <button
                  onClick={() => setOfManagerOpen(!ofManagerOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <FolderLock className="w-4 h-4 text-gray-500" />
                    <span>Gestionnaire Cactus</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${ofManagerOpen ? 'rotate-180' : ''}`} />
                </button>
                {ofManagerOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1">
                    <div className="px-2 py-1 text-[11px] text-gray-500 hover:text-blue-500 cursor-pointer rounded">
                      Planificateur Auto
                    </div>
                    <div onClick={onOpenVault} className="px-2 py-1 text-[11px] text-gray-500 hover:text-blue-500 cursor-pointer rounded">
                      Coffre & Médias
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
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    <span>Analytiques</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${analyticsOpen ? 'rotate-180' : ''}`} />
                </button>
                {analyticsOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1">
                    <div className="px-2 py-1 text-[11px] text-gray-500 hover:text-blue-500 cursor-pointer rounded">
                      Rétention Fans
                    </div>
                    <div className="px-2 py-1 text-[11px] text-gray-500 hover:text-blue-500 cursor-pointer rounded">
                      Conversion PPV
                    </div>
                  </div>
                )}
              </div>

              {/* Messages Pro */}
              <button
                onClick={onNavigateToMessages}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span>Messages Pro</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="px-1.5 py-0.2 rounded-full bg-[#ff4081] text-white font-bold text-[10px]">
                    28
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-700" />
                </div>
              </button>

              {/* Growth */}
              <div>
                <button
                  onClick={() => setGrowthOpen(!growthOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span>Croissance</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${growthOpen ? 'rotate-180' : ''}`} />
                </button>

                {growthOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5">
                    <button
                      onClick={onOpenBroadcast}
                      className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-gray-500 hover:text-blue-500 text-[11px] cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Messages Intelligents</span>
                    </button>
                    <button
                      onClick={onOpenVault}
                      className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-gray-500 hover:text-blue-500 text-[11px] cursor-pointer"
                    >
                      <FolderLock className="w-3.5 h-3.5" />
                      <span>Coffre-fort Pro</span>
                    </button>
                    <button
                      onClick={() => {
                        setAdminSection('scripts');
                        sounds.playReceive();
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                        adminSection === 'scripts'
                          ? 'bg-[#edf0f5] dark:bg-[#1e2438] text-gray-900 dark:text-white font-bold'
                          : 'text-gray-500 hover:text-blue-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Scripts de Vente</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 text-[9px] font-bold">
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
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>Employés & Chatters</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${employeesOpen ? 'rotate-180' : ''}`} />
                </button>
                {employeesOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1">
                    <div className="px-2 py-1 text-[11px] text-gray-500 hover:text-blue-500 cursor-pointer rounded">
                      Opérateurs Actifs (2)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-gray-100 dark:border-[#1c2238] space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span>Paramètres</span>
            </button>
            <button className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span>Centre d'aide</span>
            </button>

            <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400">
              <span>Version 5.8.0</span>
              <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                <span className="text-gray-300">|</span>
                <Mic className="w-3 h-3 text-gray-500" />
                <MoreHorizontal className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          </div>
        </aside>

        {/* Content Workspace Area */}
        {adminSection === 'scripts' ? (
          /* ============================================================== */
          /* VIEW A: DEDICATED INLINE SCRIPTS & MEDIA TAGS WORKSPACE        */
          /* ============================================================== */
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
                  if (isCreatingScriptInline) {
                    handleCancelScriptForm();
                  } else {
                    setIsCreatingScriptInline(true);
                  }
                  sounds.playReceive();
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{isCreatingScriptInline ? (editingScriptId ? 'Annuler l’Édition' : 'Masquer le Formulaire') : '+ Créer un Nouveau Script'}</span>
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

            {/* INLINE SCRIPT CREATION / EDITING FORM (NO POPUP!) */}
            {isCreatingScriptInline && (
              <section className="p-5 rounded-3xl bg-white dark:bg-[#131624] border-2 border-blue-500/40 shadow-xl space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1e2338]">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                      {editingScriptId ? <Pencil className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center space-x-2">
                        <span>{editingScriptId ? 'Modifier le Script & ses Tags Médias' : 'Créer un Script avec ses Tags Photos/Vidéos & Prix'}</span>
                        {editingScriptId && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                            Édition en cours
                          </span>
                        )}
                      </h2>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {editingScriptId
                          ? 'Ajustez le texte, les tags, les médias ou les prix PPV de ce script.'
                          : 'Rédigez le texte et associez un ou plusieurs tags média payants.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelScriptForm}
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

                  {/* Media Tags Shelf */}
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

                    {formMediaTags.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {formMediaTags.map((mt) => (
                          <div
                            key={mt.id}
                            className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                              editingTagId === mt.id
                                ? 'bg-blue-500/10 dark:bg-blue-500/20 border-2 border-blue-500 shadow-sm'
                                : 'bg-white dark:bg-[#101422] border border-gray-200 dark:border-[#222a42] shadow-2xs hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-black flex-shrink-0">
                                <img src={mt.url} alt={mt.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-[10px]">
                                  {mt.type === 'video' ? '🎬' : '📸'}
                                </div>
                              </div>
                              <div className="min-w-0">
                                <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 block truncate">
                                  #{mt.name}
                                </span>
                                <span className="text-[10px] text-gray-400 block truncate">
                                  {mt.type === 'video' ? 'Vidéo' : 'Photo'} • ${mt.price.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditTag(mt)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  editingTagId === mt.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                                }`}
                                title="Modifier ce tag (nom, prix, média)"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveMediaTagFromForm(mt.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
                                title="Retirer ce tag"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Presets fast pick */}
                    <div className="pt-2 border-t border-blue-500/15">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-1.5">
                        Sélection rapide parmi les médias exclusifs agence :
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_DASHBOARD_MEDIA_TAGS.map((pmt) => (
                          <button
                            key={pmt.name}
                            type="button"
                            onClick={() => {
                              setTagInputName(pmt.name);
                              setTagInputType(pmt.type);
                              setTagInputPrice(pmt.price.toFixed(2));
                              setTagInputUrl(pmt.url);
                              setTagInputTitle(pmt.title);
                            }}
                            className="px-2 py-1 rounded-lg bg-white dark:bg-[#1a2033] border border-blue-500/20 hover:border-blue-500 text-[10px] font-mono font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-all cursor-pointer flex items-center space-x-1"
                          >
                            <span>#{pmt.name}</span>
                            <span>{pmt.type === 'video' ? '🎬' : '📸'}</span>
                            <span className="text-amber-500 font-mono-numbers">${pmt.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Tag input row */}
                    <div className="space-y-2 pt-2 border-t border-blue-500/15">
                      {editingTagId && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                          <div className="flex items-center space-x-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Modification active du tag : <strong>#{tagInputName}</strong></span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCancelEditTag}
                            className="text-[10px] underline hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer"
                          >
                            Annuler modification tag
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={tagInputName}
                            onChange={(e) => setTagInputName(e.target.value)}
                            placeholder="Nom du tag (ex: douche_video, lingerie_4k)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-gray-900 dark:text-white font-mono text-xs outline-none"
                          />
                        </div>

                        <div>
                          <select
                            value={tagInputType}
                            onChange={(e) => setTagInputType(e.target.value as 'photo' | 'video')}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-gray-900 dark:text-white text-xs outline-none cursor-pointer"
                          >
                            <option value="video">🎬 Vidéo PPV</option>
                            <option value="photo">📸 Photo PPV</option>
                          </select>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={tagInputPrice}
                            onChange={(e) => setTagInputPrice(e.target.value)}
                            placeholder="Prix ($)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-gray-900 dark:text-white font-mono font-bold text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInputUrl}
                          onChange={(e) => setTagInputUrl(e.target.value)}
                          placeholder="URL de la photo ou vidéo (ou choisissez un preset ci-dessus)..."
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-gray-900 dark:text-white font-mono text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddOrUpdateMediaTagToForm}
                          className={`px-4 py-1.5 rounded-lg text-white font-bold text-xs cursor-pointer shadow-xs whitespace-nowrap transition-all ${
                            editingTagId
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {editingTagId ? '✓ Enregistrer le Tag' : '+ Ajouter le Tag'}
                        </button>
                      </div>
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
                      onClick={handleCancelScriptForm}
                      className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#1a2033] text-gray-700 dark:text-gray-300 text-xs font-bold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      {editingScriptId ? '✓ Enregistrer les Modifications' : 'Enregistrer dans la Bibliothèque'}
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
                {[
                  { id: 'All', label: 'Tous les scripts' },
                  { id: 'PPV Tease', label: '🚿 PPV Tease' },
                  { id: 'Greeting', label: '👋 Salutations' },
                  { id: 'Upsell', label: '💎 Vente VIP (Upsell)' },
                  { id: 'Kinky', label: '🔥 Kinky / Fantasmes' },
                  { id: 'Follow-up', label: '⏳ Relances' },
                  { id: 'Re-engage', label: '💫 Réengagement' },
                ].map((catItem) => {
                  const isSelected = scriptCategoryFilter === catItem.id;
                  return (
                    <button
                      key={catItem.id}
                      onClick={() => {
                        setScriptCategoryFilter(catItem.id);
                        sounds.playReceive();
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-[#1a2033] text-gray-600 dark:text-gray-400 hover:text-blue-500'
                      }`}
                    >
                      {catItem.label}
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

                    {/* Media Tags Shelf */}
                    {script.mediaTags && script.mediaTags.length > 0 && (
                      <div className="my-3 p-2.5 rounded-xl bg-gray-50/80 dark:bg-[#181d2e] border border-gray-200/60 dark:border-[#222940] space-y-1.5">
                        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">
                          Tags avec Photo / Vidéo & Prix :
                        </span>
                        <div className="space-y-1.5">
                          {script.mediaTags.map((mt) => (
                            <div
                              key={mt.id}
                              className="group/tag flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-[#131624] border border-gray-200/80 dark:border-[#20273d] hover:border-blue-400/60 transition-colors"
                            >
                              <div
                                onClick={() => handleStartEditScript(script, mt.id)}
                                className="flex items-center space-x-2 min-w-0 cursor-pointer flex-1"
                                title={`Cliquer pour modifier le tag #${mt.name}`}
                              >
                                <div className="relative w-7 h-7 rounded-md overflow-hidden bg-black flex-shrink-0">
                                  <img src={mt.url} alt={mt.name} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-[9px]">
                                    {mt.type === 'video' ? '🎬' : '📸'}
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 block truncate hover:underline">
                                    #{mt.name}
                                  </span>
                                  {mt.title && (
                                    <span className="text-[10px] text-gray-400 truncate block">
                                      {mt.title}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-1.5 flex-shrink-0">
                                <span className="font-mono text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                                  ${mt.price.toFixed(2)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditScript(script, mt.id)}
                                  className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
                                  title={`Modifier ce tag (#${mt.name})`}
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#1e2338] mt-3">
                    <div className="flex items-center space-x-1">
                      {onDeleteScript && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Supprimer le script "${script.title}" ?`)) {
                              onDeleteScript(script.id);
                              sounds.playReceive();
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg cursor-pointer transition-colors"
                          title="Supprimer ce script"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStartEditScript(script)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all cursor-pointer"
                        title="Modifier ce script et ses tags"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Modifier</span>
                      </button>
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
          /* VIEW B: EXACT MAIN OVERVIEW DASHBOARD REPRODUCTION             */
          /* ============================================================== */
          <main className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 relative bg-[#f4f5f8] dark:bg-[#0c0e17]">
            {/* Card 1: Creator earnings overview */}
            <section className="bg-white dark:bg-[#131624] rounded-2xl border border-gray-200/80 dark:border-[#1e2338] shadow-xs p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-[#1c2238] gap-3">
                <div className="flex items-center space-x-2 text-sm font-bold text-gray-900 dark:text-white">
                  <span>Aperçu des revenus créatrice</span>
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                  <span className="text-xs text-gray-400 font-medium">UTC+01:00</span>
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setEarningsType(earningsType === 'net' ? 'gross' : 'net')}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1b2033] border border-gray-200 dark:border-[#252c42] text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-gray-300 cursor-pointer"
                  >
                    <span>{earningsType === 'net' ? 'Revenus nets' : 'Revenus bruts'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                  </button>

                  <div className="flex items-center p-0.5 rounded-lg bg-gray-100/80 dark:bg-[#1b2033] text-xs font-medium">
                    {(['yesterday', 'today', 'week', 'month'] as const).map((p) => {
                      const label = {
                        yesterday: 'Hier',
                        today: "Aujourd'hui",
                        week: 'Cette semaine',
                        month: 'Ce mois',
                      }[p];
                      const isActive = period === p;
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            setPeriod(p);
                            sounds.playReceive();
                          }}
                          className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-600/20 text-[#2563eb] dark:text-blue-400 font-bold shadow-2xs'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0 pt-4 items-center">
                {/* Hero Total Earnings (Left, ~3 cols) */}
                <div
                  onClick={() => {
                    sounds.playCash();
                    confetti({
                      particleCount: 50,
                      spread: 60,
                      origin: { y: 0.35, x: 0.28 },
                      colors: ['#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
                    });
                  }}
                  className="md:col-span-3 flex flex-col justify-center pr-6 md:border-r border-gray-100 dark:border-[#1c2238] cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="bg-white p-1 rounded-xl shadow-xs border border-gray-100 dark:border-gray-800">
                      <img src="/cactusclub-logo.png" alt="CactusClub" className="h-6 w-auto object-contain" />
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      Total des revenus CactusClub
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400 tracking-tight">
                      {metricsData.total}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-black">
                      +18.4%
                    </span>
                  </div>
                </div>

                {/* Column 1: Subscriptions (top) + Tips (bottom) (~3 cols) */}
                <div className="md:col-span-3 px-5 py-2 space-y-4 md:border-r border-gray-100 dark:border-[#1c2238]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                        {metricsData.subs}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">Abonnements</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#e6faf3] dark:bg-emerald-950/40 text-[#00b074] flex items-center justify-center">
                      <Bookmark className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                        {metricsData.tips}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">Pourboires (Tips)</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#edf5fe] dark:bg-blue-950/40 text-[#2b7fff] flex items-center justify-center">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Column 2: Posts (top) + Referrals (bottom) (~3 cols) */}
                <div className="md:col-span-3 px-5 py-2 space-y-4 md:border-r border-gray-100 dark:border-[#1c2238]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                        {metricsData.posts}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">Publications (Posts)</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#e6fbfb] dark:bg-cyan-950/40 text-[#00c5c5] flex items-center justify-center">
                      <FileCheck className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                        {metricsData.referrals}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">Parrainages</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#fff2ed] dark:bg-orange-950/40 text-[#ff7043] flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Column 3: Messages (top) + Streams (bottom) (~3 cols) */}
                <div className="md:col-span-3 pl-5 py-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                        {metricsData.messages}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">Messages Privés</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#f5eefd] dark:bg-purple-950/40 text-[#a855f7] flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                        {metricsData.streams}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">Lives / Streams</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#eef2ff] dark:bg-indigo-950/40 text-[#4f46e5] flex items-center justify-center">
                      <Radio className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Middle Row: My shifts + Employee sales */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Card 2: My shifts (lg:col-span-4) */}
              <section className="lg:col-span-4 bg-white dark:bg-[#131624] rounded-2xl border border-gray-200/80 dark:border-[#1e2338] shadow-xs p-5 flex flex-col justify-between">
                <div className="flex items-center space-x-1.5 text-sm font-bold text-gray-900 dark:text-white">
                  <span>Mes créneaux de travail</span>
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </div>

                {/* Cute Minimal Document Mascot matching exemplar */}
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-2">
                    {/* Radiating Rays */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center space-x-1 text-gray-400">
                      <span className="text-[10px] transform -rotate-45">/</span>
                      <span className="text-[11px]">|</span>
                      <span className="text-[10px] transform rotate-45">\</span>
                    </div>

                    {/* Paper Outline */}
                    <div className="w-14 h-18 rounded-xl bg-white dark:bg-[#191f33] border-2 border-gray-900 dark:border-gray-200 flex flex-col items-center justify-center shadow-xs">
                      {/* Face */}
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="w-2 h-0.5 bg-gray-900 dark:bg-white rounded-full"></span>
                        <span className="w-2 h-0.5 bg-gray-900 dark:bg-white rounded-full"></span>
                      </div>
                      <span className="w-3.5 h-0.5 bg-gray-900 dark:bg-white rounded-full"></span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-400 mt-2">Aucun créneau planifié</span>
                </div>

                <div />
              </section>

              {/* Card 3: Employee sales (lg:col-span-8) */}
              <section className="lg:col-span-8 bg-white dark:bg-[#131624] rounded-2xl border border-gray-200/80 dark:border-[#1e2338] shadow-xs p-5">
                <div className="flex items-center space-x-1.5 text-sm font-bold text-gray-900 dark:text-white mb-2">
                  <span>Ventes par employé / chatter</span>
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </div>

                {/* SVG Bézier Curve Chart matching exemplar screenshot */}
                <div className="relative w-full h-64 select-none">
                  {hoveredPoint && (
                    <div
                      style={{
                        left: `${(hoveredPoint.x / 600) * 100}%`,
                        top: `${(hoveredPoint.y / 280) * 100}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-9 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-[11px] font-mono font-bold shadow-lg pointer-events-none z-10 whitespace-nowrap"
                    >
                      {hoveredPoint.day}: ${hoveredPoint.val}
                    </div>
                  )}

                  <svg className="w-full h-full" viewBox="0 0 600 280">
                    <defs>
                      <linearGradient id="employeeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Y-Axis Grid Lines & Labels */}
                    {[
                      { label: '400', y: 35 },
                      { label: '300', y: 88 },
                      { label: '200', y: 141 },
                      { label: '100', y: 194 },
                      { label: '0', y: 247 },
                    ].map((grid, i) => (
                      <g key={i}>
                        <text
                          x="10"
                          y={grid.y + 4}
                          fill="#94a3b8"
                          fontSize="11"
                          fontFamily="Inter, system-ui, sans-serif"
                        >
                          {grid.label}
                        </text>
                        <line
                          x1="38"
                          y1={grid.y}
                          x2="590"
                          y2={grid.y}
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                          className="dark:stroke-[#20273f]"
                        />
                      </g>
                    ))}

                    {/* Area under curve */}
                    <path
                      d="M 45,175 C 90,50 90,50 130,50 C 170,50 175,88 215,88 C 255,88 260,170 300,170 C 340,170 345,220 385,220 C 425,220 430,190 470,190 C 510,190 515,235 555,235 L 555,247 L 45,247 Z"
                      fill="url(#employeeAreaGrad)"
                    />

                    {/* Blue Bézier line */}
                    <path
                      d="M 45,175 C 90,50 90,50 130,50 C 170,50 175,88 215,88 C 255,88 260,170 300,170 C 340,170 345,220 385,220 C 425,220 430,190 470,190 C 510,190 515,235 555,235"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Marker points */}
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

                    {/* X-Axis Day Labels */}
                    {chartPoints.map((pt, idx) => (
                      <text
                        key={idx}
                        x={pt.cx}
                        y="270"
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="11"
                        fontFamily="Inter, system-ui, sans-serif"
                      >
                        {pt.day}
                      </text>
                    ))}
                  </svg>
                </div>
              </section>
            </div>

            {/* Card 4: Scheduled hours */}
            <section className="bg-white dark:bg-[#131624] rounded-2xl border border-gray-200/80 dark:border-[#1e2338] shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1c2238]">
                <div className="flex items-center space-x-1.5 text-sm font-bold text-gray-900 dark:text-white">
                  <span>Horaires & shifts planifiés</span>
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </div>
                <span className="text-xs text-gray-400 font-medium">3 shifts actifs aujourd'hui</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-[#181d2e] border border-gray-200/60 dark:border-[#222940] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center">
                      M
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">Margot</div>
                      <div className="text-[11px] text-gray-500">08:00 - 16:00</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                    En cours
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-[#181d2e] border border-gray-200/60 dark:border-[#222940] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                      V
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">Valentin (Chatter)</div>
                      <div className="text-[11px] text-gray-500">16:00 - 00:00</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold">
                    Planifié
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-[#181d2e] border border-gray-200/60 dark:border-[#222940] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold text-xs flex items-center justify-center">
                      A
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">Alexandre (Nuit)</div>
                      <div className="text-[11px] text-gray-500">00:00 - 08:00</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                    Nuit
                  </span>
                </div>
              </div>
            </section>
          </main>
        )}
      </div>

      {/* Floating Support Widget on Bottom-Right matching exemplar */}
      <button
        onClick={onNavigateToMessages}
        title="Ouvrir le Support / Messages"
        className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-black text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all z-50 cursor-pointer"
      >
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.14 2 11.25c0 2.87 1.43 5.43 3.68 7.08-.16 1.05-.62 2.37-1.74 3.42 1.84.18 3.74-.46 4.96-1.39.97.27 2 .42 3.1.42 5.523 0 10-4.14 10-9.28C22 6.14 17.523 2 12 2zm-3.5 10c-.83 0-1.5-.67-1.5-1.5S7.67 9 8.5 9s1.5.67 1.5 1.5S9.33 12 8.5 12zm7 0c-.83 0-1.5-.67-1.5-1.5S14.67 9 15.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
        <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#ff4081] border border-white"></span>
      </button>
    </div>
  );
};
