import { PropertyImage } from './property.types';

export interface StagedImage {
  id: string;
  file: File;
  previewUrl: string;
}

export interface PropertyGalleryManagerProps {
  propertyId: string;
  images?: PropertyImage[];
  rooms?: Array<{ id: string; name: string }>;
  onImagesUpdated?: () => void;
}
