import React, { useState } from 'react';
import { X, Send, Radio, Lock, Check, Clock } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendBroadcast: (text: string, audience: string, price?: number) => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  onSendBroadcast,
}) => {
  const [text, setText] = useState<string>("tu ferais quoi si je te disais que j'pense à toi sous ma douche? 😜");
  const [targetAudience, setTargetAudience] = useState<string>('Online Fans (48)');
  const [isPPV, setIsPPV] = useState<boolean>(false);
  const [price, setPrice] = useState<number>(15);

  if (!isOpen) return null;

  const audiences = [
    { label: 'Online Fans (48)', desc: 'Fans actively browsing right now' },
    { label: 'High Spenders (Top 5%)', desc: 'VIPs with spend > $100' },
    { label: 'Non-spenders ($0)', desc: 'Convert free subs to first purchase' },
    { label: 'All Subscribers (482)', desc: 'Global agency broadcast' },
  ];

  const handleSend = () => {
    if (!text.trim()) return;
    onSendBroadcast(text, targetAudience, isPPV ? price : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-white dark:bg-[#151926] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#22283d]">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Mass Message & Teaser Campaign
              </h2>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Blast all selected fans simultaneously
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Select Recipient Segment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {audiences.map((aud) => (
                <div
                  key={aud.label}
                  onClick={() => setTargetAudience(aud.label)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    targetAudience === aud.label
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 text-blue-900 dark:text-white'
                      : 'border-gray-200 dark:border-[#262c45] bg-gray-50/50 dark:bg-[#191e30] text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{aud.label}</span>
                    {targetAudience === aud.label && <Check className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{aud.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Broadcast Message Copy */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Teaser Message Copy
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your mass message hook..."
              className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#181d2c] border border-gray-200 dark:border-[#2b334d] text-gray-900 dark:text-white outline-hidden focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* PPV Option Toggle */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#191e30] border border-gray-200/80 dark:border-[#262c45] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  Lock Media with PPV Price
                </span>
                <span className="text-[10px] text-gray-400">
                  Include paywalled preview video
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isPPV && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-mono-numbers font-bold text-amber-500">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-16 p-1 text-xs font-mono-numbers font-bold rounded bg-white dark:bg-[#121522] border border-gray-200 dark:border-[#2d3652] text-gray-900 dark:text-white"
                  />
                </div>
              )}
              <button
                onClick={() => setIsPPV(!isPPV)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isPPV ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isPPV ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#22283d] flex items-center justify-between bg-gray-50/50 dark:bg-[#181d2c]/50">
          <div className="flex items-center space-x-1 text-[11px] text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Sends immediately to {targetAudience}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch Campaign</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
