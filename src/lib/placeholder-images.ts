import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  link?: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
