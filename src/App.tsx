import { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { SidebarInbox } from './components/SidebarInbox';
import { ChatArea } from './components/ChatArea';
import { FanInsights } from './components/FanInsights';
import { AdminDashboard } from './components/AdminDashboard';
import { ScriptsModal } from './components/ScriptsModal';
import { PPVModal } from './components/PPVModal';
import { VaultModal } from './components/VaultModal';
import { BroadcastModal } from './components/BroadcastModal';
import { GifModal } from './components/GifModal';
import { ScheduleModal } from './components/ScheduleModal';
import { AddAccountModal } from './components/AddAccountModal';
import { SettingsModal } from './components/SettingsModal';
import { MediaLightbox } from './components/MediaLightbox';
import { ToastContainer } from './components/Toast';
import { sounds } from './utils/sound';
import { LanguageProvider } from './i18n/LanguageContext';
import { 
  CREATOR_ACCOUNTS, 
  INITIAL_FANS, 
  INITIAL_MESSAGES_VALENTIN, 
  CHATTER_TEAM,
  INITIAL_FAN_USER 
} from './data/mockData';
import type { Fan, ChatMessage, CannedScript, ToastMessage, CreatorAccount, FanUser } from './types/crm';
import { FanPortal } from './components/fan/FanPortal';

export type AppView = 'dashboard' | 'messages' | 'fan';

const getViewFromLocation = (): AppView => {
  if (typeof window === 'undefined') return 'fan';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path.startsWith('/admin') || path.startsWith('/dashboard') || hash.includes('/admin') || hash.includes('/dashboard')) {
    return 'dashboard';
  }
  if (path.startsWith('/messages') || path.startsWith('/operator') || path.startsWith('/chat') || hash.includes('/messages') || hash.includes('/chat')) {
    return 'messages';
  }
  // Default to Fan Portal for all visitors on / or /fan or /club:
  return 'fan';
};

function DashboardApp() {
  // Navigation View: 'dashboard' (Admin Overview), 'messages' (Messages Pro Live Chat) or 'fan' (Fan/Visitor Experience)
  const [currentView, setCurrentView] = useState<AppView>(getViewFromLocation);

  // Synchronize URL and history when navigating
  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    let targetPath = '/';
    if (view === 'dashboard') targetPath = '/admin';
    else if (view === 'messages') targetPath = '/messages';
    else targetPath = '/';

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view }, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getViewFromLocation());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global & Theme State
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [sfwMode, setSfwMode] = useState<boolean>(false);

  // Accounts & Shift Operators
  const [accounts, setAccounts] = useState<CreatorAccount[]>(CREATOR_ACCOUNTS);
  const [activeAccountId, setActiveAccountId] = useState<string>('margot');
  const [activeChatter, setActiveChatter] = useState<string>('Nella');

  // Fans & Conversations
  const [fans, setFans] = useState<Fan[]>(INITIAL_FANS);
  const [selectedFanId, setSelectedFanId] = useState<string>('valentin');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pinned' | 'priority' | 'unread' | 'tips'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fan User (Visitor session profile)
  const [fanUser, setFanUser] = useState<FanUser>(INITIAL_FAN_USER);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Messages per fan
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({
    valentin: INITIAL_MESSAGES_VALENTIN,
    robin: [
      {
        id: 'r1',
        sender: 'fan',
        text: "T'es làà toi ? 😍",
        timestamp: '1:35 pm',
      },
    ],
    naughtyboy69: [
      {
        id: 'nb1',
        sender: 'fan',
        text: 'Coucou toi, tu as 2 minutes pour discuter ?',
        timestamp: '1:35 pm',
      },
    ],
    lulu: [
      {
        id: 'l1',
        sender: 'creator',
        chatterName: 'SIMON',
        text: 'Coucou mon grand, tu as pu regarder les nouvelles photos ?',
        timestamp: '1:10 pm',
        status: 'read',
      },
      {
        id: 'l2',
        sender: 'fan',
        text: 'Je sais mais je dois prioriser tu sais...',
        timestamp: '1:34 pm',
      },
    ],
    hydras: [
      {
        id: 'h1',
        sender: 'fan',
        text: 'Hey salut bb',
        timestamp: '1:31 pm',
      },
      {
        id: 'h2',
        sender: 'creator',
        chatterName: 'Nella',
        text: 'Coucou toi mon VIP préféré ! Comment tu vas aujourd’hui ? ❤️',
        timestamp: '1:33 pm',
        status: 'read',
      },
    ],
    alex: [
      {
        id: 'a1',
        sender: 'fan',
        text: 'Trop hâte du nouveau shooting !',
        timestamp: '1:25 pm',
      },
    ],
  });

  // Modals state
  const [isScriptsOpen, setIsScriptsOpen] = useState(false);
  const [isPPVOpen, setIsPPVOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isGifOpen, setIsGifOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Lightbox state
  const [lightboxData, setLightboxData] = useState<{ isOpen: boolean; url: string; title?: string; price?: number }>({
    isOpen: false,
    url: '',
  });

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const currentAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];
  const selectedFan = fans.find((f) => f.id === selectedFanId) || fans[0];
  const currentMessages = messagesMap[selectedFanId] || [];

  // Send message
  const handleSendMessage = (
    text: string,
    media?: { type: 'image' | 'video'; url: string; price?: number },
    isVoiceNote?: boolean,
    audioDuration?: string
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'creator',
      chatterName: activeChatter,
      text,
      timestamp: timeStr,
      status: 'delivered',
      isVoiceNote,
      audioDuration,
      media: media ? {
        type: media.type,
        url: media.url,
        isLocked: !!media.price,
        price: media.price,
      } : undefined,
    };

    sounds.playSend();

    setMessagesMap((prev) => ({
      ...prev,
      [selectedFanId]: [...(prev[selectedFanId] || []), newMsg],
    }));

    // Update snippet in fan list
    setFans((prev) =>
      prev.map((f) =>
        f.id === selectedFanId
          ? {
              ...f,
              lastMessageSnippet: isVoiceNote ? '🎙️ Voice note memo' : text,
              lastMessageTime: timeStr,
            }
          : f
      )
    );

    // If sending PPV, simulate unlock after 4 seconds
    if (media?.price) {
      setTimeout(() => {
        handleSimulateUnlock(newMsg.id, media.price || 15);
      }, 4000);
    }

    // Simulated Fan smart automated response after 2.5 seconds (if not PPV)
    if (selectedFanId === 'valentin' && !media?.price) {
      setTimeout(() => {
        const replies = [
          'Haha trop hâte de voir ça 🥰',
          'Tu es sublime comme toujours !',
          'Dis-moi quand tu es dispo en vocal ?',
          'Trop mignonne, je te réponds vite ! 🙈',
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();

        const fanReply: ChatMessage = {
          id: `fan-reply-${Date.now()}`,
          sender: 'fan',
          text: randomReply,
          timestamp: replyTime,
        };

        sounds.playReceive();

        setMessagesMap((prev) => ({
          ...prev,
          valentin: [...(prev.valentin || []), fanReply],
        }));

        setFans((prev) =>
          prev.map((f) =>
            f.id === 'valentin'
              ? {
                  ...f,
                  lastMessageSnippet: randomReply,
                  lastMessageTime: replyTime,
                }
              : f
          )
        );
      }, 2500);
    }
  };

  // Simulate Fan PPV Unlock
  const handleSimulateUnlock = (msgId: string, price: number) => {
    sounds.playCash();

    // Mark message as unlocked
    setMessagesMap((prev) => {
      const fanMsgs = prev[selectedFanId] || [];
      return {
        ...prev,
        [selectedFanId]: fanMsgs.map((m) =>
          m.id === msgId && m.media
            ? {
                ...m,
                isUnlockedPPV: true,
                media: { ...m.media, isLocked: false },
              }
            : m
        ),
      };
    });

    // Update Fan Spend CRM statistics
    setFans((prev) =>
      prev.map((f) => {
        if (f.id === selectedFanId) {
          const newTotal = f.totalSpend + price;
          return {
            ...f,
            totalSpend: newTotal,
            spendingBehavior: {
              ...f.spendingBehavior,
              totalSpend: newTotal,
              lastSpend: {
                timeAgo: 'Just now',
                type: 'PPV',
                amount: price,
              },
              ppvTotal: f.spendingBehavior.ppvTotal + price,
            },
            salesHistory: [
              {
                id: `sale-${Date.now()}`,
                date: 'Just now',
                title: 'Contenu exclusif débloqué',
                type: 'PPV',
                amount: price,
                status: 'Unlocked',
              },
              ...f.salesHistory,
            ],
          };
        }
        return f;
      })
    );

    addToast({
      type: 'ppv',
      title: 'PPV Unlocked!',
      description: `${selectedFan.name} unlocked your PPV media.`,
      amount: price,
    });
  };

  // Simulate Fan sending a Tip
  const handleSimulateTip = (amount: number) => {
    sounds.playCash();

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();

    const tipMsg: ChatMessage = {
      id: `tip-${Date.now()}`,
      sender: 'fan',
      text: `💸 Sent a $${amount} tip! "Pour toi mon rayon de soleil ❤️"`,
      timestamp: timeStr,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedFanId]: [...(prev[selectedFanId] || []), tipMsg],
    }));

    setFans((prev) =>
      prev.map((f) => {
        if (f.id === selectedFanId) {
          const newTotal = f.totalSpend + amount;
          return {
            ...f,
            totalSpend: newTotal,
            hasTips: true,
            spendingBehavior: {
              ...f.spendingBehavior,
              totalSpend: newTotal,
              tipTotal: f.spendingBehavior.tipTotal + amount,
              tipAvg: Math.round((f.spendingBehavior.tipTotal + amount) / 2),
              lastSpend: {
                timeAgo: 'Just now',
                type: 'Tip',
                amount,
              },
            },
            salesHistory: [
              {
                id: `tip-sale-${Date.now()}`,
                date: 'Just now',
                title: `Tip surprise de soutien ($${amount})`,
                type: 'Tip',
                amount,
                status: 'Unlocked',
              },
              ...f.salesHistory,
            ],
          };
        }
        return f;
      })
    );

    addToast({
      type: 'tip',
      title: 'New Tip Received!',
      description: `${selectedFan.name} tipped you $${amount}!`,
      amount,
    });
  };

  // Send Voice Memo from Mic
  const handleSendVoiceMemo = (duration: string) => {
    handleSendMessage('🎙️ Voice note', undefined, true, duration);
    addToast({
      type: 'info',
      title: 'Voice Note Sent',
      description: `Sent voice memo (${duration}) to ${selectedFan.name}`,
    });
  };

  // Launch Mass Broadcast
  const handleSendBroadcast = (text: string, audience: string, price?: number) => {
    sounds.playSend();
    addToast({
      type: 'success',
      title: 'Mass Campaign Launched!',
      description: `Broadcast sent to ${audience} ${price ? `(Locked PPV: $${price})` : ''}`,
    });

    handleSendMessage(
      text,
      price
        ? {
            type: 'video',
            url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=400&q=80',
            price,
          }
        : undefined
    );
  };

  // Add tag
  const handleAddTag = (tag: string) => {
    setFans((prev) =>
      prev.map((f) =>
        f.id === selectedFanId && !f.profile.preferences.includes(tag)
          ? {
              ...f,
              profile: {
                ...f.profile,
                preferences: [...f.profile.preferences, tag],
              },
            }
          : f
      )
    );
    addToast({
      type: 'info',
      title: 'Tag Added',
      description: `#${tag} added to ${selectedFan.name}`,
    });
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFans((prev) =>
      prev.map((f) =>
        f.id === selectedFanId
          ? {
              ...f,
              profile: {
                ...f.profile,
                preferences: f.profile.preferences.filter((t) => t !== tagToRemove),
              },
            }
          : f
      )
    );
  };

  // Add agency note to fan
  const handleAddNote = (noteText: string) => {
    setFans((prev) =>
      prev.map((f) =>
        f.id === selectedFanId
          ? {
              ...f,
              profile: {
                ...f.profile,
                notes: [noteText, ...f.profile.notes],
              },
            }
          : f
      )
    );
    addToast({
      type: 'success',
      title: 'Note Saved',
      description: 'Internal chatter instruction saved to fan profile.',
    });
  };

  // Update Fan nickname
  const handleUpdateNickname = (newName: string) => {
    setFans((prev) =>
      prev.map((f) => (f.id === selectedFanId ? { ...f, name: newName } : f))
    );
    addToast({
      type: 'info',
      title: 'Nickname Updated',
      description: `Fan renamed to "${newName}".`,
    });
  };

  // Star / Pin fan toggle
  const handleToggleStarFan = () => {
    setFans((prev) =>
      prev.map((f) =>
        f.id === selectedFanId ? { ...f, isPinned: !f.isPinned } : f
      )
    );
  };

  // Apply script from modal
  const handleApplyScript = (script: CannedScript) => {
    handleSendMessage(script.text);
  };

  // Send PPV from modal
  const handleSendPPV = (price: number, caption: string, mediaUrl: string) => {
    handleSendMessage(caption, {
      type: 'image',
      url: mediaUrl,
      price,
    });
    addToast({
      type: 'info',
      title: 'PPV Sent',
      description: `Locked media ($${price}) delivered to ${selectedFan.name}.`,
    });
  };

  // Schedule automated message
  const handleScheduleMessage = (text: string, scheduledTime: string) => {
    addToast({
      type: 'success',
      title: 'Message Scheduled',
      description: `Scheduled for ${scheduledTime}: "${text.slice(0, 30)}..."`,
    });
  };

  // Add new Creator account
  const handleAddAccount = (acc: CreatorAccount) => {
    setAccounts((prev) => [...prev, acc]);
    setActiveAccountId(acc.id);
    addToast({
      type: 'success',
      title: 'Account Connected',
      description: `Linked ${acc.name} (${acc.handle}) to CactusClub Agency.`,
    });
  };

  // ==========================================
  // FAN / VISITOR PORTAL ACTION HANDLERS
  // ==========================================

  // Fan sends a private message to Margot
  const handleSendMessageFromFan = (text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const fanMsg: ChatMessage = {
      id: `fan-${Date.now()}`,
      sender: 'fan',
      text,
      timestamp: timeStr,
    };

    sounds.playSend();

    setMessagesMap((prev) => ({
      ...prev,
      valentin: [...(prev.valentin || []), fanMsg],
    }));

    // Update Valentin in fans CRM list
    setFans((prev) =>
      prev.map((f) =>
        f.id === 'valentin'
          ? {
              ...f,
              lastMessageSnippet: text,
              lastMessageTime: timeStr,
              unreadCount: (f.unreadCount || 0) + 1,
            }
          : f
      )
    );

    addToast({
      type: 'info',
      title: `Nouveau message de ${fanUser.name || 'Valentin'}`,
      description: text.length > 50 ? `${text.slice(0, 50)}...` : text,
    });

    // Simulated warm automated response from Margot after 2.2s
    setTimeout(() => {
      const creatorReplies = [
        'Coucou mon Valentin ! Tu me fais tellement plaisir ❤️ Tu as passé une bonne journée ?',
        'Merci pour ton message bébé 🥰 Regarde vite dans tes messages si tu as vu mon nouveau shooting !',
        'Toujours là pour toi ! Tu veux que je te prépare une petite surprise en privé ? ✨',
        'Coucou toi ! J\'étais justement en train de penser à toi 🙈',
      ];
      const reply = creatorReplies[Math.floor(Math.random() * creatorReplies.length)];
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();

      const creatorMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'creator',
        chatterName: activeChatter,
        text: reply,
        timestamp: replyTime,
        status: 'delivered',
      };

      sounds.playReceive();

      setMessagesMap((prev) => ({
        ...prev,
        valentin: [...(prev.valentin || []), creatorMsg],
      }));

      setFans((prev) =>
        prev.map((f) =>
          f.id === 'valentin'
            ? {
                ...f,
                lastMessageSnippet: reply,
                lastMessageTime: replyTime,
              }
            : f
        )
      );
    }, 2200);
  };

  // Fan unlocks PPV locked media
  const handleUnlockPPVFromFan = (messageId: string, price: number): boolean => {
    if (fanUser.walletBalance < price) {
      addToast({
        type: 'error',
        title: 'Solde insuffisant',
        description: `Votre solde est de $${fanUser.walletBalance.toFixed(2)}. Rechargez votre solde pour débloquer ce média.`,
      });
      return false;
    }

    // Deduct price from wallet balance & save unlocked id
    setFanUser((prev) => ({
      ...prev,
      walletBalance: Math.max(0, prev.walletBalance - price),
      unlockedMediaIds: [...prev.unlockedMediaIds, messageId],
    }));

    // Unlock message in Valentin conversation
    setMessagesMap((prev) => {
      const fanMsgs = prev.valentin || [];
      return {
        ...prev,
        valentin: fanMsgs.map((m) =>
          m.id === messageId
            ? {
                ...m,
                isUnlockedPPV: true,
                media: m.media ? { ...m.media, isLocked: false } : undefined,
              }
            : m
        ),
      };
    });

    // Update CRM fan spend & sales history
    setFans((prev) =>
      prev.map((f) => {
        if (f.id === 'valentin') {
          const newTotal = f.totalSpend + price;
          return {
            ...f,
            totalSpend: newTotal,
            spendingBehavior: {
              ...f.spendingBehavior,
              totalSpend: newTotal,
              ppvTotal: f.spendingBehavior.ppvTotal + price,
              lastSpend: {
                timeAgo: 'À l’instant',
                type: 'PPV',
                amount: price,
              },
            },
            salesHistory: [
              {
                id: `sale-${Date.now()}`,
                date: 'À l’instant',
                title: 'Contenu Privé Débloqué (PPV)',
                type: 'PPV',
                amount: price,
                status: 'Unlocked',
              },
              ...f.salesHistory,
            ],
          };
        }
        return f;
      })
    );

    sounds.playCash();
    addToast({
      type: 'ppv',
      title: 'Contenu Débloqué !',
      description: `Vous avez débloqué le média exclusif pour $${price.toFixed(2)}.`,
      amount: price,
    });

    return true;
  };

  // Fan sends a tip
  const handleFanTip = (amount: number, message: string) => {
    if (fanUser.walletBalance < amount) {
      addToast({
        type: 'error',
        title: 'Solde insuffisant',
        description: `Votre solde est de $${fanUser.walletBalance.toFixed(2)}.`,
      });
      return;
    }

    // Deduct amount
    setFanUser((prev) => ({
      ...prev,
      walletBalance: Math.max(0, prev.walletBalance - amount),
    }));

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const tipMsg: ChatMessage = {
      id: `tip-${Date.now()}`,
      sender: 'fan',
      text: `💸 Pourboire de $${amount.toFixed(2)} envoyé ! ${message ? `"${message}"` : ''}`,
      timestamp: timeStr,
    };

    setMessagesMap((prev) => ({
      ...prev,
      valentin: [...(prev.valentin || []), tipMsg],
    }));

    setFans((prev) =>
      prev.map((f) => {
        if (f.id === 'valentin') {
          const newTotal = f.totalSpend + amount;
          return {
            ...f,
            totalSpend: newTotal,
            hasTips: true,
            spendingBehavior: {
              ...f.spendingBehavior,
              totalSpend: newTotal,
              tipTotal: f.spendingBehavior.tipTotal + amount,
              lastSpend: {
                timeAgo: 'À l’instant',
                type: 'Tip',
                amount,
              },
            },
            salesHistory: [
              {
                id: `tip-${Date.now()}`,
                date: 'À l’instant',
                title: `Pourboire Fan ($${amount})`,
                type: 'Tip',
                amount,
                status: 'Unlocked',
              },
              ...f.salesHistory,
            ],
          };
        }
        return f;
      })
    );

    sounds.playCash();
    addToast({
      type: 'tip',
      title: 'Pourboire envoyé !',
      description: `Margot a bien reçu votre pourboire de $${amount.toFixed(2)} ❤️`,
      amount,
    });
  };

  // Fan subscribes to tier
  const handleFanSubscribe = (tier: 'monthly' | 'quarterly' | 'vip', price: number) => {
    setFanUser((prev) => ({
      ...prev,
      walletBalance: Math.max(0, prev.walletBalance - price),
      isSubscribed: true,
      subscriptionTier: tier,
    }));

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const subMsg: ChatMessage = {
      id: `sub-${Date.now()}`,
      sender: 'fan',
      text: `👑 Valentin a activé son abonnement VIP (${tier.toUpperCase()}) pour $${price.toFixed(2)} !`,
      timestamp: timeStr,
    };

    setMessagesMap((prev) => ({
      ...prev,
      valentin: [...(prev.valentin || []), subMsg],
    }));

    setFans((prev) =>
      prev.map((f) => {
        if (f.id === 'valentin') {
          const newTotal = f.totalSpend + price;
          return {
            ...f,
            totalSpend: newTotal,
            isPriority: true,
            salesHistory: [
              {
                id: `sub-sale-${Date.now()}`,
                date: 'À l’instant',
                title: `Abonnement Club (${tier})`,
                type: 'Sub',
                amount: price,
                status: 'Unlocked',
              },
              ...f.salesHistory,
            ],
          };
        }
        return f;
      })
    );

    sounds.playCash();
    addToast({
      type: 'success',
      title: 'Abonnement Confirmé !',
      description: `Bienvenue dans le cercle VIP de Margot (${tier}) !`,
    });
  };

  // Fan recharges wallet balance
  const handleTopUpWallet = (amount: number) => {
    setFanUser((prev) => ({
      ...prev,
      walletBalance: Math.max(0, prev.walletBalance + amount),
    }));

    if (amount > 0) {
      sounds.playCash();
      addToast({
        type: 'success',
        title: 'Solde Rechargé !',
        description: `+$${amount.toFixed(2)} ajoutés. Solde disponible: $${(fanUser.walletBalance + amount).toFixed(2)}`,
      });
    }
  };

  // Fan updates profile / signs up
  const handleUpdateFanUser = (user: FanUser) => {
    setFanUser(user);
    addToast({
      type: 'success',
      title: `Bienvenue ${user.name} !`,
      description: `Votre profil fan est prêt. Solde initial : $${user.walletBalance.toFixed(2)}`,
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f3f4f8] dark:bg-[#0c0e17] font-sans antialiased">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* VIEW 1: ADMIN DASHBOARD */}
      {currentView === 'dashboard' ? (
        <AdminDashboard
          onNavigateToMessages={() => navigateTo('messages')}
          onNavigateToFan={() => navigateTo('fan')}
          sfwMode={sfwMode}
          onToggleSfw={() => setSfwMode(!sfwMode)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenVault={() => setIsVaultOpen(true)}
          onOpenScripts={() => setIsScriptsOpen(true)}
          onOpenBroadcast={() => setIsBroadcastOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : currentView === 'messages' ? (
        /* VIEW 2: MESSAGES PRO LIVE CHAT WORKSTATION */
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Top Application Bar with accounts & chatter shifts */}
          <TopNav
            accounts={accounts}
            activeAccountId={activeAccountId}
            onSelectAccount={setActiveAccountId}
            sfwMode={sfwMode}
            onToggleSfw={() => setSfwMode(!sfwMode)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            chatters={CHATTER_TEAM}
            activeChatter={activeChatter}
            onSelectChatter={setActiveChatter}
            onBackToDashboard={() => navigateTo('dashboard')}
            onNavigateToFan={() => navigateTo('fan')}
            onOpenAddAccount={() => setIsAddAccountOpen(true)}
            onSimulateFanMessage={() => {
              const incoming = [
                'Coucou ma beauté, tu as 2 minutes ? 🥰',
                'Trop belle ta dernière photo ! J\'ai hâte de voir la suite',
                'Tu es dispo en vocal ce soir ?',
                'Tu as pu regarder mon dernier message ? ❤️',
              ];
              handleSendMessageFromFan(incoming[Math.floor(Math.random() * incoming.length)]);
            }}
            onSimulateTip={(amt) => handleSimulateTip(amt)}
          />

          {/* Main 3-Column Studio Workstation */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Fans Inbox & Queue */}
            <SidebarInbox
              currentAccount={currentAccount}
              fans={fans}
              selectedFanId={selectedFanId}
              onSelectFan={setSelectedFanId}
              activeFilter={activeFilter}
              onChangeFilter={setActiveFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenGallery={() => setIsVaultOpen(true)}
              onSendVoiceMemo={handleSendVoiceMemo}
              onOpenBroadcast={() => setIsBroadcastOpen(true)}
            />

            {/* Center: Live Chat & Script Execution Engine */}
            <ChatArea
              fan={selectedFan}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              activeChatter={activeChatter}
              sfwMode={sfwMode}
              onOpenScriptsModal={() => setIsScriptsOpen(true)}
              onOpenPPVModal={() => setIsPPVOpen(true)}
              onOpenVaultModal={() => setIsVaultOpen(true)}
              onOpenGifModal={() => setIsGifOpen(true)}
              onOpenScheduleModal={() => setIsScheduleOpen(true)}
              onOpenLightbox={(url: string, title?: string, price?: number) => setLightboxData({ isOpen: true, url, title, price })}
              onToggleStarFan={handleToggleStarFan}
              onSimulateUnlock={handleSimulateUnlock}
              onUpdateNickname={handleUpdateNickname}
            />

            {/* Right: Fan Insights & Deep Agency CRM */}
            <FanInsights
              fan={selectedFan}
              onAddNote={handleAddNote}
              onSimulateTip={handleSimulateTip}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
            />
          </div>
        </div>
      ) : (
        /* VIEW 3: FAN / VISITOR PORTAL */
        <FanPortal
          creator={currentAccount}
          fanUser={fanUser}
          messages={messagesMap['valentin'] || []}
          onSendMessageFromFan={handleSendMessageFromFan}
          onUnlockPPV={handleUnlockPPVFromFan}
          onSendTip={handleFanTip}
          onSubscribe={handleFanSubscribe}
          onTopUpWallet={handleTopUpWallet}
          onUpdateFanUser={handleUpdateFanUser}
          onNavigateToOperator={() => navigateTo('messages')}
          onNavigateToAdmin={() => navigateTo('dashboard')}
          onOpenLightbox={(url: string, title?: string, price?: number) => setLightboxData({ isOpen: true, url, title, price })}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      )}

      {/* Global Modals */}
      <ScriptsModal
        isOpen={isScriptsOpen}
        onClose={() => setIsScriptsOpen(false)}
        onApplyScript={handleApplyScript}
      />

      <PPVModal
        isOpen={isPPVOpen}
        onClose={() => setIsPPVOpen(false)}
        onSendPPV={handleSendPPV}
      />

      <VaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        onSelectMedia={(media) => {
          if (media.price) {
            handleSendMessage(`Débloque ce contenu exclusif ✨ (${media.type})`, media);
          } else {
            handleSendMessage(`Regarde ça spécialement pour toi ! 💖`, media);
          }
        }}
      />

      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onSendBroadcast={handleSendBroadcast}
      />

      <GifModal
        isOpen={isGifOpen}
        onClose={() => setIsGifOpen(false)}
        onSelectGif={(gifUrl) => {
          handleSendMessage(`Regarde ce GIF pour toi 💋`, {
            type: 'image',
            url: gifUrl,
          });
        }}
      />

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onScheduleMessage={handleScheduleMessage}
      />

      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAddAccount={handleAddAccount}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <MediaLightbox
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData({ isOpen: false, url: '' })}
        mediaUrl={lightboxData.url}
        title={lightboxData.title}
        price={lightboxData.price}
      />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <DashboardApp />
    </LanguageProvider>
  );
}

export default App;
