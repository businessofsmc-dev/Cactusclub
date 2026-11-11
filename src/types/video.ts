export type VideoCategory = 'all' | 'anale' | 'leche' | 'solo' | 'hardcore' | 'bdsm';

export interface VideoCategoryConfig {
  id: VideoCategory;
  label: string;
  shortDesc: string;
  badge: string;
  color: string;
}

export interface SexTapeVideo {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle: string;
  category: VideoCategory;
  categoryLabel: string;
  duration: string;
  quality: '4K ULTRA HD' | '1080P HD' | '4K HDR 60FPS';
  price: number;
  thumbnailUrl: string;
  previewVideoUrl?: string;
  viewsCount: number;
  likesCount: number;
  rating: number;
  tags: string[];
  badge?: 'EXCLUSIF' | 'TOP VENTE' | 'NOUVEAU' | 'SANS CENSURE' | 'COUP DE COEUR';
  isUnlocked?: boolean;
  releaseDate: string;
}

