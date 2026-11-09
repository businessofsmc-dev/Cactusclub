import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Lock,
  Unlock,
  Crown,
  Image as ImageIcon,
  Sun,
  Moon,
  Plus,
  Wallet,
  Sparkles,
  Users,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle2,
  Home,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import type { CreatorAccount, ChatMessage, FanUser, CreatorPost } from '../../types/crm';
import { CREATOR_ACCOUNTS, INITIAL_CREATOR_POSTS } from '../../data/mockData';
import { FanChatView } from './FanChatView';
import { FanAuthModal } from './FanAuthModal';
import { FanSubscribeModal } from './FanSubscribeModal';
import { FanTipModal } from './FanTipModal';
import { FanWalletModal } from './FanWalletModal';
import { FanCommentsModal } from './FanCommentsModal';

interface FanPortalProps {
  creator: CreatorAccount;
  creators?: CreatorAccount[];
  activeCreatorId?: string;
  onSelectCreator?: (creatorId: string) => void;
  fanUser: FanUser;
  messages: ChatMessage[];
  onSendMessageFromFan: (text: string) => void;
  onUnlockPPV: (messageId: string, price: number) => boolean;
  onSendTip: (amount: number, message: string) => void;
  onSubscribe: (tier: 'free' | 'monthly' | 'quarterly' | 'vip', price: number) => void;
  onTopUpWallet: (amount: number) => void;
  onUpdateFanUser?: (user: FanUser) => void;
  onOpenLightbox: (url: string, title?: string, price?: number) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const FanPortal: React.FC<FanPortalProps> = ({
  creator,
  creators = CREATOR_ACCOUNTS,
  activeCreatorId,
  onSelectCreator,
  fanUser,
  messages,
  onSendMessageFromFan,
  onUnlockPPV,
  onSendTip,
  onSubscribe,
  onTopUpWallet,
  onUpdateFanUser,
  onOpenLightbox,
  darkMode,
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'creators' | 'posts' | 'feed' | 'chat' | 'subscribe'>('creators');
  const [posts, setPosts] = useState<CreatorPost[]>(INITIAL_CREATOR_POSTS);

  // Scroll references
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const storiesScrollRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [commentingPost, setCommentingPost] = useState<CreatorPost | null>(null);

  // Active creator state with reactive external synchronization
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(activeCreatorId || creator.id);

  React.useEffect(() => {
    if (activeCreatorId) {
      setSelectedCreatorId(activeCreatorId);
    }
  }, [activeCreatorId]);

  // Always resolve the full active creator object
  const activeCreator = creators.find((c) => c.id === selectedCreatorId) || creators.find((c) => c.id === creator.id) || creator;

  // Filter posts for active creator, fallback to posts from margot if none found
  const creatorPosts = posts.filter((p) => p.creatorId === activeCreator.id);
  const displayedPosts = creatorPosts.length > 0 ? creatorPosts : posts.filter((p) => p.creatorId === 'margot');

  // Handle open creator profile & feed
  const handleOpenCreatorProfile = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    if (onSelectCreator) {
      onSelectCreator(creatorId);
    }
    setActiveTab('feed');
    sounds.playReceive();
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Scroll Stories horizontal strip
  const handleScrollStories = (direction: 'left' | 'right') => {
    if (storiesScrollRef.current) {
      storiesScrollRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth',
      });
      sounds.playReceive();
    }
  };

  // Open all creators tab & scroll top smoothly
  const handleOpenAllCreators = () => {
    setActiveTab('creators');
    sounds.playReceive();
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Toggle post like
  const handleLikePost = (postId: string) => {
    sounds.playReceive();
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
            ...p,
            isLiked: !p.isLiked,
            likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
          }
          : p
      )
    );
  };

  // Unlock post
  const handleUnlockPost = (post: CreatorPost) => {
    if (!post.price) return;
    if (fanUser.walletBalance < post.price) {
      alert(`Solde insuffisant ($${fanUser.walletBalance.toFixed(2)}). Veuillez recharger votre solde.`);
      return;
    }

    onTopUpWallet(-post.price);
    sounds.playCash();
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981'],
    });

    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, isLocked: false } : p))
    );
  };

  // Select creator and initiate chat or prompt subscription
  const handleStartChatWithCreator = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    if (onSelectCreator) {
      onSelectCreator(creatorId);
    }

    // When deciding to write to a creator: if not subscribed and no plan active, prompt subscription
    if (!fanUser.isSubscribed && fanUser.subscriptionTier !== 'free') {
      setIsSubOpen(true);
      sounds.playReceive();
      return;
    }

    setActiveTab('chat');
    sounds.playSend();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7, x: 0.5 },
      colors: ['#ec4899', '#8b5cf6', '#3b82f6'],
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f3f4f8] dark:bg-[#0c0e17] text-gray-900 dark:text-white font-sans select-none">
      {/* Top Application Header */}
      <header className="h-14 px-4 sm:px-6 bg-white dark:bg-[#131624] border-b border-gray-200 dark:border-[#1f2438] flex items-center justify-between z-30 shadow-xs flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 font-black text-sm">
            CC
          </div>
          <span className="font-black text-base tracking-tight text-gray-900 dark:text-white">
            CactusClub
          </span>
        </div>

        {/* Fan Balance & User Controls */}
        <div className="flex items-center space-x-3">
          {/* Wallet Balance Pill */}
          <div
            onClick={() => setIsWalletOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono-numbers cursor-pointer hover:bg-emerald-500/15 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>${fanUser.walletBalance.toFixed(2)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsWalletOpen(true);
              }}
              title="Recharger mon solde"
              className="ml-1 p-0.5 rounded hover:bg-emerald-500/20 cursor-pointer text-emerald-500"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* User Profile / Auth Button */}
          {fanUser.name ? (
            <div className="flex items-center space-x-2 p-1 pl-2 rounded-xl bg-gray-100 dark:bg-[#1a2033] text-xs">
              <span className="font-bold text-gray-800 dark:text-gray-200 hidden sm:inline">{fanUser.name}</span>
              {fanUser.isSubscribed ? (
                <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white font-black text-[9px]">VIP</span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full bg-gray-400 text-white font-bold text-[9px]">Fan</span>
              )}
              <img
                src={fanUser.avatar}
                alt={fanUser.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all"
            >
              S'inscrire / Connexion
            </button>
          )}

          {/* Dark Mode */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* TOP STORIES CAROUSEL: VIP CREATOR AVATARS STRIP WITH ARROWS */}
      <section className="bg-white/95 dark:bg-[#131624]/95 backdrop-blur-md border-b border-gray-200 dark:border-[#1f2438] px-4 sm:px-6 py-2.5 flex-shrink-0 z-20 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
            </span>
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Créatrices VIP ({creators.length})
            </h2>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold">
              Cliquez pour discuter en tête-à-tête
            </span>
          </div>

          <button
            onClick={handleOpenAllCreators}
            className={`text-xs font-bold transition-all px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer ${activeTab === 'creators'
              ? 'bg-pink-500 text-white shadow-xs'
              : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10'
              }`}
          >
            <span>Toutes les créatrices</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Creator Avatars Scroll Strip with Navigation Arrows */}
        <div className="relative flex items-center">
          <button
            onClick={() => handleScrollStories('left')}
            className="p-1 rounded-full bg-white dark:bg-[#1a2033] border border-gray-200 dark:border-gray-700 shadow-sm text-gray-600 dark:text-gray-300 hover:text-pink-500 cursor-pointer hidden sm:flex items-center justify-center flex-shrink-0 mr-2 z-10"
            title="Défiler à gauche"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={storiesScrollRef}
            className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-1 scroll-smooth w-full"
          >
            {/* FIRST POSITION: HOME ICON CIRCLE */}
            <div
              onClick={() => {
                setActiveTab('creators');
                sounds.playReceive();
                setTimeout(() => {
                  mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }, 30);
              }}
              title="Retour à l'accueil des créatrices"
              className={`flex flex-col items-center flex-shrink-0 group cursor-pointer transition-all duration-200 ${
                activeTab === 'creators' ? 'scale-105' : 'hover:scale-102 opacity-90 hover:opacity-100'
              }`}
            >
              <div className="relative p-0.5">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-300 flex items-center justify-center ${
                    activeTab === 'creators'
                      ? 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 ring-2 ring-pink-500 ring-offset-2 dark:ring-offset-[#131624] shadow-lg shadow-pink-500/30'
                      : 'bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 group-hover:from-pink-400 group-hover:to-purple-500'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#131624] flex items-center justify-center text-pink-600 dark:text-pink-400 border-2 border-white dark:border-[#131624]">
                    <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="mt-1.5 text-center flex flex-col items-center">
                <span
                  className={`text-[11px] font-bold truncate max-w-[80px] ${
                    activeTab === 'creators'
                      ? 'text-pink-600 dark:text-pink-400 font-extrabold'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  Accueil
                </span>
                <span className="mt-0.5 text-[9px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 font-medium">
                  Modèles
                </span>
              </div>
            </div>

            {creators.map((c) => {
              const isSelected = c.id === activeCreator.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleOpenCreatorProfile(c.id)}
                  title={`Voir le profil et les publications de ${c.name}`}
                  className={`flex flex-col items-center flex-shrink-0 group cursor-pointer transition-all duration-200 ${isSelected ? 'scale-105' : 'hover:scale-102 opacity-90 hover:opacity-100'
                    }`}
                >
                  {/* Avatar with Animated Gradient Story Ring */}
                  <div className="relative p-0.5">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-300 ${isSelected
                        ? 'bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400 ring-2 ring-pink-500 ring-offset-2 dark:ring-offset-[#131624] shadow-lg shadow-pink-500/30'
                        : 'bg-gradient-to-tr from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 group-hover:from-pink-400 group-hover:to-purple-500'
                        }`}
                    >
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#131624]"
                      />
                    </div>

                    {/* Online Live Pulsing Dot */}
                    <span className="absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131624] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    </span>

                    {/* Top VIP / Live Tag */}
                    {c.id === 'margot-vip' ? (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-[8px] shadow-xs">
                        VIP
                      </span>
                    ) : (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-pink-500 text-white font-black text-[8px] shadow-xs">
                        LIVE
                      </span>
                    )}
                  </div>

                  {/* Name & Quick Chat Trigger */}
                  <div className="mt-1.5 text-center flex flex-col items-center">
                    <span
                      className={`text-[11px] font-bold truncate max-w-[80px] ${isSelected ? 'text-pink-600 dark:text-pink-400 font-extrabold' : 'text-gray-800 dark:text-gray-200'
                        }`}
                    >
                      {c.name.split(' ')[0]}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartChatWithCreator(c.id);
                      }}
                      className="mt-0.5 text-[9px] px-2 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 font-bold transition-all flex items-center space-x-0.5 cursor-pointer shadow-2xs"
                    >
                      <MessageCircle className="w-2.5 h-2.5" />
                      <span>Discuter</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => handleScrollStories('right')}
            className="p-1 rounded-full bg-white dark:bg-[#1a2033] border border-gray-200 dark:border-gray-700 shadow-sm text-gray-600 dark:text-gray-300 hover:text-pink-500 cursor-pointer hidden sm:flex items-center justify-center flex-shrink-0 ml-2 z-10"
            title="Défiler à droite"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* UNIFIED SUB-NAVIGATION TABS BAR (Visible & Accessible Everywhere) */}
      <nav className="bg-white dark:bg-[#131624] border-b border-gray-200 dark:border-[#1f2438] px-4 sm:px-6 flex items-center justify-between text-xs font-bold flex-shrink-0 z-10 shadow-xs">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={handleOpenAllCreators}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center space-x-2 flex-shrink-0 ${activeTab === 'creators'
              ? 'border-pink-600 text-pink-600 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-500/5'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Users className="w-4 h-4 text-pink-500" />
            <span>⭐ Nos Créatrices ({creators.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('posts');
              sounds.playReceive();
              setTimeout(() => {
                mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              }, 30);
            }}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center space-x-2 flex-shrink-0 ${activeTab === 'posts'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5 font-extrabold'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>📰 Posts ({posts.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('feed');
              sounds.playReceive();
            }}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center space-x-2 flex-shrink-0 ${activeTab === 'feed'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <ImageIcon className="w-4 h-4 text-blue-500" />
            <span>📸 Profil & Publications ({activeCreator.name.split(' ')[0]}) ({displayedPosts.length})</span>
          </button>

          <button
            onClick={() => handleStartChatWithCreator(activeCreator.id)}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center space-x-2 flex-shrink-0 ${activeTab === 'chat'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/5'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>💬 Discussion Privée</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          <button
            onClick={() => {
              setActiveTab('subscribe');
              sounds.playReceive();
            }}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center space-x-2 flex-shrink-0 ${activeTab === 'subscribe'
              ? 'border-amber-500 text-amber-500 bg-amber-50/50 dark:bg-amber-500/5'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>👑 Formules VIP</span>
          </button>
        </div>

        {/* Current Active Creator Indicator */}
        <div
          onClick={() => handleOpenCreatorProfile(activeCreator.id)}
          className="hidden md:flex items-center space-x-2 text-[11px] text-gray-400 pl-4 cursor-pointer hover:opacity-80 transition-opacity"
          title={`Voir le profil de ${activeCreator.name}`}
        >
          <span>Modèle sélectionnée :</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">{activeCreator.name}</span>
          <img src={activeCreator.avatar} alt={activeCreator.name} className="w-5 h-5 rounded-full object-cover border" />
        </div>
      </nav>

      {/* MAIN SINGLE SCROLLABLE WORKSPACE */}
      <main
        ref={mainScrollRef}
        className="flex-1 overflow-y-auto min-h-0 bg-[#f3f4f8] dark:bg-[#0c0e17]"
      >
        {/* VIEW 1: CREATORS / AVATARS DIRECTORY (No giant Margot banner blocking!) */}
        {activeTab === 'creators' && (
          <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
            <div className="text-center max-w-xl mx-auto my-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Réseau Officiel CactusClub</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Choisissez votre Créatrice Privée
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                Discutez en tête-à-tête avec votre modèle préférée, accédez à ses photos et vidéos exclusives en 4K et recevez des réponses personnalisées chaque jour.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
              {creators.map((c) => {
                const isSelected = c.id === activeCreator.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleOpenCreatorProfile(c.id)}
                    className={`rounded-3xl bg-white dark:bg-[#131624] border-2 transition-all duration-300 overflow-hidden shadow-xs flex flex-col justify-between group cursor-pointer ${isSelected
                      ? 'border-pink-500 shadow-lg shadow-pink-500/10 ring-2 ring-pink-500/20'
                      : 'border-gray-200/90 dark:border-[#1e2338] hover:border-pink-500 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-0.5'
                      }`}
                  >
                    <div>
                      {/* Mini Cover */}
                      <div className="h-32 w-full relative overflow-hidden bg-gradient-to-r from-pink-500 to-indigo-600">
                        <img
                          src={c.coverUrl || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80'}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"></div>

                        {/* Badge VIP / Catégorie */}
                        <div className="absolute top-2.5 right-2.5 pointer-events-none">
                          <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white shadow-xs border border-white/10">
                            {c.category || 'VIP'}
                          </span>
                        </div>

                        {/* Overlay hover prompt */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-2xs">
                          <span className="px-3 py-1 rounded-full bg-white/90 text-gray-900 text-[11px] font-bold shadow-md flex items-center space-x-1">
                            <ImageIcon className="w-3 h-3 text-pink-500" />
                            <span>Voir le profil & publications</span>
                          </span>
                        </div>
                      </div>

                      {/* Avatar & Identité */}
                      <div className="px-5 pb-3 relative">
                        {/* Avatar & Subscriber Row - Zero Overlap */}
                        <div className="flex items-center justify-between mb-2">
                          {/* Avatar pulling up on cover */}
                          <div className="-mt-10 relative p-0.5 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 shadow-xl">
                            <img
                              src={c.avatar}
                              alt={c.name}
                              className="w-18 h-18 rounded-full object-cover border-2 border-white dark:border-[#131624]"
                            />
                            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131624] animate-pulse"></span>
                          </div>

                          {/* Subscriber Count Badge (Cleanly inside card body, 0 overlap) */}
                          <div className="text-right pt-2">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#1f253d] text-gray-700 dark:text-gray-300 text-xs font-bold shadow-2xs">
                              <span className="font-mono-numbers text-pink-600 dark:text-pink-400 font-extrabold">{c.subscribersCount || '25k'}</span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">abonnés</span>
                            </span>
                          </div>
                        </div>

                        {/* Name & Handle */}
                        <div className="flex items-center space-x-1.5 mt-1">
                          <h3 className="font-black text-base text-gray-900 dark:text-white group-hover:text-pink-500 transition-colors">
                            {c.name}
                          </h3>
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-xs text-gray-400 font-mono-numbers block">
                          {c.handle}
                        </span>

                        {/* Response Speed & Rating Pill Row */}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Réponse {c.responseSpeed || '~2 min'}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                            ★ {c.rating || 4.9}
                          </span>
                        </div>

                        {/* Bio */}
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-2.5 leading-relaxed">
                          {c.bio}
                        </p>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-5 pt-0 flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartChatWithCreator(c.id);
                        }}
                        className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Discuter en Privé</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreatorProfile(c.id);
                        }}
                        className="py-2.5 px-3 rounded-2xl bg-gray-100 hover:bg-pink-500 hover:text-white dark:bg-[#1f253d] dark:hover:bg-pink-600 text-gray-700 dark:text-gray-200 font-bold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                        title="Voir son profil et ses publications"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Profil</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW: ALL POSTS STREAM (Flux global de toutes les publications) */}
        {activeTab === 'posts' && (
          <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full pb-16">
            {/* Header banner for All Posts */}
            <div className="text-center max-w-xl mx-auto my-3">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Flux Global CactusClub</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Toutes les Publications ({posts.length})
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Explorez en exclusivité les photos, vidéos et coulisses privées partagées par toutes nos créatrices VIP.
              </p>
            </div>

            {/* Posts Stream */}
            <div className="space-y-6">
              {posts.map((post) => {
                const postCreator = creators.find((c) => c.id === post.creatorId) || activeCreator;
                return (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-[#131624] rounded-3xl border border-gray-200/90 dark:border-[#1e2338] shadow-xs overflow-hidden"
                  >
                    {/* Post Header */}
                    <div className="p-4 flex items-center justify-between">
                      <div
                        onClick={() => handleOpenCreatorProfile(postCreator.id)}
                        className="flex items-center space-x-3 cursor-pointer group"
                      >
                        <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 shadow-sm">
                          <img
                            src={postCreator.avatar}
                            alt={postCreator.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-[#131624]"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-pink-500 transition-colors">
                              {postCreator.name}
                            </span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold">
                              {postCreator.category || 'VIP'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-gray-400">
                            <span>{postCreator.handle}</span>
                            <span>•</span>
                            <span>{post.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenCreatorProfile(postCreator.id)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-pink-500 hover:text-white dark:bg-[#1a2033] dark:hover:bg-pink-600 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        Voir profil
                      </button>
                    </div>

                    {/* Post Caption */}
                    <div className="px-4 pb-3 text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                      {post.caption}
                    </div>

                    {/* Post Media Attachment */}
                    <div className="relative overflow-hidden bg-black/90">
                      {post.isLocked ? (
                        /* Locked Post Preview */
                        <div className="relative">
                          <img
                            src={post.mediaUrl}
                            alt="Locked preview"
                            className="w-full max-h-96 object-cover blur-2xl opacity-40 scale-105"
                          />
                          <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 shadow-xl animate-pulse">
                              <Lock className="w-7 h-7" />
                            </div>
                            <span className="font-black text-sm uppercase tracking-wider text-amber-300">
                              Publication Privée VIP
                            </span>
                            <span className="text-2xl font-black font-mono-numbers text-white my-1">
                              ${post.price?.toFixed(2) || '19.99'}
                            </span>
                            <p className="text-xs text-gray-300 max-w-xs mb-3">
                              Débloquez instantanément ce contenu exclusif pour toujours.
                            </p>

                            <button
                              onClick={() => handleUnlockPost(post)}
                              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
                            >
                              <Unlock className="w-4 h-4" />
                              <span>Débloquer ce Post (${post.price?.toFixed(2)})</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Unlocked Full Post */
                        <img
                          src={post.mediaUrl}
                          alt="Post media"
                          onClick={() => onOpenLightbox(post.mediaUrl, post.caption)}
                          className="w-full max-h-[500px] object-cover cursor-pointer hover:scale-101 transition-transform duration-300"
                        />
                      )}
                    </div>

                    {/* Post Interactions Footer */}
                    <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-[#1c2238] text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center space-x-1.5 cursor-pointer transition-colors ${
                            post.isLiked ? 'text-pink-600 font-bold' : 'hover:text-pink-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-pink-600 text-pink-600' : ''}`} />
                          <span className="font-mono-numbers">{post.likesCount}</span>
                        </button>

                        <button
                          onClick={() => setCommentingPost(post)}
                          className="flex items-center space-x-1.5 hover:text-blue-500 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-mono-numbers">{post.commentsCount}</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStartChatWithCreator(postCreator.id)}
                          className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 font-bold cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Discuter avec elle</span>
                        </button>
                        <button
                          onClick={() => setIsTipOpen(true)}
                          className="flex items-center space-x-1 text-pink-500 hover:text-pink-600 font-bold cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          <span>Pourboire</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: ACTIVE CREATOR PROFILE SHOWCASE BANNER & PUBLICATIONS FEED */}
        {activeTab === 'feed' && (
          <div className="w-full">
            {/* Creator Profile Showcase Banner */}
            <div className="bg-white dark:bg-[#131624] border-b border-gray-200 dark:border-[#1f2438]">
              {/* Cover Banner */}
              <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700">
                <img
                  src={activeCreator.coverUrl || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1400&q=80'}
                  alt={`${activeCreator.name} Cover`}
                  className="w-full h-full object-cover opacity-80 hover:scale-101 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Back to all creators button */}
                <div className="absolute top-3 left-4 z-10">
                  <button
                    onClick={handleOpenAllCreators}
                    className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Toutes les créatrices</span>
                  </button>
                </div>
              </div>

              {/* Profile Info Row */}
              <div className="px-6 pb-5 relative max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 sm:-mt-16 mb-4 gap-4">
                  {/* Avatar with Story Gradient Ring */}
                  <div className="flex items-end space-x-4">
                    <div className="relative p-1 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400 shadow-2xl">
                      <img
                        src={activeCreator.avatar}
                        alt={activeCreator.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-[#131624]"
                      />
                      <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131624] animate-pulse"></span>
                    </div>

                    <div className="pb-1">
                      <div className="flex items-center space-x-1.5">
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                          {activeCreator.name}
                        </h1>
                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs shadow-sm">
                          ✓
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {activeCreator.handle} • <span className="text-pink-500 font-bold">{activeCreator.category || 'VIP'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => handleStartChatWithCreator(activeCreator.id)}
                      className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Discuter en Privé</span>
                    </button>

                    <button
                      onClick={() => setIsTipOpen(true)}
                      className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Pourboire</span>
                    </button>

                    {!fanUser.isSubscribed && (
                      <button
                        onClick={() => setIsSubOpen(true)}
                        className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                      >
                        <Crown className="w-4 h-4" />
                        <span>S'abonner ($9.99)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Bio & Stats */}
                <p className="text-xs text-gray-700 dark:text-gray-300 max-w-2xl leading-relaxed">
                  {activeCreator.bio || 'Bienvenue dans mon univers intime et exclusif 🇫🇷 Je réponds personnellement à tous mes messages privés chaque jour. Débloquez mes photos & vidéos exclusives en 4K, mes mémos vocaux et mes coulisses de tournages ! ✨'}
                </p>

                {/* Creator Numbers Strip */}
                <div className="flex items-center space-x-6 mt-4 pt-3 border-t border-gray-100 dark:border-[#1d2338] text-xs">
                  <div>
                    <span className="font-black text-gray-900 dark:text-white font-mono-numbers">
                      {displayedPosts.length}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">Publications</span>
                  </div>
                  <div>
                    <span className="font-black text-gray-900 dark:text-white font-mono-numbers">
                      {activeCreator.subscribersCount || '28.4k'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">Abonnés</span>
                  </div>
                  <div>
                    <span className="font-black text-gray-900 dark:text-white font-mono-numbers">
                      {activeCreator.responseSpeed || '~2 min'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">Réponse moy.</span>
                  </div>
                  <div>
                    <span className="font-black text-amber-500 font-mono-numbers">
                      ★ {activeCreator.rating || 4.9}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">Avis VIP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Feed Area */}
            <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full pb-16">
              {displayedPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white dark:bg-[#131624] rounded-3xl border border-gray-200/90 dark:border-[#1e2338] shadow-xs overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={activeCreator.avatar}
                        alt={activeCreator.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-gray-900 dark:text-white">{activeCreator.name}</span>
                          <span className="text-[10px] text-blue-500">✓</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{post.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Caption */}
                  <div className="px-4 pb-3 text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                    {post.caption}
                  </div>

                  {/* Post Media Attachment */}
                  <div className="relative overflow-hidden bg-black/90">
                    {post.isLocked ? (
                      /* Locked Post Preview */
                      <div className="relative">
                        <img
                          src={post.mediaUrl}
                          alt="Locked preview"
                          className="w-full max-h-96 object-cover blur-2xl opacity-40 scale-105"
                        />
                        <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 shadow-xl animate-pulse">
                            <Lock className="w-7 h-7" />
                          </div>
                          <span className="font-black text-sm uppercase tracking-wider text-amber-300">
                            Publication Privée VIP
                          </span>
                          <span className="text-2xl font-black font-mono-numbers text-white my-1">
                            ${post.price?.toFixed(2) || '19.99'}
                          </span>
                          <p className="text-xs text-gray-300 max-w-xs mb-3">
                            Débloquez instantanément ce contenu exclusif pour toujours.
                          </p>

                          <button
                            onClick={() => handleUnlockPost(post)}
                            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
                          >
                            <Unlock className="w-4 h-4" />
                            <span>Débloquer ce Post (${post.price?.toFixed(2)})</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Unlocked Full Post */
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        onClick={() => onOpenLightbox(post.mediaUrl, post.caption)}
                        className="w-full max-h-[500px] object-cover cursor-pointer hover:scale-101 transition-transform duration-300"
                      />
                    )}
                  </div>

                  {/* Post Interactions Footer */}
                  <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-[#1c2238] text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center space-x-1.5 cursor-pointer transition-colors ${post.isLiked ? 'text-pink-600 font-bold' : 'hover:text-pink-500'
                          }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-pink-600 text-pink-600' : ''}`} />
                        <span className="font-mono-numbers">{post.likesCount}</span>
                      </button>

                      <button
                        onClick={() => setCommentingPost(post)}
                        className="flex items-center space-x-1.5 hover:text-blue-500 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-mono-numbers">{post.commentsCount}</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStartChatWithCreator(activeCreator.id)}
                        className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 font-bold cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Discuter</span>
                      </button>
                      <button
                        onClick={() => setIsTipOpen(true)}
                        className="flex items-center space-x-1 text-pink-500 hover:text-pink-600 font-bold cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>Pourboire</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: LIVE CHAT VIEW WITH CURRENT CREATOR */}
        {activeTab === 'chat' && (
          <div className="h-full flex overflow-hidden">
            <FanChatView
              creator={activeCreator}
              creators={creators}
              activeCreatorId={activeCreator.id}
              onSelectCreator={(cId) => {
                setSelectedCreatorId(cId);
                onSelectCreator?.(cId);
              }}
              fanUser={fanUser}
              messages={messages}
              onSendMessage={onSendMessageFromFan}
              onUnlockPPV={onUnlockPPV}
              onOpenTipModal={() => setIsTipOpen(true)}
              onOpenLightbox={onOpenLightbox}
              onOpenSubscribeModal={() => setIsSubOpen(true)}
            />
          </div>
        )}

        {/* VIEW 4: VIP SUBSCRIPTION FORMULAS */}
        {activeTab === 'subscribe' && (
          <div className="p-6 max-w-4xl mx-auto w-full pb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Choisissez votre formule VIP pour {activeCreator.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                Rejoignez les abonnés privilégiés et discutez chaque jour en tête-à-tête avec elle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Pass 1 Mois',
                  price: 9.99,
                  desc: 'Idéal pour découvrir les coulisses et papoter en direct.',
                  badge: null,
                },
                {
                  name: 'Pass 3 Mois',
                  price: 24.99,
                  desc: 'Notre formule la plus populaire auprès des fans réguliers.',
                  badge: '20% DE RÉDUCTION',
                },
                {
                  name: 'VIP Élite 1 An',
                  price: 79.99,
                  desc: 'Accès prioritaire garanti + Tous les teasers mensuels offerts.',
                  badge: 'LE MEILLEUR CHOIX',
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-white dark:bg-[#131624] border-2 border-gray-200 dark:border-[#222942] hover:border-blue-500 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {plan.badge && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-pink-500 to-purple-600 text-white mb-2">
                        {plan.badge}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    <div className="text-3xl font-black font-mono-numbers text-blue-600 dark:text-blue-400 my-2">
                      ${plan.price}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{plan.desc}</p>
                  </div>

                  <button
                    onClick={() => setIsSubOpen(true)}
                    className="w-full mt-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Sélectionner cette formule
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Fan Modals */}
      <FanAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          onUpdateFanUser?.(user);
          setIsAuthOpen(false);
        }}
      />

      <FanSubscribeModal
        isOpen={isSubOpen}
        onClose={() => setIsSubOpen(false)}
        fanUser={fanUser}
        creator={activeCreator}
        onSubscribeSuccess={(tier, price) => {
          onSubscribe(tier, price);
          setActiveTab('chat');
        }}
        onOpenWalletModal={() => setIsWalletOpen(true)}
      />

      <FanTipModal
        isOpen={isTipOpen}
        onClose={() => setIsTipOpen(false)}
        fanUser={fanUser}
        onSendTip={onSendTip}
      />

      <FanWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        fanUser={fanUser}
        onTopUp={onTopUpWallet}
      />

      <FanCommentsModal
        isOpen={!!commentingPost}
        onClose={() => setCommentingPost(null)}
        post={commentingPost}
        fanUser={fanUser}
        onAddCommentSuccess={(postId) => {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
            )
          );
        }}
      />
    </div>
  );
};
