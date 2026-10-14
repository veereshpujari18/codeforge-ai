export * from '../../shared/types';

export interface EditorFile {
  id: string;
  name: string;
  language: string;
  content: string;
  isModified?: boolean;
  version?: number;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export type DashboardTab = 'Editor' | 'Debug' | 'Performance' | 'Agent' | 'Collab';

export interface ParticleConfig {
  count: number;
  type: 'code' | 'data' | 'error' | 'success';
  gravity: number;
  speed: number;
}

export interface PricingTier {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  badge?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
}
