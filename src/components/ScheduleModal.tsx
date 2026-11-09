import React, { useState } from 'react';
import { X, Clock, Calendar as CalendarIcon, Check } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleMessage: (text: string, scheduledTime: string) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onScheduleMessage,
}) => {
  const [text, setText] = useState('');
  const [timePreset, setTimePreset] = useState('Tonight at 10:00 PM');

  if (!isOpen) return null;

  const presets = [
    'Tonight at 10:00 PM (Bedtime tease)',
    'Tomorrow at 8:30 AM (Morning greeting)',
    'Tomorrow at 1:00 PM (Lunch check-in)',
    'Friday at 8:00 PM (Weekend teaser)',
  ];

  const handleConfirm = () => {
    if (!text.trim()) return;
    onScheduleMessage(text.trim(), timePreset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#151926] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#22283d]">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Schedule Automated Message
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Select Trigger Time
            </label>
            <div className="space-y-1.5">
              {presets.map((preset) => (
                <div
                  key={preset}
                  onClick={() => setTimePreset(preset)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    timePreset === preset
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 text-blue-900 dark:text-white font-medium'
                      : 'border-gray-200 dark:border-[#262c45] bg-gray-50/50 dark:bg-[#191e30] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>{preset}</span>
                  </div>
                  {timePreset === preset && <Check className="w-4 h-4 text-blue-500" />}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Message Content
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: Coucou mon chéri... Tu es encore réveillé ou tu dors déjà ? 🌙"
              className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#181d2c] border border-gray-200 dark:border-[#2b334d] text-gray-900 dark:text-white outline-hidden focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#22283d] flex items-center justify-end space-x-2 bg-gray-50/50 dark:bg-[#181d2c]/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!text.trim()}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Confirm Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};

