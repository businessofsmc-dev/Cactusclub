export interface Fan {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isAvatarDefault?: boolean;
  totalSpend: number;
  lastMessageSnippet: string;
  lastMessageTime: string;
  unreadCount?: number;
  hasUnreadDot?: boolean;
  isPinned?: boolean;
  isPriority?: boolean;
  hasTips?: boolean;
  spendingPower: string; // e.g. "Top 5%"
  chargebackRisk: 'Low' | 'Medium' | 'High';
  subscription: {
    status: 'Active' | 'Expired' | 'Canceled';
    cost: string;
    duration: string;
    autoRenewal: boolean;
    expiresAt?: string;
  };
  spendingBehavior: {
    totalSpend: number;
    lastSpend: {
      timeAgo: string;
      type: string;
      amount: number;
    };
    ppvTotal: number;
    ppvAvg: number;
    tipTotal: number;
    tipAvg: number;
    highestSpend: {
      amount: number;
      type: string;
      date: string;
    };
  };
  profile: {
    realName?: string;
    location?: string;
    age?: number;
    timezone?: string;
    tier: string;
    preferences: string[];
    notes: string[];
  };
  salesHistory: {
    id: string;
    date: string;
    title: string;
    type: 'PPV' | 'Tip' | 'Sub';
    amount: number;
    status: 'Unlocked' | 'Pending';
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'fan' | 'creator';
  chatterName?: string; // e.g. "SIMON", "Nella"
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isVoiceNote?: boolean;
  audioDuration?: string;
  translation?: string;
  showTranslation?: boolean;
  isUnlockedPPV?: boolean;
  quotedMessage?: {
    creatorHandle: string;
    date: string;
    text: string;
  };
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    isLocked?: boolean;
    price?: number;
  };
  reactions?: string[];
}

export interface CreatorAccount {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  unreadCount: number;
  onlineFansCount: number;
  notificationsCount: number;
  coverUrl?: string;
  bio?: string;
  category?: string;
  isOnline?: boolean;
  subscribersCount?: string;
  responseSpeed?: string;
  rating?: number;
}

export interface CannedScript {
  id: string;
  category: 'Greeting' | 'PPV Tease' | 'Upsell' | 'Follow-up' | 'Re-engage' | 'Kinky';
  title: string;
  text: string;
  price?: number;
  tags: string[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'tip' | 'ppv' | 'info' | 'error';
  title: string;
  description: string;
  amount?: number;
}

export interface FanUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string;
  walletBalance: number;
  isSubscribed: boolean;
  subscriptionTier?: 'free' | 'monthly' | 'quarterly' | 'vip';
  unlockedMediaIds: string[];
}

export interface CreatorPost {
  id: string;
  creatorId: string;
  createdAt: string;
  caption: string;
  mediaUrl: string;
  isLocked: boolean;
  price?: number;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}
