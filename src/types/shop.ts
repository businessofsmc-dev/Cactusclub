export type ShopCategory = 'all' | 'lingerie' | 'shoes' | 'bdsm' | 'sextoys' | 'collector';

export interface ShopItem {
  id: string;
  name: string;
  category: 'lingerie' | 'shoes' | 'bdsm' | 'sextoys' | 'collector';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  features: string[];
  endorsedBy?: {
    creatorId: string;
    creatorName: string;
    avatar: string;
    quote: string;
  };
  isExclusiveVIP?: boolean;
  inStock: boolean;
  isPopular?: boolean;
  badge?: string;
}

export interface ShopOrder {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  price: number;
  date: string;
  status: 'confirmed' | 'shipping' | 'delivered';
  trackingNumber: string;
}
