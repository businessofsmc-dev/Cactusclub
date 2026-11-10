import React, { useState } from 'react';
import { X, Sparkles, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import type { FanUser } from '../../types/crm';
import { sounds } from '../../utils/sound';

interface FanAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: FanUser) => void;
}

export const FanAuthModal: React.FC<FanAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Valentin';
    const finalUser: FanUser = {
      id: `fan-${Date.now()}`,
      name: finalName,
      username: `@${finalName.toLowerCase().replace(/\s+/g, '_')}`,
      email: email.trim() || `${finalName.toLowerCase()}@fan.cactusclub`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      walletBalance: 150.00,
      isSubscribed: false,
      unlockedMediaIds: [],
    };
    sounds.playCash();
    onAuthSuccess(finalUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#151926] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 text-center bg-gradient-to-b from-blue-500/10 to-transparent border-b border-gray-100 dark:border-[#202538]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
            <Sparkles className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-black text-gray-900 dark:text-white">
            {mode === 'register' ? 'Créer un Compte Fan' : 'Connexion à CactusClub'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Rejoignez le club exclusif pour discuter avec Margot et débloquer ses contenus privés.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 rounded-xl bg-gray-100 dark:bg-[#1a2033] text-xs font-bold">
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-[#252b45] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            S'inscrire
          </button>
          <button
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-[#252b45] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Se Connecter
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Votre Prénom / Pseudo
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Valentin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#29324d] text-gray-900 dark:text-white outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="votre.email@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#29324d] text-gray-900 dark:text-white outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#29324d] text-gray-900 dark:text-white outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl text-white bg-blue-600 hover:bg-blue-500 font-bold shadow-lg shadow-blue-500/25 active:scale-98 transition-all cursor-pointer"
          >
            {mode === 'register' ? 'Créer mon compte Fan' : 'Se Connecter'}
          </button>

          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Paiement sécurisé par cryptage 256 bits. Confidentialité 100% garantie.</span>
          </div>
        </form>
      </div>
    </div>
  );
};

