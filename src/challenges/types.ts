import type { ComponentType } from 'react';

export interface ChallengeContext {
  level: number;
  onPass: () => void;
  onFail: () => void;
}

export interface ChallengeMeta {
  id: number;
  title: string;
  subtitle: string;
  instruction: string;
  Component: ComponentType<ChallengeContext>;
}

export const TOTAL_LEVELS = 20;
