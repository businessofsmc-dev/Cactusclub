import React, { useState, useRef } from 'react';
import {
  X,
  Star,
  Sparkles,
  Check,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Upload,
  KeyRound,
  Smartphone,
  CreditCard,
  Globe,
  Car,
  Lock,
  ArrowLeft,
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import type { FanUser, CreatorAccount } from '../../types/crm';

interface FanVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  fanUser: FanUser;
  creator: CreatorAccount;
  onVerificationComplete: (updatedUser: FanUser, topUpAmount: number) => void;
}

export const FanVerificationModal: React.FC<FanVerificationModalProps> = ({
  isOpen,
  onClose,
  fanUser,
  creator,
  onVerificationComplete,
}) => {
  // 2-step flow: 'identity' (2FA + ID Document) -> 'banking' (Credit Card Info)
  const [step, setStep] = useState<'identity' | 'banking'>(
    fanUser.isVerified ? 'banking' : 'identity'
  );

  // Step 1: Identity & 2FA states
  const [docType, setDocType] = useState<'cni' | 'passport' | 'driving_license'>('cni');
  const [docFileUrl, setDocFileUrl] = useState<string | null>(fanUser.idDocumentFrontUrl || null);
  const [docFileName, setDocFileName] = useState<string | null>(
    fanUser.idDocumentStatus === 'verified' ? 'Piece_Identite_Verifiee.pdf' : null
  );
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSent, setTwoFactorSent] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  // Step 2: Banking states
  const [cardHolderName, setCardHolderName] = useState(fanUser.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [initialTopUp, setInitialTopUp] = useState<number>(50);
  const [saveCardConsent, setSaveCardConsent] = useState(true);
  const [bankingError, setBankingError] = useState<string | null>(null);

  const idFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const creatorFirstName = creator.name.split(' ')[0];

  const handleIdDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setIdentityError('Document trop volumineux (15 Mo maximum).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDocFileUrl(event.target.result as string);
          setDocFileName(file.name);
          setIdentityError(null);
          sounds.playReceive();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend2FACode = () => {
    setTwoFactorSent(true);
    setTwoFactorCode('742819');
    setIdentityError(null);
    sounds.playReceive();
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFileName && !docFileUrl) {
      setIdentityError('Veuillez sélectionner et téléverser votre pièce d’identité officielle (+18).');
      return;
    }
    if (twoFactorCode.trim().length < 6) {
      setIdentityError('Veuillez saisir le code de sécurité 2FA à 6 chiffres.');
      return;
    }

    setIdentityError(null);
    setStep('banking');
    sounds.playReceive();
  };

  // Format card number as XXXX XXXX XXXX XXXX
  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    setBankingError(null);
  };

  // Format expiry as MM/AA
  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setCardExpiry(digits);
    }
    setBankingError(null);
  };

  const handleBankingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawDigits = cardNumber.replace(/\D/g, '');

    if (!cardHolderName.trim()) {
      setBankingError('Veuillez indiquer le nom complet du titulaire de la carte.');
      return;
    }
    if (rawDigits.length < 16) {
      setBankingError('Veuillez saisir un numéro de carte bancaire valide à 16 chiffres.');
      return;
    }
    if (cardExpiry.length < 5) {
      setBankingError('Veuillez saisir une date d’expiration valide (MM/AA).');
      return;
    }
    if (cardCvc.length < 3) {
      setBankingError('Veuillez saisir le cryptogramme de sécurité (3 chiffres au dos).');
      return;
    }
    if (!saveCardConsent) {
      setBankingError('Veuillez confirmer l’enregistrement sécurisé de votre moyen de paiement.');
      return;
    }

    const updatedUser: FanUser = {
      ...fanUser,
      isVerified: true,
      isSuperFan: true,
      idDocumentType: docType,
      idDocumentStatus: 'verified',
      idDocumentFrontUrl: docFileUrl || undefined,
      hasPaymentMethod: true,
      cardHolderName: cardHolderName.trim(),
      cardLast4: rawDigits.slice(-4),
      cardExpiry,
      isSubscribed: true,
      subscriptionTier: fanUser.subscriptionTier || 'monthly',
    };

    sounds.playCash();
    confetti({
      particleCount: 110,
      spread: 85,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
    });

    onVerificationComplete(updatedUser, initialTopUp);
  };

  const displayedDigits = cardNumber || '•••• •••• •••• ••••';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#131624] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#242b42] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Modal Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-[#7e22ce]/15 via-[#a21caf]/10 to-[#ec4899]/15 border-b border-gray-100 dark:border-[#20263b]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Creator Context & Step Progress */}
          <div className="flex items-center space-x-3.5">
            <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#ec4899] to-[#8b5cf6] shadow-md flex-shrink-0">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-13 h-13 rounded-full object-cover border-2 border-white dark:border-[#131624]"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131624]"></span>
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-wider mb-1 shadow-xs">
                <Star className="w-2.5 h-2.5 fill-white" />
                <span>
                  {step === 'identity'
                    ? 'Étape 1 sur 2 • Vérification 2FA & Identité'
                    : 'Étape 2 sur 2 • Informations Bancaires'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight">
                {step === 'identity'
                  ? `Vérifiez votre profil pour discuter avec ${creatorFirstName}`
                  : `Coordonnées bancaires & Activation Super Fan`}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {step === 'identity'
                  ? 'Sécurité obligatoire (+18 ans) pour débloquer la messagerie privée et le badge Super Fan.'
                  : `Enregistrez votre carte pour activer vos discussions privées avec ${creator.name}.`}
              </p>
            </div>
          </div>

          {/* 2-Step Progress Bar */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 'identity'
                  ? 'bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]'
                  : 'bg-emerald-500'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 'banking'
                  ? 'bg-gradient-to-r from-[#ec4899] to-amber-500'
                  : 'bg-gray-200 dark:bg-gray-800'
              }`}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {step === 'identity' ? (
            /* ========================================================= */
            /* STEP 1: 2FA & ID DOCUMENT VERIFICATION                    */
            /* ========================================================= */
            <form onSubmit={handleIdentitySubmit} className="space-y-4">
              {/* Benefits Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-pink-500/10 to-purple-500/10 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-xs font-black text-amber-800 dark:text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Pourquoi cette vérification est requise avant de discuter :</span>
                </div>
                <div className="space-y-1 text-[11px] text-gray-700 dark:text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 stroke-[3]" />
                    <span>Débloque l'accès direct aux messages privés 1-à-1 avec <strong>{creator.name}</strong>.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 stroke-[3]" />
                    <span>Active votre badge officiel <strong>Super Fan / Vérifié</strong> visible par toutes les créatrices.</span>
                  </div>
                </div>
              </div>

              {/* Document Type Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  1. Sélectionnez votre pièce d'identité officielle (+18)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cni', label: "Carte d'identité", Icon: CreditCard },
                    { id: 'passport', label: 'Passeport', Icon: Globe },
                    { id: 'driving_license', label: 'Permis de conduire', Icon: Car },
                  ].map((tab) => {
                    const TabIcon = tab.Icon;
                    const isSelected = docType === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setDocType(tab.id as any);
                          sounds.playReceive();
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-[#ec4899] bg-pink-500/10 text-pink-600 dark:text-pink-300 font-bold shadow-xs'
                            : 'border-gray-200 dark:border-[#27304b] bg-gray-50 dark:bg-[#181d2f] text-gray-600 dark:text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        <TabIcon className="w-4 h-4 mb-1" />
                        <span className="text-[10px] leading-tight truncate max-w-full">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Zone */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#181d2f] border-2 border-dashed border-gray-300 dark:border-[#2d3755] text-center space-y-2">
                <div className="w-9 h-9 mx-auto rounded-full bg-pink-500/10 text-[#ec4899] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                    Joindre votre justificatif d'identité
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    Format JPG, PNG ou PDF — Crypté et confidentiel
                  </span>
                </div>

                <input
                  ref={idFileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleIdDocumentUpload}
                  className="hidden"
                />

                {docFileName ? (
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/40 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center space-x-2 truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="truncate font-semibold">{docFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => idFileInputRef.current?.click()}
                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline ml-2 cursor-pointer"
                    >
                      Remplacer
                    </button>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => idFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-[#222942] border border-gray-300 dark:border-[#333f63] text-gray-800 dark:text-gray-200 font-bold text-xs hover:border-[#ec4899] transition-all cursor-pointer shadow-xs inline-flex items-center space-x-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#ec4899]" />
                      <span>Sélectionner mon document officiel</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 2FA Code Box */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#181d2f] border border-gray-200 dark:border-[#27304b] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-[#ec4899]" />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      2. Code d'authentification 2FA (6 chiffres)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSend2FACode}
                    className="text-[10px] font-bold text-[#ec4899] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>{twoFactorSent ? 'Code envoyé' : 'Recevoir le code 2FA'}</span>
                  </button>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  placeholder="Saisissez le code à 6 chiffres"
                  value={twoFactorCode}
                  onChange={(e) => {
                    setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''));
                    setIdentityError(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#131624] text-center font-mono text-base font-black tracking-widest text-gray-900 dark:text-white outline-hidden focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20"
                />
              </div>

              {identityError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{identityError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#ec4899] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Valider mon identité & Continuer vers mes infos bancaires</span>
              </button>
            </form>
          ) : (
            /* ========================================================= */
            /* STEP 2: BANKING INFORMATION & WALLET ACTIVATION           */
            /* ========================================================= */
            <form onSubmit={handleBankingSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <button
                type="button"
                onClick={() => setStep('identity')}
                className="flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour à la pièce d'identité</span>
              </button>

              {/* Interactive Premium Card Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1a103c] via-[#4c1d95] to-[#be185d] text-white shadow-xl border border-white/15 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-pink-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                      Cactusclub VIP Pass
                    </span>
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[9px] font-black uppercase">
                    <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                    <span>Super Fan Vérifié</span>
                  </span>
                </div>

                <div className="font-mono text-base sm:text-lg font-black tracking-widest text-white my-2">
                  {displayedDigits}
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/80 mt-3 pt-2 border-t border-white/10">
                  <div>
                    <span className="uppercase block text-[8px] text-white/60">Titulaire</span>
                    <span className="font-bold uppercase tracking-wider">
                      {cardHolderName || 'NOM DU TITULAIRE'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="uppercase block text-[8px] text-white/60">Expire fin</span>
                    <span className="font-mono font-bold">{cardExpiry || 'MM/AA'}</span>
                  </div>
                </div>
              </div>

              {/* Card Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Nom complet sur la carte <span className="text-[#ec4899]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: VALENTIN ROBERT"
                    value={cardHolderName}
                    onChange={(e) => {
                      setCardHolderName(e.target.value);
                      setBankingError(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#181d2f] text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Numéro de carte bancaire <span className="text-[#ec4899]">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="4532 •••• •••• ••••"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#181d2f] text-xs font-mono font-bold text-gray-900 dark:text-white outline-hidden focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Date d'expiration <span className="text-[#ec4899]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#181d2f] text-xs font-mono font-bold text-center text-gray-900 dark:text-white outline-hidden focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Cryptogramme (CVC) <span className="text-[#ec4899]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => {
                          setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
                          setBankingError(null);
                        }}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#181d2f] text-xs font-mono font-bold text-center text-gray-900 dark:text-white outline-hidden focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Initial Wallet Credit Selector */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#181d2f] border border-gray-200 dark:border-[#27304b] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Crédit portefeuille initial (pour vos médias & pourboires)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Instantanné
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 50, 100, 250].map((amt) => {
                    const isSelected = initialTopUp === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setInitialTopUp(amt)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#ec4899] bg-pink-500/15 text-[#ec4899] shadow-2xs'
                            : 'border-gray-200 dark:border-[#27304b] bg-white dark:bg-[#131624] text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {amt === 0 ? '0 $' : `+$${amt}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Consent Checkbox */}
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveCardConsent}
                  onChange={(e) => setSaveCardConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#ec4899] focus:ring-[#ec4899] cursor-pointer"
                />
                <span className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
                  J'autorise l'enregistrement sécurisé SSL 256-bits de ma carte bancaire pour débloquer la messagerie privée et le statut <strong>Super Fan</strong>. Libellé bancaire 100% neutre et discret.
                </span>
              </label>

              {bankingError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{bankingError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-[#ec4899] to-[#8b5cf6] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Valider & Discuter en direct avec {creatorFirstName}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
