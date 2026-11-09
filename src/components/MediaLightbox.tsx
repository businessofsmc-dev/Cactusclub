import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  title?: string;
  price?: number;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  title,
  price,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none animate-in fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-[#121522] border border-white/10 shadow-2xl"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md text-white border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold truncate max-w-xs sm:max-w-md">
              {title || 'Media Asset Preview'}
            </span>
            {price && (
              <span className="text-xs font-bold font-mono-numbers px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PPV: ${price}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={mediaUrl}
              target="_blank"
              rel="noreferrer"
              title="Open full size"
              className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Canvas */}
        <div className="flex-1 flex items-center justify-center p-2 overflow-hidden bg-black/40">
          <img
            src={mediaUrl}
            alt={title || 'Preview'}
            className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
