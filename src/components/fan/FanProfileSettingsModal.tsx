import React, { useState } from 'react';
import {
  X,
  User,
  Crown,
  Wallet,
  CheckCircle2,
  Star,
  ShieldCheck,
  CreditCard,
  Camera,
  Save,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import type { FanUser } from '../../types/crm';

interface FanProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fanUser: FanUser;
  onUpdateFanUser?: (user: FanUser, message?: string) => void;
  onSubscribe: (tier: 'free' | 'monthly' | 'quarterly' | 'vip', price: number) => void;
  onOpenWalletModal: () => void;
  onOpenVerificationModal?: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
];

export const FanProfileSettingsModal: React.FC<FanProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  fanUser,
  onUpdateFanUser,
  onSubscribe,
  onOpenWalletModal,
  onOpenVerificationModal,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'wallet'>('profile');

  // Profile Edit State
  const [profileName, setProfileName] = useState(fanUser.name || '');
  const [profileUsername, setProfileUsername] = useState(fanUser.username || '@valentin_vip');
  const [profileEmail, setProfileEmail] = useState(fanUser.email || 'valentin@cactusclub.agency');
  const [profileAvatar, setProfileAvatar] = useState(fanUser.avatar || PRESET_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!isOpen) return null;

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      alert('Veuillez renseigner un nom de profil valide.');
      return;
    }

    const updatedUser: FanUser = {
      ...fanUser,
      name: profileName.trim(),
      username: profileUsername.trim().startsWith('@') ? profileUsername.trim() : `@${profileUsername.trim()}`,
      email: profileEmail.trim(),
      avatar: profileAvatar,
    };

    onUpdateFanUser?.(updatedUser, `Profil mis à jour : ${profileName} !`);
    sounds.playSend();

    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
    }, 3000);
  };

  // Handle Select / Change Subscription Plan
  const handleChangeSubscription = (tier: 'free' | 'monthly' | 'quarterly' | 'vip', price: number) => {
    if (fanUser.subscriptionTier === tier && fanUser.isSubscribed === (tier !== 'free')) {
      alert('Vous êtes déjà abonné à cette formule.');
      return;
    }

    if (tier !== 'free' && fanUser.walletBalance < price) {
      const needed = price - fanUser.walletBalance;
      if (
        confirm(
          `Solde insuffisant ($${fanUser.walletBalance.toFixed(2)}). Il vous manque $${needed.toFixed(
            2
          )} pour passer à la formule ${tier.toUpperCase()}. Recharger votre portefeuille maintenant ?`
        )
      ) {
        onOpenWalletModal();
      }
      return;
    }

    // Call onSubscribe
    onSubscribe(tier, price);

    // Confetti on upgrade
    if (tier !== 'free') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#f59e0b', '#8b5cf6', '#10b981'],
      });
    }

    sounds.playCash();
  };

  // Helper label for current tier
  const getCurrentTierLabel = () => {
    if (!fanUser.isSubscribed || fanUser.subscriptionTier === 'free' || !fanUser.subscriptionTier) {
      return {
        title: 'Plan Découverte (Gratuit)',
        badge: 'GRATUIT',
        price: '$0.00 / mois',
        color: 'from-gray-600 to-gray-700',
        textColor: 'text-gray-400',
      };
    }
    if (fanUser.subscriptionTier === 'monthly') {
      return {
        title: 'Pass VIP 1 Mois',
        badge: 'VIP ACTIF',
        price: '$9.99 / mois',
        color: 'from-blue-600 to-indigo-600',
        textColor: 'text-blue-400',
      };
    }
    if (fanUser.subscriptionTier === 'quarterly') {
      return {
        title: 'Pass VIP 3 Mois',
        badge: 'VIP ACTIF • -20%',
        price: '$24.99 / trimestre',
        color: 'from-purple-600 to-pink-600',
        textColor: 'text-purple-400',
      };
    }
    return {
      title: 'VIP Élite 1 An',
      badge: 'MEMBRE PLATINE',
      price: '$79.99 / an',
      color: 'from-amber-500 via-pink-600 to-purple-600',
      textColor: 'text-amber-400',
    };
  };

  const currentTierInfo = getCurrentTierLabel();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#121524] border border-gray-200 dark:border-[#202742] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:px-8 bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-indigo-600/10 border-b border-gray-200 dark:border-[#202742] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400">
                  ESPACE MEMBRE FAN
                </span>
                <span className="text-xs text-gray-400">• Paramètres du compte</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                Mon Profil &amp; Abonnements
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center space-x-2 px-5 sm:px-8 pt-3 border-b border-gray-200 dark:border-[#202742] bg-gray-50/50 dark:bg-[#101321] text-xs font-bold flex-shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'border-pink-600 text-pink-600 dark:text-pink-400 bg-pink-50/40 dark:bg-pink-500/5 font-extrabold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-pink-500" />
            <span>Mon Profil</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'subscription'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/40 dark:bg-purple-500/5 font-extrabold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4 text-purple-500" />
            <span>Mes Abonnements VIP</span>
            {fanUser.isSubscribed && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'wallet'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-500/5 font-extrabold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span>Solde &amp; Sécurité</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1 text-gray-900 dark:text-white">
          {/* TAB 1: PROFIL & MODIFICATION DU NOM */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Card Header with Avatar changer */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#161a2c] border border-gray-200 dark:border-[#222947] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative group">
                    <img
                      src={profileAvatar}
                      alt={profileName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-pink-500 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                    >
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span>Changer</span>
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-lg text-gray-900 dark:text-white">
                        {profileName || 'Nom de profil'}
                      </h3>
                      {fanUser.isSuperFan && (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white font-black text-[9px] shadow-xs flex items-center space-x-1">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          <span>Super Fan</span>
                        </span>
                      )}
                      {fanUser.isVerified && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-[9px] flex items-center space-x-0.5 border border-blue-500/30">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Vérifié</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono-numbers">
                      {profileUsername}
                    </span>
                    <div className="mt-1 flex items-center space-x-3 text-xs">
                      <span className="text-gray-500">Formule :</span>
                      <span className="font-bold text-pink-600 dark:text-pink-400">
                        {currentTierInfo.title}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Solde Portefeuille
                  </span>
                  <span className="text-xl font-black font-mono-numbers text-emerald-500">
                    ${fanUser.walletBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Avatar Preset Picker popup */}
              {showAvatarPicker && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#181d33] border border-pink-500/30 shadow-lg space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Sélectionnez un avatar prédéfini ou saisissez une URL :
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(false)}
                      className="text-xs text-gray-400 hover:text-white cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Avatar ${i}`}
                        onClick={() => {
                          setProfileAvatar(url);
                          setShowAvatarPicker(false);
                          sounds.playReceive();
                        }}
                        className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all hover:scale-105 ${
                          profileAvatar === url ? 'border-pink-500 ring-2 ring-pink-500/30' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <input
                      type="url"
                      placeholder="Ou collez l'URL d'une image en ligne..."
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#0f121e] border border-gray-200 dark:border-[#252c4a] text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customAvatarUrl.trim()) {
                          setProfileAvatar(customAvatarUrl.trim());
                          setCustomAvatarUrl('');
                          setShowAvatarPicker(false);
                          sounds.playReceive();
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>
              )}

              {/* Form Fields: Change Profile Name, Username, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Nom de profil affiché *</span>
                    <span className="text-[10px] text-gray-400 font-normal">Visible par les créatrices</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Ex: Valentin"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#161a2c] border border-gray-200 dark:border-[#222947] text-sm text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Pseudo unique *</span>
                    <span className="text-[10px] text-gray-400 font-normal">Identifiant interne</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value)}
                    placeholder="@valentin_vip"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#161a2c] border border-gray-200 dark:border-[#222947] text-sm text-gray-900 dark:text-white font-mono-numbers focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Adresse e-mail du compte
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="valentin@cactusclub.agency"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#161a2c] border border-gray-200 dark:border-[#222947] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                </div>
              </div>

              {/* Status Badges Recap */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#161a2c] border border-gray-200 dark:border-[#222947] space-y-3">
                <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                  Statut &amp; Badges Officiels de votre compte
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Super Fan Badge */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111422] border border-gray-200/80 dark:border-[#242b47] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <div>
                        <span className="font-bold block">Badge Super Fan</span>
                        <span className="text-[10px] text-gray-400">Priorité de réponse</span>
                      </div>
                    </div>
                    {fanUser.isSuperFan ? (
                      <span className="text-emerald-500 font-bold text-[11px]">ACTIF</span>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenVerificationModal}
                        className="text-pink-600 dark:text-pink-400 font-bold text-[10px] hover:underline cursor-pointer"
                      >
                        Activer →
                      </button>
                    )}
                  </div>

                  {/* Verification Badge */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111422] border border-gray-200/80 dark:border-[#242b47] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="font-bold block">Identité &amp; 2FA</span>
                        <span className="text-[10px] text-gray-400">Sécurité +18 ans</span>
                      </div>
                    </div>
                    {fanUser.isVerified ? (
                      <span className="text-emerald-500 font-bold text-[11px]">VÉRIFIÉ</span>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenVerificationModal}
                        className="text-blue-500 font-bold text-[10px] hover:underline cursor-pointer"
                      >
                        Vérifier →
                      </button>
                    )}
                  </div>

                  {/* Carte Bancaire */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111422] border border-gray-200/80 dark:border-[#242b47] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-purple-500" />
                      <div>
                        <span className="font-bold block">Paiement 1-Click</span>
                        <span className="text-[10px] text-gray-400">
                          {fanUser.cardLast4 ? `•••• ${fanUser.cardLast4}` : 'Non enregistrée'}
                        </span>
                      </div>
                    </div>
                    {fanUser.hasPaymentMethod ? (
                      <span className="text-emerald-500 font-bold text-[11px]">LIÉE</span>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenVerificationModal}
                        className="text-purple-500 font-bold text-[10px] hover:underline cursor-pointer"
                      >
                        Ajouter →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Success Notification message */}
              {isSavedNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Vos informations de profil ont été enregistrées avec succès !</span>
                </div>
              )}

              {/* Submit Save Button */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2b3352] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a2033] transition-colors cursor-pointer"
                >
                  Fermer
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-pink-600/25 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer mon profil</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MES ABONNEMENTS VIP (VOIR & CHANGER D'ABONNEMENT) */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {/* CURRENT SUBSCRIPTION BANNER */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-900/30 via-purple-900/30 to-indigo-950/40 border border-pink-500/30 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs font-black mb-2 border border-pink-500/30">
                      <Crown className="w-3.5 h-3.5" />
                      <span>VOTRE ABONNEMENT EN COURS</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {currentTierInfo.title}
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      {fanUser.isSubscribed
                        ? 'Votre abonnement est actif avec accès illimité aux messages privés et contenus exclusifs.'
                        : 'Vous êtes actuellement sur le Plan Découverte Gratuit. Choisissez une formule VIP ci-dessous pour discuter en direct sans limite.'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-2xl sm:text-3xl font-black font-mono-numbers text-white">
                      {currentTierInfo.price}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">
                      ● Statut : {fanUser.isSubscribed ? 'Actif & Renouvelable' : 'Actif (Gratuit)'}
                    </span>
                  </div>
                </div>

                {/* Subscribed Perks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs text-gray-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                    <span>Discussions privées 1-à-1 avec toutes les modèles</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                    <span>Réponse prioritaire en moins de 3 minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                    <span>Badge VIP exclusif visible sur votre profil</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                    <span>-20% de réduction permanente sur les Sex Tapes 4K</span>
                  </div>
                </div>
              </div>

              {/* CHANGER D'ABONNEMENT: FORMULES VIP DISPONIBLES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-purple-500" />
                    <span>Changer de formule d'abonnement</span>
                  </h4>
                  <span className="text-xs text-gray-400">
                    Débit direct sur votre portefeuille
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* FORMULE 1: 1 MOIS */}
                  <div
                    className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                      fanUser.subscriptionTier === 'monthly'
                        ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 ring-2 ring-blue-500/20'
                        : 'border-gray-200 dark:border-[#222947] bg-white dark:bg-[#161a2c] hover:border-blue-500/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-500">
                          Pass 1 Mois
                        </span>
                        {fanUser.subscriptionTier === 'monthly' && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold text-[9px]">
                            ACTUEL
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-black font-mono-numbers text-gray-900 dark:text-white mb-2">
                        $9.99
                        <span className="text-xs font-normal text-gray-500"> / mois</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Idéal pour découvrir les coulisses et papoter en direct chaque jour avec votre créatrice.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={fanUser.subscriptionTier === 'monthly'}
                      onClick={() => handleChangeSubscription('monthly', 9.99)}
                      className={`mt-4 w-full py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        fanUser.subscriptionTier === 'monthly'
                          ? 'bg-blue-500/20 text-blue-500 cursor-default font-bold'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95'
                      }`}
                    >
                      {fanUser.subscriptionTier === 'monthly' ? 'Formule Actuelle' : 'Choisir le Pass 1 Mois'}
                    </button>
                  </div>

                  {/* FORMULE 2: 3 MOIS (POPULAIRE) */}
                  <div
                    className={`relative rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                      fanUser.subscriptionTier === 'quarterly'
                        ? 'border-purple-500 bg-purple-50/30 dark:bg-purple-900/10 ring-2 ring-purple-500/20'
                        : 'border-purple-500/50 bg-white dark:bg-[#161a2c] hover:border-purple-500'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-[9px] uppercase tracking-wider shadow-sm">
                        20% DE RÉDUCTION
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-purple-500">
                          Pass 3 Mois
                        </span>
                        {fanUser.subscriptionTier === 'quarterly' && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white font-bold text-[9px]">
                            ACTUEL
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-black font-mono-numbers text-gray-900 dark:text-white mb-2">
                        $24.99
                        <span className="text-xs font-normal text-gray-500"> / trimestre</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Notre formule la plus populaire auprès des fans réguliers. 3 mois de complicité garantie.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={fanUser.subscriptionTier === 'quarterly'}
                      onClick={() => handleChangeSubscription('quarterly', 24.99)}
                      className={`mt-4 w-full py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        fanUser.subscriptionTier === 'quarterly'
                          ? 'bg-purple-500/20 text-purple-500 cursor-default font-bold'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md active:scale-95'
                      }`}
                    >
                      {fanUser.subscriptionTier === 'quarterly' ? 'Formule Actuelle' : 'Choisir le Pass 3 Mois'}
                    </button>
                  </div>

                  {/* FORMULE 3: 1 AN VIP ÉLITE (MEILLEUR CHOIX) */}
                  <div
                    className={`relative rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                      fanUser.subscriptionTier === 'vip'
                        ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-900/10 ring-2 ring-amber-500/20'
                        : 'border-amber-500/50 bg-white dark:bg-[#161a2c] hover:border-amber-500'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-[9px] uppercase tracking-wider shadow-sm">
                        LE MEILLEUR CHOIX
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                          VIP Élite 1 An
                        </span>
                        {fanUser.subscriptionTier === 'vip' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[9px]">
                            ACTUEL
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-black font-mono-numbers text-gray-900 dark:text-white mb-2">
                        $79.99
                        <span className="text-xs font-normal text-gray-500"> / an</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Accès prioritaire garanti toute l’année + Tous les teasers mensuels offerts + Badge Platine.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={fanUser.subscriptionTier === 'vip'}
                      onClick={() => handleChangeSubscription('vip', 79.99)}
                      className={`mt-4 w-full py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        fanUser.subscriptionTier === 'vip'
                          ? 'bg-amber-500/20 text-amber-500 cursor-default font-bold'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-md active:scale-95'
                      }`}
                    >
                      {fanUser.subscriptionTier === 'vip' ? 'Formule Actuelle' : 'Choisir le VIP Élite 1 An'}
                    </button>
                  </div>
                </div>

                {/* Option to downgrade to free */}
                {fanUser.isSubscribed && (
                  <div className="pt-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir résilier votre abonnement VIP et repasser au Plan Gratuit ? Vous perdrez la messagerie illimitée.')) {
                          handleChangeSubscription('free', 0);
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 underline cursor-pointer"
                    >
                      Résilier mon abonnement et revenir au Plan Gratuit
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SOLDE & SÉCURITÉ */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              {/* Wallet Summary Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-[#0e111d] border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Solde Portefeuille Disponible
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono-numbers text-emerald-400 mt-1">
                    ${fanUser.walletBalance.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Utilisable pour débloquer des Sex Tapes, envoyer des pourboires ou régler vos abonnements.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onOpenWalletModal}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer flex-shrink-0"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Recharger mon solde</span>
                </button>
              </div>

              {/* Payment Method Details */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#161a2c] border border-gray-200 dark:border-[#222947] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-purple-500" />
                    <span>Moyen de paiement enregistré</span>
                  </h4>
                  <span className="text-xs text-emerald-500 font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Crypté SSL 256-bit</span>
                  </span>
                </div>

                {fanUser.hasPaymentMethod ? (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#111422] border border-gray-200/80 dark:border-[#242b47] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-7 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-black tracking-wider">
                        VISA
                      </div>
                      <div>
                        <span className="font-bold text-xs text-gray-900 dark:text-white block font-mono-numbers">
                          •••• •••• •••• {fanUser.cardLast4 || '4242'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {fanUser.cardHolderName || fanUser.name} • Exp: {fanUser.cardExpiry || '12/28'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onOpenVerificationModal}
                      className="text-xs font-bold text-pink-600 hover:underline cursor-pointer"
                    >
                      Modifier la carte
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#111422] border border-dashed border-gray-300 dark:border-gray-700 text-center space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Aucune carte bancaire n'est enregistrée pour le moment.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenVerificationModal}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Ajouter une carte bancaire
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
