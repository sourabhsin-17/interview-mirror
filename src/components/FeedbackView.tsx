import { useEffect, useMemo, useState } from 'react';
import {
  CRITERION_ORDER,
  CriterionKey,
  EvaluationResult,
  QuestionItem,
  RoleConfig,
} from '../types';
import { CRITERION_STYLES } from '../constants/criteria';
import { HighlightedAnswer } from './HighlightedAnswer';
import { RadarChart } from './RadarChart';
import {
  ArrowRight,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Edit3,
  MessageSquareQuote,
  Square,
} from 'lucide-react';

interface FeedbackViewProps {
  role: RoleConfig;
  questionIndex: number;
  question: QuestionItem;
  answer: string;
  evaluation: EvaluationResult;
  checkedFixes: Record<number, boolean>;
  hasRevision: boolean;
  onToggleFix: (fixIndex: number) => void;
  onRevise: () => void;
  onViewCompare?: () => void;
  onNextQuestion: () => void;
  onViewSummary: () => void;
}

export function FeedbackView({
  role,
  questionIndex,
  question,
  answer,
  evaluation,
  checkedFixes,
  hasRevision,
  onToggleFix,
  onRevise,
  onViewCompare,
  onNextQuestion,
  onViewSummary,
}: FeedbackViewProps) {
  const [criterionFilter, setCriterionFilter] = useState<'ALL' | CriterionKey>('ALL');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(
    evaluation.evidence[0]?.id ?? null
  );
  const [showImprovedExample, setShowImprovedExample] = useState(false);

  const visibleEvidence = useMemo(() => {
    if (criterionFilter === 'ALL') return evaluation.evidence;
    return evaluation.evidence.filter((e) => e.criterion === criterionFilter);
  }, [evaluation.evidence, criterionFilter]);

  useEffect(() => {
    setSelectedEvidenceId(visibleEvidence[0]?.id ?? null);
  }, [visibleEvidence]);

  const selectedEvidence =
    visibleEvidence.find((ev) => ev.id === selectedEvidenceId) ??
    visibleEvidence[0] ??
    null;

  const isLastQuestion = questionIndex === role.questions.length - 1;
  const averageScore =
    evaluation.scores.reduce((sum, s) => sum + s.score, 0) /
    Math.max(1, evaluation.scores.length);

  const inspectorStyle = selectedEvidence
    ? CRITERION_STYLES[selectedEvidence.criterion]
    : CRITERION_STYLES.Relevance;

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      {/* Luminous Scorecard Banner */}
      <section className="overflow-hidden rounded-2xl border border-white/15 bg-[#121126]/95">
        <div className="p-6 sm:p-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 font-mono-tabular text-xs font-bold text-[#67E8F9]">
              <span>{role.title}</span>
              <span aria-hidden="true">·</span>
              <span>
                Q{questionIndex + 1} / 0{role.questions.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>{question.category}</span>
            </div>
            <h1
              className="mt-2 font-display text-xl font-extrabold leading-snug text-white sm:text-2xl"
              style={{ textWrap: 'balance' }}
            >
              {question.prompt}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {hasRevision && onViewCompare && (
              <button
                type="button"
                onClick={onViewCompare}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15 whitespace-nowrap shrink-0"
              >
                Before / After View
              </button>
            )}
            <button
              type="button"
              onClick={onRevise}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#67E8F9]/60 bg-[#67E8F9]/10 px-4 py-2 text-xs font-bold text-[#67E8F9] hover:bg-[#67E8F9]/20 transition-colors whitespace-nowrap shrink-0"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Revise my answer</span>
            </button>
            <button
              type="button"
              onClick={isLastQuestion ? onViewSummary : onNextQuestion}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#DDEB6B] px-5 py-2 text-xs font-extrabold text-[#14163F] hover:bg-[#67E8F9] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{isLastQuestion ? 'Session Summary' : 'Next Question'}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 5-Column Glowing Score KPI Grid */}
        <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 sm:grid-cols-5">
          <div className="col-span-2 sm:col-span-1 bg-[#0B0A16] p-4 flex flex-col justify-between">
            <span className="font-mono-tabular text-[11px] uppercase tracking-wider text-slate-400">
              Overall Avg
            </span>
            <div className="mt-1.5 font-display text-3xl font-extrabold tabular-nums text-[#DDEB6B]">
              {averageScore.toFixed(1)}
              <span className="text-xs font-normal text-slate-400"> / 5.0</span>
            </div>
          </div>

          {evaluation.scores.map((item) => {
            const style = CRITERION_STYLES[item.criterion];
            return (
              <div key={item.criterion} className="bg-[#121126] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-300 truncate">
                    {item.criterion}
                  </span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{ backgroundColor: style.neonHex }}
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span
                    className="font-display text-2xl font-extrabold tabular-nums"
                    style={{
                      color: style.neonHex,
                      textShadow: `0 0 18px ${style.glowRgba}`,
                    }}
                  >
                    {item.score}
                    <span className="text-xs font-normal text-slate-400"> / 5</span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.score / 5) * 100}%`,
                      backgroundColor: style.neonHex,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Two-Column Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 7 Cols */}
        <div className="space-y-6 lg:col-span-7">
          {/* Overall Summary */}
          <section className="rounded-2xl border border-white/15 bg-[#121126]/95 p-6">
            <h2 className="font-display text-base font-extrabold text-white">
              Overall Evaluation
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-200">
              {evaluation.overall_summary}
            </p>
          </section>

          {/* Cream Framed Evidence Transcript Card */}
          <section className="overflow-hidden rounded-2xl border-[3px] border-[#14163F] bg-[#FFFDF7] text-[#14163F] shadow-[0_14px_34px_-12px_rgba(0,0,0,0.6)]">
            <div className="border-b-2 border-[#14163F]/10 bg-[#F3EFE2] px-6 py-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-display text-base font-extrabold text-[#14163F]">
                  Your Answer with Evidence Highlights
                </h2>
                <span className="font-mono-tabular text-[11px] font-bold text-[#14163F]/70">
                  CLICK ANY HIGHLIGHT TO INSPECT
                </span>
              </div>

              <div
                className="mt-3 flex flex-wrap items-center gap-1.5"
                role="group"
                aria-label="Filter highlights by criterion"
              >
                <button
                  type="button"
                  onClick={() => setCriterionFilter('ALL')}
                  className={`rounded-full px-3 py-1 font-mono-tabular text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                    criterionFilter === 'ALL'
                      ? 'bg-[#14163F] text-white'
                      : 'border border-[#14163F]/20 bg-white text-[#14163F] hover:border-[#14163F]'
                  }`}
                >
                  ALL ({evaluation.evidence.length})
                </button>
                {CRITERION_ORDER.map((crit) => {
                  const style = CRITERION_STYLES[crit];
                  const count = evaluation.evidence.filter((e) => e.criterion === crit).length;
                  const isActive = criterionFilter === crit;
                  return (
                    <button
                      key={crit}
                      type="button"
                      onClick={() => setCriterionFilter(crit)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono-tabular text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-[#14163F] text-white'
                          : 'border border-[#14163F]/20 bg-white text-[#14163F] hover:border-[#14163F]'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-sm"
                        style={{ backgroundColor: style.hex }}
                        aria-hidden="true"
                      />
                      <span>{style.shortLabel}</span>
                      <span className="opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6">
              <HighlightedAnswer
                answer={answer}
                evidence={visibleEvidence}
                selectedEvidenceId={selectedEvidence?.id ?? null}
                onSelectEvidence={setSelectedEvidenceId}
              />

              {visibleEvidence.length === 0 && (
                <p className="mt-4 border-t border-[#14163F]/10 pt-3 text-xs text-slate-600">
                  {criterionFilter === 'ALL'
                    ? 'No exact phrase-level quotes were flagged—review the summary and rubric scores for guidance.'
                    : `No quotes tagged under ${criterionFilter}. Select "ALL" to view other feedback.`}
                </p>
              )}
            </div>
          </section>

          {/* Top 3 Fixes Checklist */}
          <section className="rounded-2xl border border-white/15 bg-[#121126]/95 p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-display text-base font-extrabold text-white">
                Top 3 Fixes Before You Revise
              </h2>
              <span className="font-mono-tabular text-xs font-bold text-[#DDEB6B]">
                {Object.values(checkedFixes).filter(Boolean).length} /{' '}
                {evaluation.top_3_fixes.length} DONE
              </span>
            </div>

            <ul className="mt-4 divide-y divide-white/10">
              {evaluation.top_3_fixes.map((fix, idx) => {
                const checked = Boolean(checkedFixes[idx]);
                return (
                  <li key={idx} className="py-3 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => onToggleFix(idx)}
                      className="flex w-full items-start gap-3 text-left group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                    >
                      {checked ? (
                        <CheckSquare
                          className="mt-0.5 h-5 w-5 shrink-0 text-[#3DDBA6]"
                          aria-hidden="true"
                        />
                      ) : (
                        <Square
                          className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 group-hover:text-[#67E8F9]"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={`text-sm leading-relaxed ${
                          checked ? 'text-slate-500 line-through' : 'text-slate-200'
                        }`}
                      >
                        {fix}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Improved Example Answer */}
          <section className="overflow-hidden rounded-2xl border border-[#3DDBA6]/40 bg-[#121126]/95">
            <button
              type="button"
              onClick={() => setShowImprovedExample((prev) => !prev)}
              className="flex w-full items-center justify-between bg-[#3DDBA6]/10 px-6 py-4 text-left hover:bg-[#3DDBA6]/15 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
            >
              <div>
                <h2 className="font-display text-base font-extrabold text-white">
                  Example Answer Applying These Fixes
                </h2>
                <p className="mt-0.5 text-xs text-slate-300">
                  Reference model showing how structure, reasoning, and specifics fit together.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 font-mono-tabular text-xs font-bold text-[#3DDBA6] whitespace-nowrap shrink-0 ml-4">
                {showImprovedExample ? 'HIDE' : 'SHOW'}
                {showImprovedExample ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
            </button>

            {showImprovedExample && (
              <div className="border-t border-white/10 p-6">
                <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-200">
                  {evaluation.improved_example}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right 5 Cols: Glowing Quote Inspector Dossier & Radar Chart */}
        <aside className="space-y-6 lg:col-span-5">
          <section
            className="rounded-2xl border bg-[#14112C]/90 p-6 backdrop-blur-md transition-all"
            style={{
              borderColor: `${inspectorStyle.neonHex}88`,
              boxShadow: `0 0 30px -10px ${inspectorStyle.glowRgba}`,
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquareQuote
                  className="h-4 w-4"
                  style={{ color: inspectorStyle.neonHex }}
                  aria-hidden="true"
                />
                <h2 className="font-display text-base font-extrabold text-white">
                  Quote Inspector
                </h2>
              </div>
              <span className="font-mono-tabular text-xs text-slate-400">
                {visibleEvidence.length}{' '}
                {visibleEvidence.length === 1 ? 'quote' : 'quotes'}
              </span>
            </div>

            {selectedEvidence ? (
              <div className="mt-4">
                <div
                  className="inline-block rounded-full px-3 py-0.5 font-mono-tabular text-[11px] font-bold text-[#080812]"
                  style={{ backgroundColor: inspectorStyle.neonHex }}
                >
                  {selectedEvidence.criterion}
                </div>

                <blockquote className="mt-3 rounded-xl border border-white/15 bg-[#0B0A16] p-3.5 text-sm italic leading-relaxed text-[#E6EDF7]">
                  &ldquo;{selectedEvidence.quote}&rdquo;
                </blockquote>

                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <div className="font-mono-tabular text-[11px] font-bold text-[#FF8F63]">
                      ISSUE OBSERVED
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-200">
                      {selectedEvidence.issue}
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="font-mono-tabular text-[11px] font-bold text-[#3DDBA6]">
                      ACTIONABLE SUGGESTION
                    </div>
                    <p className="mt-1 leading-relaxed text-white">
                      {selectedEvidence.suggestion}
                    </p>
                  </div>
                </div>

                {visibleEvidence.length > 1 && (
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="mb-2 font-mono-tabular text-[11px] font-bold text-slate-400">
                      ALL QUOTES ({visibleEvidence.length})
                    </div>
                    <div className="space-y-1.5">
                      {visibleEvidence.map((ev, idx) => {
                        const style = CRITERION_STYLES[ev.criterion];
                        const active = ev.id === selectedEvidence.id;
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => setSelectedEvidenceId(ev.id)}
                            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                              active
                                ? 'bg-white/15 text-white font-semibold'
                                : 'bg-[#0B0A16]/70 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-sm"
                              style={{ backgroundColor: style.neonHex }}
                              aria-hidden="true"
                            />
                            <span className="font-mono-tabular shrink-0 opacity-75">
                              0{idx + 1}
                            </span>
                            <span className="truncate">{ev.quote}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                No quotes matched this filter. Click &ldquo;ALL&rdquo; or revise your answer
                with concrete details.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-white/15 bg-[#121126]/95 p-6">
            <h2 className="font-display text-base font-extrabold text-white">
              Rubric Shape &amp; Justifications
            </h2>

            <div className="mt-4">
              <RadarChart scores={evaluation.scores} />
            </div>

            <div className="mt-5 divide-y divide-white/10 border-t border-white/10">
              {evaluation.scores.map((item) => {
                const style = CRITERION_STYLES[item.criterion];
                const pct = (item.score / 5) * 100;
                return (
                  <div key={item.criterion} className="py-3.5 first:pt-4 last:pb-0">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: style.neonHex }}
                          aria-hidden="true"
                        />
                        <span className="font-bold text-white">{item.criterion}</span>
                      </div>
                      <span
                        className="font-mono-tabular font-bold"
                        style={{ color: style.neonHex }}
                      >
                        {item.score} / 5
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: style.neonHex }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                      {item.justification}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      {!isLastQuestion && (
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onViewSummary}
            className="text-xs font-semibold text-[#67E8F9] underline-offset-4 hover:underline"
          >
            Jump to Session Summary now
          </button>
        </div>
      )}
    </div>
  );
}
