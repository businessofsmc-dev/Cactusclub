import React, { useState } from 'react';
import { 
  Users, 
  Bell, 
  ChevronDown, 
  ArrowUpDown, 
  Search, 
  Image, 
  Mic, 
  X,
  Volume2,
  Send,
  Radio
} from 'lucide-react';
import type { CreatorAccount, Fan } from '../types/crm';
import { useLanguage } from '../i18n/LanguageContext';

interface SidebarInboxProps {
  currentAccount: CreatorAccount;
  fans: Fan[];
  selectedFanId: string;
  onSelectFan: (fanId: string) => void;
  activeFilter: 'all' | 'pinned' | 'priority' | 'unread' | 'tips';
  onChangeFilter: (filter: 'all' | 'pinned' | 'priority' | 'unread' | 'tips') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenGallery?: () => void;
  onSendVoiceMemo?: (duration: string) => void;
  onOpenBroadcast?: () => void;
}

export const SidebarInbox: React.FC<SidebarInboxProps> = ({
  currentAccount,
  fans,
  selectedFanId,
  onSelectFan,
  activeFilter,
  onChangeFilter,
  searchQuery,
  onSearchChange,
  onOpenGallery,
  onSendVoiceMemo,
  onOpenBroadcast,
}) => {
  const { t } = useLanguage();
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(0);

  // Audio recording simulation
  const toggleRecord = () => {
    if (!isRecordingAudio) {
      setIsRecordingAudio(true);
      setAudioSeconds(0);
      const timer = setInterval(() => {
        setAudioSeconds((s) => {
          if (s >= 15) {
            clearInterval(timer);
            setIsRecordingAudio(false);
            return 0;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      setIsRecordingAudio(false);
      if (audioSeconds > 0 && onSendVoiceMemo) {
        const durStr = `0:${audioSeconds < 10 ? `0${audioSeconds}` : audioSeconds}`;
        onSendVoiceMemo(durStr);
      }
      setAudioSeconds(0);
    }
  };

  // Filter fans based on search & filter category
  const filteredFans = fans.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.lastMessageSnippet.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (activeFilter === 'pinned') return f.isPinned;
    if (activeFilter === 'priority') return f.isPriority;
    if (activeFilter === 'unread') return (f.unreadCount && f.unreadCount > 0) || f.hasUnreadDot;
    if (activeFilter === 'tips') return f.hasTips || f.totalSpend > 0;
    return true;
  });

  return (
    <aside className="w-[305px] flex-shrink-0 flex flex-col h-full bg-[#f8f9fb] dark:bg-[#121522] border-r border-gray-200 dark:border-[#222738] select-none transition-colors duration-200">
      {/* Creator Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-200 dark:border-[#202538] bg-white dark:bg-[#151926]">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <img
              src={currentAccount.avatar}
              alt={currentAccount.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-500/40 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#151926]"></span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {currentAccount.name}
            </h2>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              {currentAccount.handle}
            </span>
          </div>
        </div>

        {/* Quick actions for creator vault & broadcast */}
        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
          <button 
            onClick={onOpenGallery}
            title={t.gallery}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#20263b] hover:text-blue-500 transition-colors cursor-pointer"
          >
            <Image className="w-4 h-4" />
          </button>
          <button 
            onClick={onOpenBroadcast}
            title={t.broadcastCampaign}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#20263b] hover:text-blue-500 transition-colors cursor-pointer"
          >
            <Radio className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Action Buttons: Online Fans & Notifications */}
      <div className="p-3 grid grid-cols-2 gap-2">
        <button 
          onClick={onOpenBroadcast}
          title={t.onlineFans}
          className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer active:scale-98"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="truncate">{t.onlineFans} ({currentAccount.onlineFansCount})</span>
        </button>

        <button 
          onClick={() => onChangeFilter('unread')}
          title={t.notifications}
          className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer active:scale-98"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="truncate">{t.notifications} ({currentAccount.notificationsCount})</span>
        </button>
      </div>

      {/* Inboxes Dropdown & Sorting Options */}
      <div className="flex items-center justify-between px-3 py-1 text-xs text-gray-600 dark:text-gray-400">
        <div className="relative group cursor-pointer">
          <div className="flex items-center space-x-1 py-1 px-1.5 rounded hover:bg-gray-200/60 dark:hover:bg-white/5 font-medium">
            <span>{t.allInboxes}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>
        </div>

        <div className="relative group cursor-pointer">
          <div className="flex items-center space-x-1 py-1 px-1.5 rounded hover:bg-gray-200/60 dark:hover:bg-white/5 font-medium">
            <ArrowUpDown className="w-3 h-3 text-gray-400" />
            <span>{t.newestFirst}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filter Chips Pills */}
      <div className="flex items-center space-x-1 px-2.5 py-1.5 overflow-x-auto no-scrollbar border-b border-gray-200/80 dark:border-[#1e2335]">
        <button
          onClick={() => onChangeFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#2563eb] text-white shadow-xs'
              : 'bg-gray-200/70 dark:bg-[#1a1f2e] text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#252b40]'
          }`}
        >
          {t.all}
        </button>

        <button
          onClick={() => onChangeFilter('pinned')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeFilter === 'pinned'
              ? 'bg-[#2563eb] text-white shadow-xs'
              : 'bg-gray-200/70 dark:bg-[#1a1f2e] text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#252b40]'
          }`}
        >
          <span>{t.pinned}</span>
          <span className="flex items-center justify-center h-3.5 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white">
            99+
          </span>
        </button>

        <button
          onClick={() => onChangeFilter('priority')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeFilter === 'priority'
              ? 'bg-[#2563eb] text-white shadow-xs'
              : 'bg-gray-200/70 dark:bg-[#1a1f2e] text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#252b40]'
          }`}
        >
          {t.priority}
        </button>

        <button
          onClick={() => onChangeFilter('unread')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeFilter === 'unread'
              ? 'bg-[#2563eb] text-white shadow-xs'
              : 'bg-gray-200/70 dark:bg-[#1a1f2e] text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#252b40]'
          }`}
        >
          <span>{t.unread}</span>
          <span className="flex items-center justify-center h-3.5 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white">
            2
          </span>
        </button>

        <button
          onClick={() => onChangeFilter('tips')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeFilter === 'tips'
              ? 'bg-[#2563eb] text-white shadow-xs'
              : 'bg-gray-200/70 dark:bg-[#1a1f2e] text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#252b40]'
          }`}
        >
          {t.withTips}
        </button>
      </div>

      {/* Quick Search Input */}
      <div className="px-3 pt-2 pb-1">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#181d2c] border border-gray-200 dark:border-[#22283d] text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Fan Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {filteredFans.map((fan) => {
          const isSelected = fan.id === selectedFanId;
          const hasSpend = fan.totalSpend > 0;
          return (
            <div
              key={fan.id}
              onClick={() => onSelectFan(fan.id)}
              className={`group relative flex items-center p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 dark:bg-[#1d2338] shadow-xs border border-blue-200/80 dark:border-blue-500/30'
                  : 'hover:bg-white/80 dark:hover:bg-[#171b29] border border-transparent'
              }`}
            >
              {/* Left Column: Avatar & Spend Badge */}
              <div className="relative flex-shrink-0 flex flex-col items-center mr-2.5">
                {fan.avatar ? (
                  <img
                    src={fan.avatar}
                    alt={fan.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-white/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#252b40] flex items-center justify-center text-gray-500 dark:text-gray-300 font-semibold text-xs border border-gray-300/40 dark:border-white/5">
                    {fan.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Spend badge underneath avatar */}
                <div className="mt-1">
                  <span
                    className={`font-mono-numbers text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      hasSpend
                        ? fan.totalSpend > 500
                          ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-semibold'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    ${fan.totalSpend}
                  </span>
                </div>
              </div>

              {/* Middle Column: Fan Info & Message Preview */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-baseline justify-between mb-0.5">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isSelected
                          ? 'text-blue-700 dark:text-blue-300 font-bold'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {fan.name}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                      {fan.handle}
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono-numbers flex-shrink-0 ml-1">
                    {fan.lastMessageTime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate group-hover:text-gray-900 dark:group-hover:text-gray-200">
                    {fan.lastMessageSnippet}
                  </p>

                  {/* Unread indicator red dot */}
                  {(fan.hasUnreadDot || (fan.unreadCount && fan.unreadCount > 0)) && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 ml-1 flex-shrink-0 shadow-xs"></span>
                  )}
                </div>
              </div>

              {/* Quick Dismiss Button (x) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                title="Dismiss"
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-500 transition-opacity ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Audio Voice Recorder (Bottom Left) */}
      <div className="p-2.5 border-t border-gray-200/80 dark:border-[#202538] bg-white/70 dark:bg-[#141824] flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <button
            onClick={toggleRecord}
            className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
              isRecordingAudio
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'bg-gray-100 dark:bg-[#1f2538] text-gray-600 dark:text-gray-300 hover:text-blue-500'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          {isRecordingAudio ? (
            <div className="flex items-center justify-between flex-1 pr-1">
              <div className="flex items-center space-x-1.5 text-xs text-rose-500 font-bold font-mono-numbers">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>00:{audioSeconds < 10 ? `0${audioSeconds}` : audioSeconds}</span>
              </div>
              <button
                onClick={toggleRecord}
                className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>{t.send}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Volume2 className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px]">{t.instantVoiceMemo}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
