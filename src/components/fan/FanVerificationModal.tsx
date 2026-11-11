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
  CreditCard,
  Globe,
  Car,
  Lock,
  ArrowLeft,
  AlertCircle,
  MessageCircle,
  Camera,
  RotateCcw,
  Mail,
  Copy,
  ShieldAlert,
  Inbox,
  FileCheck2,
  Layers
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

  // Format selection for CNI & Driving license: 'photos' (2 separate photos) vs 'pdf' (1 complete PDF with both sides)
  const [cniFormat, setCniFormat] = useState<'photos' | 'pdf'>('photos');

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

  // Single PDF with both sides
  const [docPdfUrl, setDocPdfUrl] = useState<string | null>(null);
  const [docPdfName, setDocPdfName] = useState<string | null>(null);

  // 2FA Email & Code state
  const [generated2FACode, setGenerated2FACode] = useState<string>('742819');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSent, setTwoFactorSent] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const creatorFirstName = creator.name.split(' ')[0];
  const requiresVerso = docType === 'cni' || docType === 'driving_license';
  const recipientEmail = fanUser.email || 'alexandre@fan.cactusclub';

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

  const handleUploadPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setIdentityError('Fichier PDF trop volumineux (20 Mo maximum).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDocPdfUrl(event.target.result as string);
          setDocPdfName(file.name);
          setIdentityError(null);
          sounds.playReceive();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend2FACode = () => {
    const newCode = '742819';
    setGenerated2FACode(newCode);
    setTwoFactorSent(true);
    setIsEmailModalOpen(true);
    setIdentityError(null);
    sounds.playReceive();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generated2FACode);
    setIsCopied(true);
    sounds.playReceive();
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAutoFillCodeFromEmail = () => {
    setTwoFactorCode(generated2FACode);
    setIsEmailModalOpen(false);
    sounds.playCash();
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (requiresVerso) {
      if (cniFormat === 'pdf') {
        if (!docPdfName && !docPdfUrl) {
          setIdentityError(`Veuillez importer le fichier PDF complet (recto-verso) de votre ${docType === 'cni' ? "Carte d'identité" : 'Permis de conduire'}.`);
          return;
        }
      } else {
        if (!docFrontName && !docFrontUrl) {
          setIdentityError(`Veuillez importer la face avant (Recto) de votre ${docType === 'cni' ? "Carte d'identité" : 'Permis de conduire'}.`);
          return;
        }
        if (!docBackName && !docBackUrl) {
          setIdentityError(`Veuillez importer la face arrière (Verso) de votre ${docType === 'cni' ? "Carte d'identité" : 'Permis de conduire'}.`);
          return;
        }
      }
    } else {
      // Passport
      if (!docFrontName && !docFrontUrl) {
        setIdentityError('Veuillez importer la page principale avec photo et signature de votre Passeport.');
        return;
      }
    }

    if (twoFactorCode.trim().length < 6) {
      setIdentityError('Veuillez saisir le code de sécurité 2FA à 6 chiffres envoyé par e-mail.');
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

    const isPdfMode = requiresVerso && cniFormat === 'pdf';

    const updatedUser: FanUser = {
      ...fanUser,
      isVerified: true,
      isSuperFan: true,
      idDocumentType: docType,
      idDocumentStatus: 'verified',
      idDocumentFrontUrl: isPdfMode ? docPdfUrl || undefined : docFrontUrl || undefined,
      idDocumentBackUrl: isPdfMode ? undefined : docBackUrl || undefined,
      idDocumentFrontName: isPdfMode ? docPdfName || undefined : docFrontName || undefined,
      idDocumentBackName: isPdfMode ? undefined : docBackName || undefined,
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
            /* STEP 1: DYNAMIC ID IMPORTATION (RECTO/VERSO OU PDF) & 2FA */
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
                    { id: 'cni', label: "Carte d'identité", Icon: CreditCard, subtitle: 'Recto-Verso ou PDF' },
                    { id: 'passport', label: 'Passeport', Icon: Globe, subtitle: 'Page principale' },
                    { id: 'driving_license', label: 'Permis de conduire', Icon: Car, subtitle: 'Recto-Verso ou PDF' },
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
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
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

              {/* 2. Format Selector & Dynamic Upload Component */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    2. Importation de votre {docType === 'cni' ? "Carte d'identité" : docType === 'passport' ? 'Passeport' : 'Permis de conduire'}
                  </label>
                </div>

                {/* Sub-Format Switcher for CNI & Driving License: Photos (Recto/Verso) vs PDF complet */}
                {requiresVerso && (
                  <div className="grid grid-cols-2 p-1 mb-3 rounded-xl bg-gray-100 dark:bg-[#1a2034] text-xs font-bold border border-gray-200/80 dark:border-[#29324e]">
                    <button
                      type="button"
                      onClick={() => {
                        setCniFormat('photos');
                        setIdentityError(null);
                        sounds.playReceive();
                      }}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                        cniFormat === 'photos'
                          ? 'bg-white dark:bg-[#252c48] text-[#ec4899] shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>2 Photos (Recto & Verso)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCniFormat('pdf');
                        setIdentityError(null);
                        sounds.playReceive();
                      }}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                        cniFormat === 'pdf'
                          ? 'bg-white dark:bg-[#252c48] text-[#ec4899] shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Document PDF (2 faces réunies)</span>
                    </button>
                  </div>
                )}

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
                <input
                  ref={pdfFileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleUploadPdf}
                  className="hidden"
                />

                {/* VIEW A: DUAL RECTO/VERSO PHOTO CARDS */}
                {requiresVerso && cniFormat === 'photos' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                    {/* ===== RECTO (Face avant) ===== */}
                    <div
                      onClick={() => frontFileInputRef.current?.click()}
                      className={`relative rounded-2xl border-2 border-dashed p-3.5 transition-all cursor-pointer flex flex-col justify-between group ${
                        docFrontName
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
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
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
                        className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                          docFrontName
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
                      className={`relative rounded-2xl border-2 border-dashed p-3.5 transition-all cursor-pointer flex flex-col justify-between group ${
                        docBackName
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
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
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
                        className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                          docBackName
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-white dark:bg-[#20273f] border border-gray-300 dark:border-[#323d5e] text-gray-700 dark:text-gray-200 hover:border-[#ec4899]'
                        }`}
                      >
                        {docBackName ? <RotateCcw className="w-3 h-3" /> : <Upload className="w-3 h-3 text-[#ec4899]" />}
                        <span>{docBackName ? 'Changer le Verso' : 'Importer le Verso'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* VIEW B: SINGLE COMPLETE PDF COMPONENT */}
                {requiresVerso && cniFormat === 'pdf' && (
                  <div
                    onClick={() => pdfFileInputRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed p-4.5 transition-all cursor-pointer flex flex-col items-center text-center group animate-in fade-in ${
                      docPdfName
                        ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20'
                        : 'border-gray-300 dark:border-[#2b3552] bg-gray-50 dark:bg-[#181d2f] hover:border-[#ec4899] hover:bg-pink-500/5'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 font-black text-[9px] uppercase tracking-wider flex items-center space-x-1">
                        <FileCheck2 className="w-3 h-3" />
                        <span>Fichier PDF Complet (2 faces)</span>
                      </span>
                      {docPdfName ? (
                        <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PDF importé</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-500 font-bold">* Requis</span>
                      )}
                    </div>

                    <div className="py-2.5 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {docPdfName || `Document PDF officiel de votre ${docType === 'cni' ? "Carte d'identité" : 'Permis de conduire'}`}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 max-w-sm">
                        {docPdfName
                          ? 'Fichier PDF validé. Les 2 faces (recto et verso) seront vérifiées par notre système.'
                          : 'Importez votre document PDF numérique comportant le recto et le verso réunis dans un seul fichier.'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        pdfFileInputRef.current?.click();
                      }}
                      className={`mt-2 py-2 px-5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        docPdfName
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-white dark:bg-[#20273f] border border-gray-300 dark:border-[#323d5e] text-gray-800 dark:text-gray-200 hover:border-[#ec4899] shadow-xs'
                      }`}
                    >
                      {docPdfName ? <RotateCcw className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5 text-[#ec4899]" />}
                      <span>{docPdfName ? 'Remplacer le document PDF' : 'Sélectionner mon fichier PDF (+18)'}</span>
                    </button>
                  </div>
                )}

                {/* VIEW C: PASSEPORT (Page principale unique) */}
                {!requiresVerso && (
                  <div
                    onClick={() => frontFileInputRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed p-4 transition-all cursor-pointer flex flex-col items-center text-center group ${
                      docFrontName
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
                      className={`mt-2 py-2 px-5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        docFrontName
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

              {/* 3. 2FA Code Box with Email Template Trigger */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#181d2f] border border-gray-200 dark:border-[#27304b] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-[#ec4899]" />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      3. Code d'authentification 2FA envoyé par e-mail
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleSend2FACode}
                      className="text-[11px] font-bold text-[#ec4899] hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{twoFactorSent ? 'Renvoyer l\'e-mail' : 'Envoyer mon code par e-mail'}</span>
                    </button>

                    {twoFactorSent && (
                      <button
                        type="button"
                        onClick={() => setIsEmailModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-[#ec4899] text-[10px] font-extrabold flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Voir l'e-mail officiel reçu"
                      >
                        <Inbox className="w-3 h-3" />
                        <span>Ouvrir l'e-mail reçu</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Saisissez le code à 6 chiffres reçu par e-mail"
                    value={twoFactorCode}
                    onChange={(e) => {
                      setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''));
                      setIdentityError(null);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#27304b] bg-white dark:bg-[#131624] text-center font-mono text-base font-black tracking-widest text-gray-900 dark:text-white outline-hidden focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                  <span>Destinataire : <strong className="text-gray-800 dark:text-gray-200">{recipientEmail}</strong></span>
                  {twoFactorSent ? (
                    <span className="text-emerald-500 font-semibold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>E-mail envoyé avec succès</span>
                    </span>
                  ) : (
                    <span>Cliquez ci-dessus pour recevoir votre e-mail de sécurité.</span>
                  )}
                </div>
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

      {/* ========================================================= */}
      {/* REALISTIC OFFICIAL CACTUSCLUB EMAIL INBOX TEMPLATE MODAL  */}
      {/* ========================================================= */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
          <div className="w-full max-w-lg bg-white dark:bg-[#111422] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#29324e] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Email Client Header bar */}
            <div className="px-5 py-3.5 bg-gray-100 dark:bg-[#181d30] border-b border-gray-200 dark:border-[#252d47] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-bold">
                <Mail className="w-4 h-4 text-[#ec4899]" />
                <span>Messagerie • 1 nouveau message de sécurité</span>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Meta Information */}
            <div className="px-5 py-3.5 bg-gray-50 dark:bg-[#14192b] border-b border-gray-200/70 dark:border-[#20273e] text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-gray-900 dark:text-white text-sm">
                  🔒 Votre code d'authentification 2FA Cactusclub
                </span>
                <span className="text-[10px] text-gray-400 font-medium">À l'instant</span>
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>De : <strong className="text-gray-800 dark:text-gray-200">Cactusclub Security</strong> &lt;securite@cactusclub.agency&gt;</span>
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                À : <span className="font-semibold text-gray-700 dark:text-gray-300">{recipientEmail}</span>
              </div>
            </div>

            {/* HTML Email Template Body */}
            <div className="p-6 overflow-y-auto space-y-5 bg-white dark:bg-[#0f121e]">
              {/* Cactusclub Official Brand Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#7e22ce] via-[#a21caf] to-[#ec4899] text-white flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-lg text-[#ec4899] shadow-sm">
                    CC
                  </div>
                  <div>
                    <h3 className="font-black text-base tracking-tight leading-tight">Cactusclub</h3>
                    <span className="text-[9px] uppercase tracking-widest text-white/80 block font-bold">
                      VIP Creator Network
                    </span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs border border-white/25 text-[10px] font-black uppercase tracking-wider">
                  Sécurité 2FA
                </div>
              </div>

              {/* Personalized Email Text */}
              <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  Bonjour {fanUser.name || 'Cher Membre'},
                </p>

                <p>
                  Vous avez initié une procédure de vérification d'identité pour certifier votre profil et débloquer les échanges privés en direct avec <strong>{creator.name}</strong> sur Cactusclub.
                </p>

                <p>
                  Veuillez utiliser votre code de sécurité confidentiel à usage unique pour confirmer votre authentification à 2 facteurs :
                </p>
              </div>

              {/* Huge 6-Digit Code Display */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#161b2e] border border-gray-200 dark:border-[#2a3452] text-center space-y-3 shadow-inner">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block">
                  Votre Code de Confirmation à 6 chiffres
                </span>

                <div className="flex items-center justify-center space-x-2 font-mono text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-widest py-1">
                  {generated2FACode.split('').map((digit, idx) => (
                    <span
                      key={idx}
                      className="w-10 h-12 rounded-xl bg-white dark:bg-[#1f263e] border border-gray-200 dark:border-[#38456b] flex items-center justify-center shadow-xs text-[#ec4899]"
                    >
                      {digit}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAutoFillCodeFromEmail}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Insérer automatiquement ce code</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white dark:bg-[#20273f] border border-gray-300 dark:border-[#354166] text-gray-800 dark:text-gray-200 font-bold text-xs hover:border-[#ec4899] active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Code copié !' : 'Copier le code'}</span>
                  </button>
                </div>
              </div>

              {/* Security Advisory */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>Consignes de sécurité Cactusclub :</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-[10px] text-gray-600 dark:text-gray-400">
                  <li>Ce code expire automatiquement dans 10 minutes.</li>
                  <li>Ne le communiquez à personne : l'équipe Cactusclub ne vous demandera jamais ce code.</li>
                </ul>
              </div>

              {/* Email Footer */}
              <div className="pt-3 border-t border-gray-100 dark:border-white/10 text-center text-[10px] text-gray-400 space-y-1">
                <p>Cactusclub Global Network Ltd. • Plateforme réservée aux membres majeurs (+18 ans).</p>
                <p>Protégé par cryptage SSL 256 bits • Confidentialité bancaire et personnelle 100% garantie.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
