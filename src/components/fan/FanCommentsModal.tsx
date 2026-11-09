import React, { useState } from 'react';
import { X, Send, Heart, MessageCircle } from 'lucide-react';
import { sounds } from '../../utils/sound';
import type { FanUser, CreatorPost } from '../../types/crm';

interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  isVIP?: boolean;
  text: string;
  timestamp: string;
  likesCount: number;
  isLiked?: boolean;
}

interface FanCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CreatorPost | null;
  fanUser: FanUser;
  onAddCommentSuccess?: (postId: string) => void;
}

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: 'c1',
    authorName: 'Alexandre VIP',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    isVIP: true,
    text: 'Sublime comme d’habitude Margot ! Le shooting est juste incroyable ❤️',
    timestamp: 'Il y a 1 heure',
    likesCount: 14,
    isLiked: false,
  },
  {
    id: 'c2',
    authorName: 'Julien_75',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    isVIP: false,
    text: 'Trop hâte de te retrouver en vocal ce soir ! Prends soin de toi ✨',
    timestamp: 'Il y a 45 min',
    likesCount: 8,
    isLiked: true,
  },
  {
    id: 'c3',
    authorName: 'Lucas_Fan',
    authorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80',
    isVIP: false,
    text: 'La vidéo exclusive vaut vraiment le coup, débloquée sans hésiter 🔥',
    timestamp: 'Il y a 20 min',
    likesCount: 5,
    isLiked: false,
  },
];

export const FanCommentsModal: React.FC<FanCommentsModalProps> = ({
  isOpen,
  onClose,
  post,
  fanUser,
  onAddCommentSuccess,
}) => {
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState('');

  if (!isOpen || !post) return null;

  const handleToggleLikeComment = (commentId: string) => {
    sounds.playReceive();
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              isLiked: !c.isLiked,
              likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
            }
          : c
      )
    );
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    sounds.playSend();
    const created: CommentItem = {
      id: `comm-${Date.now()}`,
      authorName: fanUser.name || 'Valentin',
      authorAvatar: fanUser.avatar,
      isVIP: fanUser.isSubscribed,
      text: newComment.trim(),
      timestamp: 'À l’instant',
      likesCount: 0,
      isLiked: false,
    };

    setComments((prev) => [created, ...prev]);
    setNewComment('');
    if (onAddCommentSuccess) {
      onAddCommentSuccess(post.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#151926] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#262c42] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-gray-100 dark:border-[#202538] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Commentaires ({comments.length})
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Preview Snippet */}
        <div className="p-3.5 px-6 bg-gray-50 dark:bg-[#111420] border-b border-gray-100 dark:border-[#1e2336] flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-300">
          <img
            src={post.mediaUrl}
            alt="Preview"
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
          />
          <p className="line-clamp-2 italic text-[11px] leading-snug">
            "{post.caption}"
          </p>
        </div>

        {/* Comments Stream */}
        <div className="flex-1 overflow-y-auto p-4 px-6 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 text-xs">
              <img
                src={comment.authorAvatar}
                alt={comment.authorName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5 border"
              />

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-0.5">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {comment.authorName}
                  </span>
                  {comment.isVIP && (
                    <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white font-black text-[8px]">
                      VIP
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">{comment.timestamp}</span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[11px]">
                  {comment.text}
                </p>
              </div>

              {/* Like Comment Heart Button */}
              <button
                onClick={() => handleToggleLikeComment(comment.id)}
                className={`flex flex-col items-center p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors ${
                  comment.isLiked ? 'text-pink-600' : 'text-gray-400 hover:text-pink-500'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-pink-600' : ''}`} />
                {comment.likesCount > 0 && (
                  <span className="text-[9px] font-mono-numbers mt-0.5">{comment.likesCount}</span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Post Comment Input */}
        <div className="p-4 px-6 bg-gray-50/70 dark:bg-[#131622] border-t border-gray-100 dark:border-[#202538]">
          <form onSubmit={handleSendComment} className="flex items-center space-x-2">
            <img
              src={fanUser.avatar}
              alt={fanUser.name}
              className="w-7 h-7 rounded-full object-cover border flex-shrink-0"
            />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrire un commentaire bienveillant..."
              className="flex-1 px-4 py-2 rounded-2xl bg-white dark:bg-[#1c2235] border border-gray-200 dark:border-[#28314d] text-gray-900 dark:text-white text-xs outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
