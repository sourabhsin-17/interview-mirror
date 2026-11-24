export type CriterionKey =
  | 'Relevance'
  | 'Clarity & Structure'
  | 'Reasoning'
  | 'Use of Specific Examples';

export const CRITERION_ORDER: CriterionKey[] = [
  'Relevance',
  'Clarity & Structure',
  'Reasoning',
  'Use of Specific Examples',
];

export interface RubricCriterion {
  key: CriterionKey;
  label: CriterionKey;
  summary: string;
  level1: string;
  level3: string;
  level5: string;
}

export interface QuestionItem {
  id: string;
  category: 'Behavioral' | 'Technical';
  prompt: string;
  focusHint: string;
  demoWeakAnswer: string;
  demoStrongAnswer: string;
}

export interface RoleConfig {
  id: string;
  title: string;
  subtitle: string;
  isCustom?: boolean;
  rubric: RubricCriterion[];
  questions: QuestionItem[];
}

export interface CriterionScore {
  criterion: CriterionKey;
  score: number;
  justification: string;
}

export interface EvidenceItem {
  id: string;
  quote: string;
  criterion: CriterionKey;
  issue: string;
  suggestion: string;
}

export interface EvaluationResult {
  scores: CriterionScore[];
  evidence: EvidenceItem[];
  overall_summary: string;
  top_3_fixes: string[];
  improved_example: string;
  improvement_note?: string;
}

export interface QuestionAttempt {
  questionId: string;
  initialAnswer: string;
  initialEvaluation: EvaluationResult;
  revisedAnswer?: string;
  revisedEvaluation?: EvaluationResult;
  checkedFixes: Record<number, boolean>;
}

export type AppStep =
  | 'role-select'
  | 'rubric'
  | 'practice'
  | 'feedback'
  | 'compare'
  | 'summary';
