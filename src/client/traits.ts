import type { TraitKey } from '../shared/api';

export const TRAITS: { key: TraitKey; icon: string; label: string }[] = [
  { key: 'hasScar', icon: '🩹', label: 'Scar' },
  { key: 'wearsHat', icon: '🎩', label: 'Hat' },
  { key: 'wearsGlasses', icon: '👓', label: 'Glasses' },
  { key: 'hasRedEyes', icon: '👹', label: 'Red eyes' },
  { key: 'holdsKnife', icon: '🔪', label: 'Knife' },
];
