import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Pencil, 
  Star, 
  FileText, 
  Image as ImageIcon, 
  Search, 
  Languages, 
  ExternalLink, 
  RotateCw, 
  MoreVertical,
  Paperclip,
  Calendar,
  DollarSign,
  AtSign,
  Type,
  Send,
  Lock,
  Clock,
  CheckCheck,
  Heart,
  Share2,
  Zap,
  Play,
  Pause,
  CheckCircle2,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import type { Fan, ChatMessage, CannedScript } from '../types/crm';
import { FREQUENT_EMOJIS, CANNED_SCRIPTS } from '../data/mockData';
import { useLanguage } from '../i18n/LanguageContext';

interface ChatAreaProps {
  fan: Fan;
  messages: ChatMessage[];
  onSendMessage: (text: string, media?: { type: 'image' | 'video'; url: string; price?: number }) => void;
  activeChatter: string;
  sfwMode: boolean;
  onOpenScriptsModal: () => void;
  onOpenPPVModal: () => void;
  onOpenVaultModal: () => void;
  onOpenGifModal?: () => void;
  onOpenScheduleModal?: () => void;
  onOpenLightbox?: (mediaUrl: string, title?: string, price?: number) => void;
  onToggleStarFan?: () => void;
  onSimulateUnlock?: (msgId: string, price: number) => void;
  onUpdateNickname?: (newName: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  fan,
  messages,
  onSendMessage,
  activeChatter,
  sfwMode,
  onOpenScriptsModal,
  onOpenPPVModal,
  onOpenVaultModal,
  onOpenGifModal,
  onOpenScheduleModal,
  onOpenLightbox,
  onToggleStarFan,
  onSimulateUnlock,
  onUpdateNickname,
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [customNickname, setCustomNickname] = useState(fan.name);
  const [isStarred, setIsStarred] = useState(fan.isPinned || false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [translatedMap, setTranslatedMap] = useState<Record<string, boolean>>({});

  // In-chat Find Search state
  const [showFindBar, setShowFindBar] = useState(false);
  const [findQuery, setFindQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keep customNickname in sync when fan changes
  useEffect(() => {
    setCustomNickname(fan.name);
    setIsStarred(fan.isPinned || false);
  }, [fan]);

  // Handle typing & "/" slash command detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (val.startsWith('/')) {
      setShowSlashMenu(true);
      setSlashFilter(val.slice(1).toLowerCase());
      setSelectedSlashIndex(0);
    } else {
      setShowSlashMenu(false);
    }
  };

  const matchingScripts = CANNED_SCRIPTS.filter((s) =>
    s.title.toLowerCase().includes(slashFilter) ||
    s.text.toLowerCase().includes(slashFilter) ||
    s.tags.some((t) => t.toLowerCase().includes(slashFilter))
  );

  // Submit message
  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setShowSlashMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSlashMenu && matchingScripts.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSlashIndex((prev) => (prev + 1) % matchingScripts.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSlashIndex((prev) => (prev - 1 + matchingScripts.length) % matchingScripts.length);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        handleSelectScript(matchingScripts[selectedSlashIndex]);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Insert emoji
  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Insert canned script
  const handleSelectScript = (script: CannedScript) => {
    setInputText(script.text);
    setShowSlashMenu(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Save nickname
  const handleSaveNickname = () => {
    setIsEditingNickname(false);
    if (onUpdateNickname && customNickname.trim()) {
      onUpdateNickname(customNickname.trim());
    }
  };

  // Toggle voice playback simulation
  const togglePlayAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 5000);
    }
  };

  // Toggle inline translation
  const toggleTranslation = (id: string) => {
    setTranslatedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Find matches count
  const findMatches = findQuery.trim()
    ? messages.filter((m) => m.text.toLowerCase().includes(findQuery.toLowerCase()))
    : [];

  return (
    <main className="flex-1 flex flex-col h-full bg-white dark:bg-[#10131d] overflow-hidden relative select-text transition-colors duration-200">
      {/* Top Chat Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-[#1e2335] bg-white/95 dark:bg-[#131622]/95 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          {/* Back button */}
          <button className="p-1 rounded-md text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Fan Name with Inline Editing */}
          <div className="flex items-center space-x-1.5">
            {isEditingNickname ? (
              <input
                type="text"
                value={customNickname}
                onChange={(e) => setCustomNickname(e.target.value)}
                onBlur={handleSaveNickname}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                autoFocus
                className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1c2236] px-2 py-0.5 rounded border border-blue-500 outline-hidden"
              />
            ) : (
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {customNickname}
              </span>
            )}

            <button
              onClick={() => setIsEditingNickname(!isEditingNickname)}
              title="Edit Fan Nickname"
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Header Action Icons */}
          <div className="flex items-center space-x-1 text-gray-400 pl-1 border-l border-gray-200 dark:border-[#202538]">
            <button
              onClick={() => {
                setIsStarred(!isStarred);
                if (onToggleStarFan) onToggleStarFan();
              }}
              title="Bookmark / Pin Fan"
              className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                isStarred ? 'text-amber-400' : 'hover:text-amber-400'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              title="Fan Notes"
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenVaultModal}
              title={t.gallery}
              className="flex items-center space-x-1 px-1.5 py-1 rounded-md text-xs hover:bg-gray-100 dark:hover:bg-white/5 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">{t.gallery}</span>
            </button>

            {/* In-Chat Find Button */}
            <button
              onClick={() => setShowFindBar(!showFindBar)}
              title={t.find}
              className={`flex items-center space-x-1 px-1.5 py-1 rounded-md text-xs hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                showFindBar ? 'text-blue-500 font-bold bg-blue-50/50 dark:bg-blue-500/10' : 'hover:text-blue-400'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">{t.find}</span>
            </button>

            <button
              title="Live Translator"
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <button className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-blue-500 hover:text-blue-600 dark:text-blue-400 transition-colors cursor-pointer">
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">{t.openInNewTab}</span>
          </button>

          <button
            title="Refresh stream"
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            title="More options"
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* In-Chat Find Search Toolbar */}
      {showFindBar && (
        <div className="px-4 py-2 bg-blue-50/90 dark:bg-[#161c2d] border-b border-blue-200/80 dark:border-blue-500/20 flex items-center justify-between z-10 animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-blue-500" />
            <input
              type="text"
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              placeholder="Search words in conversation..."
              autoFocus
              className="w-full text-xs px-2 py-1 rounded-lg bg-white dark:bg-[#111420] border border-blue-300 dark:border-blue-500/40 text-gray-900 dark:text-white outline-hidden"
            />
            {findQuery && (
              <span className="text-[10px] font-mono-numbers text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {findMatches.length} {t.results}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => {
                setShowFindBar(false);
                setFindQuery('');
              }}
              className="p-1 text-gray-400 hover:text-rose-500 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Messages Stream Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${sfwMode ? 'sfw-active' : ''}`}>
        {/* Campaign Broadcast Quote Card (Matches original screenshot) */}
        <div className="max-w-md mx-auto my-2 p-3.5 rounded-xl bg-gray-50 dark:bg-[#161a27] border border-gray-200 dark:border-[#23293e] shadow-xs text-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Margotdulacoff, Oct 31 1:18 PM
            </span>
            <span className="text-[10px] font-mono-numbers text-gray-400">{t.broadcastCampaign}</span>
          </div>
          <p className="italic text-gray-700 dark:text-gray-300 sfw-blur leading-relaxed">
            "tu ferais quoi si je te disais que j'pense à toi sous ma douche? 😜"
          </p>
          <div className="mt-2 text-right">
            <button className="text-[11px] font-semibold text-blue-500 hover:text-blue-400 hover:underline cursor-pointer">
              {t.viewMessage}
            </button>
          </div>
        </div>

        {/* Dynamic Message History */}
        {messages.map((msg) => {
          const isCreator = msg.sender === 'creator';
          const isTranslated = !!translatedMap[msg.id];
          const isHighlighted = findQuery.trim() && msg.text.toLowerCase().includes(findQuery.toLowerCase());

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 group ${
                isCreator ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Fan Avatar (When sender is fan) */}
              {!isCreator && (
                <div className="relative flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-rose-600 to-indigo-700 p-0.5 shadow-sm">
                    <div className="w-full h-full rounded-full bg-[#121522] flex items-center justify-center text-white text-[10px] font-bold">
                      🐺
                    </div>
                  </div>
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                className={`relative max-w-[70%] sm:max-w-[60%] flex flex-col ${
                  isCreator ? 'items-end' : 'items-start'
                }`}
              >
                {/* Bubble */}
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs transition-all duration-150 ${
                    isHighlighted ? 'ring-2 ring-yellow-400 shadow-lg' : ''
                  } ${
                    isCreator
                      ? 'bg-blue-600 text-white rounded-tr-xs shadow-blue-500/10'
                      : 'bg-gray-100 dark:bg-[#1a1f2f] text-gray-800 dark:text-gray-100 border border-gray-200/70 dark:border-[#282f45] rounded-tl-xs'
                  }`}
                >
                  {/* Voice note waveform player */}
                  {msg.isVoiceNote ? (
                    <div className="flex items-center space-x-2.5 py-1 min-w-[180px]">
                      <button
                        onClick={() => togglePlayAudio(msg.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isCreator
                            ? 'bg-white text-blue-600 hover:bg-white/90'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {playingAudioId === msg.id ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 flex items-center space-x-0.5 h-6">
                        {[40, 70, 30, 90, 60, 80, 45, 100, 65, 35, 75, 50, 85, 30, 95].map(
                          (val, idx) => (
                            <span
                              key={idx}
                              style={{ height: `${val}%` }}
                              className={`w-1 rounded-full transition-all duration-150 ${
                                playingAudioId === msg.id
                                  ? isCreator
                                    ? 'bg-white animate-pulse'
                                    : 'bg-blue-500 animate-pulse'
                                  : isCreator
                                  ? 'bg-white/60'
                                  : 'bg-gray-400 dark:bg-gray-500'
                              }`}
                            />
                          )
                        )}
                      </div>

                      <span className="text-[10px] font-mono-numbers opacity-80">
                        {msg.audioDuration || '0:18'}
                      </span>
                    </div>
                  ) : (
                    <p className="sfw-blur select-text">{msg.text}</p>
                  )}

                  {/* Inline Translation if active */}
                  {isTranslated && (
                    <div className="mt-1.5 pt-1.5 border-t border-white/20 text-[11px] text-blue-100 dark:text-blue-300 italic">
                      {t.translatedFrom} "
                      {msg.text.includes('douche')
                        ? 'what would you do if I told you I am thinking of you in the shower? 😜'
                        : msg.text.includes('sais pas')
                        ? 'I do not know'
                        : msg.text.includes('ça va')
                        ? 'Hummmm how are you doing??'
                        : msg.text.includes('quoi de beau')
                        ? 'What are you up to??'
                        : msg.text}
                      "
                    </div>
                  )}

                  {/* PPV / Media Attachment */}
                  {msg.media && (
                    <div 
                      onClick={() => {
                        const media = msg.media;
                        if (onOpenLightbox && media && (!media.isLocked || msg.isUnlockedPPV)) {
                          onOpenLightbox(media.url, msg.text, media.price);
                        }
                      }}
                      className="mt-2 rounded-lg overflow-hidden border border-white/20 relative cursor-pointer"
                    >
                      <img
                        src={msg.media.url}
                        alt="media attachment"
                        className={`w-full max-h-48 object-cover ${sfwMode ? 'sfw-blur' : ''}`}
                      />
                      {msg.media.isLocked ? (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute inset-0 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center text-white p-3 text-center"
                        >
                          <Lock className="w-5 h-5 text-amber-400 mb-1" />
                          <span className="font-bold text-xs">{t.ppvLocked}</span>
                          <span className="text-sm font-mono-numbers font-bold text-amber-300 my-0.5">
                            ${msg.media.price}
                          </span>

                          {/* Quick simulate unlock button for testing */}
                          {onSimulateUnlock && (
                            <button
                              onClick={() => onSimulateUnlock(msg.id, msg.media?.price || 15)}
                              className="mt-2 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold shadow-md cursor-pointer transition-transform hover:scale-105"
                            >
                              {t.simulateUnlock}
                            </button>
                          )}
                        </div>
                      ) : (
                        msg.isUnlockedPPV && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center space-x-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t.unlocked} (${msg.media.price})</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Metadata: Timestamp & Chatter Operator Name */}
                <div className="flex items-center space-x-1.5 mt-1 px-1 text-[10px] text-gray-400">
                  <span className="font-mono-numbers">{msg.timestamp}</span>

                  {isCreator && (
                    <>
                      <CheckCheck className="w-3 h-3 text-blue-400" />
                      <span className="font-semibold text-blue-500 dark:text-blue-300 uppercase tracking-wider text-[9px] bg-blue-500/10 dark:bg-blue-400/10 px-1 py-0.2 rounded">
                        {msg.chatterName || activeChatter}
                      </span>
                    </>
                  )}
                </div>

                {/* Hover Quick Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 text-gray-400 mt-0.5 px-1">
                  <button title="Quote message" className="p-0.5 hover:text-blue-400">
                    <Share2 className="w-3 h-3" />
                  </button>
                  <button title="Heart reaction" className="p-0.5 hover:text-rose-400">
                    <Heart className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => toggleTranslation(msg.id)}
                    title="Translate"
                    className={`p-0.5 hover:text-emerald-400 ${
                      isTranslated ? 'text-emerald-500 font-bold' : ''
                    }`}
                  >
                    <Languages className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Slash Command Menu */}
      {showSlashMenu && (
        <div className="absolute bottom-28 left-4 right-4 max-w-lg bg-white dark:bg-[#181d2e] rounded-xl shadow-2xl border border-gray-200 dark:border-[#2b334d] p-2 z-30 max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#22283d] mb-1">
            <span className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.matchingScripts}</span>
            </span>
            <span className="text-[10px] font-mono-numbers">{matchingScripts.length} {t.results}</span>
          </div>

          <div className="space-y-1">
            {matchingScripts.length > 0 ? (
              matchingScripts.map((script, idx) => {
                const isSelected = selectedSlashIndex === idx;
                return (
                  <div
                    key={script.id}
                    onClick={() => handleSelectScript(script)}
                    className={`flex flex-col p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                        : 'hover:bg-blue-50 dark:hover:bg-[#20273f]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {script.title}
                      </span>
                      {script.price && (
                        <span className="text-[10px] font-mono-numbers bg-amber-500/20 text-amber-500 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">
                          ${script.price}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {script.text}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 py-3 text-center">
                No scripts matching "/{slashFilter}". Open Scripts library to see all.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Interactive Bottom Control Section */}
      <footer className="border-t border-gray-200 dark:border-[#1e2335] bg-gray-50/90 dark:bg-[#131622]/90 backdrop-blur-md p-2.5">
        {/* Quick Emoji Ribbon & Scripts / Schedule Buttons */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-[#1e2335] mb-2">
          {/* Emojis scroll row */}
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5 text-base select-none">
            {FREQUENT_EMOJIS.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => handleEmojiClick(emoji)}
                className="hover:scale-125 transition-transform duration-100 p-1 rounded hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Action buttons: Scripts & Schedule */}
          <div className="flex items-center space-x-1.5 pl-2 flex-shrink-0">
            <button
              onClick={onOpenScriptsModal}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-500/30 transition-all cursor-pointer active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.scripts}</span>
            </button>

            <button
              onClick={onOpenScheduleModal}
              title="Schedule Message"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Text Input Area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t.inputPlaceholder}
            className="w-full resize-none p-2.5 text-xs sm:text-[13px] rounded-xl bg-white dark:bg-[#181d2c] border border-gray-200 dark:border-[#252c42] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Lower Toolbar */}
        <div className="flex items-center justify-between pt-2">
          {/* Media & Tools */}
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <button
              title="Attach File / Photo"
              className="p-1.5 rounded-md hover:bg-gray-200/60 dark:hover:bg-white/5 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenGifModal}
              title="Insert GIF"
              className="px-1.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider hover:bg-gray-200/60 dark:hover:bg-white/5 hover:text-blue-500 transition-colors cursor-pointer"
            >
              GIF
            </button>

            <button
              onClick={onOpenVaultModal}
              title={t.gallery}
              className="p-1.5 rounded-md hover:bg-gray-200/60 dark:hover:bg-white/5 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenScheduleModal}
              title="Schedule for date"
              className="p-1.5 rounded-md hover:bg-gray-200/60 dark:hover:bg-white/5 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
            </button>

            {/* PPV Price Tag Lock Button */}
            <button
              onClick={onOpenPPVModal}
              title="Lock with PPV Price ($)"
              className="flex items-center space-x-0.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold border border-amber-500/30 transition-all cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>PPV</span>
            </button>

            <button
              title="Mention @"
              className="p-1.5 rounded-md hover:bg-gray-200/60 dark:hover:bg-white/5 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <AtSign className="w-4 h-4" />
            </button>

            <button
              title="Formatting Aa"
              className="p-1.5 rounded-md hover:bg-gray-200/60 dark:hover:bg-white/5 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <Type className="w-4 h-4" />
            </button>

            <button
              title="Auto Translate"
              className="p-1.5 rounded-md hover:bg-gray-200/60 dark:hover:bg-white/5 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <Languages className="w-4 h-4" />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all duration-150 cursor-pointer ${
              inputText.trim()
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 active:scale-98'
                : 'bg-blue-400/40 text-white/50 cursor-not-allowed'
            }`}
          >
            <span>{t.send}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>
    </main>
  );
};
