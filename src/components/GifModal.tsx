import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

interface GifModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
}

const GIF_COLLECTION = [
  {
    id: 'g1',
    category: 'Flirty',
    title: 'Wink Kiss',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'g2',
    category: 'Love',
    title: 'Heart Hands',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'g3',
    category: 'Reaction',
    title: 'Excited Laugh',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'g4',
    category: 'Tease',
    title: 'Shower Steam Tease',
    url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'g5',
    category: 'Love',
    title: 'Sweet Smile',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'g6',
    category: 'Flirty',
    title: 'Bikini Wave',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
  },
];

export const GifModal: React.FC<GifModalProps> = ({
  isOpen,
  onClose,
  onSelectGif,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Flirty', 'Love', 'Reaction', 'Tease'];

  const filtered = GIF_COLLECTION.filter((g) => {
    const matchCat = activeCategory === 'All' || g.category === activeCategory;
    const matchSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-white dark:bg-[#151926] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#22283d]">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm px-1.5 py-0.5 rounded bg-blue-600 text-white">
              GIF
            </span>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Trending Agency GIFs
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-gray-200 dark:border-[#22283d] space-y-2.5 bg-gray-50/50 dark:bg-[#181d2c]/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search GIFs (wink, tease, kiss, dance)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#121522] border border-gray-200 dark:border-[#2b334d] text-gray-900 dark:text-white placeholder-gray-400 outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-[#20263b] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272e47]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GIFs Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectGif(item.url);
                onClose();
              }}
              className="group relative rounded-xl overflow-hidden aspect-square border border-gray-200 dark:border-[#293149] cursor-pointer hover:scale-103 transition-transform"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-white truncate">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
