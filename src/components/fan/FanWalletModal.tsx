import React, { useState } from 'react';
import { X, Wallet, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import type { FanUser } from '../../types/crm';

interface FanWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  fanUser: FanUser;
  onTopUp: (amount: number) => void;
}

export const FanWalletModal: React.FC<FanWalletModalProps> = ({
  isOpen,
  onClose,
  fanUser,
  onTopUp,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'crypto'>('card');

  if (!isOpen) return null;

  const quickAmounts = [20, 50, 100, 250];
  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleConfirmTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0) return;

    sounds.playCash();
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
    });

    onTopUp(finalAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#151926] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 text-center bg-gradient-to-b from-emerald-500/10 to-transparent border-b border-gray-100 dark:border-[#202538]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
            <Wallet className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Mon Portefeuille Fan
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Rechargez votre solde instantanément pour débloquer les PPV, envoyer des pourboires et vous abonner.
          </p>

          {/* Current Balance Display Card */}
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Solde Actuel Disponible
              </span>
              <span className="text-2xl font-black font-mono-numbers text-emerald-600 dark:text-emerald-400">
                ${fanUser.walletBalance.toFixed(2)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Top-up Form */}
        <form onSubmit={handleConfirmTopUp} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
              Montant à créditer
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {quickAmounts.map((amt) => {
                const isSelected = selectedAmount === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 rounded-xl font-mono-numbers font-bold text-sm border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'border-gray-200 dark:border-[#262d42] text-gray-700 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    +${amt}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
              <input
                type="number"
                min="5"
                step="5"
                placeholder="Autre montant (ex: 75)..."
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(0);
                }}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#29324d] text-gray-900 dark:text-white font-mono-numbers outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
              Moyen de paiement sécurisé
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'card' as const, label: 'Carte Bancaire', icon: '💳' },
                { id: 'apple' as const, label: 'Apple Pay', icon: '🍏' },
                { id: 'crypto' as const, label: 'Crypto (USDT)', icon: '⚡' },
              ].map((m) => {
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center space-y-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                        : 'border-gray-200 dark:border-[#262d42] text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-base">{m.icon}</span>
                    <span className="text-[11px] truncate max-w-full">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={finalAmount <= 0}
            className="w-full py-3.5 rounded-2xl text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-bold shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Recharger mon Portefeuille (+${finalAmount.toFixed(2)})</span>
          </button>

          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Cryptage bancaire 256 bits. Aucun libellé explicite sur vos relevés.</span>
          </div>
        </form>
      </div>
    </div>
  );
};

