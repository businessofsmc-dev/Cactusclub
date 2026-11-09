import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Smile, 
  Lock, 
  Unlock, 
  Heart, 
  Play, 
  Pause, 
  Sparkles, 
  ShieldCheck, 
  Check,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import type { ChatMessage, FanUser, CreatorAccount } from '../../types/crm';
import { FREQUENT_EMOJIS } from '../../data/mockData';

interface FanChatViewProps {
  creator: CreatorAccount;
  creators?: CreatorAccount[];
  activeCreatorId?: string;
  onSelectCreator?: (creatorId: string) => void;
  fanUser: FanUser;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onUnlockPPV: (messageId: string, price: number) => boolean;
  onOpenTipModal: () => void;
  onOpenLightbox: (url: string, title?: string, price?: number) => void;
  onOpenSubscribeModal?: () => void;
}

export const FanChatView: React.FC<FanChatViewProps> = ({
  creator,
  creators,
  onSelectCreator,
  fanUser,
  messages,
  onSendMessage,
  onUnlockPPV,
  onOpenTipModal,
  onOpenLightbox,
  onOpenSubscribeModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasAccessToChat = fanUser.isSubscribed || fanUser.subscriptionTier === 'free';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // If user hasn't chosen an active plan (free or vip), prompt to subscribe
    if (!hasAccessToChat && onOpenSubscribeModal) {
      onOpenSubscribeModal();
      return;
    }

    onSendMessage(inputText.trim());
    setInputText('');
    sounds.playSend();
  };

  /**
   * RÈGLE MÉTIER & SÉCURITÉ STRICTE :
   * Les fans n'ont AUCUN droit d'envoyer des photos, vidéos ou fichiers.
   * Seuls les administrateurs et les modèles ont l'autorisation d'envoyer des médias.
   */
  const handleBlockedFileUpload = (e: React.DragEvent | React.ClipboardEvent) => {
    e.preventDefault();
    sounds.playReceive();
    alert("Sécurité CactusClub : L'envoi de photos, vidéos ou fichiers n'est pas autorisé pour les fans. Seules les créatrices et l'administration peuvent partager des médias.");
  };

  const handleUnlockClick = (msgId: string, price: number) => {
    const success = onUnlockPPV(msgId, price);
    if (success) {
      sounds.playCash();
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6, x: 0.5 },
        colors: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981'],
      });
    }
  };

  const toggleAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      sounds.playReceive();
      setTimeout(() => setPlayingAudioId(null), 4000);
    }
  };

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleBlockedFileUpload}
      className="flex-1 flex flex-col h-full bg-[#f8f9fc] dark:bg-[#0f121d] overflow-hidden select-none"
    >
      {/* Chat Room Top Bar */}
      <div className="h-16 px-6 bg-white dark:bg-[#151926] border-b border-gray-200 dark:border-[#22273b] flex items-center justify-between z-10 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-pink-500 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#151926] animate-pulse"></span>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">{creator.name}</h3>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-blue-500 text-white">VIP</span>
            </div>
            <p className="text-[11px] text-emerald-500 font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>En ligne • Répond rapidement</span>
            </p>
          </div>
        </div>

        {/* Tip & Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenTipModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Envoyer un Pourboire</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      {/* Quick Creator Avatar Switcher Ribbon */}
      {creators && creators.length > 0 && (
        <div className="px-4 sm:px-6 py-2 bg-gray-50/90 dark:bg-[#121522] border-b border-gray-200/80 dark:border-[#1d2235] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
          <div className="flex items-center space-x-1.5 flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <span>Changer de créatrice :</span>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {creators.map((c) => {
              const isCurrent = c.id === creator.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    if (onSelectCreator) {
                      onSelectCreator(c.id);
                      sounds.playReceive();
                    }
                  }}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs scale-102'
                      : 'bg-white dark:bg-[#1a2033] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#232b45] border border-gray-200/60 dark:border-[#2b3552]'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <span>{c.name.split(' ')[0]}</span>
                  {isCurrent && <span className="text-[10px]">💬</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Subscription Plan State Banner */}
        {!hasAccessToChat ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-blue-500/15 border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-2.5 text-xs">
              <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">
                  Abonnez-vous pour écrire à {creator.name}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Choisissez votre formule : Découverte Gratuite ($0) ou VIP Premium Illimité ($9.99/m).
                </span>
              </div>
            </div>

            <button
              onClick={onOpenSubscribeModal}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Choisir un Plan d'Abonnement</span>
            </button>
          </div>
        ) : fanUser.subscriptionTier === 'free' ? (
          <div className="p-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold">Plan Découverte Gratuit actif</span>
              <span className="text-gray-400 text-[11px] hidden sm:inline">• Discussion ouverte</span>
            </div>

            <button
              onClick={onOpenSubscribeModal}
              className="text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Passer en VIP Illimité ($9.99) ↗</span>
            </button>
          </div>
        ) : null}

        {/* Encrypted Notice */}
        <div className="max-w-xs mx-auto text-center p-2 rounded-xl bg-gray-100 dark:bg-[#1a2033] text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1 border border-gray-200/60 dark:border-[#262e47]">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Discussion privée et sécurisée avec {creator.name}.</span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender === 'fan';
          const isUnlocked = msg.isUnlockedPPV || (msg.media && fanUser.unlockedMediaIds.includes(msg.id));

          return (
            <div
              key={msg.id}
              className={`flex items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
                />
              )}

              <div className={`max-w-xs sm:max-w-md flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed relative shadow-xs ${
                    isMe
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-[#1a2033] border border-gray-200/70 dark:border-[#262e47] text-gray-800 dark:text-gray-100 rounded-bl-xs'
                  }`}
                >
                  {/* Quoted Message / Broadcast Card */}
                  {msg.quotedMessage && (
                    <div className="mb-2 p-2 rounded-lg bg-black/10 dark:bg-white/5 border-l-2 border-pink-500 text-[11px] italic">
                      <span className="font-bold block not-italic">{msg.quotedMessage.creatorHandle} :</span>
                      {msg.quotedMessage.text}
                    </div>
                  )}

                  {/* Text content */}
                  {msg.text && <p>{msg.text}</p>}

                  {/* Audio Memo */}
                  {msg.isVoiceNote && (
                    <div className="flex items-center space-x-2.5 mt-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                      <button
                        onClick={() => toggleAudio(msg.id)}
                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                      >
                        {playingAudioId === msg.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center space-x-1 h-4">
                          {[30, 60, 40, 80, 50, 70, 90, 45, 65, 30, 75, 40, 85].map((h, i) => (
                            <div
                              key={i}
                              style={{ height: `${h}%` }}
                              className={`w-1 rounded-full ${playingAudioId === msg.id ? 'bg-blue-500 animate-pulse' : 'bg-gray-400/40'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono-numbers block mt-0.5">
                          {msg.audioDuration || '0:24'} • Message vocal privé
                        </span>
                      </div>
                    </div>
                  )}

                  {/* PPV / Media Attachment */}
                  {msg.media && (
                    <div className="mt-2.5 rounded-xl overflow-hidden border border-gray-200/60 dark:border-white/10 relative">
                      {msg.media.isLocked && !isUnlocked ? (
                        /* Locked PPV Card */
                        <div className="relative group overflow-hidden bg-gray-900 rounded-xl">
                          <img
                            src={msg.media.url}
                            alt="Locked PPV preview"
                            className="w-full max-h-56 object-cover blur-xl opacity-60 scale-105"
                          />
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2 shadow-lg animate-pulse">
                              <Lock className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                              Contenu Privé Exclusif
                            </span>
                            <span className="text-xl font-black font-mono-numbers text-white my-1">
                              ${msg.media.price?.toFixed(2) || '25.00'}
                            </span>

                            <button
                              onClick={() => handleUnlockClick(msg.id, msg.media?.price || 25)}
                              className="mt-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer"
                            >
                              <Unlock className="w-4 h-4" />
                              <span>Débloquer le Média (${msg.media.price || 25})</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Unlocked Full Media */
                        <div
                          onClick={() => onOpenLightbox(msg.media?.url || '', msg.text, msg.media?.price)}
                          className="cursor-pointer group relative overflow-hidden rounded-xl"
                        >
                          <img
                            src={msg.media.url}
                            alt="Media"
                            className="w-full max-h-64 object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Débloqué</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp & Status */}
                <div className="flex items-center space-x-1 text-[10px] text-gray-400 mt-1 px-1">
                  <span>{msg.timestamp}</span>
                  {isMe && <Check className="w-3 h-3 text-blue-500" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Bar */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-white dark:bg-[#151926] border-t border-gray-200 dark:border-[#22273b] flex items-center space-x-1 overflow-x-auto">
          {FREQUENT_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-lg cursor-pointer transition-transform hover:scale-120"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Bottom Bar */}
      <div className="p-4 bg-white dark:bg-[#151926] border-t border-gray-200 dark:border-[#22273b]">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenTipModal}
            title="Envoyer un Pourboire"
            className="p-2 rounded-xl text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-colors cursor-pointer"
          >
            <Heart className="w-5 h-5 fill-pink-500/20" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onPaste={(e) => {
              if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
                handleBlockedFileUpload(e);
              }
            }}
            onClick={() => {
              if (!hasAccessToChat && onOpenSubscribeModal) {
                onOpenSubscribeModal();
              }
            }}
            placeholder={
              !hasAccessToChat
                ? `Abonnez-vous (Gratuit ou VIP) pour écrire à ${creator.name}...`
                : fanUser.subscriptionTier === 'free'
                ? `Message découverte à ${creator.name}...`
                : `Écrire un message privé VIP à ${creator.name}...`
            }
            className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-[#1e2438] text-gray-900 dark:text-white text-xs outline-hidden focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />

          <button
            type="submit"
            disabled={!hasAccessToChat ? false : !inputText.trim()}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:opacity-40 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title={!hasAccessToChat ? "S'abonner pour envoyer" : "Envoyer le message"}
          >
            {!hasAccessToChat ? <Crown className="w-4 h-4 text-amber-300" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

