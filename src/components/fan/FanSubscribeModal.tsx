import React, { useState } from 'react';
import { X, Check, ShieldCheck, Crown, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import type { FanUser } from '../../types/crm';

interface FanSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  fanUser: FanUser;
  onSubscribeSuccess: (tier: 'monthly' | 'quarterly' | 'vip', price: number) => void;
}

export const FanSubscribeModal: React.FC<FanSubscribeModalProps> = ({
  isOpen,
  onClose,
  fanUser,
  onSubscribeSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'vip'>('monthly');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'monthly' as const,
      name: 'Abonnement 1 Mois',
      price: 9.99,
      period: '/ mois',
      popular: false,
      badge: null,
      desc: 'Accès standard complet au feed et à la messagerie privée de Margot.',
    },
    {
      id: 'quarterly' as const,
      name: 'Pass 3 Mois — Économique',
      price: 24.99,
      period: 'pour 3 mois',
      popular: true,
      badge: 'ÉCONOMISEZ 20%',
      desc: 'Accès continu illimité + 1 mémo vocal de bienvenue exclusif.',
    },
    {
      id: 'vip' as const,
      name: 'Accès VIP 1 An Élite',
      price: 79.99,
      period: '/ an',
      popular: false,
      badge: 'MEILLEURE OFFRE',
      desc: 'Statut Whale prioritaire dans la boîte de réception + Réductions sur tous les PPV.',
    },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlan) || plans[0];

  const handleConfirm = () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#151926] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative p-6 text-center bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent border-b border-gray-100 dark:border-[#202538]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-pink-500/30">
            <Crown className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Abonnement au Club de Margot
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Débloquez les discussions privées en direct et accédez au flux exclusif quotidien.
          </p>
        </div>

        {/* Plans Selector */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {plans.map((p) => {
            const isSelected = selectedPlan === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-500/10 shadow-md shadow-blue-500/10'
                    : 'border-gray-200 dark:border-[#242b40] hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-transparent'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm uppercase tracking-wider">
                    {p.badge}
                  </span>
                )}

                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-400 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {p.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black font-mono-numbers text-gray-900 dark:text-white">
                      ${p.price}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      {p.period}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 pl-7">
                  {p.desc}
                </p>
              </div>
            );
          })}

          {/* Perks list */}
          <div className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1a2033] border border-gray-100 dark:border-[#222942] space-y-2 text-xs">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Avantages inclus avec votre abonnement :</span>
            </h4>
            <ul className="space-y-1.5 text-gray-600 dark:text-gray-400 pl-1">
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Accès illimité à tous les posts réguliers & stories privées</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Messagerie privée directe 1-à-1 avec Margot (priorité haute)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Écoute des mémos vocaux et possibilité de débloquer les PPV</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Annulation libre en 1 clic à tout moment sans engagement</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Checkout Action */}
        <div className="p-6 bg-gray-50/80 dark:bg-[#131724] border-t border-gray-100 dark:border-[#202538] flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Solde portefeuille actuel :</span>
            <span className="font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400">
              ${fanUser.walletBalance.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Confirmer l'Abonnement (${currentPlan.price})</span>
          </button>

          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Paiement 100% anonyme & discret sur votre relevé bancaire.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

