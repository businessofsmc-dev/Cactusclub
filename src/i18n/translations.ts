export type Language = 'fr' | 'en' | 'es' | 'de';

export interface Translations {
  // TopNav
  home: string;
  activeShift: string;
  sfwOn: string;
  sfwOff: string;
  activeFans: string;

  // Sidebar
  onlineFans: string;
  notifications: string;
  allInboxes: string;
  newestFirst: string;
  highestSpend: string;
  unread: string;
  all: string;
  pinned: string;
  priority: string;
  withTips: string;
  searchPlaceholder: string;
  instantVoiceMemo: string;
  recordingVoiceNote: string;
  send: string;

  // Chat Area
  openInNewTab: string;
  find: string;
  gallery: string;
  broadcastCampaign: string;
  viewMessage: string;
  scripts: string;
  inputPlaceholder: string;
  ppvLocked: string;
  unlocked: string;
  simulateUnlock: string;
  translatedFrom: string;
  matchingScripts: string;
  results: string;

  // Fan Insights
  fanInsights: string;
  crmLive: string;
  spendingBehavior: string;
  totalSpend: string;
  lastSpend: string;
  ppv: string;
  tip: string;
  highestSpendTitle: string;
  organizationMetrics: string;
  spendingPower: string;
  chargebackRisk: string;
  subscription: string;
  status: string;
  active: string;
  cost: string;
  free: string;
  duration: string;
  autoRenewal: string;
  on: string;
  off: string;
  profileAndTags: string;
  tierClassification: string;
  locationAndZone: string;
  fanPreferences: string;
  addTag: string;
  typeTagEnter: string;
  purchasedContent: string;
  sharedAgencyNotes: string;
  addChatterNotePlaceholder: string;
  saveNote: string;
  insightsTab: string;
  salesTab: string;
  notesTab: string;
  tipQuickBtn: string;

  // Modals
  cannedScriptsTitle: string;
  searchScriptsPlaceholder: string;
  applyScript: string;
  applied: string;
  createPPVTitle: string;
  setUnlockPrice: string;
  selectVaultAsset: string;
  teaserCaption: string;
  cancel: string;
  sendPPV: string;
  massMessageTitle: string;
  selectAudience: string;
  launchCampaign: string;
  trendingGifsTitle: string;
  scheduleMessageTitle: string;
  confirmSchedule: string;

  // Admin Dashboard
  dashboard: string;
  creatorEarningsOverview: string;
  netEarnings: string;
  grossEarnings: string;
  yesterday: string;
  today: string;
  thisWeek: string;
  thisMonth: string;
  totalEarnings: string;
  subscriptions: string;
  posts: string;
  messagesEarnings: string;
  tipsEarnings: string;
  referrals: string;
  streams: string;
  myShifts: string;
  noData: string;
  employeeSales: string;
  scheduledHours: string;
  ofManager: string;
  analytics: string;
  messagesPro: string;
  growth: string;
  smartMessages: string;
  vaultPro: string;
  employees: string;
  settings: string;
  helpCenter: string;
  version: string;
  operational: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  fr: {
    home: 'Accueil',
    activeShift: 'Équipe en ligne',
    sfwOn: 'SFW ACTIVÉ',
    sfwOff: 'SFW DÉSACTIVÉ',
    activeFans: '43 Actifs',

    onlineFans: 'Fans en ligne',
    notifications: 'Notifications',
    allInboxes: 'Toutes les boîtes',
    newestFirst: 'Plus récents',
    highestSpend: 'Plus gros dépensiers',
    unread: 'Non lus',
    all: 'Tous',
    pinned: 'Épinglés',
    priority: 'Prioritaire',
    withTips: 'Avec Tips',
    searchPlaceholder: 'Rechercher fans ou message...',
    instantVoiceMemo: 'Note Vocale Rapide',
    recordingVoiceNote: 'Enregistrement vocal...',
    send: 'Envoyer',

    openInNewTab: 'Ouvrir dans un onglet',
    find: 'Chercher',
    gallery: 'Galerie',
    broadcastCampaign: 'Campagne Broadcast',
    viewMessage: 'Voir le message →',
    scripts: 'Scripts',
    inputPlaceholder: 'Tapez "/" + mot-clé pour chercher des scripts...',
    ppvLocked: 'Contenu PPV Verrouillé',
    unlocked: 'Débloqué',
    simulateUnlock: 'Simuler Déblocage Fan 💸',
    translatedFrom: 'Traduit :',
    matchingScripts: 'Scripts correspondants (Entrée ou clic pour insérer)',
    results: 'résultats',

    fanInsights: 'Statistiques Fan',
    crmLive: 'CRM En direct',
    spendingBehavior: "Comportement d'achat",
    totalSpend: 'Dépenses totales',
    lastSpend: 'Dernier achat',
    ppv: 'PPV',
    tip: 'Pourboire (Tip)',
    highestSpendTitle: 'Dépense record',
    organizationMetrics: "Métriques d'organisation",
    spendingPower: "Pouvoir d'achat",
    chargebackRisk: 'Risque de litige',
    subscription: 'Abonnement',
    status: 'Statut',
    active: 'Actif',
    cost: 'Tarif',
    free: 'gratuit',
    duration: 'Durée',
    autoRenewal: 'Renouvellement auto',
    on: 'Activé',
    off: 'Désactivé',
    profileAndTags: 'Profil & Tags',
    tierClassification: 'Classification Tier',
    locationAndZone: 'Localisation & Fuseau',
    fanPreferences: 'Préférences du fan',
    addTag: '+ Ajouter tag',
    typeTagEnter: 'Tapez le tag et faites Entrée...',
    purchasedContent: 'Contenus achetés',
    sharedAgencyNotes: 'Notes agence partagées',
    addChatterNotePlaceholder: 'Ajouter une note de chatter ou consigne fan...',
    saveNote: 'Enregistrer la note',
    insightsTab: 'Aperçu',
    salesTab: 'Ventes',
    notesTab: 'Notes',
    tipQuickBtn: '+ Tip 25$',

    cannedScriptsTitle: 'Scripts Types & Relances Agence',
    searchScriptsPlaceholder: 'Chercher des scripts par mot-clé (douche, lingerie, whale, relance)...',
    applyScript: 'Insérer le script',
    applied: 'Inséré !',
    createPPVTitle: 'Créer un Message PPV Verrouillé',
    setUnlockPrice: 'Définir le prix de déblocage ($ USD)',
    selectVaultAsset: 'Sélectionner un média du coffre',
    teaserCaption: "Accroche / Message d'aperçu",
    cancel: 'Annuler',
    sendPPV: 'Envoyer PPV',
    massMessageTitle: 'Campagne Mass Message & Relance',
    selectAudience: 'Sélectionner le segment de destinataires',
    launchCampaign: 'Lancer la Campagne',
    trendingGifsTitle: 'GIFs Tendance Agence',
    scheduleMessageTitle: 'Programmer un Message Automatisé',
    confirmSchedule: 'Confirmer la programmation',

    dashboard: 'Tableau de bord',
    creatorEarningsOverview: 'Aperçu des revenus créatrice',
    netEarnings: 'Revenus nets',
    grossEarnings: 'Revenus bruts',
    yesterday: 'Hier',
    today: "Aujourd'hui",
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois',
    totalEarnings: 'Total des revenus',
    subscriptions: 'Abonnements',
    posts: 'Publications (Posts)',
    messagesEarnings: 'Messages Privés',
    tipsEarnings: 'Pourboires (Tips)',
    referrals: 'Parrainages',
    streams: 'Lives & Streams',
    myShifts: 'Mes shifts',
    noData: 'Aucune donnée',
    employeeSales: 'Ventes par employé / chatter',
    scheduledHours: 'Heures planifiées',
    ofManager: 'Gestionnaire Cactusclub',
    analytics: 'Analytiques',
    messagesPro: 'Messages Pro',
    growth: 'Croissance',
    smartMessages: 'Smart Messages',
    vaultPro: 'Vault Pro',
    employees: 'Employés & Chatters',
    settings: 'Paramètres',
    helpCenter: "Centre d'aide",
    version: 'Version 5.8.0',
    operational: 'Opérationnel',
  },

  en: {
    home: 'Home',
    activeShift: 'Live Shift',
    sfwOn: 'SFW ON',
    sfwOff: 'SFW OFF',
    activeFans: '43 Active',

    onlineFans: 'Online Fans',
    notifications: 'Notifications',
    allInboxes: 'All inboxes',
    newestFirst: 'Newest first',
    highestSpend: 'Highest spenders',
    unread: 'Unread',
    all: 'All',
    pinned: 'Pinned',
    priority: 'Priority',
    withTips: 'With Tips',
    searchPlaceholder: 'Search fans or chat snippet...',
    instantVoiceMemo: 'Instant Voice Memo',
    recordingVoiceNote: 'Recording voice note...',
    send: 'Send',

    openInNewTab: 'Open in new tab',
    find: 'Find',
    gallery: 'Gallery',
    broadcastCampaign: 'Broadcast Campaign',
    viewMessage: 'View message →',
    scripts: 'Scripts',
    inputPlaceholder: 'Press "/" + keyword to quickly search scripts...',
    ppvLocked: 'PPV Locked Asset',
    unlocked: 'Unlocked',
    simulateUnlock: 'Simulate Fan Unlock 💸',
    translatedFrom: 'Translated:',
    matchingScripts: 'Matching Scripts (Enter or click to insert)',
    results: 'results',

    fanInsights: 'Fan insights',
    crmLive: 'CRM Live',
    spendingBehavior: 'Spending behavior',
    totalSpend: 'Total spend',
    lastSpend: 'Last spend',
    ppv: 'PPV',
    tip: 'Tip',
    highestSpendTitle: 'Highest spend',
    organizationMetrics: 'Organization metrics',
    spendingPower: 'Spending power',
    chargebackRisk: 'Chargeback risk',
    subscription: 'Subscription',
    status: 'Status',
    active: 'Active',
    cost: 'Cost',
    free: 'free',
    duration: 'Duration',
    autoRenewal: 'Auto-renewal',
    on: 'On',
    off: 'Off',
    profileAndTags: 'Profile & Tags',
    tierClassification: 'Tier Classification',
    locationAndZone: 'Location & Zone',
    fanPreferences: 'Fan Preferences',
    addTag: '+ Add tag',
    typeTagEnter: 'Type tag and press Enter...',
    purchasedContent: 'Purchased Content',
    sharedAgencyNotes: 'Shared Agency Notes',
    addChatterNotePlaceholder: 'Add chatter instructions or fan intel...',
    saveNote: 'Save Note',
    insightsTab: 'Insights',
    salesTab: 'Sales',
    notesTab: 'Notes',
    tipQuickBtn: '+ Tip $25',

    cannedScriptsTitle: 'Canned Scripts & Agency Cues',
    searchScriptsPlaceholder: 'Search scripts by keyword (shower, lingerie, whale, custom)...',
    applyScript: 'Insert Script',
    applied: 'Applied!',
    createPPVTitle: 'Create Locked PPV Message',
    setUnlockPrice: 'Set Unlock Price ($ USD)',
    selectVaultAsset: 'Select Vault Asset',
    teaserCaption: 'Teaser Caption / Hook',
    cancel: 'Cancel',
    sendPPV: 'Send PPV',
    massMessageTitle: 'Mass Message & Teaser Campaign',
    selectAudience: 'Select Recipient Segment',
    launchCampaign: 'Launch Campaign',
    trendingGifsTitle: 'Trending Agency GIFs',
    scheduleMessageTitle: 'Schedule Automated Message',
    confirmSchedule: 'Confirm Schedule',

    dashboard: 'Dashboard',
    creatorEarningsOverview: 'Creator earnings overview',
    netEarnings: 'Net earnings',
    grossEarnings: 'Gross earnings',
    yesterday: 'Yesterday',
    today: 'Today',
    thisWeek: 'This week',
    thisMonth: 'This month',
    totalEarnings: 'Total earnings',
    subscriptions: 'Subscriptions',
    posts: 'Posts',
    messagesEarnings: 'Messages',
    tipsEarnings: 'Tips',
    referrals: 'Referrals',
    streams: 'Streams',
    myShifts: 'My shifts',
    noData: 'No data',
    employeeSales: 'Employee sales',
    scheduledHours: 'Scheduled hours',
    ofManager: 'Cactusclub Manager',
    analytics: 'Analytics',
    messagesPro: 'Messages Pro',
    growth: 'Growth',
    smartMessages: 'Smart Messages',
    vaultPro: 'Vault Pro',
    employees: 'Employees',
    settings: 'Settings',
    helpCenter: 'Help center',
    version: 'Version 5.8.0',
    operational: 'Operational',
  },

  es: {
    home: 'Inicio',
    activeShift: 'Turno en vivo',
    sfwOn: 'SFW ACTIVADO',
    sfwOff: 'SFW DESACTIVADO',
    activeFans: '43 Activos',

    onlineFans: 'Fans en línea',
    notifications: 'Notificaciones',
    allInboxes: 'Todas las bandejas',
    newestFirst: 'Más recientes',
    highestSpend: 'Mayores inversores',
    unread: 'No leídos',
    all: 'Todos',
    pinned: 'Fijados',
    priority: 'Prioridad',
    withTips: 'Con Propinas',
    searchPlaceholder: 'Buscar fans o mensajes...',
    instantVoiceMemo: 'Nota de voz rápida',
    recordingVoiceNote: 'Grabando nota de voz...',
    send: 'Enviar',

    openInNewTab: 'Abrir en pestaña',
    find: 'Buscar',
    gallery: 'Galería',
    broadcastCampaign: 'Campaña Difusión',
    viewMessage: 'Ver mensaje →',
    scripts: 'Guiones',
    inputPlaceholder: 'Pulsa "/" + palabra clave para buscar guiones...',
    ppvLocked: 'Contenido PPV Bloqueado',
    unlocked: 'Desbloqueado',
    simulateUnlock: 'Simular Desbloqueo Fan 💸',
    translatedFrom: 'Traducido:',
    matchingScripts: 'Guiones coincidentes (Enter o clic para insertar)',
    results: 'resultados',

    fanInsights: 'Métricas del Fan',
    crmLive: 'CRM En Vivo',
    spendingBehavior: 'Comportamiento de gasto',
    totalSpend: 'Gasto total',
    lastSpend: 'Último gasto',
    ppv: 'PPV',
    tip: 'Propina',
    highestSpendTitle: 'Gasto récord',
    organizationMetrics: 'Métricas de organización',
    spendingPower: 'Poder adquisitivo',
    chargebackRisk: 'Riesgo de contracargo',
    subscription: 'Suscripción',
    status: 'Estado',
    active: 'Activo',
    cost: 'Costo',
    free: 'gratis',
    duration: 'Duración',
    autoRenewal: 'Renovación auto',
    on: 'Sí',
    off: 'No',
    profileAndTags: 'Perfil y Etiquetas',
    tierClassification: 'Clasificación de Nivel',
    locationAndZone: 'Ubicación y Zona',
    fanPreferences: 'Preferencias del fan',
    addTag: '+ Añadir etiqueta',
    typeTagEnter: 'Escribe etiqueta y pulsa Enter...',
    purchasedContent: 'Contenido adquirido',
    sharedAgencyNotes: 'Notas compartidas de agencia',
    addChatterNotePlaceholder: 'Añadir instrucción o nota del fan...',
    saveNote: 'Guardar Nota',
    insightsTab: 'Aperçu',
    salesTab: 'Ventas',
    notesTab: 'Notas',
    tipQuickBtn: '+ Propina $25',

    cannedScriptsTitle: 'Guiones y Respuestas de Agencia',
    searchScriptsPlaceholder: 'Buscar guiones por palabra clave...',
    applyScript: 'Insertar Guión',
    applied: '¡Aplicado!',
    createPPVTitle: 'Crear Mensaje PPV Bloqueado',
    setUnlockPrice: 'Fijar Precio ($ USD)',
    selectVaultAsset: 'Seleccionar recurso del baúl',
    teaserCaption: 'Gancho / Texto de avance',
    cancel: 'Cancelar',
    sendPPV: 'Enviar PPV',
    massMessageTitle: 'Mensaje Masivo y Campaña Teaser',
    selectAudience: 'Seleccionar Audiencia',
    launchCampaign: 'Lanzar Campaña',
    trendingGifsTitle: 'GIFs en Tendencia',
    scheduleMessageTitle: 'Programar Mensaje Automático',
    confirmSchedule: 'Confirmar Programación',

    dashboard: 'Panel de control',
    creatorEarningsOverview: 'Resumen de ingresos de creadora',
    netEarnings: 'Ingresos netos',
    grossEarnings: 'Ingresos brutos',
    yesterday: 'Ayer',
    today: 'Hoy',
    thisWeek: 'Esta semana',
    thisMonth: 'Este mes',
    totalEarnings: 'Ingresos totales',
    subscriptions: 'Suscripciones',
    posts: 'Publicaciones',
    messagesEarnings: 'Mensajes',
    tipsEarnings: 'Propinas',
    referrals: 'Referencias',
    streams: 'Transmisiones',
    myShifts: 'Mis turnos',
    noData: 'Sin datos',
    employeeSales: 'Ventas por empleado',
    scheduledHours: 'Horas programadas',
    ofManager: 'Gestor Cactusclub',
    analytics: 'Analítica',
    messagesPro: 'Messages Pro',
    growth: 'Crecimiento',
    smartMessages: 'Smart Messages',
    vaultPro: 'Vault Pro',
    employees: 'Empleados',
    settings: 'Ajustes',
    helpCenter: 'Centro de ayuda',
    version: 'Versión 5.8.0',
    operational: 'Operativo',
  },

  de: {
    home: 'Startseite',
    activeShift: 'Live-Schicht',
    sfwOn: 'SFW AN',
    sfwOff: 'SFW AUS',
    activeFans: '43 Aktiv',

    onlineFans: 'Online Fans',
    notifications: 'Benachrichtigungen',
    allInboxes: 'Alle Postfächer',
    newestFirst: 'Neueste zuerst',
    highestSpend: 'Höchste Ausgaben',
    unread: 'Ungelesen',
    all: 'Alle',
    pinned: 'Angeheftet',
    priority: 'Priorität',
    withTips: 'Mit Trinkgeld',
    searchPlaceholder: 'Fans oder Chat suchen...',
    instantVoiceMemo: 'Sprachmemo',
    recordingVoiceNote: 'Aufnahme läuft...',
    send: 'Senden',

    openInNewTab: 'Im neuen Tab öffnen',
    find: 'Suchen',
    gallery: 'Galerie',
    broadcastCampaign: 'Broadcast-Kampagne',
    viewMessage: 'Nachricht ansehen →',
    scripts: 'Skripte',
    inputPlaceholder: 'Drücke "/" + Suchbegriff für Skripte...',
    ppvLocked: 'PPV Gesperrt',
    unlocked: 'Freigeschaltet',
    simulateUnlock: 'Fan-Freischaltung simulieren 💸',
    translatedFrom: 'Übersetzt:',
    matchingScripts: 'Passende Skripte',
    results: 'Ergebnisse',

    fanInsights: 'Fan-Einblicke',
    crmLive: 'Live-CRM',
    spendingBehavior: 'Kaufverhalten',
    totalSpend: 'Gesamtausgaben',
    lastSpend: 'Letzte Ausgabe',
    ppv: 'PPV',
    tip: 'Trinkgeld',
    highestSpendTitle: 'Höchste Ausgabe',
    organizationMetrics: 'Organisations-Metriken',
    spendingPower: 'Kaufkraft',
    chargebackRisk: 'Rückbuchungsrisiko',
    subscription: 'Abonnement',
    status: 'Status',
    active: 'Aktiv',
    cost: 'Kosten',
    free: 'kostenlos',
    duration: 'Dauer',
    autoRenewal: 'Auto-Verlängerung',
    on: 'Ein',
    off: 'Aus',
    profileAndTags: 'Profil & Tags',
    tierClassification: 'Tier-Einstufung',
    locationAndZone: 'Ort & Zeitzone',
    fanPreferences: 'Fan-Vorlieben',
    addTag: '+ Tag hinzufügen',
    typeTagEnter: 'Tag eingeben und Enter drücken...',
    purchasedContent: 'Gekaufte Inhalte',
    sharedAgencyNotes: 'Geteilte Notizen',
    addChatterNotePlaceholder: 'Notiz oder Fan-Hinweis hinzufügen...',
    saveNote: 'Notiz speichern',
    insightsTab: 'Einblicke',
    salesTab: 'Verkäufe',
    notesTab: 'Notizen',
    tipQuickBtn: '+ Trinkgeld $25',

    cannedScriptsTitle: 'Vordefinierte Skripte',
    searchScriptsPlaceholder: 'Skripte durchsuchen...',
    applyScript: 'Skript einfügen',
    applied: 'Eingefügt!',
    createPPVTitle: 'Gesperrte PPV-Nachricht erstellen',
    setUnlockPrice: 'Freischaltpreis festlegen ($ USD)',
    selectVaultAsset: 'Medium auswählen',
    teaserCaption: 'Teaser-Text',
    cancel: 'Abbrechen',
    sendPPV: 'PPV senden',
    massMessageTitle: 'Massen-Nachricht senden',
    selectAudience: 'Zielgruppe wählen',
    launchCampaign: 'Kampagne starten',
    trendingGifsTitle: 'Trend-GIFs',
    scheduleMessageTitle: 'Nachricht planen',
    confirmSchedule: 'Planung bestätigen',

    dashboard: 'Dashboard',
    creatorEarningsOverview: 'Einnahmen-Übersicht',
    netEarnings: 'Nettoeinnahmen',
    grossEarnings: 'Bruttoeinnahmen',
    yesterday: 'Gestern',
    today: 'Heute',
    thisWeek: 'Diese Woche',
    thisMonth: 'Dieser Monat',
    totalEarnings: 'Gesamteinnahmen',
    subscriptions: 'Abonnements',
    posts: 'Beiträge',
    messagesEarnings: 'Nachrichten',
    tipsEarnings: 'Trinkgelder',
    referrals: 'Empfehlungen',
    streams: 'Streams',
    myShifts: 'Meine Schichten',
    noData: 'Keine Daten',
    employeeSales: 'Mitarbeiter-Umsätze',
    scheduledHours: 'Geplante Stunden',
    ofManager: 'Cactusclub-Manager',
    analytics: 'Analytik',
    messagesPro: 'Messages Pro',
    growth: 'Wachstum',
    smartMessages: 'Smart Messages',
    vaultPro: 'Vault Pro',
    employees: 'Mitarbeiter',
    settings: 'Einstellungen',
    helpCenter: 'Hilfe-Center',
    version: 'Version 5.8.0',
    operational: 'Betriebsbereit',
  },
};
