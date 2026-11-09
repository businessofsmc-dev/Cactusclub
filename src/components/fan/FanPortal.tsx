import React, { useState } from 'react';
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
  Wallet 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import type { CreatorAccount, ChatMessage, FanUser, CreatorPost } from '../../types/crm';
import { INITIAL_CREATOR_POSTS } from '../../data/mockData';
import { FanChatView } from './FanChatView';
import { FanAuthModal } from './FanAuthModal';
import { FanSubscribeModal } from './FanSubscribeModal';
import { FanTipModal } from './FanTipModal';

interface FanPortalProps {
  creator: CreatorAccount;
  fanUser: FanUser;
  messages: ChatMessage[];
  onSendMessageFromFan: (text: string) => void;
  onUnlockPPV: (messageId: string, price: number) => boolean;
  onSendTip: (amount: number, message: string) => void;
  onSubscribe: (tier: 'monthly' | 'quarterly' | 'vip', price: number) => void;
  onTopUpWallet: (amount: number) => void;
  onUpdateFanUser?: (user: FanUser) => void;
  onNavigateToOperator: () => void;
  onNavigateToAdmin: () => void;
  onOpenLightbox: (url: string, title?: string, price?: number) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const FanPortal: React.FC<FanPortalProps> = ({
  creator,
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
  onOpenLightbox,
  darkMode,
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'subscribe'>('feed');
  const [posts, setPosts] = useState<CreatorPost[]>(INITIAL_CREATOR_POSTS);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [isTipOpen, setIsTipOpen] = useState(false);

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
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#252b45] text-blue-600 dark:text-blue-400 font-bold shadow-xs">
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
          </div>
        </div>

        {/* Fan Balance & User Controls */}
        <div className="flex items-center space-x-3">
          {/* Wallet Balance Pill */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono-numbers">
            <Wallet className="w-3.5 h-3.5" />
            <span>${fanUser.walletBalance.toFixed(2)}</span>
            <button
              onClick={() => onTopUpWallet(50)}
              title="Ajouter $50 au solde"
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

      {/* Main Fan Workspace Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Center Main Column: Profile & Feed OR Live Chat */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto">
          {/* Creator Profile Showcase Banner */}
          <div className="bg-white dark:bg-[#131624] border-b border-gray-200 dark:border-[#1f2438]">
            {/* Cover Banner */}
            <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700">
              <img
                src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1400&q=80"
                alt="Margot Cover"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            </div>

            {/* Profile Info Row */}
            <div className="px-6 pb-5 relative">
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
                      {creator.handle} • <span className="text-pink-500 font-bold">Top 0.05%</span>
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-[#1f253d] hover:bg-gray-200 dark:hover:bg-[#272f4d] text-gray-900 dark:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 text-blue-500" />
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
                      className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                    >
                      <Crown className="w-4 h-4" />
                      <span>S'abonner ($9.99)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bio & Stats */}
              <p className="text-xs text-gray-700 dark:text-gray-300 max-w-2xl leading-relaxed">
                Bienvenue dans mon univers intime et exclusif 🇫🇷 Je réponds personnellement à tous mes messages privés chaque jour. Débloquez mes photos & vidéos exclusives en 4K, mes mémos vocaux et mes coulisses de tournages ! ✨
              </p>

              {/* Creator Numbers Strip */}
              <div className="flex items-center space-x-6 mt-4 pt-3 border-t border-gray-100 dark:border-[#1d2338] text-xs">
                <div>
                  <span className="font-black text-gray-900 dark:text-white font-mono-numbers">1,240</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">Publications</span>
                </div>
                <div>
                  <span className="font-black text-gray-900 dark:text-white font-mono-numbers">28.4k</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">Abonnés</span>
                </div>
                <div>
                  <span className="font-black text-gray-900 dark:text-white font-mono-numbers">98.4k</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">J'aime</span>
                </div>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex items-center px-6 border-t border-gray-200 dark:border-[#1f2438] text-xs font-bold">
              <button
                onClick={() => setActiveTab('feed')}
                className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
                  activeTab === 'feed'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Publications ({posts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
                  activeTab === 'chat'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Discussion en Direct</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>

              <button
                onClick={() => setActiveTab('subscribe')}
                className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
                  activeTab === 'subscribe'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>Formules VIP</span>
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'feed' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full">
                {posts.map((post) => (
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
                          onClick={() => setActiveTab('chat')}
                          className="flex items-center space-x-1.5 hover:text-blue-500 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-mono-numbers">{post.commentsCount}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setIsTipOpen(true)}
                        className="flex items-center space-x-1 text-pink-500 hover:text-pink-600 font-bold cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>Envoyer un Pourboire</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex-1 flex overflow-hidden">
                <FanChatView
                  creator={creator}
                  fanUser={fanUser}
                  messages={messages}
                  onSendMessage={onSendMessageFromFan}
                  onUnlockPPV={onUnlockPPV}
                  onOpenTipModal={() => setIsTipOpen(true)}
                  onOpenLightbox={onOpenLightbox}
                />
              </div>
            )}

            {activeTab === 'subscribe' && (
              <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                    Choisissez votre formule VIP
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                    Rejoignez plus de 28,000 abonnés privilégiés et discutez chaque jour en privé avec Margot.
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
          </div>
        </main>
      </div>

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
        onSubscribeSuccess={onSubscribe}
      />

      <FanTipModal
        isOpen={isTipOpen}
        onClose={() => setIsTipOpen(false)}
        fanUser={fanUser}
        onSendTip={onSendTip}
      />
    </div>
  );
};

