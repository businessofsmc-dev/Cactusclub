import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Zap, 
  DollarSign, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  Layers, 
  Copy, 
  Flame, 
  Image as ImageIcon,
  Play,
  Hash,
  ArrowRight,
  Tag as TagIcon
} from 'lucide-react';
import type { CannedScript, ScriptMediaTag } from '../types/crm';
import { CANNED_SCRIPTS } from '../data/mockData';
import { sounds } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScript?: (script: CannedScript, selectedTag?: ScriptMediaTag) => void;
  scripts?: CannedScript[];
  onAddScript?: (script: Omit<CannedScript, 'id'>) => void;
  onDeleteScript?: (id: string) => void;
  initialMode?: 'list' | 'create';
  onOpenLightbox?: (url: string, title?: string, price?: number) => void;
}

const CATEGORIES: ('All' | CannedScript['category'])[] = [
  'All',
  'PPV Tease',
  'Greeting',
  'Upsell',
  'Kinky',
  'Follow-up',
  'Re-engage',
];

const PRESET_MEDIA_TAGS: Omit<ScriptMediaTag, 'id'>[] = [
  {
    name: 'douche_video',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
    price: 15,
    title: 'Extrait Douche Chaude 4K (45s)',
  },
  {
    name: 'douche_photo',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    price: 10,
    title: 'Selfie Miroir Buée',
  },
  {
    name: 'lingerie_dentelle',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    price: 25,
    title: 'Pack 5 Photos Dentelle',
  },
  {
    name: 'lingerie_video',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    price: 35,
    title: 'Vidéo Essayage Privé (2min)',
  },
  {
    name: 'regard_sensuel',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    price: 12,
    title: 'Photo Regard Braise',
  },
  {
    name: 'kinky_clip',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    price: 20,
    title: 'Clip Teasing Soirée',
  },
];

const TEMPLATES: Omit<CannedScript, 'id'>[] = [
  {
    title: '🚿 Tease Douche Chaude PPV',
    category: 'PPV Tease',
    text: "Je viens tout juste de sortir de la douche, l'eau était tellement chaude... J'ai filmé un clip très intime rien que pour toi. Tu veux voir ? 🙈💦",
    price: 15,
    tags: ['douche', 'tease', 'video'],
    mediaTags: [
      {
        id: 'mt-1',
        name: 'douche_video',
        type: 'video',
        url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
        price: 15,
        title: 'Vidéo Douche 4K (45s)',
      },
      {
        id: 'mt-2',
        name: 'douche_photo',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
        price: 10,
        title: 'Photo Miroir Buée',
      },
    ],
  },
  {
    title: '📸 Pack Photos Lingerie 4K',
    category: 'Upsell',
    text: "J'ai reçu ce nouvel ensemble de lingerie en dentelle noire que tu aimais... J'ai pris 5 photos ultra détaillées sous la lumière du soleil. Tu veux débloquer le pack secret ? 🖤",
    price: 25,
    tags: ['photos', 'lingerie', 'pack'],
    mediaTags: [
      {
        id: 'mt-3',
        name: 'lingerie_dentelle',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        price: 25,
        title: 'Pack 5 Photos Dentelle',
      },
      {
        id: 'mt-4',
        name: 'lingerie_video',
        type: 'video',
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        price: 35,
        title: 'Vidéo Essayage Privé (2min)',
      },
    ],
  },
];

export const ScriptsModal: React.FC<ScriptsModalProps> = ({
  isOpen,
  onClose,
  onApplyScript,
  scripts = CANNED_SCRIPTS,
  onAddScript,
  onDeleteScript,
  initialMode = 'list',
  onOpenLightbox,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'create'>(initialMode);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMediaTagFilter, setSelectedMediaTagFilter] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New script form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CannedScript['category']>('PPV Tease');
  const [newText, setNewText] = useState('');

  // Media tags list for the current script being created
  const [scriptMediaTags, setScriptMediaTags] = useState<ScriptMediaTag[]>([]);

  // Current media tag form state to add
  const [tagName, setTagName] = useState('');
  const [tagMediaType, setTagMediaType] = useState<'photo' | 'video'>('video');
  const [tagUrl, setTagUrl] = useState('');
  const [tagPrice, setTagPrice] = useState<string>('15.00');
  const [tagTitle, setTagTitle] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setViewMode(initialMode);
      setFormError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const currentScripts = scripts.length > 0 ? scripts : CANNED_SCRIPTS;

  // Filter scripts
  const filtered = currentScripts.filter((s) => {
    const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchTagFilter =
      !selectedMediaTagFilter ||
      s.tags.includes(selectedMediaTagFilter) ||
      (s.mediaTags && s.mediaTags.some((mt) => mt.name === selectedMediaTagFilter));
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.text.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      (s.mediaTags && s.mediaTags.some((mt) => mt.name.toLowerCase().includes(search.toLowerCase())));
    return matchCat && matchTagFilter && matchSearch;
  });

  const handleApply = (script: CannedScript, mediaTag?: ScriptMediaTag) => {
    setCopiedId(script.id + (mediaTag ? `-${mediaTag.id}` : ''));
    sounds.playReceive();
    if (onApplyScript) {
      onApplyScript(script, mediaTag);
    } else {
      navigator.clipboard?.writeText(script.text);
    }
    setTimeout(() => {
      setCopiedId(null);
    }, 1800);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    sounds.playReceive();
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleLoadTemplate = (tpl: typeof TEMPLATES[0]) => {
    setNewTitle(tpl.title);
    setNewCategory(tpl.category);
    setNewText(tpl.text);
    if (tpl.mediaTags) {
      setScriptMediaTags([...tpl.mediaTags]);
    }
    setFormError(null);
    sounds.playReceive();
  };

  const handleAddMediaTagToScript = () => {
    if (!tagName.trim()) {
      setFormError('Veuillez renseigner le nom du tag (ex: douche_video, lingerie_dentelle).');
      return;
    }
    if (!tagUrl.trim()) {
      setFormError('Veuillez renseigner une URL de photo ou vidéo pour ce tag.');
      return;
    }

    const priceNum = parseFloat(tagPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Veuillez saisir un prix valide en dollars pour ce tag.');
      return;
    }

    const cleanTagName = tagName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const newMediaTag: ScriptMediaTag = {
      id: `mt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanTagName,
      type: tagMediaType,
      url: tagUrl.trim(),
      price: priceNum,
      title: tagTitle.trim() || undefined,
    };

    setScriptMediaTags([...scriptMediaTags, newMediaTag]);
    sounds.playReceive();

    // Reset media tag inputs
    setTagName('');
    setTagUrl('');
    setTagPrice('15.00');
    setTagTitle('');
    setFormError(null);
  };

  const handleRemoveMediaTagFromScript = (id: string) => {
    setScriptMediaTags(scriptMediaTags.filter((mt) => mt.id !== id));
    sounds.playReceive();
  };

  const handleSelectPresetTag = (preset: typeof PRESET_MEDIA_TAGS[0]) => {
    setTagName(preset.name);
    setTagMediaType(preset.type);
    setTagUrl(preset.url);
    setTagPrice(preset.price.toString());
    setTagTitle(preset.title || '');
    sounds.playReceive();
  };

  const insertVariable = (variable: string) => {
    setNewText((prev) => prev + variable);
    sounds.playReceive();
  };

  const handleCreateScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Le titre du script est obligatoire.');
      return;
    }
    if (!newText.trim()) {
      setFormError('Le texte du script ne peut pas être vide.');
      return;
    }

    // Extract tags from mediaTags plus category
    const extractedTags = Array.from(
      new Set([
        newCategory.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        ...scriptMediaTags.map((mt) => mt.name),
      ])
    );

    const firstMedia = scriptMediaTags[0];

    const scriptPayload: Omit<CannedScript, 'id'> = {
      title: newTitle.trim(),
      category: newCategory,
      text: newText.trim(),
      price: firstMedia ? firstMedia.price : undefined,
      tags: extractedTags,
      mediaTags: scriptMediaTags,
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
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981'],
    });

    // Reset form
    setNewTitle('');
    setNewText('');
    setScriptMediaTags([]);
    setFormError(null);
    setViewMode('list');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-[#131624] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#20263b] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#1e2338] bg-gray-50/50 dark:bg-[#151928]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-black text-gray-900 dark:text-white">
                  Scripts avec Tags Photos/Vidéos & Prix
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px]">
                  {currentScripts.length} scripts
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Chaque tag contient sa photo ou sa vidéo exclusive associée avec son prix de déblocage.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-gray-200/80 dark:bg-[#1d2338] text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#131624] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Bibliothèque</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('create')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'create'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Créer un Script</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VIEW 1: CREATE NEW SCRIPT WITH MEDIA TAGS */}
        {viewMode === 'create' ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Templates Drawer */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Modèles de scripts pré-remplis avec leurs tags média & prix :</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleLoadTemplate(tpl)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a2033] border border-gray-200 dark:border-[#2a3350] hover:border-blue-500 text-gray-800 dark:text-gray-200 text-xs font-bold shadow-2xs hover:scale-102 transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <span>{tpl.title}</span>
                    <span className="text-[10px] text-pink-600 font-extrabold bg-pink-500/10 px-1.5 py-0.2 rounded">
                      {tpl.mediaTags?.length} tags média
                    </span>
                    <ArrowRight className="w-3 h-3 text-blue-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Creation Form */}
            <form onSubmit={handleCreateScript} className="space-y-5">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold animate-shake">
                  ⚠️ {formError}
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
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Ex: 🚿 Tease Douche Chaude 4K"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Catégorie Stratégique <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CannedScript['category'])}
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

              {/* SECTION MAÎTRESSE : LES TAGS QUI ONT DES PHOTOS, VIDÉOS AVEC LES PRIX */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-[#161a29] dark:to-[#1a2035] border-2 border-dashed border-blue-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                      <TagIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white flex items-center space-x-1.5">
                        <span>Tags avec Photos & Vidéos et leurs Prix</span>
                        <span className="px-2 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold">
                          {scriptMediaTags.length} tag{scriptMediaTags.length > 1 ? 's' : ''} associé{scriptMediaTags.length > 1 ? 's' : ''}
                        </span>
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Chaque tag représente un média (photo ou vidéo) avec son prix PPV verrouillé.
                      </p>
                    </div>
                  </div>
                </div>

                {/* List of Already Added Media Tags for this script */}
                {scriptMediaTags.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Tags configurés pour ce script :
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {scriptMediaTags.map((mt) => (
                        <div
                          key={mt.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#131624] border border-blue-500/30 shadow-xs"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {/* Media thumbnail */}
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-gray-200 dark:border-white/10">
                              <img
                                src={mt.url}
                                alt={mt.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                {mt.type === 'video' ? (
                                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                                ) : (
                                  <ImageIcon className="w-3.5 h-3.5 text-white" />
                                )}
                              </div>
                            </div>

                            {/* Tag Details */}
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 truncate">
                                  #{mt.name}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                  {mt.type === 'video' ? '🎬 Vidéo' : '📸 Photo'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                <span className="font-mono-numbers font-extrabold text-amber-500">
                                  ${mt.price.toFixed(2)}
                                </span>
                                {mt.title && <span className="truncate">• {mt.title}</span>}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveMediaTagFromScript(mt.id)}
                            className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                            title="Retirer ce tag"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-form to add a new Media Tag */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#131624] border border-gray-200 dark:border-[#22283d] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center space-x-1">
                      <span>+ Ajouter un Tag avec Photo ou Vidéo & Prix</span>
                    </span>

                    {/* Quick Presets Dropdown / Buttons */}
                    <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar max-w-xs sm:max-w-md">
                      <span className="text-[10px] text-gray-400 flex-shrink-0">Presets :</span>
                      {PRESET_MEDIA_TAGS.slice(0, 3).map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPresetTag(p)}
                          className="px-2 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-mono transition-colors flex-shrink-0 cursor-pointer"
                        >
                          #{p.name} (${p.price})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Tag Name (Col 4) */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Nom du Tag
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">#</span>
                        <input
                          type="text"
                          value={tagName}
                          onChange={(e) => setTagName(e.target.value)}
                          placeholder="douche_video"
                          className="w-full pl-6 pr-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#2b3550] text-xs text-gray-900 dark:text-white font-mono outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Media Type (Col 3) */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Type
                      </label>
                      <div className="flex items-center p-0.5 rounded-lg bg-gray-100 dark:bg-[#1a2033] border border-gray-200 dark:border-[#2b3550]">
                        <button
                          type="button"
                          onClick={() => setTagMediaType('photo')}
                          className={`flex-1 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            tagMediaType === 'photo'
                              ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-2xs'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          📸 Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setTagMediaType('video')}
                          className={`flex-1 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            tagMediaType === 'video'
                              ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-2xs'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          🎬 Vidéo
                        </button>
                      </div>
                    </div>

                    {/* Tag Price (Col 3) */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Prix PPV ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500 font-bold text-xs">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          value={tagPrice}
                          onChange={(e) => setTagPrice(e.target.value)}
                          placeholder="15.00"
                          className="w-full pl-6 pr-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#2b3550] text-xs text-gray-900 dark:text-white font-mono-numbers font-bold outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Add Tag Button (Col 2) */}
                    <div className="sm:col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={handleAddMediaTagToScript}
                        className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter</span>
                      </button>
                    </div>
                  </div>

                  {/* Media URL Input */}
                  <div>
                    <input
                      type="text"
                      value={tagUrl}
                      onChange={(e) => setTagUrl(e.target.value)}
                      placeholder="Collez l'URL de la photo ou vidéo (ou cliquez sur un preset ci-dessus)..."
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#2b3550] text-xs text-gray-900 dark:text-white font-mono outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Text Area with dynamic tag chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Contenu du Script <span className="text-rose-500">*</span>
                  </label>

                  <div className="flex items-center space-x-1.5 text-[10px]">
                    <span className="text-gray-400">Insérer variable :</span>
                    <button
                      type="button"
                      onClick={() => insertVariable('{fan_name}')}
                      className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-500/20 cursor-pointer"
                    >
                      {'{fan_name}'}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable('{creator_name}')}
                      className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold hover:bg-pink-500/20 cursor-pointer"
                    >
                      {'{creator_name}'}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={newText}
                  onChange={(e) => {
                    setNewText(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="Rédigez le message de vente captivant que les chatters enverront aux fans..."
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium leading-relaxed resize-none"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#1e2338]">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-[#1a2033] hover:bg-gray-200 dark:hover:bg-[#252e49] text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enregistrer le Script avec ses Tags & Prix</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* VIEW 2: SCRIPT LIST & FILTERS */
          <>
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-[#1e2338] space-y-3 bg-gray-50/50 dark:bg-[#161a29]">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par mot-clé ou tag (#douche, #lingerie, #kinky)..."
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#10131f] border border-gray-200 dark:border-[#28314e] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <button
                  onClick={() => setViewMode('create')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center space-x-1.5 flex-shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau Script</span>
                </button>
              </div>

              {/* Categories Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                {CATEGORIES.map((cat) => {
                  const count = cat === 'All' ? currentScripts.length : currentScripts.filter((s) => s.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        sounds.playReceive();
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 flex items-center space-x-1 ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-xs scale-102'
                          : 'bg-white dark:bg-[#1c2236] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252c46] border border-gray-200/80 dark:border-transparent'
                      }`}
                    >
                      <span>{cat === 'All' ? 'Tous les scripts' : cat}</span>
                      <span className="opacity-70 text-[10px]">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Tag Quick Filter Bar */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex-shrink-0 mr-1 flex items-center space-x-1">
                  <Hash className="w-3 h-3" />
                  <span>Tags :</span>
                </span>

                {selectedMediaTagFilter && (
                  <button
                    onClick={() => setSelectedMediaTagFilter(null)}
                    className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold cursor-pointer flex items-center space-x-1 flex-shrink-0"
                  >
                    <span>#{selectedMediaTagFilter}</span>
                    <span>×</span>
                  </button>
                )}

                {['douche_video', 'douche_photo', 'lingerie_pack', 'lingerie_video', 'kinky_clip', 'regard_sensuel', 'whale'].map((tName) => {
                  const isSelected = selectedMediaTagFilter === tName;
                  return (
                    <button
                      key={tName}
                      onClick={() => {
                        setSelectedMediaTagFilter(isSelected ? null : tName);
                        sounds.playReceive();
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-[#1f263c] text-gray-600 dark:text-gray-400 hover:text-blue-500'
                      }`}
                    >
                      #{tName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Script Cards List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {filtered.length > 0 ? (
                filtered.map((script) => (
                  <div
                    key={script.id}
                    className="group p-4 rounded-2xl bg-white dark:bg-[#171b2c] border border-gray-200/90 dark:border-[#222940] hover:border-blue-500/50 shadow-xs transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-xs font-black text-gray-900 dark:text-white">
                          {script.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {script.category}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {onDeleteScript && script.id.startsWith('s-') && (
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer le script "${script.title}" ?`)) {
                                onDeleteScript(script.id);
                                sounds.playReceive();
                              }
                            }}
                            className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Supprimer ce script"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Script Body Text */}
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed my-2 select-text font-normal">
                      {script.text}
                    </p>

                    {/* SECTION DES TAGS QUI ONT DES PHOTOS, VIDÉOS AVEC LEURS PRIX */}
                    {script.mediaTags && script.mediaTags.length > 0 && (
                      <div className="my-3 p-2.5 rounded-xl bg-gray-50/80 dark:bg-[#131726] border border-gray-200/60 dark:border-[#20273d] space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Tags Médias & Prix PPV attachés :
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {script.mediaTags.map((mt) => (
                            <div
                              key={mt.id}
                              onClick={() => handleApply(script, mt)}
                              title={`Cliquer pour envoyer ce script avec le média #${mt.name}`}
                              className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#1a2033] border border-gray-200 dark:border-[#27324e] hover:border-pink-500 dark:hover:border-pink-500 transition-all cursor-pointer group/tag shadow-2xs hover:scale-101"
                            >
                              <div className="flex items-center space-x-2 min-w-0">
                                <div 
                                  onClick={(e) => {
                                    if (onOpenLightbox) {
                                      e.stopPropagation();
                                      onOpenLightbox(mt.url, mt.title || mt.name, mt.price);
                                    }
                                  }}
                                  title="Agrandir ce média"
                                  className="relative w-8 h-8 rounded-md overflow-hidden bg-black flex-shrink-0 cursor-zoom-in"
                                >
                                  <img
                                    src={mt.url}
                                    alt={mt.name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                                    {mt.type === 'video' ? (
                                      <Play className="w-2.5 h-2.5 fill-white" />
                                    ) : (
                                      <ImageIcon className="w-2.5 h-2.5" />
                                    )}
                                  </div>
                                </div>

                                <div className="min-w-0">
                                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 block truncate group-hover/tag:text-pink-500">
                                    #{mt.name}
                                  </span>
                                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block truncate">
                                    {mt.title || (mt.type === 'video' ? 'Vidéo' : 'Photo')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 font-mono-numbers text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md flex-shrink-0">
                                <DollarSign className="w-3 h-3" />
                                <span>{mt.price.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-[#20273d]">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                        {script.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded font-mono bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleCopyText(script.text, script.id)}
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#20273f] dark:hover:bg-[#2a3454] text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
                          title="Copier le texte"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copier</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApply(script)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          {copiedId === script.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Appliqué !</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" />
                              <span>Utiliser Script</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-gray-400 space-y-3">
                  <Flame className="w-8 h-8 text-gray-400 mx-auto opacity-40" />
                  <p>Aucun script correspondant à votre recherche ou filtre.</p>
                  <button
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('All');
                      setSelectedMediaTagFilter(null);
                      setViewMode('create');
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer ce script maintenant</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
