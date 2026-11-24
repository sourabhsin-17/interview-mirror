import { CriterionKey } from '../types';

export interface CriterionVisualStyle {
  key: CriterionKey;
  shortLabel: string;
  hex: string;
  neonHex: string;
  glowRgba: string;
  highlightBg: string;
  highlightBorder: string;
  highlightText: string;
  activeRing: string;
  barBg: string;
  labelText: string;
  darkLabelText: string;
  dotBg: string;
}

export const CRITERION_STYLES: Record<CriterionKey, CriterionVisualStyle> = {
  Relevance: {
    key: 'Relevance',
    shortLabel: 'REL',
    hex: '#1D9E75',
    neonHex: '#3DDBA6',
    glowRgba: 'rgba(61, 219, 166, 0.35)',
    highlightBg: 'bg-emerald-200/80 hover:bg-emerald-300/85',
    highlightBorder: 'border-b-2 border-emerald-700',
    highlightText: 'text-[#14163F]',
    activeRing: 'ring-2 ring-emerald-700 bg-emerald-300/90',
    barBg: 'bg-[#3DDBA6]',
    labelText: 'text-emerald-800',
    darkLabelText: 'text-[#3DDBA6]',
    dotBg: 'bg-[#3DDBA6]',
  },
  'Clarity & Structure': {
    key: 'Clarity & Structure',
    shortLabel: 'CLR',
    hex: '#378ADD',
    neonHex: '#63B0FF',
    glowRgba: 'rgba(99, 176, 255, 0.35)',
    highlightBg: 'bg-sky-200/85 hover:bg-sky-300/90',
    highlightBorder: 'border-b-2 border-blue-700',
    highlightText: 'text-[#14163F]',
    activeRing: 'ring-2 ring-blue-700 bg-sky-300/95',
    barBg: 'bg-[#63B0FF]',
    labelText: 'text-blue-800',
    darkLabelText: 'text-[#63B0FF]',
    dotBg: 'bg-[#63B0FF]',
  },
  Reasoning: {
    key: 'Reasoning',
    shortLabel: 'RSN',
    hex: '#E8572A',
    neonHex: '#FF8F63',
    glowRgba: 'rgba(255, 143, 99, 0.35)',
    highlightBg: 'bg-orange-200/85 hover:bg-orange-300/90',
    highlightBorder: 'border-b-2 border-orange-700',
    highlightText: 'text-[#14163F]',
    activeRing: 'ring-2 ring-orange-700 bg-orange-300/95',
    barBg: 'bg-[#FF8F63]',
    labelText: 'text-orange-800',
    darkLabelText: 'text-[#FF8F63]',
    dotBg: 'bg-[#FF8F63]',
  },
  'Use of Specific Examples': {
    key: 'Use of Specific Examples',
    shortLabel: 'EXP',
    hex: '#7F77DD',
    neonHex: '#A78BFA',
    glowRgba: 'rgba(167, 139, 250, 0.35)',
    highlightBg: 'bg-violet-200/85 hover:bg-violet-300/90',
    highlightBorder: 'border-b-2 border-violet-700',
    highlightText: 'text-[#14163F]',
    activeRing: 'ring-2 ring-violet-700 bg-violet-300/95',
    barBg: 'bg-[#A78BFA]',
    labelText: 'text-violet-800',
    darkLabelText: 'text-[#A78BFA]',
    dotBg: 'bg-[#A78BFA]',
  },
};
