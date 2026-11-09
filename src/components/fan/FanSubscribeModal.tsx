import React, { useState } from 'react';
import { X, Check, ShieldCheck, Crown, Zap, Sparkles, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import type { FanUser, CreatorAccount } from '../../types/crm';

interface FanSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  fanUser: FanUser;
  creator?: CreatorAccount;
  onSubscribeSuccess: (tier: 'free' | 'monthly' | 'quarterly' | 'vip', price: number) => void;
  onOpenWalletModal?: () => void;
}

export const FanSubscribeModal: React.FC<FanSubscribeModalProps> = ({
  isOpen,
  onClose,
  fanUser,
  creator,
  onSubscribeSuccess,
  onOpenWalletModal,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'monthly' | 'quarterly' | 'vip'>('monthly');

  if (!isOpen) return null;

  const creatorName = creator?.name || 'Margot Dulac';
  const creatorFirstName = creatorName.split(' ')[0];

  const plans = [
    {
      id: 'free' as const,
      name: 'Plan Découverte Gratuit',
      price: 0,
      period: '100% Gratuit',
      popular: false,
      isFree: true,
      badge: 'OFFRE GRATUITE',
      badgeColor: 'bg-emerald-500',
      icon: Gift,
      desc: `Accédez au profil de ${creatorFirstName} et bénéficiez de 3 messages d'essai offerts pour débuter la discussion.`,
    },
    {
      id: 'monthly' as const,
      name: 'VIP Premium Illimité',
      price: 9.99,
      period: '/ mois',
      popular: true,
      isFree: false,
      badge: 'LE PLUS POPULAIRE',
      badgeColor: 'bg-gradient-to-r from-pink-500 to-purple-600',
      icon: Crown,
      desc: `Discussions illimitées 24/7 avec ${creatorFirstName}, écoute des mémos vocaux et priorité absolue dans sa boîte.`,
    },
    {
      id: 'quarterly' as const,
      name: 'Pass VIP 3 Mois',
      price: 24.99,
      period: 'pour 3 mois',
      popular: false,
      isFree: false,
      badge: 'ÉCONOMISEZ 20%',
      badgeColor: 'bg-blue-600',
      icon: Zap,
      desc: 'Tous les avantages VIP avec tarif préférentiel + 1 mémo vocal de bienvenue inédit.',
    },
    {
      id: 'vip' as const,
      name: 'VIP Élite 1 An Platine',
      price: 79.99,
      period: '/ an',
      popular: false,
      isFree: false,
      badge: 'STATUT ULTIME',
      badgeColor: 'bg-gradient-to-r from-amber-400 to-amber-600 text-black',
      icon: Sparkles,
      desc: 'Accès royal garanti, badge Whale, réductions automatiques de 15% sur tous les PPVs exclusifs.',
    },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlan) || plans[1];
  const isAffordable = currentPlan.price === 0 || fanUser.walletBalance >= currentPlan.price;

  const handleConfirm = () => {
    if (!isAffordable) {
      if (onOpenWalletModal) {
        onClose();
        onOpenWalletModal();
      } else {
        alert(`Solde insuffisant ($${fanUser.walletBalance.toFixed(2)}). Veuillez recharger votre portefeuille.`);
      }
      return;
    }

    sounds.playCash();
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981'],
    });

    onSubscribeSuccess(selectedPlan, currentPlan.price);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#151926] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Creator Info */}
        <div className="relative p-6 text-center bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent border-b border-gray-100 dark:border-[#202538]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Creator Avatar Monogram / Photo */}
          <div className="relative w-16 h-16 mx-auto mb-3">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400 shadow-xl">
              <img
                src={creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={creatorName}
                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#151926]"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#151926] animate-pulse"></span>
          </div>

          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            Abonnement au Club de {creatorName}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Pour écrire et discuter avec <span className="font-bold text-pink-600 dark:text-pink-400">{creatorFirstName}</span>, choisissez votre formule d'abonnement :
          </p>
        </div>

        {/* Plans Selector */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {plans.map((p) => {
            const isSelected = selectedPlan === p.id;
            const PlanIcon = p.icon;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? p.isFree
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-500/10 shadow-md shadow-emerald-500/10'
                      : 'border-pink-500 bg-pink-50/50 dark:bg-pink-500/10 shadow-md shadow-pink-500/10'
                    : 'border-gray-200 dark:border-[#242b40] hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/40 dark:bg-transparent'
                }`}
              >
                {p.badge && (
                  <span className={`absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-black text-white shadow-xs uppercase tracking-wider ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                )}

                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? p.isFree
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-pink-500 bg-pink-500 text-white'
                          : 'border-gray-400 dark:border-gray-600'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <PlanIcon className="w-3 h-3 text-gray-400" />}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-gray-900 dark:text-white block leading-tight">
                        {p.name}
                      </span>
                      {p.isFree && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ Sans carte bancaire requise
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black font-mono-numbers text-gray-900 dark:text-white">
                      {p.isFree ? '0€' : `$${p.price}`}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      {p.period}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 pl-8 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}

          {/* Comparative Highlights */}
          <div className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1a2033] border border-gray-100 dark:border-[#222942] space-y-2 text-xs">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Comparatif des formules :</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#131624] border border-gray-200/70 dark:border-[#262c42]">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                  🎁 Plan Gratuit
                </span>
                <p className="text-gray-500 leading-snug">
                  • 3 messages d'essai offerts<br />
                  • Accès au flux public<br />
                  • Découverte sans frais
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-[#131624] border border-pink-500/40">
                <span className="font-bold text-pink-600 dark:text-pink-400 block mb-1">
                  ⭐ VIP Premium
                </span>
                <p className="text-gray-500 leading-snug">
                  • Messages illimités 24/7<br />
                  • Mémos vocaux haute fidélité<br />
                  • Priorité boîte de réception
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Checkout Action */}
        <div className="p-6 bg-gray-50/80 dark:bg-[#131724] border-t border-gray-100 dark:border-[#202538] flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Votre solde disponible :</span>
            <div className="flex items-center space-x-1.5 font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400">
              <span>${fanUser.walletBalance.toFixed(2)}</span>
              {!isAffordable && (
                <span className="text-amber-500 text-[10px] ml-1">(Solde insuffisant pour ce plan)</span>
              )}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-xl active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              currentPlan.isFree
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25'
                : isAffordable
                ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-500 text-white shadow-pink-500/25'
                : 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/25'
            }`}
          >
            {currentPlan.isFree ? (
              <>
                <Gift className="w-4 h-4" />
                <span>Activer l'Accès Gratuit ($0)</span>
              </>
            ) : isAffordable ? (
              <>
                <Crown className="w-4 h-4" />
                <span>Confirmer l'Abonnement VIP (${currentPlan.price})</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Recharger mon solde pour s'abonner</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Aucun engagement. Modifiable ou résiliable à tout moment en 1 clic.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
