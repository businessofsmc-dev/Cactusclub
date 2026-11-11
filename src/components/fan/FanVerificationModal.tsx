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
  MessageCircle,
  Camera,
  RotateCcw
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

  // Recto (Front / Page principale)
  const [docFrontUrl, setDocFrontUrl] = useState<string | null>(fanUser.idDocumentFrontUrl || null);
  const [docFrontName, setDocFrontName] = useState<string | null>(
    fanUser.idDocumentStatus === 'verified' ? 'Piece_Recto_Verifiee.jpg' : null
  );

  // Verso (Back)
  const [docBackUrl, setDocBackUrl] = useState<string | null>(fanUser.idDocumentBackUrl || null);
  const [docBackName, setDocBackName] = useState<string | null>(
    fanUser.idDocumentStatus === 'verified' ? 'Piece_Verso_Verifiee.jpg' : null
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

  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const creatorFirstName = creator.name.split(' ')[0];
  const requiresVerso = docType === 'cni' || docType === 'driving_license';

  const handleUploadFront = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setIdentityError('Fichier trop volumineux (15 Mo maximum).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDocFrontUrl(event.target.result as string);
          setDocFrontName(file.name);
          setIdentityError(null);
          sounds.playReceive();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadBack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setIdentityError('Fichier trop volumineux (15 Mo maximum).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDocBackUrl(event.target.result as string);
          setDocBackName(file.name);
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

    if (!docFrontName && !docFrontUrl) {
      if (docType === 'passport') {
        setIdentityError('Veuillez importer la page principale avec photo et signature de votre Passeport.');
      } else {
        setIdentityError(`Veuillez importer la face avant (Recto) de votre ${docType === 'cni' ? "Carte d'identité" : 'Permis de conduire'}.`);
      }
      return;
    }

    if (requiresVerso && !docBackName && !docBackUrl) {
      setIdentityError(`Veuillez importer la face arrière (Verso) de votre ${docType === 'cni' ? "Carte d'identité" : 'Permis de conduire'}.`);
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
      idDocumentFrontUrl: docFrontUrl || undefined,
      idDocumentBackUrl: requiresVerso ? docBackUrl || undefined : undefined,
      idDocumentFrontName: docFrontName || undefined,
      idDocumentBackName: requiresVerso ? docBackName || undefined : undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-[#131624] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#242b42] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Modal Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-[#7e22ce]/15 via-[#a21caf]/10 to-[#ec4899]/15 border-b border-gray-100 dark:border-[#20263b] flex-shrink-0">
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
                    ? 'Étape 1 sur 2 • Vérification 2FA & Pièce d\'identité'
                    : 'Étape 2 sur 2 • Coordonnées Bancaires'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight">
                {step === 'identity'
                  ? `Vérifiez votre profil pour discuter avec ${creatorFirstName}`
                  : `Coordonnées bancaires & Activation Super Fan`}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {step === 'identity'
                  ? 'Authentification obligatoire (+18 ans) avec importation de votre document officiel.'
                  : `Enregistrez votre carte pour activer vos discussions privées avec ${creator.name}.`}
              </p>
            </div>
          </div>

          {/* 2-Step Progress Bar */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div
              className={`h-1.5 rounded-full transition-all ${step === 'identity'
                  ? 'bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]'
                  : 'bg-emerald-500'
                }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${step === 'banking'
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
            /* STEP 1: DYNAMIC ID IMPORTATION (RECTO / VERSO) & 2FA      */
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

              {/* 1. Document Type Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  1. Sélectionnez votre pièce d'identité officielle (+18)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cni', label: "Carte d'identité", Icon: CreditCard, subtitle: 'Recto & Verso' },
                    { id: 'passport', label: 'Passeport', Icon: Globe, subtitle: 'Page principale' },
                    { id: 'driving_license', label: 'Permis de conduire', Icon: Car, subtitle: 'Recto & Verso' },
                  ].map((tab) => {
                    const TabIcon = tab.Icon;
                    const isSelected = docType === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setDocType(tab.id as any);
                          setIdentityError(null);
                          sounds.playReceive();
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${isSelected
                            ? 'border-[#ec4899] bg-pink-500/10 text-pink-600 dark:text-pink-300 font-bold shadow-xs'
                            : 'border-gray-200 dark:border-[#27304b] bg-gray-50 dark:bg-[#181d2f] text-gray-600 dark:text-gray-400 hover:border-gray-300'
                          }`}
                      >
                        <TabIcon className="w-4 h-4 mb-1" />
                        <span className="text-[11px] font-bold leading-tight truncate max-w-full">{tab.label}</span>
                        <span className="text-[9px] text-gray-400 font-medium mt-0.5">{tab.subtitle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Dynamic Upload Component: Adapted for Selected Document */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    2. Importation des photos de votre {docType === 'cni' ? "Carte d'identité" : docType === 'passport' ? 'Passeport' : 'Permis de conduire'}
                  </label>
                  <span className="text-[10px] text-gray-400">JPG, PNG ou PDF lisible</span>
                </div>

                {/* Hidden input elements */}
                <input
                  ref={frontFileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleUploadFront}
                  className="hidden"
                />
                <input
                  ref={backFileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleUploadBack}
                  className="hidden"
                />

                {/* Conditional Layout: Dual Recto/Verso cards for CNI/Permis, or Single Wide card for Passport */}
                {requiresVerso ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* ===== RECTO (Face avant) ===== */}
                    <div
                      onClick={() => frontFileInputRef.current?.click()}
                      className={`relative rounded-2xl border-2 border-dashed p-3.5 transition-all cursor-pointer flex flex-col justify-between group ${docFrontName
                          ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20'
                          : 'border-gray-300 dark:border-[#2b3552] bg-gray-50 dark:bg-[#181d2f] hover:border-[#ec4899] hover:bg-pink-500/5'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#8b5cf6]/15 text-[#8b5cf6] dark:text-[#a78bfa] font-black text-[9px] uppercase tracking-wider">
                          Face Avant (Recto)
                        </span>
                        {docFrontName ? (
                          <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Chargé</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-500 font-bold">* Requis</span>
                        )}
                      </div>

                      {docFrontUrl && docFrontUrl.startsWith('data:image') ? (
                        <div className="relative w-full h-24 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 mb-2 border border-gray-200 dark:border-white/10">
                          <img src={docFrontUrl} alt="Aperçu Recto" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="py-3 flex flex-col items-center justify-center text-center">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#8b5cf6] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            {docFrontName ? <FileText className="w-4 h-4 text-emerald-500" /> : <Camera className="w-4 h-4" />}
                          </div>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {docFrontName || 'Photo du Recto'}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">
                            {docFrontName ? 'Cliquez pour remplacer' : 'Photo, nom, prénom & date'}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          frontFileInputRef.current?.click();
                        }}
                        className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${docFrontName
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-white dark:bg-[#20273f] border border-gray-300 dark:border-[#323d5e] text-gray-700 dark:text-gray-200 hover:border-[#ec4899]'
                          }`}
                      >
                        {docFrontName ? <RotateCcw className="w-3 h-3" /> : <Upload className="w-3 h-3 text-[#ec4899]" />}
                        <span>{docFrontName ? 'Changer le Recto' : 'Importer le Recto'}</span>
                      </button>
                    </div>

                    {/* ===== VERSO (Face arrière) ===== */}
                    <div
                      onClick={() => backFileInputRef.current?.click()}
                      className={`relative rounded-2xl border-2 border-dashed p-3.5 transition-all cursor-pointer flex flex-col justify-between group ${docBackName
                          ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20'
                          : 'border-gray-300 dark:border-[#2b3552] bg-gray-50 dark:bg-[#181d2f] hover:border-[#ec4899] hover:bg-pink-500/5'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#ec4899]/15 text-[#ec4899] font-black text-[9px] uppercase tracking-wider">
                          Face Arrière (Verso)
                        </span>
                        {docBackName ? (
                          <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Chargé</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-500 font-bold">* Requis</span>
                        )}
                      </div>

                      {docBackUrl && docBackUrl.startsWith('data:image') ? (
                        <div className="relative w-full h-24 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 mb-2 border border-gray-200 dark:border-white/10">
                          <img src={docBackUrl} alt="Aperçu Verso" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="py-3 flex flex-col items-center justify-center text-center">
                          <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-[#ec4899] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            {docBackName ? <FileText className="w-4 h-4 text-emerald-500" /> : <Camera className="w-4 h-4" />}
                          </div>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {docBackName || 'Photo du Verso'}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">
                            {docBackName ? 'Cliquez pour remplacer' : 'Puce, adresse & bande MRZ'}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          backFileInputRef.current?.click();
                        }}
                        className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${docBackName
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-white dark:bg-[#20273f] border border-gray-300 dark:border-[#323d5e] text-gray-700 dark:text-gray-200 hover:border-[#ec4899]'
                          }`}
                      >
                        {docBackName ? <RotateCcw className="w-3 h-3" /> : <Upload className="w-3 h-3 text-[#ec4899]" />}
                        <span>{docBackName ? 'Changer le Verso' : 'Importer le Verso'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ===== PASSEPORT (Page principale unique) ===== */
                  <div
                    onClick={() => frontFileInputRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed p-4 transition-all cursor-pointer flex flex-col items-center text-center group ${docFrontName
                        ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20'
                        : 'border-gray-300 dark:border-[#2b3552] bg-gray-50 dark:bg-[#181d2f] hover:border-[#ec4899] hover:bg-pink-500/5'
                      }`}
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 font-black text-[9px] uppercase tracking-wider">
                        Page Biométrique Principale
                      </span>
                      {docFrontName ? (
                        <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Passeport chargé</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-500 font-bold">* Requis</span>
                      )}
                    </div>

                    {docFrontUrl && docFrontUrl.startsWith('data:image') ? (
                      <div className="relative w-full max-w-sm h-32 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 mb-3 border border-gray-200 dark:border-white/10">
                        <img src={docFrontUrl} alt="Aperçu Passeport" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="py-2 flex flex-col items-center">
                        <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                          <Globe className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          {docFrontName || 'Double page avec photo, signature et bande optique (MRZ)'}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          Assurez-vous que l'ensemble des 4 coins du passeport soient bien visibles et nets.
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        frontFileInputRef.current?.click();
                      }}
                      className={`mt-2 py-2 px-5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${docFrontName
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-white dark:bg-[#20273f] border border-gray-300 dark:border-[#323d5e] text-gray-800 dark:text-gray-200 hover:border-[#ec4899] shadow-xs'
                        }`}
                    >
                      {docFrontName ? <RotateCcw className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5 text-[#ec4899]" />}
                      <span>{docFrontName ? 'Changer la page du passeport' : 'Importer la page principale du Passeport'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. 2FA Code Box */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#181d2f] border border-gray-200 dark:border-[#27304b] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-[#ec4899]" />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      3. Code d'authentification 2FA (6 chiffres)
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
                <span>Valider mes documents & Continuer vers mes infos bancaires</span>
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
                <span>Retour aux pièces d'identité</span>
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
                    Instantané
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
                        className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${isSelected
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
