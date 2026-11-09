import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Check, 
  ShieldCheck, 
  Truck, 
  Lock, 
  Star, 
  X, 
  Plus, 
  Eye, 
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import type { FanUser } from '../../types/crm';
import type { ShopItem, ShopCategory, ShopOrder } from '../../types/shop';
import { SHOP_CATEGORIES, INITIAL_SHOP_ITEMS } from '../../data/shopData';

interface FanShopViewProps {
  fanUser: FanUser;
  onTopUpWallet: (amount: number) => void;
  onOpenWalletModal: () => void;
  onStartChatWithCreator?: (creatorId: string) => void;
  onOpenLightbox: (url: string, title?: string, price?: number) => void;
}

export const FanShopView: React.FC<FanShopViewProps> = ({
  fanUser,
  onTopUpWallet,
  onOpenWalletModal,
  onStartChatWithCreator,
  onOpenLightbox,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ShopItem | null>(null);
  const [completedOrder, setCompletedOrder] = useState<ShopOrder | null>(null);

  // Filter items
  const filteredItems = INITIAL_SHOP_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.endorsedBy && item.endorsedBy.creatorName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Handle direct purchase with wallet
  const handlePurchase = (item: ShopItem) => {
    if (fanUser.walletBalance < item.price) {
      const needed = item.price - fanUser.walletBalance;
      if (confirm(`Solde portefeuille insuffisant ($${fanUser.walletBalance.toFixed(2)}). Il vous manque $${needed.toFixed(2)}. Souhaitez-vous recharger votre solde ?`)) {
        onOpenWalletModal();
      }
      return;
    }

    // Deduct from wallet
    onTopUpWallet(-item.price);
    sounds.playCash();

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#f59e0b', '#8b5cf6', '#10b981'],
    });

    const newOrder: ShopOrder = {
      id: `ord-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      itemImage: item.image,
      price: item.price,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'confirmed',
      trackingNumber: `CC-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setCompletedOrder(newOrder);
    if (selectedProduct) setSelectedProduct(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full pb-20 space-y-8 select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900 via-pink-900 to-indigo-950 p-6 sm:p-10 text-white shadow-xl border border-pink-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold mb-3 backdrop-blur-md border border-pink-500/30">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Boutique Officielle Érotique & Romance</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-tight">
            La Boutique Secrète CactusClub
          </h1>

          <p className="text-xs sm:text-sm text-pink-100/80 leading-relaxed mb-6">
            Lingerie fine en soie, escarpins vertigineux, menottes en velours, fouets artisanaux et sextoys haut de gamme testés et approuvés par vos créatrices préférées.
          </p>

          {/* Discreet Reassurance Pills */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-pink-200">
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-black/40 backdrop-blur-xs border border-white/10 font-medium">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Colis 100% Anonyme & Discret</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-black/40 backdrop-blur-xs border border-white/10 font-medium">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Paiement Portefeuille Sécurisé</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-black/40 backdrop-blur-xs border border-white/10 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
              <span>Qualité & Authenticité Certifiée</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Category Pills Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {SHOP_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as ShopCategory);
                  sounds.playReceive();
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25 scale-102'
                    : 'bg-white dark:bg-[#131624] text-gray-700 dark:text-gray-300 border border-gray-200/90 dark:border-[#1e2338] hover:border-pink-400'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search input & User wallet summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher lingerie, menottes, talons, sextoy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#131624] border border-gray-200 dark:border-[#1e2338] text-xs focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              {filteredItems.length} article{filteredItems.length > 1 ? 's' : ''} disponible{filteredItems.length > 1 ? 's' : ''}
            </span>

            <div
              onClick={onOpenWalletModal}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold font-mono-numbers cursor-pointer hover:bg-emerald-500/20 transition-colors"
              title="Votre solde disponible pour vos achats"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Solde : ${fanUser.walletBalance.toFixed(2)}</span>
              <Plus className="w-3 h-3 ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-white dark:bg-[#131624] border border-gray-200/90 dark:border-[#1e2338] shadow-xs hover:shadow-xl hover:border-pink-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
          >
            <div>
              {/* Product Image Container */}
              <div className="h-64 w-full relative overflow-hidden bg-black/90">
                <img
                  src={item.image}
                  alt={item.name}
                  onClick={() => onOpenLightbox(item.image, item.name, item.price)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                {/* Badge (Best-Seller, VIP, etc.) */}
                {item.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md">
                    {item.badge}
                  </span>
                )}

                {/* Category tag */}
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                  {item.categoryLabel}
                </span>

                {/* Quick zoom button */}
                <button
                  onClick={() => onOpenLightbox(item.image, item.name, item.price)}
                  className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                  title="Agrandir la photo"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-3">
                {/* Creator Endorsement Tag */}
                {item.endorsedBy && (
                  <div
                    onClick={() => onStartChatWithCreator?.(item.endorsedBy!.creatorId)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl bg-pink-500/5 border border-pink-500/10 cursor-pointer hover:bg-pink-500/10 transition-colors"
                    title={`Discuter avec ${item.endorsedBy.creatorName}`}
                  >
                    <img
                      src={item.endorsedBy.avatar}
                      alt={item.endorsedBy.creatorName}
                      className="w-5 h-5 rounded-full object-cover border border-pink-400"
                    />
                    <span className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 truncate">
                      Coup de cœur de <strong className="font-bold">{item.endorsedBy.creatorName}</strong>
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white leading-snug group-hover:text-pink-500 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center text-amber-400 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold ml-1 text-gray-800 dark:text-gray-200 font-mono-numbers">
                        {item.rating}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">({item.reviewsCount} avis vérifiés)</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Features Bullets */}
                <ul className="space-y-1 pt-1">
                  {item.features.slice(0, 2).map((feat, idx) => (
                    <li key={idx} className="flex items-center text-[11px] text-gray-500 dark:text-gray-400 space-x-1.5">
                      <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Price & Action Footer */}
            <div className="p-5 pt-0 border-t border-gray-100 dark:border-[#1a2033] mt-2 flex items-center justify-between">
              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl font-black font-mono-numbers text-gray-900 dark:text-white">
                    ${item.price.toFixed(2)}
                  </span>
                  {item.originalPrice && (
                    <span className="text-xs text-gray-400 line-through font-mono-numbers">
                      ${item.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-500 font-semibold block">Livraison discrète offerte</span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setSelectedProduct(item)}
                  className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#1a2033] dark:hover:bg-[#252b45] text-gray-700 dark:text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                  title="Voir les détails complets"
                >
                  Détails
                </button>

                <button
                  onClick={() => handlePurchase(item)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-pink-500/25 active:scale-95 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Acheter</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
          <div className="w-full max-w-2xl bg-white dark:bg-[#131624] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#222942] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black flex-shrink-0">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute bottom-3 left-4 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                {selectedProduct.categoryLabel}
              </span>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  {selectedProduct.name}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center text-amber-400 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold ml-1 text-gray-800 dark:text-gray-200 font-mono-numbers">
                      {selectedProduct.rating}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">({selectedProduct.reviewsCount} avis de clients vérifiés)</span>
                </div>
              </div>

              {selectedProduct.endorsedBy && (
                <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-start space-x-3">
                  <img
                    src={selectedProduct.endorsedBy.avatar}
                    alt={selectedProduct.endorsedBy.creatorName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-pink-500 flex-shrink-0"
                  />
                  <div className="text-xs">
                    <div className="font-black text-pink-600 dark:text-pink-400">
                      Le mot de {selectedProduct.endorsedBy.creatorName} :
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic mt-0.5">
                      "{selectedProduct.endorsedBy.quote}"
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {selectedProduct.description}
              </p>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Caractéristiques d'exception</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                  {selectedProduct.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs flex items-center justify-between text-gray-500">
                <span className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-emerald-500" />
                  <span>Emballage neutre sans inscription commerciale extérieure.</span>
                </span>
                <span className="font-bold text-emerald-500">Gratuit</span>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-gray-100 dark:border-[#1e2338] flex items-center justify-between bg-white dark:bg-[#131624]">
              <div>
                <span className="text-xs text-gray-400">Prix total :</span>
                <div className="text-2xl font-black font-mono-numbers text-gray-900 dark:text-white">
                  ${selectedProduct.price.toFixed(2)}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Fermer
                </button>

                <button
                  onClick={() => handlePurchase(selectedProduct)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Confirmer la Commande (${selectedProduct.price.toFixed(2)})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmed Success Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
          <div className="w-full max-w-md bg-white dark:bg-[#131624] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#222942] p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-xl animate-bounce">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              Commande Confirmée avec Succès !
            </h3>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Votre commande pour <strong>{completedOrder.itemName}</strong> a été validée. Le montant de <strong>${completedOrder.price.toFixed(2)}</strong> a été réglé avec votre portefeuille.
            </p>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1a2033] border border-gray-200 dark:border-[#262e4a] text-xs text-left space-y-2 font-mono-numbers">
              <div className="flex justify-between">
                <span className="text-gray-400">N° de Suivi Secret :</span>
                <span className="font-bold text-pink-600 dark:text-pink-400">{completedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Expédition :</span>
                <span className="font-bold text-emerald-500">Discrète sous 24-48h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Solde Restant :</span>
                <span className="font-bold text-gray-900 dark:text-white">${fanUser.walletBalance.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setCompletedOrder(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-pink-500/25 active:scale-95 transition-all cursor-pointer"
            >
              Continuer mes achats
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
