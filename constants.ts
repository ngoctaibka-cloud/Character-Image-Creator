
import { Quality } from './types';

export const QUALITY_OPTIONS = [
  { id: Quality.Standard, label: 'Standard', caption: 'Good quality' },
  { id: Quality.High, label: '2K - 4K (High)', caption: 'Sharper details' },
  { id: Quality.Ultra, label: '8K (Ultra)', caption: 'Photorealistic' },
];

export const INITIAL_FORM_STATE = {
  images: [],
  removeBackground: false,
  influenceEnabled: true,
  influenceStrength: 100,
  characterDesc: '',
  sceneDesc: '',
  quality: Quality.High,
};
