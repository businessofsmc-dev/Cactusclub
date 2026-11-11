import React, { useState, useRef } from 'react';
import {
  HelpCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Camera,
  Check,
  AlertCircle,
  ArrowLeft,
  Upload,
  Star,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import type { FanUser } from '../../types/crm';

interface FanLoginPageProps {
  onLoginSuccess: (user: FanUser) => void;
  onNavigateToOperator?: () => void;
  onNavigateToAdmin?: () => void;
}

const AVATAR_PRESETS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', label: 'Valentin' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', label: 'Alex' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', label: 'Thomas' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', label: 'Marc' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', label: 'Sophie' },
  { id: 'av6', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', label: 'Léa' },
];

export const FanLoginPage: React.FC<FanLoginPageProps> = ({
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Shared credential states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login flow steps: 'email' -> 'password'
  const [loginStep, setLoginStep] = useState<'email' | 'password'>('email');

  // Register flow steps: 'credentials' -> 'profile' (Direct platform access after profile)
  const [registerStep, setRegisterStep] = useState<'credentials' | 'profile'>('credentials');

  // Register Step 2: Formulaire complet du profil Fan
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [customUsernameModified, setCustomUsernameModified] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);
  const [birthDate, setBirthDate] = useState('');
  const [isOver18Confirmed, setIsOver18Confirmed] = useState(false);
  const [ageError, setAgeError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Age calculation helper (+18 requirement)
  const calculateAge = (dateString: string): number => {
    if (!dateString) return 0;
    const today = new Date();
    const birth = new Date(dateString);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleBirthDateChange = (val: string) => {
    setBirthDate(val);
    if (val) {
      const age = calculateAge(val);
      if (age < 18) {
        setAgeError('Accès interdit : Vous devez impérativement avoir 18 ans ou plus pour vous inscrire sur Cactusclub.');
      } else {
        setAgeError(null);
      }
    } else {
      setAgeError(null);
    }
  };

  const handleFirstNameChange = (val: string) => {
    setFirstName(val);
    if (!customUsernameModified) {
      const clean = val.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean) {
        setUsername(`@${clean}`);
      }
    }
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Image trop volumineuse (8 Mo maximum).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedAvatar(event.target.result as string);
          sounds.playReceive();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (loginStep === 'email') {
      setLoginStep('password');
      sounds.playReceive();
      return;
    }

    const defaultName = email.split('@')[0] || 'Valentin';
    const finalUser: FanUser = {
      id: `fan-${Date.now()}`,
      name: defaultName,
      username: `@${defaultName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      email: email.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      walletBalance: 150.00,
      isSubscribed: false,
      subscriptionTier: undefined,
      unlockedMediaIds: [],
      isOver18: true,
      isVerified: false,
      isSuperFan: false,
      hasPaymentMethod: false,
    };

    sounds.playCash();
    onLoginSuccess(finalUser);
  };

  // Submit Register Step 1 (Credentials -> Profile Form)
  const handleRegisterCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setRegisterStep('profile');
    sounds.playReceive();
  };

  // Submit Register Step 2 (Profile Form -> Direct Access to Platform!)
  const handleRegisterProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    if (!birthDate) {
      setAgeError('Veuillez renseigner votre date de naissance.');
      return;
    }

    const age = calculateAge(birthDate);
    if (age < 18) {
      setAgeError('Accès interdit : Vous devez impérativement avoir 18 ans ou plus pour vous inscrire sur Cactusclub.');
      return;
    }

    if (!isOver18Confirmed) {
      setAgeError('Vous devez cocher la case attestant avoir au moins 18 ans révolus.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || email.split('@')[0];
    const cleanUsername = username.trim().startsWith('@')
      ? username.trim()
      : `@${(username.trim() || firstName.trim()).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const finalUser: FanUser = {
      id: `fan-${Date.now()}`,
      name: fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: cleanUsername,
      email: email.trim(),
      avatar: selectedAvatar,
      walletBalance: 150.00,
      isSubscribed: false,
      subscriptionTier: undefined,
      unlockedMediaIds: [],
      birthDate,
      isOver18: true,
      isVerified: false,
      isSuperFan: false,
      idDocumentStatus: 'none',
      hasPaymentMethod: false,
    };

    sounds.playCash();
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#ec4899', '#8b5cf6', '#f59e0b'],
    });

    onLoginSuccess(finalUser);
  };

  const handleGoogleAuth = () => {
    const googleUser: FanUser = {
      id: 'fan-google-valentin',
      name: 'Valentin Robert',
      firstName: 'Valentin',
      lastName: 'Robert',
      username: '@valentin_vip',
      email: 'valentin@fan.cactusclub',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      walletBalance: 150.00,
      isSubscribed: false,
      subscriptionTier: undefined,
      unlockedMediaIds: [],
      birthDate: '1998-05-14',
      isOver18: true,
      isVerified: false,
      isSuperFan: false,
      idDocumentStatus: 'none',
      hasPaymentMethod: false,
    };

    sounds.playCash();
    onLoginSuccess(googleUser);
  };

  const isRegisterStep2Valid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    birthDate.length > 0 &&
    calculateAge(birthDate) >= 18 &&
    isOver18Confirmed;

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

          {/* Catchphrase */}
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white mb-6">
            Inscrivez-vous pour soutenir vos créateurs préférés
          </h1>

          {/* Value proposition badges */}
          <div className="space-y-3.5 text-white/95 text-sm font-medium">
            <div className="flex items-center space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </span>
              <span>Accès direct et illimité aux publications exclusives</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </span>
              <span>Discussions privées 1-à-1 et mémos vocaux en direct</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </span>
              <span>Plateforme certifiée +18 ans & discrétion absolue</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-400/30 text-amber-200 flex items-center justify-center">
                <Star className="w-3 h-3 fill-amber-200 text-amber-200" />
              </span>
              <span>Badge Super Fan certifié par vérification 2FA & pièce d’identité</span>
            </div>
          </div>

          {/* 18+ Legal Compliance Banner on Left */}
          <div className="mt-8 p-3 rounded-2xl bg-black/20 border border-white/20 backdrop-blur-xs flex items-center space-x-3">
            <div className="px-2.5 h-9 rounded-xl bg-white/15 flex items-center justify-center space-x-1 font-black text-xs text-white border border-white/30 flex-shrink-0">
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>18+</span>
            </div>
            <div className="text-xs text-white/90 leading-snug">
              <span className="font-bold block">Réservé exclusivement aux adultes</span>
              Inscription subordonnée à la majorité légale (+18 ans) et authentification 2FA.
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: DYNAMIC ONBOARDING & LOGIN FORM             */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 relative bg-white dark:bg-[#0c0e17] overflow-y-auto py-8">
        {/* Mobile Header Branding */}
        <div className="lg:hidden flex items-center space-x-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ec4899] via-[#d946ef] to-[#8b5cf6] flex items-center justify-center text-white font-black text-base shadow-md shadow-pink-500/20">
            CC
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">Cactusclub</span>
        </div>

        {/* Central Card Container */}
        <div className="w-full max-w-[440px]">
          {/* ======================================================= */}
          {/* MODE 1: LOGIN FLOW                                      */}
          {/* ======================================================= */}
          {mode === 'login' ? (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Connectez-vous à Cactusclub
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Accédez à vos conversations et contenus débloqués
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="exemple@fan.cactusclub"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#151926] focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20 outline-hidden text-sm text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                  />
                </div>

                {/* Password Field (revealed on step 2 of login) */}
                {loginStep === 'password' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#151926] focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20 outline-hidden text-sm text-gray-900 dark:text-white placeholder-gray-400 transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-[#ec4899] cursor-pointer transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* SUIVANT / SE CONNECTER BUTTON */}
                <button
                  type="submit"
                  disabled={!email.trim() || (loginStep === 'password' && !password.trim())}
                  className={`w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    email.trim()
                      ? 'bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#ec4899] hover:opacity-95 text-white shadow-lg shadow-pink-500/25 active:scale-98'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loginStep === 'email' ? 'Suivant' : 'Se Connecter'}
                </button>
              </form>

              {/* Legal Notice */}
              <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 mt-4 text-left">
                En vous connectant et en utilisant Cactusclub, vous confirmez que vous avez au moins{' '}
                <span className="font-bold text-[#ec4899]">18 ans révolus</span> et acceptez nos{' '}
                <span className="text-[#ec4899] hover:underline cursor-pointer font-medium">Conditions d'utilisation</span>.
              </p>

              {/* Switch to Register */}
              <div className="text-center my-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setRegisterStep('credentials');
                    sounds.playReceive();
                  }}
                  className="text-[#ec4899] hover:text-[#c026d3] hover:underline text-sm font-semibold cursor-pointer transition-colors"
                >
                  Pas encore de compte ? Inscrivez-vous (+18)
                </button>
              </div>

              {/* Alternate Logins */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center relative py-3 px-4 rounded-full bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer"
                >
                  <div className="absolute left-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs">
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
                  <span>Se connecter avec Google</span>
                </button>
              </div>
            </div>
          ) : registerStep === 'credentials' ? (
            /* ======================================================= */
            /* MODE 2 - STEP 1 : REGISTER CREDENTIALS (Email & Pwd)    */
            /* ======================================================= */
            <div className="animate-in fade-in duration-200">
              <div className="mb-5">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-wider mb-2">
                  <span>Étape 1 sur 2</span>
                  <span>•</span>
                  <span>Identifiants</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Inscrivez-vous à Cactusclub
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Rejoignez la communauté VIP et soutenez vos créateurs
                </p>
              </div>

              {/* 18+ Mandatory Reminder Pill */}
              <div className="mb-4 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center space-x-2 text-xs text-amber-800 dark:text-amber-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>Plateforme strictement réservée aux personnes majeures (<strong>+18 ans</strong>).</span>
              </div>

              <form onSubmit={handleRegisterCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Adresse e-mail <span className="text-[#ec4899]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="votre.email@domaine.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#151926] focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20 outline-hidden text-sm text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Mot de passe <span className="text-[#ec4899]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#151926] focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20 outline-hidden text-sm text-gray-900 dark:text-white placeholder-gray-400 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-[#ec4899] cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!email.trim() || !password.trim()}
                  className={`w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    email.trim() && password.trim()
                      ? 'bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#ec4899] hover:opacity-95 text-white shadow-lg shadow-pink-500/25 active:scale-98'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continuer vers mon profil (18+)
                </button>
              </form>

              {/* Switch to Login */}
              <div className="text-center my-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLoginStep('email');
                    sounds.playReceive();
                  }}
                  className="text-[#ec4899] hover:text-[#c026d3] hover:underline text-sm font-semibold cursor-pointer transition-colors"
                >
                  Vous avez déjà un compte ? Connectez-vous
                </button>
              </div>

              {/* Alternate Logins */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center relative py-3 px-4 rounded-full bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer"
                >
                  <div className="absolute left-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs">
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
                  <span>S'inscrire avec Google</span>
                </button>
              </div>
            </div>
          ) : (
            /* ======================================================= */
            /* MODE 2 - STEP 2 : COMPLETE PROFILE FORM + 18+ AGE RULE  */
            /* ======================================================= */
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Back to Step 1 Button */}
              <button
                type="button"
                onClick={() => {
                  setRegisterStep('credentials');
                  sounds.playReceive();
                }}
                className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-3 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modifier mes identifiants</span>
              </button>

              <div className="mb-4">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-wider mb-2">
                  <span>Étape 2 sur 2</span>
                  <span>•</span>
                  <span>Profil & Vérification 18+</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Créez votre profil Fan
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Remplissez vos informations et accédez directement à la plateforme (+18 ans)
                </p>
              </div>

              <form onSubmit={handleRegisterProfileSubmit} className="space-y-4">
                {/* Avatar Selection & Upload Section */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#151926] border border-gray-200 dark:border-[#27304b] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Photo de profil / Avatar
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-[#ec4899] hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Téléverser ma photo</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCustomAvatarUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Active Avatar + Preset Avatars Row */}
                  <div className="flex items-center space-x-3">
                    <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#ec4899] to-[#8b5cf6] shadow-md shadow-pink-500/20 flex-shrink-0">
                      <img
                        src={selectedAvatar}
                        alt="Avatar sélectionné"
                        className="w-full h-full rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-1 rounded-full bg-white dark:bg-[#1a2033] shadow-md text-gray-700 dark:text-gray-200 hover:text-[#ec4899] cursor-pointer"
                        title="Changer de photo"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Presets list */}
                    <div className="flex-1 overflow-x-auto no-scrollbar py-1">
                      <div className="flex items-center space-x-2">
                        {AVATAR_PRESETS.map((p) => {
                          const isSelected = selectedAvatar === p.url;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedAvatar(p.url);
                                sounds.playReceive();
                              }}
                              className={`relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#ec4899] scale-105 shadow-sm'
                                  : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                              title={p.label}
                            >
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-[#ec4899]/30 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* First Name & Last Name (2 columns) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Prénom <span className="text-[#ec4899]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Alexandre"
                      value={firstName}
                      onChange={(e) => handleFirstNameChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#151926] focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20 outline-hidden text-xs text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Nom <span className="text-[#ec4899]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dupont"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#151926] focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20 outline-hidden text-xs text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Profile Username / Handle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Pseudo / Nom de profil <span className="text-[#ec4899]">*</span>
                    </label>
                    <span className="text-[10px] text-gray-400">Visible par les créateurs</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="@alexandre_vip"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setCustomUsernameModified(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#151926] focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20 outline-hidden text-xs font-bold text-[#ec4899] placeholder-gray-400 transition-all"
                    />
                  </div>
                </div>

                {/* 18+ REQUIREMENT: DATE OF BIRTH & CERTIFICATION BOX */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-300/80 dark:border-amber-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-[10px] shadow-xs">
                        18+ OBLIGATOIRE
                      </span>
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        Vérification de Majorité
                      </span>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Date de naissance <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split('T')[0]}
                      value={birthDate}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#151926] text-xs font-mono font-bold text-gray-900 dark:text-white outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {birthDate && (
                    <div className="text-[11px] font-semibold">
                      {calculateAge(birthDate) >= 18 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5 inline mr-1" />
                          Âge valide ({calculateAge(birthDate)} ans) — Vous avez l'âge légal requis.
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                          Vous avez {calculateAge(birthDate)} ans. L'accès est strictement interdit aux mineurs.
                        </span>
                      )}
                    </div>
                  )}

                  {ageError && (
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
                      {ageError}
                    </div>
                  )}

                  <label className="flex items-start space-x-2.5 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isOver18Confirmed}
                      onChange={(e) => {
                        setIsOver18Confirmed(e.target.checked);
                        if (e.target.checked && ageError) {
                          setAgeError(null);
                        }
                      }}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#ec4899] focus:ring-[#ec4899] cursor-pointer"
                    />
                    <span className="text-[11px] text-gray-700 dark:text-gray-300 leading-snug">
                      J'atteste sur l'honneur avoir <strong>au moins 18 ans révolus</strong> et être juridiquement autorisé(e) à consulter du contenu adulte exclusif.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!isRegisterStep2Valid}
                  className={`w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isRegisterStep2Valid
                      ? 'bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#ec4899] hover:opacity-95 text-white shadow-lg shadow-pink-500/25 active:scale-98'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Créer mon profil & Accéder à la plateforme
                </button>
              </form>
            </div>
          )}
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
