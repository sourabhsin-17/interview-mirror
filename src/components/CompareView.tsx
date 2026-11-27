import { useEffect, useState } from 'react';
import {
  EvaluationResult,
  QuestionItem,
  RoleConfig,
} from '../types';
import { CRITERION_STYLES } from '../constants/criteria';
import { HighlightedAnswer } from './HighlightedAnswer';
import { RadarChart } from './RadarChart';
import {
  ArrowRight,
  Edit3,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface CompareViewProps {
  role: RoleConfig;
  questionIndex: number;
  question: QuestionItem;
  beforeAnswer: string;
  beforeEval: EvaluationResult;
  afterAnswer: string;
  afterEval: EvaluationResult;
  onReviseAgain: () => void;
  onViewFullAfterFeedback: () => void;
  onNextQuestion: () => void;
  onViewSummary: () => void;
}

export function CompareView({
  role,
  questionIndex,
  question,
  beforeAnswer,
  beforeEval,
  afterAnswer,
  afterEval,
  onReviseAgain,
  onViewFullAfterFeedback,
  onNextQuestion,
  onViewSummary,
}: CompareViewProps) {
  const [selectedBeforeId, setSelectedBeforeId] = useState<string | null>(
    beforeEval.evidence[0]?.id ?? null
  );
  const [selectedAfterId, setSelectedAfterId] = useState<string | null>(
    afterEval.evidence[0]?.id ?? null
  );

  useEffect(() => {
    setSelectedBeforeId(beforeEval.evidence[0]?.id ?? null);
    setSelectedAfterId(afterEval.evidence[0]?.id ?? null);
  }, [question.id, beforeEval, afterEval]);

  const isLastQuestion = questionIndex === role.questions.length - 1;

  const beforeAvg =
    beforeEval.scores.reduce((sum, s) => sum + s.score, 0) /
    Math.max(1, beforeEval.scores.length);
  const afterAvg =
    afterEval.scores.reduce((sum, s) => sum + s.score, 0) /
    Math.max(1, afterEval.scores.length);
  const avgDelta = Number((afterAvg - beforeAvg).toFixed(1));

  const activeBeforeEv = beforeEval.evidence.find((e) => e.id === selectedBeforeId);
  const activeAfterEv = afterEval.evidence.find((e) => e.id === selectedAfterId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      {/* Luminous Revision Impact Banner */}
      <section className="overflow-hidden rounded-2xl border border-white/15 bg-[#121126]/95">
        <div className="p-6 sm:p-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 font-mono-tabular text-xs font-bold text-[#DDEB6B]">
              <span>BEFORE &amp; AFTER REVISION</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#67E8F9]">{role.title}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">
                Q{questionIndex + 1} / 0{role.questions.length}
              </span>
            </div>
            <h1
              className="mt-2 font-display text-xl font-extrabold leading-snug text-white sm:text-2xl"
              style={{ textWrap: 'balance' }}
            >
              {question.prompt}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onViewFullAfterFeedback}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15 whitespace-nowrap shrink-0"
            >
              Full After Feedback
            </button>
            <button
              type="button"
              onClick={onReviseAgain}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#67E8F9]/60 bg-[#67E8F9]/10 px-4 py-2 text-xs font-bold text-[#67E8F9] hover:bg-[#67E8F9]/20 whitespace-nowrap shrink-0"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Revise Again</span>
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

        {/* 5-Column Revision Delta Strip */}
        <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 sm:grid-cols-5">
          <div className="col-span-2 sm:col-span-1 bg-[#0B0A16] p-4">
            <div className="font-mono-tabular text-[11px] uppercase tracking-wider text-slate-400">
              Overall Shift
            </div>
            <div className="mt-1.5 flex items-baseline gap-2 font-display">
              <span className="text-sm text-slate-400 tabular-nums">{beforeAvg.toFixed(1)}</span>
              <span className="text-slate-500">→</span>
              <span className="text-2xl font-extrabold text-white tabular-nums">
                {afterAvg.toFixed(1)}
              </span>
            </div>
            <div
              className={`mt-1 inline-flex items-center gap-1 font-mono-tabular text-xs font-bold ${
                avgDelta > 0
                  ? 'text-[#3DDBA6]'
                  : avgDelta < 0
                    ? 'text-[#FF8F63]'
                    : 'text-slate-400'
              }`}
            >
              {avgDelta > 0 && <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />}
              {avgDelta < 0 && <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
              {avgDelta === 0 && <Minus className="h-3.5 w-3.5" aria-hidden="true" />}
              <span>
                {avgDelta > 0 ? `+${avgDelta.toFixed(1)}` : avgDelta.toFixed(1)} avg
              </span>
            </div>
          </div>

          {afterEval.scores.map((afterItem) => {
            const beforeScore =
              beforeEval.scores.find((b) => b.criterion === afterItem.criterion)?.score ?? 0;
            const delta = afterItem.score - beforeScore;
            const style = CRITERION_STYLES[afterItem.criterion];
            return (
              <div key={afterItem.criterion} className="bg-[#121126] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-300 truncate">
                    {afterItem.criterion}
                  </span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{ backgroundColor: style.neonHex }}
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-1.5 flex items-baseline justify-between font-mono-tabular">
                  <span className="text-lg font-extrabold text-white">
                    {beforeScore} → {afterItem.score}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      delta > 0
                        ? 'text-emerald-400'
                        : delta < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Score Table + Overlaid Radar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-white/15 bg-[#121126]/95 p-6 lg:col-span-7">
          <h2 className="font-display text-base font-extrabold text-white">
            Per-Criterion Score Deltas
          </h2>

          {afterEval.improvement_note && (
            <p className="mt-3 rounded-xl border border-[#3DDBA6]/40 bg-[#3DDBA6]/10 p-4 text-sm leading-relaxed text-[#E6EDF7]">
              <strong className="font-bold text-[#3DDBA6]">What improved: </strong>
              {afterEval.improvement_note}
            </p>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 font-mono-tabular text-xs font-bold text-slate-400">
                  <th className="py-2 pr-3">Criterion</th>
                  <th className="py-2 px-3 text-right">Before</th>
                  <th className="py-2 px-3 text-right">After</th>
                  <th className="py-2 pl-3 text-right">Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {afterEval.scores.map((afterItem) => {
                  const beforeItem = beforeEval.scores.find(
                    (b) => b.criterion === afterItem.criterion
                  );
                  const beforeScore = beforeItem?.score ?? 0;
                  const delta = afterItem.score - beforeScore;
                  const style = CRITERION_STYLES[afterItem.criterion];

                  return (
                    <tr key={afterItem.criterion}>
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2 font-bold text-white">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{ backgroundColor: style.neonHex }}
                            aria-hidden="true"
                          />
                          <span>{afterItem.criterion}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300">{afterItem.justification}</p>
                      </td>
                      <td className="py-3.5 px-3 text-right align-top font-mono-tabular text-slate-400">
                        {beforeScore} / 5
                      </td>
                      <td className="py-3.5 px-3 text-right align-top font-mono-tabular font-bold text-white">
                        {afterItem.score} / 5
                      </td>
                      <td className="py-3.5 pl-3 text-right align-top font-mono-tabular font-bold whitespace-nowrap">
                        {delta > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>+{delta} up</span>
                          </span>
                        ) : delta < 0 ? (
                          <span className="inline-flex items-center gap-1 text-rose-400">
                            <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{delta} down</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>0 same</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-[#121126]/95 p-6 lg:col-span-5">
          <h2 className="self-start font-display text-base font-extrabold text-white">
            Before vs. After Shape
          </h2>
          <div className="mt-4">
            <RadarChart
              scores={afterEval.scores}
              compareScores={beforeEval.scores}
              primaryLabel="After Revision"
              compareLabel="Initial Answer"
            />
          </div>
        </section>
      </div>

      {/* Side-by-Side Warm Cream Framed Transcripts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border-[3px] border-[#14163F] bg-[#FFFDF7] text-[#14163F]">
          <div className="flex items-center justify-between border-b-2 border-[#14163F]/10 bg-[#F3EFE2] px-6 py-3.5">
            <h3 className="font-display text-sm font-extrabold text-[#14163F]">
              Before · Initial Answer
            </h3>
            <span className="font-mono-tabular text-xs font-bold text-slate-600">
              Avg {beforeAvg.toFixed(1)} / 5
            </span>
          </div>

          <div className="p-6">
            <HighlightedAnswer
              answer={beforeAnswer}
              evidence={beforeEval.evidence}
              selectedEvidenceId={activeBeforeEv?.id ?? null}
              onSelectEvidence={setSelectedBeforeId}
            />

            {activeBeforeEv && (
              <div className="mt-5 border-t border-[#14163F]/10 pt-4 text-xs">
                <div className={`font-bold ${CRITERION_STYLES[activeBeforeEv.criterion].labelText}`}>
                  {activeBeforeEv.criterion} · Quote Feedback
                </div>
                <p className="mt-1 text-slate-700">{activeBeforeEv.issue}</p>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border-[3px] border-[#3DDBA6] bg-[#FFFDF7] text-[#14163F] shadow-[0_0_28px_-10px_rgba(61,219,166,0.35)]">
          <div className="flex items-center justify-between border-b-2 border-[#14163F]/10 bg-emerald-100/70 px-6 py-3.5">
            <h3 className="font-display text-sm font-extrabold text-[#14163F]">
              After · Revised Answer
            </h3>
            <span className="font-mono-tabular text-xs font-extrabold text-emerald-900">
              Avg {afterAvg.toFixed(1)} / 5
            </span>
          </div>

          <div className="p-6">
            <HighlightedAnswer
              answer={afterAnswer}
              evidence={afterEval.evidence}
              selectedEvidenceId={activeAfterEv?.id ?? null}
              onSelectEvidence={setSelectedAfterId}
            />

            {activeAfterEv && (
              <div className="mt-5 border-t border-[#14163F]/10 pt-4 text-xs">
                <div className={`font-bold ${CRITERION_STYLES[activeAfterEv.criterion].labelText}`}>
                  {activeAfterEv.criterion} · Quote Feedback
                </div>
                <p className="mt-1 text-slate-700">{activeAfterEv.issue}</p>
                <p className="mt-1 font-semibold text-emerald-900">
                  Next step: {activeAfterEv.suggestion}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
