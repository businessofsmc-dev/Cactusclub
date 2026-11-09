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
  Tag as TagIcon, 
  Layers, 
  Copy, 
  Flame, 
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  Lock,
  Eye,
  Hash,
  ArrowRight
} from 'lucide-react';
import type { CannedScript } from '../types/crm';
import { CANNED_SCRIPTS } from '../data/mockData';
import { sounds } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScript?: (script: CannedScript) => void;
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

const POPULAR_TAGS = [
  'douche',
  'lingerie',
  'video',
  'photo',
  'ppv',
  'kinky',
  'whale',
  'relance',
  'nuit',
  'tease',
  'exclusif',
  'bain'
];

const PRESET_MEDIA_SAMPLES = [
  {
    type: 'video' as const,
    label: '🚿 Extrait Douche Chaude',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'image' as const,
    label: '🖤 Shooting Lingerie Dentelle',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'image' as const,
    label: '💋 Regard Sensuel Privé',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'video' as const,
    label: '🎬 Teaser Coulisses 4K',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  },
];

const TEMPLATES: Omit<CannedScript, 'id'>[] = [
  {
    title: '🚿 Tease Douche Chaude PPV',
    category: 'PPV Tease',
    text: "Je viens tout juste de sortir de la douche, l'eau était tellement chaude... J'ai filmé un clip très intime rien que pour toi. Tu veux voir ? 🙈💦",
    price: 15,
    tags: ['douche', 'tease', 'video', 'ppv'],
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
      isLocked: true,
      price: 15,
    },
  },
  {
    title: '📸 Pack Photos Lingerie 4K',
    category: 'Upsell',
    text: "J'ai reçu ce nouvel ensemble de lingerie en dentelle noire que tu aimais... J'ai pris 5 photos ultra détaillées sous la lumière du soleil. Tu veux débloquer le pack secret ? 🖤",
    price: 25,
    tags: ['photos', 'lingerie', 'pack', 'ppv'],
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      isLocked: true,
      price: 25,
    },
  },
  {
    title: '🔥 Relance Sensuelle Nocturne',
    category: 'Kinky',
    text: "Tu dors déjà ou tu penses encore à moi ? Je n'arrive pas à trouver le sommeil ce soir, j'ai envie d'un peu de compagnie... 😏",
    tags: ['nuit', 'relance', 'kinky', 'photo'],
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      isLocked: false,
    },
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New script form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CannedScript['category']>('PPV Tease');
  const [newText, setNewText] = useState('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [tagsList, setTagsList] = useState<string[]>(['vente']);
  const [customTagInput, setCustomTagInput] = useState('');
  
  // Media attachment state
  const [hasMedia, setHasMedia] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaIsLocked, setMediaIsLocked] = useState(true);
  const [mediaPrice, setMediaPrice] = useState<string>('15.00');

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setViewMode(initialMode);
      setFormError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const currentScripts = scripts.length > 0 ? scripts : CANNED_SCRIPTS;

  // Filter scripts by category, search text, and tag
  const filtered = currentScripts.filter((s) => {
    const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchTag = !selectedTag || s.tags.includes(selectedTag);
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.text.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchTag && matchSearch;
  });

  const handleInsert = (script: CannedScript) => {
    setCopiedId(script.id);
    sounds.playReceive();
    if (onApplyScript) {
      onApplyScript(script);
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
    setNewPrice(tpl.price ? tpl.price.toString() : '');
    setTagsList(tpl.tags);
    if (tpl.media) {
      setHasMedia(true);
      setMediaType(tpl.media.type);
      setMediaUrl(tpl.media.url);
      setMediaIsLocked(tpl.media.isLocked || false);
      setMediaPrice(tpl.media.price ? tpl.media.price.toString() : '15.00');
    } else {
      setHasMedia(false);
    }
    setFormError(null);
    sounds.playReceive();
  };

  const toggleTagInForm = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/^#/, '');
    if (!cleanTag) return;
    if (tagsList.includes(cleanTag)) {
      setTagsList(tagsList.filter((t) => t !== cleanTag));
    } else {
      setTagsList([...tagsList, cleanTag]);
    }
    sounds.playReceive();
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const cleanTag = customTagInput.trim().toLowerCase().replace(/^#/, '');
    if (cleanTag && !tagsList.includes(cleanTag)) {
      setTagsList([...tagsList, cleanTag]);
      setCustomTagInput('');
      sounds.playReceive();
    }
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

    const priceNum = newPrice.trim() ? parseFloat(newPrice.replace(',', '.')) : undefined;

    let mediaObj: CannedScript['media'] = undefined;
    if (hasMedia && mediaUrl.trim()) {
      const parsedMediaPrice = mediaIsLocked && mediaPrice.trim() ? parseFloat(mediaPrice.replace(',', '.')) : undefined;
      mediaObj = {
        type: mediaType,
        url: mediaUrl.trim(),
        isLocked: mediaIsLocked,
        price: parsedMediaPrice,
      };
    }

    const scriptPayload: Omit<CannedScript, 'id'> = {
      title: newTitle.trim(),
      category: newCategory,
      text: newText.trim(),
      price: priceNum || (mediaObj?.isLocked ? mediaObj.price : undefined),
      tags: tagsList.length > 0 ? tagsList : ['vente'],
      media: mediaObj,
    };

    if (onAddScript) {
      onAddScript(scriptPayload);
    }

    sounds.playCash();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981'],
    });

    // Reset form
    setNewTitle('');
    setNewText('');
    setNewPrice('');
    setTagsList(['vente']);
    setHasMedia(false);
    setMediaUrl('');
    setFormError(null);
    setViewMode('list');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-[#131624] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#20263b] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#1e2338] bg-gray-50/50 dark:bg-[#151928]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-black text-gray-900 dark:text-white">
                  Scripts de Vente, Photos/Vidéos & Tags
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px]">
                  {currentScripts.length} scripts
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Créez des scripts captivants, associez des photos/vidéos PPV et organisez-les par tags.
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

        {/* VIEW 1: CREATE NEW SCRIPT WITH MEDIA & TAGS */}
        {viewMode === 'create' ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Templates Drawer */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Modèles de vente pré-remplis avec médias et tags :</span>
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
                    {tpl.media?.type === 'video' ? (
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 text-[10px]">Vidéo</span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-pink-500/15 text-pink-600 text-[10px]">Photo</span>
                    )}
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

              {/* SECTION: PHOTO OU VIDÉO ATTACHÉE */}
              <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#171c2d] border border-gray-200 dark:border-[#242c44] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Attacher une Photo ou une Vidéo à ce script
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        Permet au chatter d'envoyer le texte avec un média payant ou offert.
                      </span>
                    </div>
                  </div>

                  {/* Toggle Media Active */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setHasMedia(!hasMedia);
                        if (!hasMedia && !mediaUrl) {
                          setMediaUrl(PRESET_MEDIA_SAMPLES[0].url);
                          setMediaType(PRESET_MEDIA_SAMPLES[0].type);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                        hasMedia
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-gray-200 dark:bg-[#20273f] text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{hasMedia ? '✓ Média Attaché' : '+ Ajouter un Média'}</span>
                    </button>
                  </div>
                </div>

                {hasMedia && (
                  <div className="pt-2 border-t border-gray-200/80 dark:border-[#232b45] space-y-3 animate-in fade-in">
                    {/* Media Type & Lock Options */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {/* Type Toggle: Photo vs Video */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setMediaType('image')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                            mediaType === 'image'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-gray-200 dark:bg-[#20273f] text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Photo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMediaType('video')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                            mediaType === 'video'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-gray-200 dark:bg-[#20273f] text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <VideoIcon className="w-3.5 h-3.5" />
                          <span>Vidéo</span>
                        </button>
                      </div>

                      {/* PPV Lock & Price */}
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mediaIsLocked}
                            onChange={(e) => setMediaIsLocked(e.target.checked)}
                            className="rounded text-pink-600 focus:ring-pink-500"
                          />
                          <Lock className="w-3 h-3 text-amber-500" />
                          <span>Verrouillé PPV payant</span>
                        </label>

                        {mediaIsLocked && (
                          <div className="relative w-24">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="1"
                              value={mediaPrice}
                              onChange={(e) => setMediaPrice(e.target.value)}
                              placeholder="15.00"
                              className="w-full pl-6 pr-2 py-1 rounded-lg bg-white dark:bg-[#1a2033] border border-gray-300 dark:border-[#2b3552] text-xs text-gray-900 dark:text-white font-mono-numbers font-bold"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Presets Chips for 1-Click Media Fill */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                        Exemples de médias disponibles dans le Vault :
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_MEDIA_SAMPLES.map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setMediaUrl(sample.url);
                              setMediaType(sample.type);
                              sounds.playReceive();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1e2439] border border-gray-200 dark:border-[#28324e] text-[11px] text-gray-700 dark:text-gray-300 hover:border-pink-500 transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <span>{sample.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Media URL Input & Live Thumbnail Preview */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                          placeholder="Collez l'URL de l'image ou vidéo..."
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#121522] border border-gray-200 dark:border-[#27304b] text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>

                      {mediaUrl && (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-pink-500 shadow-md flex-shrink-0">
                          <img
                            src={mediaUrl}
                            alt="Aperçu média"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          {mediaType === 'video' && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: TAGS DU SCRIPT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Tags & Catégorisation (#mots-clés)
                  </label>
                  <span className="text-[10px] text-gray-400">
                    {tagsList.length} tag{tagsList.length > 1 ? 's' : ''} sélectionné{tagsList.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Popular Tags Quick Chips */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {POPULAR_TAGS.map((tag) => {
                    const isSelected = tagsList.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTagInForm(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs scale-102'
                            : 'bg-gray-100 dark:bg-[#1a2033] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#252e49] border border-gray-200/80 dark:border-[#27304b]'
                        }`}
                      >
                        <Hash className="w-3 h-3 opacity-60" />
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tag Input */}
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <TagIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={handleAddCustomTag}
                      placeholder="Ajouter un tag personnalisé (Appuyez sur Entrée)..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#27304b] text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-3 py-2 rounded-xl bg-gray-200 dark:bg-[#20273f] hover:bg-blue-600 hover:text-white text-gray-700 dark:text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    + Ajouter
                  </button>
                </div>

                {/* Selected Tags Chips Display */}
                {tagsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tagsList.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => toggleTagInForm(tag)}
                          className="hover:text-rose-500 ml-1 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                  <span>Enregistrer le Script dans la Bibliothèque</span>
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
                    placeholder="Rechercher par mot-clé ou tag (douche, lingerie, whale, custom, kinky)..."
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

                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold cursor-pointer flex items-center space-x-1 flex-shrink-0"
                  >
                    <span>#{selectedTag}</span>
                    <span>×</span>
                  </button>
                )}

                {POPULAR_TAGS.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(isSelected ? null : tag);
                        sounds.playReceive();
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-[#1f263c] text-gray-600 dark:text-gray-400 hover:text-blue-500'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Script Cards List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
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

                        {/* Media Attachment Badge */}
                        {script.media && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center space-x-1 ${
                            script.media.type === 'video'
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                              : 'bg-pink-500/15 text-pink-600 dark:text-pink-400'
                          }`}>
                            {script.media.type === 'video' ? <VideoIcon className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                            <span>{script.media.type === 'video' ? 'Vidéo' : 'Photo'}</span>
                            {script.media.isLocked && <Lock className="w-2.5 h-2.5 text-amber-500 ml-0.5" />}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {script.price && (
                          <span className="flex items-center text-xs font-bold font-mono-numbers text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                            <DollarSign className="w-3 h-3" />
                            {script.price.toFixed(2)}
                          </span>
                        )}

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

                    {/* Script Body with optional Media Attachment Thumbnail */}
                    <div className="flex flex-col sm:flex-row items-start gap-3 my-2.5">
                      {script.media && (
                        <div 
                          onClick={() => {
                            if (onOpenLightbox && script.media?.url) {
                              onOpenLightbox(script.media.url, script.title, script.media.price);
                            }
                          }}
                          className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/80 flex-shrink-0 cursor-pointer group/media border border-gray-200 dark:border-white/10"
                        >
                          <img
                            src={script.media.url}
                            alt={script.title}
                            className={`w-full h-full object-cover transition-transform group-hover/media:scale-105 ${
                              script.media.isLocked ? 'blur-xs opacity-75' : ''
                            }`}
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            {script.media.type === 'video' ? (
                              <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white opacity-0 group-hover/media:opacity-100 transition-opacity">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>
                          {script.media.isLocked && (
                            <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-amber-400 font-mono-numbers text-[9px] font-bold">
                              ${script.media.price?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="flex-1 text-xs text-gray-700 dark:text-gray-300 leading-relaxed select-text font-normal">
                        {script.text}
                      </p>
                    </div>

                    {/* Tags List */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#20273d]">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                        {script.tags.map((tag, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedTag(selectedTag === tag ? null : tag);
                              sounds.playReceive();
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                              selectedTag === tag
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleCopyText(script.text, script.id)}
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#20273f] dark:hover:bg-[#2a3454] text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
                          title="Copier le texte dans le presse-papiers"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copier</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInsert(script)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          {copiedId === script.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Inséré !</span>
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
                  <p>Aucun script correspondant à votre recherche ou au filtre tag.</p>
                  <button
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('All');
                      setSelectedTag(null);
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
