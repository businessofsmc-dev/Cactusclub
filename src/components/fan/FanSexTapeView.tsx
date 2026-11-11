import React, { useState } from 'react';
import {
  Film,
  Search,
  Sparkles,
  Flame,
  Heart,
  Lock,
  Unlock,
  Play,
  Pause,
  Clock,
  Eye,
  Star,
  CheckCircle2,
  Filter,
  X,
  Volume2,
  Maximize2,
  ShieldCheck,
  Zap,
  ArrowUpDown,
  Download,
  Share2,
  MessageCircle,
  Plus,
  Tv
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import type { FanUser, CreatorAccount } from '../../types/crm';
import type { SexTapeVideo, VideoCategory } from '../../types/video';
import { VIDEO_CATEGORIES, INITIAL_SEXTAPES } from '../../data/videoData';

interface FanSexTapeViewProps {
  fanUser: FanUser;
  onTopUpWallet: (amount: number) => void;
  onOpenWalletModal: () => void;
  onStartChatWithCreator?: (creatorId: string) => void;
  creators: CreatorAccount[];
  activeCreatorId?: string;
}

export const FanSexTapeView: React.FC<FanSexTapeViewProps> = ({
  fanUser,
  onTopUpWallet,
  onOpenWalletModal,
  onStartChatWithCreator,
  creators,
  activeCreatorId,
}) => {
  const [videos] = useState<SexTapeVideo[]>(INITIAL_SEXTAPES);
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('all');
  const [selectedCreatorFilter, setSelectedCreatorFilter] = useState<string>(activeCreatorId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'duration' | 'recent'>('popular');

  // Video Player / Teaser Modal
  const [activeVideoModal, setActiveVideoModal] = useState<SexTapeVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackProgress, setPlaybackProgress] = useState<number>(24); // percentage
  const [selectedResolution, setSelectedResolution] = useState<'4K' | '1080p' | '720p'>('4K');

  // Unlocked video tracking in local state
  const [unlockedVideoIds, setUnlockedVideoIds] = useState<Record<string, boolean>>({
    'st-07': true, // 1 unlocked by default for instant delight
  });

  // Calculate counts per category
  const getCategoryCount = (catId: VideoCategory) => {
    if (catId === 'all') return videos.length;
    return videos.filter((v) => v.category === catId).length;
  };

  // Filtered & Sorted videos
  const filteredVideos = videos
    .filter((video) => {
      const matchCat = selectedCategory === 'all' || video.category === selectedCategory;
      const matchCreator = selectedCreatorFilter === 'all' || video.creatorId === selectedCreatorFilter;
      const matchSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchCreator && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.viewsCount - a.viewsCount;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'recent') return b.id.localeCompare(a.id);
      if (sortBy === 'duration') return b.duration.localeCompare(a.duration);
      return 0;
    });

  // Handle Unlock Video
  const handleUnlockVideo = (video: SexTapeVideo) => {
    const isAlreadyUnlocked = unlockedVideoIds[video.id] || video.isUnlocked;
    if (isAlreadyUnlocked) {
      setActiveVideoModal(video);
      setIsPlaying(true);
      return;
    }

    if (fanUser.walletBalance < video.price) {
      const needed = video.price - fanUser.walletBalance;
      if (
        confirm(
          `Solde insuffisant ($${fanUser.walletBalance.toFixed(2)}). Il vous manque $${needed.toFixed(
            2
          )} pour débloquer "${video.title}". Recharger votre portefeuille maintenant ?`
        )
      ) {
        onOpenWalletModal();
      }
      return;
    }

    // Deduct from wallet
    onTopUpWallet(-video.price);
    sounds.playCash();

    // Mark as unlocked
    setUnlockedVideoIds((prev) => ({ ...prev, [video.id]: true }));

    // Confetti effect
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#ec4899', '#f59e0b', '#8b5cf6'],
    });

    // Update modal if open
    if (activeVideoModal && activeVideoModal.id === video.id) {
      setActiveVideoModal({ ...video, isUnlocked: true });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full pb-24 space-y-6 select-none">
      {/* 1. HERO BANNER: SEX TAPES VIP BOUTIQUE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18080e] via-[#240d19] to-[#0c0d18] p-6 sm:p-8 text-white shadow-2xl border border-red-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-red-600/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-pink-600/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-black tracking-wide border border-red-500/30">
              <Film className="w-3.5 h-3.5 text-red-500" />
              <span>CATALOGUE OFFICIEL SEX TAPES 18+</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Boutique Vidéos Privées &amp; <span className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-400 bg-clip-text text-transparent">Sex Tapes 4K</span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Débloquez les tournages intimes les plus chauds et non censurés de nos créatrices exclusives.
              Vidéos intégrales en 4K Ultra HD avec son direct, téléchargement illimité et accès à vie.
            </p>

            {/* Badges strip */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-gray-300">
              <div className="flex items-center space-x-1.5 bg-white/5 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Non Censuré</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/5 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                <Tv className="w-3.5 h-3.5 text-blue-400" />
                <span>4K Ultra HD 60FPS</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/5 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                <span>Accès à Vie Garanti</span>
              </div>
            </div>
          </div>

          {/* Wallet summary card with rapid top-up */}
          <div className="flex-shrink-0 bg-white/10 dark:bg-black/40 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 shadow-xl flex flex-col justify-between min-w-[240px]">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Votre Solde Portefeuille
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono-numbers text-white mt-0.5">
                ${fanUser.walletBalance.toFixed(2)}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Débit instantané et discret
              </p>
            </div>

            <button
              onClick={onOpenWalletModal}
              className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-xs transition-all shadow-lg shadow-red-600/30 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Recharger mon solde</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY PILLS BAR (Anale, Lèche, Solo, Hardcore, BDSM, etc.) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-red-500" />
            <span>Catégories Explicites</span>
          </div>
          <span className="text-xs text-gray-400 font-mono-numbers">
            {filteredVideos.length} vidéo{filteredVideos.length > 1 ? 's' : ''} disponible{filteredVideos.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          {VIDEO_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  sounds.playReceive();
                }}
                className={`group flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white border-transparent shadow-lg shadow-red-600/25 scale-[1.02]'
                    : 'bg-white dark:bg-[#131624] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#1e2338] hover:border-red-500/50 hover:bg-gray-50 dark:hover:bg-[#181d30]'
                }`}
              >
                {cat.id === 'anale' && <Flame className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-red-500'}`} />}
                {cat.id === 'leche' && <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-400'}`} />}
                {cat.id === 'solo' && <Heart className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-pink-500'}`} />}
                {cat.id === 'hardcore' && <Zap className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-orange-500'}`} />}
                {cat.id === 'bdsm' && <ShieldCheck className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-purple-400'}`} />}
                {cat.id === 'all' && <Film className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-400'}`} />}

                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-numbers font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#1f253d] text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SEARCH & CONTROLS STRIP */}
      <div className="bg-white dark:bg-[#131624] p-3 sm:p-4 rounded-2xl border border-gray-200 dark:border-[#1f2438] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une sex tape, créatrice (Margot, Shasha...), tag (anale, lèche...)"
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-gray-50 dark:bg-[#0c0e17] border border-gray-200 dark:border-[#1f2438] text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Creator dropdown filter */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedCreatorFilter}
            onChange={(e) => {
              setSelectedCreatorFilter(e.target.value);
              sounds.playReceive();
            }}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#0c0e17] border border-gray-200 dark:border-[#1f2438] text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
          >
            <option value="all">Toutes les créatrices</option>
            {creators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#0c0e17] border border-gray-200 dark:border-[#1f2438] text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                sounds.playReceive();
              }}
              className="bg-transparent font-bold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="popular">Plus vues &amp; populaires</option>
              <option value="recent">Plus récentes</option>
              <option value="duration">Plus longues</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. VIDEOS GRID */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#131624] rounded-3xl border border-gray-200 dark:border-[#1f2438] p-8">
          <Film className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Aucune sex tape trouvée
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Aucune vidéo ne correspond à votre filtre "{searchQuery}". Essayez une autre catégorie ou réinitialisez la recherche.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedCreatorFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => {
            const isUnlocked = unlockedVideoIds[video.id] || video.isUnlocked;

            return (
              <div
                key={video.id}
                className="group rounded-3xl bg-white dark:bg-[#131624] border border-gray-200/90 dark:border-[#1e2338] hover:border-red-500/60 dark:hover:border-red-500/60 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-red-500/10 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Container */}
                  <div
                    onClick={() => {
                      setActiveVideoModal(video);
                      setIsPlaying(true);
                      sounds.playReceive();
                    }}
                    className="relative aspect-video w-full overflow-hidden bg-black cursor-pointer"
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      {video.badge ? (
                        <span className="px-2.5 py-1 rounded-lg bg-red-600/90 backdrop-blur-md text-[10px] font-black tracking-wider text-white uppercase shadow-md border border-red-400/30">
                          {video.badge}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-black tracking-wider text-white uppercase border border-white/10">
                          {video.categoryLabel}
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-gray-200 border border-white/10">
                        {video.quality}
                      </span>
                    </div>

                    {/* Play Button Overlay on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-red-600/90 group-hover:bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 group-hover:scale-110 transition-transform duration-300 border border-white/20">
                        {isUnlocked ? (
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        ) : (
                          <Lock className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Bottom strip on thumbnail: duration + views */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white font-mono-numbers">
                      <span className="flex items-center space-x-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 font-bold">
                        <Clock className="w-3 h-3 text-red-400" />
                        <span>{video.duration}</span>
                      </span>

                      <span className="flex items-center space-x-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                        <Eye className="w-3 h-3 text-gray-300" />
                        <span>{(video.viewsCount / 1000).toFixed(1)}k vues</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Creator Row */}
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => onStartChatWithCreator?.(video.creatorId)}
                        className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={video.creatorAvatar}
                          alt={video.creatorName}
                          className="w-7 h-7 rounded-full object-cover border border-pink-500"
                        />
                        <div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-black text-gray-900 dark:text-white">
                              {video.creatorName}
                            </span>
                            <CheckCircle2 className="w-3 h-3 text-blue-500" />
                          </div>
                          <span className="text-[10px] text-gray-400">{video.creatorHandle}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold font-mono-numbers">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{video.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => {
                        setActiveVideoModal(video);
                        setIsPlaying(true);
                      }}
                      className="font-black text-sm text-gray-900 dark:text-white group-hover:text-red-500 transition-colors line-clamp-2 leading-snug cursor-pointer"
                    >
                      {video.title}
                    </h3>

                    {/* Description snippet */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {video.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#1a1f33] text-[10px] font-semibold text-gray-600 dark:text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Card */}
                <div className="p-4 pt-0 sm:p-5 sm:pt-0 border-t border-gray-100 dark:border-[#1a1f33] flex items-center justify-between mt-2 pt-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      {isUnlocked ? 'Accès Débloqué' : 'Prix Déblocage'}
                    </span>
                    <span className="text-base font-black font-mono-numbers text-gray-900 dark:text-white">
                      {isUnlocked ? (
                        <span className="text-emerald-500 flex items-center space-x-1 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ILLIMITÉ</span>
                        </span>
                      ) : (
                        `$${video.price.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        setActiveVideoModal(video);
                        setIsPlaying(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Visionner</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnlockVideo(video)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-xs transition-all shadow-md shadow-red-600/20 active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Débloquer</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. CINEMA VIDEO PLAYER & TEASER LIGHTBOX MODAL */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-[#0f111a] border border-red-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 bg-[#141724] border-b border-gray-800 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3 truncate pr-4">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                  SEX TAPE 18+
                </span>
                <h2 className="text-xs sm:text-sm font-bold truncate text-gray-200">
                  {activeVideoModal.title}
                </h2>
              </div>

              <button
                onClick={() => setActiveVideoModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player Area */}
            <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
              <img
                src={activeVideoModal.thumbnailUrl}
                alt={activeVideoModal.title}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  unlockedVideoIds[activeVideoModal.id] ? 'opacity-90' : 'blur-md opacity-40 scale-105'
                }`}
              />

              {/* Locked Video Overlay with Unlock CTA */}
              {!unlockedVideoIds[activeVideoModal.id] && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
                  <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-3 shadow-2xl animate-pulse">
                    <Lock className="w-8 h-8" />
                  </div>

                  <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider mb-2">
                    Aperçu Teaser Verrouillé • Version Intégrale
                  </span>

                  <h3 className="text-base sm:text-lg font-black max-w-md">
                    {activeVideoModal.title}
                  </h3>

                  <div className="flex items-center space-x-2 my-2 text-xs text-gray-300 font-mono-numbers">
                    <span>Durée complète : <strong>{activeVideoModal.duration}</strong></span>
                    <span>•</span>
                    <span>Qualité : <strong>{activeVideoModal.quality}</strong></span>
                  </div>

                  <div className="text-3xl font-black font-mono-numbers text-white my-2">
                    ${activeVideoModal.price.toFixed(2)}
                  </div>

                  <p className="text-xs text-gray-300 max-w-sm mb-4 leading-relaxed">
                    Débloquez cette sex tape complète pour toujours. Votre solde portefeuille actuel est de{' '}
                    <strong className="text-emerald-400 font-mono-numbers">${fanUser.walletBalance.toFixed(2)}</strong>.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => handleUnlockVideo(activeVideoModal)}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-xs shadow-xl shadow-red-600/40 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Débloquer maintenant (${activeVideoModal.price.toFixed(2)})</span>
                    </button>

                    <button
                      onClick={onOpenWalletModal}
                      className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Recharger mon portefeuille</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Unlocked Video Custom Controls overlay */}
              {unlockedVideoIds[activeVideoModal.id] && (
                <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none">
                  {/* Top Bar with resolution switch */}
                  <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>LECTURE ACTIVE</span>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl text-[11px] font-bold text-white">
                      {(['4K', '1080p', '720p'] as const).map((res) => (
                        <button
                          key={res}
                          onClick={() => setSelectedResolution(res)}
                          className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                            selectedResolution === res ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Big Play/Pause Center Trigger */}
                  <div className="self-center pointer-events-auto">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1 fill-white" />}
                    </button>
                  </div>

                  {/* Bottom Controls Bar */}
                  <div className="space-y-2 pointer-events-auto bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white">
                    {/* Progress scrubber */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={playbackProgress}
                        onChange={(e) => setPlaybackProgress(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="hover:text-red-400 transition-colors cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                        </button>
                        <Volume2 className="w-4 h-4 text-gray-300" />
                        <span className="text-[11px] font-mono-numbers text-gray-300">
                          06:12 / {activeVideoModal.duration}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-gray-300">
                        <span className="text-[10px] font-black uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                          {selectedResolution} HDR
                        </span>
                        <button
                          type="button"
                          onClick={() => alert('Téléchargement de la Sex Tape 4K initié.')}
                          title="Télécharger la sex tape"
                          className="hover:text-white cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <Maximize2 className="w-4 h-4 hover:text-white cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Body Details & Info */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#0c0e17] text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <img
                    src={activeVideoModal.creatorAvatar}
                    alt={activeVideoModal.creatorName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-black text-sm text-white">
                        {activeVideoModal.creatorName}
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-xs text-gray-400">{activeVideoModal.creatorHandle}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setActiveVideoModal(null);
                      onStartChatWithCreator?.(activeVideoModal.creatorId);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Discuter avec elle</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('Lien de la Sex Tape copié !');
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors cursor-pointer"
                    title="Partager"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Synopsis &amp; Détails du tournage
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {activeVideoModal.description}
                </p>
              </div>

              {/* Tags & Stats */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {activeVideoModal.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
