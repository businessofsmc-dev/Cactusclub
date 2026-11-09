import React, { useState } from 'react';
import { X, Image, Lock } from 'lucide-react';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: { type: 'image' | 'video'; url: string; price?: number }) => void;
}

const VAULT_ITEMS = [
  {
    id: 'v1',
    title: 'Douche Chaude VIP Video (01:45)',
    type: 'video' as const,
    url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80',
    category: 'Shower',
    recommendedPrice: 15,
  },
  {
    id: 'v2',
    title: 'Lingerie Dentelle Noire 4K (Set 8 photos)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    category: 'Lingerie',
    recommendedPrice: 25,
  },
  {
    id: 'v3',
    title: 'Bedtime Tease Mirror Selfie',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80',
    category: 'Casual',
    recommendedPrice: 10,
  },
  {
    id: 'v4',
    title: 'Bikini Sunset Miami Beach Clip',
    type: 'video' as const,
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    category: 'Outdoor',
    recommendedPrice: 20,
  },
  {
    id: 'v5',
    title: 'Morning Coffee Silk Robe',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    category: 'Morning',
    recommendedPrice: 8,
  },
  {
    id: 'v6',
    title: 'Gym Workout Tight Leggings',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    category: 'Fitness',
    recommendedPrice: 12,
  },
];

export const VaultModal: React.FC<VaultModalProps> = ({
  isOpen,
  onClose,
  onSelectMedia,
}) => {
  const [filter, setFilter] = useState('All');
  if (!isOpen) return null;

  const categories = ['All', 'Shower', 'Lingerie', 'Casual', 'Fitness'];

  const filtered = VAULT_ITEMS.filter(
    (item) => filter === 'All' || item.category === filter
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-3xl bg-white dark:bg-[#151926] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#22283d]">
          <div className="flex items-center space-x-2">
            <Image className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Creator Media Vault & Gallery
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 py-2.5 bg-gray-50/50 dark:bg-[#181d2c]/50 border-b border-gray-200 dark:border-[#22283d] flex items-center space-x-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-[#20263b] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#262d45]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden bg-gray-100 dark:bg-[#191e30] border border-gray-200 dark:border-[#272e47] aspect-4/3"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay with details & Send actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between text-white">
                <span className="text-[10px] font-bold self-end bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs font-mono-numbers text-amber-300">
                  ${item.recommendedPrice}
                </span>

                <div>
                  <p className="text-[11px] font-bold leading-tight line-clamp-1 mb-2">
                    {item.title}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        onSelectMedia({ type: item.type, url: item.url });
                        onClose();
                      }}
                      className="py-1 px-2 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-bold backdrop-blur-xs text-center transition-colors cursor-pointer"
                    >
                      Free Teaser
                    </button>
                    <button
                      onClick={() => {
                        onSelectMedia({
                          type: item.type,
                          url: item.url,
                          price: item.recommendedPrice,
                        });
                        onClose();
                      }}
                      className="py-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-[10px] font-bold text-white text-center transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Lock className="w-3 h-3" />
                      <span>PPV</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
