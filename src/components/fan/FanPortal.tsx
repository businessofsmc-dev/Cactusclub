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
  CheckCircle2
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
  onNavigateToOperator: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToLogin?: () => void;
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
  onNavigateToOperator,
  onNavigateToAdmin,
  onNavigateToLogin,
  onOpenLightbox,
  darkMode,
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'creators' | 'feed' | 'chat' | 'subscribe'>('creators');
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

  const currentCreatorId = activeCreatorId || creator.id;

  // Filter posts for active creator, fallback to all if none exist
  const creatorPosts = posts.filter((p) => p.creatorId === currentCreatorId);
  const displayedPosts = creatorPosts.length > 0 ? creatorPosts : posts;

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
        {/* Brand & Role Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 font-black text-sm">
              CC
            </div>
            <span className="font-black text-sm tracking-tight text-gray-900 dark:text-white">
              CactusClub
            </span>
          </div>

          {/* Quick Role Switcher Pills */}
          <div className="hidden md:flex items-center space-x-1 p-1 rounded-xl bg-gray-100 dark:bg-[#1a2033] text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#252b45] text-pink-600 dark:text-pink-400 font-bold shadow-xs">
              👑 Espace Fan
            </span>
            <button
              onClick={onNavigateToOperator}
              className="px-2.5 py-1 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              💬 Chatter Desk ↗
            </button>
            <button
              onClick={onNavigateToAdmin}
              className="px-2.5 py-1 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              📊 Admin ↗
            </button>
            {onNavigateToLogin && (
              <button
                onClick={onNavigateToLogin}
                className="px-2.5 py-1 rounded-lg text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
              >
                🔐 Page Connexion
              </button>
            )}
          </div>
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
              Créatrices VIP en Direct ({creators.length})
            </h2>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold">
              Cliquez pour discuter en tête-à-tête
            </span>
          </div>

          <button
            onClick={handleOpenAllCreators}
            className={`text-xs font-bold transition-all px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer ${
              activeTab === 'creators'
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
            {creators.map((c) => {
              const isSelected = c.id === currentCreatorId;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    if (onSelectCreator) onSelectCreator(c.id);
                    sounds.playReceive();
                  }}
                  className={`flex flex-col items-center flex-shrink-0 group cursor-pointer transition-all duration-200 ${
                    isSelected ? 'scale-105' : 'hover:scale-102 opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Avatar with Animated Gradient Story Ring */}
                  <div className="relative p-0.5">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-300 ${
                        isSelected
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
                      className={`text-[11px] font-bold truncate max-w-[80px] ${
                        isSelected ? 'text-pink-600 dark:text-pink-400 font-extrabold' : 'text-gray-800 dark:text-gray-200'
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
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center space-x-2 flex-shrink-0 ${
              activeTab === 'creators'
                ? 'border-pink-600 text-pink-600 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-500/5'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-pink-500" />
            <span>⭐ Nos Créatrices ({creators.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('feed');
              sounds.playReceive();
            }}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center space-x-2 flex-shrink-0 ${
              activeTab === 'feed'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-blue-500" />
            <span>📸 Profil & Publications ({displayedPosts.length})</span>
          </button>

          <button
            onClick={() => handleStartChatWithCreator(creator.id)}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center space-x-2 flex-shrink-0 ${
              activeTab === 'chat'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/5'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>💬 Discussion en Direct</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          <button
            onClick={() => {
              setActiveTab('subscribe');
              sounds.playReceive();
            }}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center space-x-2 flex-shrink-0 ${
              activeTab === 'subscribe'
                ? 'border-amber-500 text-amber-500 bg-amber-50/50 dark:bg-amber-500/5'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>👑 Formules VIP</span>
          </button>
        </div>

        {/* Current Active Creator Indicator */}
        <div className="hidden md:flex items-center space-x-2 text-[11px] text-gray-400 pl-4">
          <span>Modèle sélectionnée :</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">{creator.name}</span>
          <img src={creator.avatar} alt={creator.name} className="w-5 h-5 rounded-full object-cover border" />
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
                const isSelected = c.id === currentCreatorId;
                return (
                  <div
                    key={c.id}
                    className={`rounded-3xl bg-white dark:bg-[#131624] border-2 transition-all duration-300 overflow-hidden shadow-xs flex flex-col justify-between group ${
                      isSelected
                        ? 'border-pink-500 shadow-lg shadow-pink-500/10 ring-2 ring-pink-500/20'
                        : 'border-gray-200/90 dark:border-[#1e2338] hover:border-pink-400/60 hover:shadow-md'
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
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white shadow-xs">
                          {c.category || 'VIP'}
                        </span>
                      </div>

                      {/* Avatar & Identité */}
                      <div className="px-5 pb-3 relative">
                        <div className="flex items-end justify-between -mt-12 mb-2">
                          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 shadow-xl">
                            <img
                              src={c.avatar}
                              alt={c.name}
                              className="w-18 h-18 rounded-full object-cover border-2 border-white dark:border-[#131624]"
                            />
                            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131624] animate-pulse"></span>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] font-bold text-emerald-500 flex items-center justify-end space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{c.responseSpeed || '~2 min'}</span>
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {c.subscribersCount || '25k'} abonnés
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 mt-1">
                          <h3 className="font-black text-base text-gray-900 dark:text-white">
                            {c.name}
                          </h3>
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-xs text-gray-400 font-mono-numbers block">
                          {c.handle}
                        </span>

                        {/* Bio */}
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 mt-2.5 leading-relaxed">
                          {c.bio}
                        </p>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-5 pt-0 flex items-center space-x-2">
                      <button
                        onClick={() => handleStartChatWithCreator(c.id)}
                        className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Discuter en Privé</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onSelectCreator) onSelectCreator(c.id);
                          setActiveTab('feed');
                          sounds.playReceive();
                          setTimeout(() => {
                            mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                          }, 50);
                        }}
                        className="px-3.5 py-2.5 rounded-2xl bg-gray-100 dark:bg-[#1f253d] hover:bg-gray-200 dark:hover:bg-[#272f4d] text-gray-800 dark:text-gray-200 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
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

        {/* VIEW 2: ACTIVE CREATOR PROFILE SHOWCASE BANNER & PUBLICATIONS FEED */}
        {activeTab === 'feed' && (
          <div className="w-full">
            {/* Creator Profile Showcase Banner */}
            <div className="bg-white dark:bg-[#131624] border-b border-gray-200 dark:border-[#1f2438]">
              {/* Cover Banner */}
              <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700">
                <img
                  src={creator.coverUrl || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1400&q=80'}
                  alt={`${creator.name} Cover`}
                  className="w-full h-full object-cover opacity-75 hover:scale-101 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>

              {/* Profile Info Row */}
              <div className="px-6 pb-5 relative max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 sm:-mt-16 mb-4 gap-4">
                  {/* Avatar with Story Gradient Ring */}
                  <div className="flex items-end space-x-4">
                    <div className="relative p-1 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400 shadow-2xl">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-[#131624]"
                      />
                      <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131624] animate-pulse"></span>
                    </div>

                    <div className="pb-1">
                      <div className="flex items-center space-x-1.5">
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                          {creator.name}
                        </h1>
                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs shadow-sm">
                          ✓
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {creator.handle} • <span className="text-pink-500 font-bold">{creator.category || 'Top 0.05%'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => handleStartChatWithCreator(creator.id)}
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
                  {creator.bio || 'Bienvenue dans mon univers intime et exclusif 🇫🇷 Je réponds personnellement à tous mes messages privés chaque jour. Débloquez mes photos & vidéos exclusives en 4K, mes mémos vocaux et mes coulisses de tournages ! ✨'}
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
                      {creator.subscribersCount || '28.4k'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">Abonnés</span>
                  </div>
                  <div>
                    <span className="font-black text-gray-900 dark:text-white font-mono-numbers">
                      {creator.responseSpeed || '~2 min'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">Réponse moy.</span>
                  </div>
                  <div>
                    <span className="font-black text-amber-500 font-mono-numbers">
                      ★ {creator.rating || 4.9}
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
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-gray-900 dark:text-white">{creator.name}</span>
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
                        onClick={() => handleStartChatWithCreator(creator.id)}
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
              creator={creator}
              creators={creators}
              activeCreatorId={currentCreatorId}
              onSelectCreator={onSelectCreator}
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
                Choisissez votre formule VIP pour {creator.name}
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
        creator={creator}
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
