import React, { useState } from 'react';
import { HelpCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { sounds } from '../../utils/sound';
import type { FanUser } from '../../types/crm';

interface FanLoginPageProps {
  onLoginSuccess: (user: FanUser) => void;
  onNavigateToOperator?: () => void;
  onNavigateToAdmin?: () => void;
}

export const FanLoginPage: React.FC<FanLoginPageProps> = ({
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (mode === 'login' && step === 'email') {
      // Advance to password step
      setStep('password');
      return;
    }

    const finalName = name.trim() || email.split('@')[0] || 'Valentin';
    const finalUser: FanUser = {
      id: `fan-${Date.now()}`,
      name: finalName,
      username: `@${finalName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      email: email.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      walletBalance: 150.00, // Preloaded with $150 so user can purchase PPV & tips immediately!
      isSubscribed: false, // Starts unsubscribed so visitor chooses Free vs VIP plan
      subscriptionTier: undefined,
      unlockedMediaIds: [],
    };

    sounds.playCash();
    onLoginSuccess(finalUser);
  };

  const handleQuickDemo = () => {
    const demoUser: FanUser = {
      id: 'fan-demo-valentin',
      name: 'Valentin',
      username: '@valentin_vip',
      email: 'valentin@fan.cactusclub',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      walletBalance: 150.00,
      isSubscribed: false,
      subscriptionTier: undefined,
      unlockedMediaIds: [],
    };

    sounds.playCash();
    onLoginSuccess(demoUser);
  };

  const isButtonActive = email.trim().length > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#0c0e17] font-sans select-none antialiased">
      {/* ========================================================= */}
      {/* LEFT COLUMN: HERO BRANDING CACTUSCLUB GRADIENT           */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-12 xl:px-20 bg-gradient-to-br from-[#7e22ce] via-[#a21caf] to-[#ec4899] text-white overflow-hidden">
        {/* Subtle Watermark Curved Waves */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="150" cy="700" r="320" fill="white" />
            <path d="M600 450 C450 600, 200 650, 50 800 L800 800 Z" fill="white" opacity="0.3" />
            <circle cx="750" cy="150" r="280" fill="white" opacity="0.15" />
          </svg>
        </div>


        {/* Brand Content */}
        <div className="relative z-10 max-w-lg">
          {/* Official Cactusclub Brand Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-black/15">
              <span className="font-black text-xl bg-gradient-to-tr from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent tracking-tighter">
                CC
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tight text-white leading-none">
                Cactusclub
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/80 mt-1">
                VIP Creator Network
              </span>
            </div>
          </div>

          {/* Catchphrase in exact French wording */}
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white mb-6">
            Inscrivez-vous pour soutenir vos créateurs préférés
          </h1>

          {/* Value proposition badges */}
          <div className="space-y-3 text-white/90 text-sm font-medium">
            <div className="flex items-center space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">✓</span>
              <span>Accès direct et illimité aux publications exclusives</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">✓</span>
              <span>Discussions privées 1-à-1 et mémos vocaux en direct</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">✓</span>
              <span>Paiements cryptés 256 bits et discrétion bancaire absolue</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: LOGIN FORM & SOCIAL PROVIDERS               */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 relative bg-white dark:bg-[#0c0e17] overflow-y-auto">
        {/* Mobile Header Branding (Visible on small screens only) */}
        <div className="lg:hidden flex items-center space-x-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ec4899] via-[#d946ef] to-[#8b5cf6] flex items-center justify-center text-white font-black text-base shadow-md shadow-pink-500/20">
            CC
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">Cactusclub</span>
        </div>

        {/* Central Container: exactly 380px - 420px as on desktop */}
        <div className="w-full max-w-[400px]">
          {/* Heading */}
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            {mode === 'login' ? 'Connectez-vous' : 'Inscrivez-vous'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (if registering) */}
            {mode === 'register' && (
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nom complet ou pseudo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#151926] focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20 outline-hidden text-sm text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <input
                type="email"
                required
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#151926] focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20 outline-hidden text-sm text-gray-900 dark:text-white placeholder-gray-400 transition-all"
              />
            </div>

            {/* Password Field (revealed on password step or register) */}
            {(step === 'password' || mode === 'register') && (
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#151926] focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20 outline-hidden text-sm text-gray-900 dark:text-white placeholder-gray-400 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-[#ec4899] cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* SUIVANT / VALIDER BUTTON */}
            <button
              type="submit"
              disabled={!isButtonActive}
              className={`w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isButtonActive
                  ? 'bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#ec4899] hover:opacity-95 text-white shadow-lg shadow-pink-500/25 active:scale-98'
                  : 'bg-[#dce1e7] dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {step === 'email' && mode === 'login' ? 'SUIVANT' : 'SE CONNECTER'}
            </button>
          </form>

          {/* Legal Compliance Notice */}
          <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 mt-4 text-left">
            En vous connectant et en utilisant Cactusclub, vous acceptez nos{' '}
            <span className="text-[#ec4899] hover:underline cursor-pointer font-medium">Conditions d'utilisation</span> et notre{' '}
            <span className="text-[#ec4899] hover:underline cursor-pointer font-medium">Politique de confidentialité</span>, et vous confirmez que vous avez au moins 18 ans.
          </p>

          {/* Switch Mode Link */}
          <div className="text-center my-6">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setStep('email');
              }}
              className="text-[#ec4899] hover:text-[#c026d3] hover:underline text-sm font-semibold cursor-pointer transition-colors"
            >
              {mode === 'login' ? 'Inscrivez-vous à Cactusclub' : 'Vous avez déjà un compte ? Connectez-vous'}
            </button>
          </div>

          {/* Social Logins Stack */}
          <div className="space-y-3">
            {/* Connect with Google Button */}
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full flex items-center justify-center relative py-3 px-4 rounded-full bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <div className="absolute left-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs">
                {/* Google G Logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <span>SE CONNECTER AVEC GOOGLE</span>
            </button>

            {/* Quick 1-Click VIP Demo Pill */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Connexion VIP Démo ($150 de solde préchargé)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Support Question Mark Button in bottom right */}
        <button
          type="button"
          onClick={() => alert("Besoin d'aide ? Le support Cactusclub est disponible 24/7.")}
          className="fixed bottom-6 right-6 w-11 h-11 rounded-xl bg-gradient-to-tr from-[#ec4899] to-[#8b5cf6] hover:opacity-95 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer z-30"
          title="Support et aide"
        >
          <HelpCircle className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
