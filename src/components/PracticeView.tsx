import { useEffect, useState } from 'react';
import {
  CRITERION_ORDER,
  CriterionKey,
  QuestionAttempt,
  QuestionItem,
  RoleConfig,
} from '../types';
import { CRITERION_STYLES } from '../constants/criteria';
import {
  AlertCircle,
  BookOpen,
  Check,
  Eraser,
  ListPlus,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';

interface PracticeViewProps {
  role: RoleConfig;
  questionIndex: number;
  question: QuestionItem;
  attempts: Record<string, QuestionAttempt>;
  draftAnswer: string;
  isRevising: boolean;
  isEvaluating: boolean;
  error: string | null;
  onChangeDraft: (val: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
  onSelectQuestion: (idx: number) => void;
  onCancelRevision?: () => void;
}

export function PracticeView({
  role,
  questionIndex,
  question,
  attempts,
  draftAnswer,
  isRevising,
  isEvaluating,
  error,
  onChangeDraft,
  onSubmit,
  onRetry,
  onSelectQuestion,
  onCancelRevision,
}: PracticeViewProps) {
  const [focusedCriterion, setFocusedCriterion] = useState<CriterionKey>('Relevance');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [clearedBackup, setClearedBackup] = useState<string | null>(null);

  useEffect(() => {
    setClearedBackup(null);
    setValidationError(null);
  }, [question.id, isRevising]);

  const trimmed = draftAnswer.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const sentenceCount = trimmed
    ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    : 0;

  const priorAttempt = attempts[question.id];

  const depthPct = Math.min(100, Math.round((wordCount / 160) * 100));
  const depthStatus =
    wordCount === 0
      ? 'Not started'
      : wordCount < 45
        ? 'Too brief — add specifics'
        : wordCount <= 180
          ? 'Optimal depth (60–90s spoken)'
          : 'Detailed — keep concise';

  function handleLoadDemo() {
    setValidationError(null);
    setClearedBackup(null);
    onChangeDraft(isRevising ? question.demoStrongAnswer : question.demoWeakAnswer);
  }

  function handleInsertScaffold(type: 'star' | 'tradeoff' | 'metric') {
    setValidationError(null);
    const snippets: Record<typeof type, string> = {
      star: 'Situation: \nTask: \nAction (what I specifically did): \nResult (measurable outcome): ',
      tradeoff:
        'Context & constraints: \nOptions considered & why I chose this path: \nHow I verified it: ',
      metric: '\nMeasurable impact: reduced/improved [metric] from [before] to [after].',
    };
    const snippet = snippets[type];
    const next = draftAnswer.trim()
      ? `${draftAnswer.trimEnd()}\n\n${snippet}`
      : snippet;
    onChangeDraft(next);
  }

  function handleClear() {
    if (draftAnswer.trim()) {
      setClearedBackup(draftAnswer);
      onChangeDraft('');
    }
  }

  function handleUndoClear() {
    if (clearedBackup !== null) {
      onChangeDraft(clearedBackup);
      setClearedBackup(null);
    }
  }

  function handleFormSubmit() {
    if (!trimmed) {
      setValidationError('Please type an answer—or click "Load demo"—before submitting.');
      return;
    }
    setValidationError(null);
    onSubmit();
  }

  if (isEvaluating) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-live="polite" aria-busy="true">
        <div className="mb-6 rounded-2xl border border-white/15 bg-[#121126] p-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-3.5 w-48 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-80 max-w-full animate-pulse rounded bg-white/10" />
          </div>
          <span className="font-mono-tabular text-xs font-bold text-[#67E8F9]">
            EVALUATING AGAINST 4 RUBRIC CRITERIA...
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-white/15 bg-[#121126] p-6">
              <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
              <div className="mt-4 space-y-2.5">
                <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-white/5" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-[#121126] p-6">
              <div className="h-4 w-44 animate-pulse rounded bg-white/10" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/15 bg-[#121126] p-6">
              <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
              <div className="mx-auto mt-6 h-52 w-52 animate-pulse rounded-full bg-white/5" />
              <div className="mt-6 space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-10 w-full animate-pulse rounded bg-white/5" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeRubricItem =
    role.rubric.find((r) => r.key === focusedCriterion) ?? role.rubric[0];
  const activeStyle = CRITERION_STYLES[activeRubricItem.key];

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      {/* Question Banner & Stepper */}
      <section className="rounded-2xl border border-white/15 bg-[#121126]/95 p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 font-mono-tabular text-xs font-bold text-[#67E8F9]">
              <span>{role.title}</span>
              <span aria-hidden="true">·</span>
              <span>
                Q{questionIndex + 1} / 0{role.questions.length}
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  question.category === 'Technical' ? 'text-[#63B0FF]' : 'text-[#3DDBA6]'
                }
              >
                {question.category}
              </span>
            </div>
            <h1
              className="mt-2 font-display text-2xl font-extrabold leading-snug text-white sm:text-3xl"
              style={{ textWrap: 'balance' }}
            >
              {question.prompt}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300">{question.focusHint}</p>
          </div>

          <div
            className="flex items-center gap-1.5 self-start lg:self-center shrink-0"
            role="group"
            aria-label="Question selector"
          >
            {role.questions.map((q, idx) => {
              const isCurrent = idx === questionIndex;
              const isDone = Boolean(attempts[q.id]);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => onSelectQuestion(idx)}
                  className={`inline-flex h-9 min-w-[2.5rem] items-center justify-center gap-1 rounded-full border px-3 font-mono-tabular text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    isCurrent
                      ? 'border-[#67E8F9] bg-[#67E8F9] text-[#0B0A16] shadow-[0_0_16px_rgba(103,232,249,0.4)]'
                      : isDone
                        ? 'border-[#3DDBA6]/60 bg-[#3DDBA6]/15 text-[#3DDBA6] hover:border-[#3DDBA6]'
                        : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/35 hover:text-white'
                  }`}
                  title={`Question ${idx + 1} (${q.category})${isDone ? ' — Completed' : ''}`}
                >
                  {isDone && !isCurrent && (
                    <Check className="h-3 w-3 text-[#3DDBA6]" aria-hidden="true" />
                  )}
                  <span>Q{idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Split 12-Column Studio Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 7 Cols: Warm Cream Framed Writing Canvas */}
        <section className="overflow-hidden rounded-2xl border-[3px] border-[#14163F] bg-[#FFFDF7] text-[#14163F] shadow-[0_16px_38px_-12px_rgba(0,0,0,0.65)] lg:col-span-7">
          {/* Editing & Scaffolding Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#14163F]/10 bg-[#F3EFE2] px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 inline-flex items-center gap-1 font-mono-tabular text-[11px] font-bold text-[#14163F]/70">
                <ListPlus className="h-3.5 w-3.5 text-[#1D9E75]" aria-hidden="true" />
                SCAFFOLDS:
              </span>
              <button
                type="button"
                onClick={() => handleInsertScaffold('star')}
                className="rounded-md border border-[#14163F]/25 bg-white px-2.5 py-1 font-mono-tabular text-[11px] font-bold text-[#14163F] hover:border-[#14163F] hover:bg-[#DDEB6B]/40 transition-colors whitespace-nowrap shrink-0"
              >
                + STAR
              </button>
              <button
                type="button"
                onClick={() => handleInsertScaffold('tradeoff')}
                className="rounded-md border border-[#14163F]/25 bg-white px-2.5 py-1 font-mono-tabular text-[11px] font-bold text-[#14163F] hover:border-[#14163F] hover:bg-[#9CD2F3]/50 transition-colors whitespace-nowrap shrink-0"
              >
                + Trade-off
              </button>
              <button
                type="button"
                onClick={() => handleInsertScaffold('metric')}
                className="rounded-md border border-[#14163F]/25 bg-white px-2.5 py-1 font-mono-tabular text-[11px] font-bold text-[#14163F] hover:border-[#14163F] hover:bg-violet-200/60 transition-colors whitespace-nowrap shrink-0"
              >
                + Metric Line
              </button>
            </div>

            <div className="flex items-center gap-2">
              {clearedBackup !== null ? (
                <button
                  type="button"
                  onClick={handleUndoClear}
                  className="inline-flex items-center gap-1 rounded-md border border-amber-700/40 bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-950 hover:bg-amber-200 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Undo Clear
                </button>
              ) : (
                draftAnswer.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 rounded-md border border-[#14163F]/20 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-rose-700 whitespace-nowrap shrink-0"
                  >
                    <Eraser className="h-3 w-3" aria-hidden="true" />
                    Clear
                  </button>
                )
              )}

              <button
                type="button"
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#14163F] bg-[#DDEB6B] px-3.5 py-1 text-xs font-extrabold text-[#14163F] hover:bg-[#67E8F9] transition-colors whitespace-nowrap shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isRevising ? 'Load strong revised demo' : 'Load demo'}</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <label htmlFor="answer-textarea" className="sr-only">
              Your typed interview answer
            </label>
            <textarea
              id="answer-textarea"
              rows={10}
              value={draftAnswer}
              onChange={(e) => {
                onChangeDraft(e.target.value);
                setClearedBackup(null);
                if (validationError) setValidationError(null);
              }}
              placeholder="Write your answer here—or click '+ STAR' / '+ Trade-off' above to insert a structure scaffold..."
              className="w-full resize-y rounded-xl border-2 border-[#14163F]/15 bg-white p-4 text-[15px] leading-7 text-[#14163F] placeholder:text-slate-400 focus:border-[#14163F] focus:outline-none"
            />

            {/* Live Word / Depth Meter Strip */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 font-mono-tabular text-xs text-slate-600">
                <span>
                  <strong className="text-[#14163F]">{wordCount}</strong> words
                </span>
                <span>
                  <strong className="text-[#14163F]">{sentenceCount}</strong> sentences
                </span>
                <span className="font-medium text-slate-600">{depthStatus}</span>
              </div>

              <div className="h-2 w-full sm:w-36 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    wordCount === 0
                      ? 'bg-slate-300'
                      : wordCount < 45
                        ? 'bg-[#E8572A]'
                        : 'bg-[#1D9E75]'
                  }`}
                  style={{ width: `${depthPct}%` }}
                />
              </div>
            </div>

            {validationError && (
              <p role="alert" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{validationError}</span>
              </p>
            )}

            {error && (
              <div
                role="alert"
                className="mt-4 flex flex-col gap-3 rounded-xl border-2 border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={onRetry}
                  className="self-start rounded-full border-2 border-rose-700 bg-white px-4 py-1 text-xs font-bold text-rose-800 hover:bg-rose-100 whitespace-nowrap shrink-0"
                >
                  Retry Evaluation
                </button>
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-3 border-t-2 border-[#14163F]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {isRevising && onCancelRevision && (
                  <button
                    type="button"
                    onClick={onCancelRevision}
                    className="rounded-full border-2 border-[#14163F]/25 bg-white px-4 py-2 text-sm font-bold text-[#14163F] hover:border-[#14163F] whitespace-nowrap shrink-0"
                  >
                    Back to Feedback
                  </button>
                )}
                <span className="text-xs text-slate-600">
                  Evaluated strictly against the 4 visible criteria.
                </span>
              </div>

              <button
                type="button"
                onClick={handleFormSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#14163F] bg-[#14163F] px-6 py-2.5 text-sm font-extrabold text-white transition-all hover:bg-[#1D9E75] hover:border-[#14163F] whitespace-nowrap shrink-0"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>{isRevising ? 'Resubmit & Compare' : 'Submit for Evaluation'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right 5 Cols: Glowing Dossier Rubric Panel (inspired by B/Stack .dos) */}
        <aside className="space-y-5 lg:col-span-5">
          {isRevising && priorAttempt && (
            <section className="rounded-2xl border border-[#3DDBA6]/50 bg-[#14112C]/90 p-5 backdrop-blur-md shadow-[0_0_24px_-10px_rgba(61,219,166,0.35)]">
              <h2 className="font-display text-sm font-extrabold text-[#3DDBA6]">
                Fixes to Apply in This Revision
              </h2>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-200">
                {priorAttempt.initialEvaluation.top_3_fixes.map((fix, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono-tabular font-bold text-[#DDEB6B] mt-0.5">
                      0{i + 1}.
                    </span>
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section
            className="rounded-2xl border bg-[#14112C]/90 p-5 sm:p-6 backdrop-blur-md transition-all"
            style={{
              borderColor: `${activeStyle.neonHex}88`,
              boxShadow: `0 0 32px -12px ${activeStyle.glowRgba}`,
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen
                  className="h-4 w-4"
                  style={{ color: activeStyle.neonHex }}
                  aria-hidden="true"
                />
                <h2 className="font-display text-sm font-extrabold text-white">
                  Live Rubric Dossier
                </h2>
              </div>
              <span className="font-mono-tabular text-xs text-slate-400">1–5 Scale</span>
            </div>

            {/* Focus Pills */}
            <div
              className="mt-3 flex flex-wrap gap-1.5"
              role="tablist"
              aria-label="Inspect rubric criterion"
            >
              {CRITERION_ORDER.map((crit) => {
                const style = CRITERION_STYLES[crit];
                const active = crit === focusedCriterion;
                return (
                  <button
                    key={crit}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFocusedCriterion(crit)}
                    style={
                      active
                        ? {
                            backgroundColor: style.neonHex,
                            color: '#080812',
                            boxShadow: `0 0 16px ${style.glowRgba}`,
                          }
                        : { borderColor: `${style.neonHex}55` }
                    }
                    className={`rounded-full border px-3 py-1 font-mono-tabular text-[11px] font-bold transition-all whitespace-nowrap shrink-0 ${
                      active ? '' : 'bg-[#080814]/80 text-slate-300 hover:text-white'
                    }`}
                  >
                    {crit}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 space-y-3">
              <div
                className="font-display text-lg font-extrabold"
                style={{ color: activeStyle.neonHex }}
              >
                {activeRubricItem.label}
              </div>
              <p className="text-xs text-slate-300">{activeRubricItem.summary}</p>

              <div className="space-y-2.5 pt-1">
                <div className="rounded-xl border border-[#3DDBA6]/35 bg-[#3DDBA6]/10 p-3">
                  <div className="font-mono-tabular text-[11px] font-bold text-[#3DDBA6]">
                    TARGET 5 / 5
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#E6EDF7]">
                    {activeRubricItem.level5}
                  </p>
                </div>

                <div className="rounded-xl border border-[#67E8F9]/30 bg-white/5 p-3">
                  <div className="font-mono-tabular text-[11px] font-bold text-[#67E8F9]">
                    DEVELOPING 3 / 5
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {activeRubricItem.level3}
                  </p>
                </div>

                <div className="rounded-xl border border-[#FF8F63]/30 bg-[#FF8F63]/10 p-3">
                  <div className="font-mono-tabular text-[11px] font-bold text-[#FF8F63]">
                    AVOID 1 / 5
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {activeRubricItem.level1}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
