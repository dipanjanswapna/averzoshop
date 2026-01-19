
export type StoreAsset = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  link?: string;
  assetType: 'hero-carousel' | 'promo-banner';
  categorySlug: string;
};

  