import React, { useState } from 'react';
import { X, Lock, Check } from 'lucide-react';

interface PPVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendPPV: (price: number, caption: string, mediaUrl: string) => void;
}

const SAMPLE_MEDIA = [
  {
    id: 'm1',
    title: 'Douche Chaude VIP Video',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=400&q=80',
    duration: '01:45',
    suggestedPrice: 15,
  },
  {
    id: 'm2',
    title: 'Lingerie Dentelle Noire 4K',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
    suggestedPrice: 25,
  },
  {
    id: 'm3',
    title: 'Teaser Lit Bedtime Talk',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80',
    duration: '00:58',
    suggestedPrice: 10,
  },
];

export const PPVModal: React.FC<PPVModalProps> = ({
  isOpen,
  onClose,
  onSendPPV,
}) => {
  const [selectedPrice, setSelectedPrice] = useState<number>(15);
  const [customPrice, setCustomPrice] = useState<string>('15');
  const [caption, setCaption] = useState<string>("Rien que pour tes yeux... Débloque la vidéo de ma douche d'aujourd'hui 🙈🚿");
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);

  if (!isOpen) return null;

  const pricePresets = [5, 10, 15, 20, 25, 40, 50];

  const handlePresetClick = (p: number) => {
    setSelectedPrice(p);
    setCustomPrice(p.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomPrice(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setSelectedPrice(num);
    }
  };

  const handleSend = () => {
    const finalPrice = parseFloat(customPrice) || selectedPrice;
    const media = SAMPLE_MEDIA[selectedMediaIndex];
    onSendPPV(finalPrice, caption, media.url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-white dark:bg-[#151926] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#22283d]">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Create Locked PPV Message
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Price Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Set Unlock Price ($ USD)
            </label>
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {pricePresets.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePresetClick(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-numbers transition-all cursor-pointer ${
                    selectedPrice === p
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-[#1c2236] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#252c42]'
                  }`}
                >
                  ${p}
                </button>
              ))}

              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-xs text-gray-400 font-mono-numbers">$</span>
                <input
                  type="number"
                  value={customPrice}
                  onChange={handleCustomChange}
                  placeholder="Custom"
                  className="w-24 pl-6 pr-2 py-1.5 rounded-lg text-xs font-mono-numbers font-bold bg-white dark:bg-[#181d2c] border border-gray-200 dark:border-[#2b334d] text-gray-900 dark:text-white outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Media Vault Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Select Vault Asset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_MEDIA.map((item, idx) => {
                const isSelected = selectedMediaIndex === idx;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedMediaIndex(idx);
                      setSelectedPrice(item.suggestedPrice);
                      setCustomPrice(item.suggestedPrice.toString());
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-4/3 group ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                      <span className="text-[10px] font-bold truncate">{item.title}</span>
                      <span className="text-[9px] text-amber-300 font-mono-numbers">
                        Rec: ${item.suggestedPrice}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teaser Caption */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Teaser Caption / Hook
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#181d2c] border border-gray-200 dark:border-[#2b334d] text-gray-900 dark:text-white outline-hidden focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-[#22283d] flex items-center justify-end space-x-2 bg-gray-50/50 dark:bg-[#181d2c]/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSend}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Send PPV (${customPrice || selectedPrice})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
