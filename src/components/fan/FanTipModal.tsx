import React, { useState } from 'react';
import { X, Heart, DollarSign, Sparkles, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import type { FanUser } from '../../types/crm';

interface FanTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  fanUser: FanUser;
  onSendTip: (amount: number, message: string) => void;
}

export const FanTipModal: React.FC<FanTipModalProps> = ({
  isOpen,
  onClose,
  fanUser,
  onSendTip,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(20);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [tipMessage, setTipMessage] = useState<string>('');

  if (!isOpen) return null;

  const quickAmounts = [5, 10, 20, 50, 100];
  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0) return;

    sounds.playCash();
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#ec4899', '#f59e0b', '#3b82f6', '#10b981'],
    });

    onSendTip(finalAmount, tipMessage.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#151926] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 text-center bg-gradient-to-b from-rose-500/10 to-transparent border-b border-gray-100 dark:border-[#202538]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-rose-500/30">
            <Heart className="w-7 h-7 fill-white" />
          </div>

          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Envoyer un Pourboire à Margot
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Faites-vous remarquer instantanément et recevez une réponse privilégiée en privé.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
              Montant du Pourboire
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
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
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400 shadow-sm'
                        : 'border-gray-200 dark:border-[#262d42] text-gray-700 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    ${amt}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Montant personnalisé..."
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(0);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#29324d] text-gray-900 dark:text-white font-mono-numbers outline-hidden focus:ring-1 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Message d'accompagnement (optionnel)
            </label>
            <textarea
              rows={3}
              value={tipMessage}
              onChange={(e) => setTipMessage(e.target.value)}
              placeholder="Un petit mot doux pour Margot ou une demande spéciale..."
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#29324d] text-gray-900 dark:text-white outline-hidden focus:ring-1 focus:ring-pink-500 resize-none text-xs"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-100 dark:border-[#202538]">
            <span className="text-gray-500 dark:text-gray-400">Votre solde portefeuille :</span>
            <span className="font-bold font-mono-numbers text-gray-900 dark:text-white">
              ${fanUser.walletBalance.toFixed(2)}
            </span>
          </div>

          <button
            type="submit"
            disabled={finalAmount <= 0}
            className="w-full py-3.5 rounded-2xl text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 font-bold shadow-lg shadow-pink-500/25 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Envoyer le Pourboire (${finalAmount.toFixed(2)})</span>
          </button>

          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Transaction instantanée & privée. Notification envoyée à Margot.</span>
          </div>
        </form>
      </div>
    </div>
  );
};

