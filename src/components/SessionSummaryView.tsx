import {
  CRITERION_ORDER,
  CriterionKey,
  CriterionScore,
  QuestionAttempt,
  RoleConfig,
} from '../types';
import { CRITERION_STYLES } from '../constants/criteria';
import { RadarChart } from './RadarChart';
import { ArrowRight, RotateCcw, Target } from 'lucide-react';

interface SessionSummaryViewProps {
  role: RoleConfig;
  attempts: Record<string, QuestionAttempt>;
  onReviewQuestion: (questionIndex: number, showCompare: boolean) => void;
  onPracticeRemaining: (questionIndex: number) => void;
  onStartNewSession: () => void;
}

const PRACTICE_DRILLS: Record<CriterionKey, string> = {
  Relevance:
    'Before typing, write a one-line direct thesis answering the exact question asked—then cut any backstory that does not support that thesis.',
  'Clarity & Structure':
    'Use explicit signposts ("Context, Decision, Verification, Result") and keep each paragraph focused on one step so the listener never has to hunt for the takeaway.',
  Reasoning:
    'For every decision you mention, add one "because" clause plus one alternative you considered and rejected, explaining the trade-off.',
  'Use of Specific Examples':
    'Replace general claims ("we improved performance") with concrete artifacts: exact tools/methods, your personal actions, and a baseline-to-result metric.',
};

export function SessionSummaryView({
  role,
  attempts,
  onReviewQuestion,
  onPracticeRemaining,
  onStartNewSession,
}: SessionSummaryViewProps) {
  const answeredQuestions = role.questions
    .map((q, index) => ({
      question: q,
      index,
      attempt: attempts[q.id],
    }))
    .filter((entry) => Boolean(entry.attempt));

  const unansweredIndex = role.questions.findIndex((q) => !attempts[q.id]);

  const criterionAverages: CriterionScore[] = CRITERION_ORDER.map((criterion) => {
    if (answeredQuestions.length === 0) {
      return { criterion, score: 0, justification: '' };
    }
    const total = answeredQuestions.reduce((sum, entry) => {
      const latestEval =
        entry.attempt!.revisedEvaluation ?? entry.attempt!.initialEvaluation;
      const match = latestEval.scores.find((s) => s.criterion === criterion);
      return sum + (match?.score ?? 0);
    }, 0);
    const avg = Number((total / answeredQuestions.length).toFixed(2));
    return {
      criterion,
      score: avg,
      justification: '',
    };
  });

  const sortedByWeakest = [...criterionAverages].sort((a, b) => a.score - b.score);
  const weakest = sortedByWeakest[0];
  const tiedWeakest = sortedByWeakest.filter((c) => c.score === weakest.score);
  const weakestRubric = role.rubric.find((r) => r.key === weakest.criterion);

  const overallAverage =
    criterionAverages.reduce((sum, c) => sum + c.score, 0) /
    Math.max(1, criterionAverages.length);

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      {/* Cosmos Session Summary Banner */}
      <section className="overflow-hidden rounded-2xl border border-white/15 bg-[#121126]/95">
        <div className="p-6 sm:p-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono-tabular text-xs font-bold text-[#67E8F9]">
              STEP 04 / 04 · SESSION SUMMARY · {role.title.toUpperCase()}
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Practice Session Overview
            </h1>
            <p className="mt-1.5 text-sm text-slate-300">
              Completed {answeredQuestions.length} of {role.questions.length} questions ·
              Session average{' '}
              <span className="font-mono-tabular font-bold text-[#DDEB6B]">
                {overallAverage.toFixed(1)} / 5.0
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {unansweredIndex !== -1 && (
              <button
                type="button"
                onClick={() => onPracticeRemaining(unansweredIndex)}
                className="rounded-full border border-[#67E8F9]/60 bg-[#67E8F9]/10 px-4 py-2 text-xs font-bold text-[#67E8F9] hover:bg-[#67E8F9]/20 whitespace-nowrap shrink-0"
              >
                Continue Q{unansweredIndex + 1}
              </button>
            )}
            <button
              type="button"
              onClick={onStartNewSession}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#DDEB6B] px-5 py-2 text-xs font-extrabold text-[#14163F] hover:bg-[#67E8F9] transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Start New Session</span>
            </button>
          </div>
        </div>

        {answeredQuestions.length > 0 && (
          <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 sm:grid-cols-4">
            {criterionAverages.map((item) => {
              const style = CRITERION_STYLES[item.criterion];
              const isWeakest = item.criterion === weakest.criterion;
              return (
                <div
                  key={item.criterion}
                  className={isWeakest ? 'bg-[#1D152E] p-4' : 'bg-[#121126] p-4'}
                >
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
                      style={{ color: style.neonHex }}
                    >
                      {item.score.toFixed(1)}
                      <span className="text-xs font-normal text-slate-400"> / 5</span>
                    </span>
                    {isWeakest && (
                      <span className="font-mono-tabular text-[11px] font-bold text-[#FF8F63]">
                        LOWEST
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
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
        )}
      </section>

      {answeredQuestions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/15 bg-[#121126] p-8 text-center">
          <p className="text-base font-semibold text-white">
            You have not evaluated any answers in this session yet.
          </p>
          <button
            type="button"
            onClick={() => onPracticeRemaining(0)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#DDEB6B] px-5 py-2.5 text-sm font-extrabold text-[#14163F] hover:bg-[#67E8F9]"
          >
            Answer Question 1
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            <section className="rounded-2xl border border-white/15 bg-[#121126]/95 p-6 lg:col-span-5">
              <h2 className="font-display text-base font-extrabold text-white">
                Session Rubric Profile
              </h2>
              <div className="mt-4">
                <RadarChart scores={criterionAverages} />
              </div>
            </section>

            {/* Weakest Criterion Spotlight */}
            <section className="flex flex-col justify-between rounded-2xl border border-[#FF8F63]/45 bg-[#14112C]/95 p-6 shadow-[0_0_28px_-12px_rgba(255,143,99,0.3)] lg:col-span-7">
              <div>
                <div className="flex items-center gap-2 font-mono-tabular text-xs font-bold text-[#FF8F63]">
                  <Target className="h-4 w-4" aria-hidden="true" />
                  <span>HIGHEST-LEVERAGE FOCUS AREA</span>
                </div>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-white">
                  Weakest Criterion: {weakest.criterion} (
                  <span className="font-mono-tabular text-[#FF8F63]">
                    {weakest.score.toFixed(1)} / 5
                  </span>
                  )
                </h2>
                {tiedWeakest.length > 1 && (
                  <p className="mt-1 text-xs text-slate-300">
                    Tied for lowest average with{' '}
                    {tiedWeakest
                      .slice(1)
                      .map((c) => c.criterion)
                      .join(', ')}
                    .
                  </p>
                )}

                {weakestRubric && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-[#0B0A16] p-4">
                    <div className="font-mono-tabular text-[11px] font-bold text-slate-400">
                      LEVEL 5 TARGET FOR {role.title.toUpperCase()}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#E6EDF7]">
                      {weakestRubric.level5}
                    </p>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-[#3DDBA6]/35 bg-[#3DDBA6]/10 p-4">
                  <div className="font-mono-tabular text-[11px] font-bold text-[#3DDBA6]">
                    WHAT TO PRACTISE NEXT
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-white">
                    {PRACTICE_DRILLS[weakest.criterion]}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-3 text-xs text-slate-400">
                Averages reflect your latest attempt on each evaluated question (including revisions).
              </div>
            </section>
          </div>

          {/* Question Breakdown */}
          <section className="mt-6 rounded-2xl border border-white/15 bg-[#121126]/95 p-6">
            <h2 className="font-display text-base font-extrabold text-white">
              Question Breakdown
            </h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 font-mono-tabular text-xs font-bold text-slate-400">
                    <th className="py-2 pr-4">Question</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Latest Avg</th>
                    <th className="py-2 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {role.questions.map((q, idx) => {
                    const attempt = attempts[q.id];
                    const latestEval = attempt
                      ? attempt.revisedEvaluation ?? attempt.initialEvaluation
                      : null;
                    const qAvg = latestEval
                      ? latestEval.scores.reduce((s, item) => s + item.score, 0) /
                        latestEval.scores.length
                      : null;

                    return (
                      <tr key={q.id} className="hover:bg-white/[0.03]">
                        <td className="py-3.5 pr-4">
                          <span className="font-mono-tabular text-xs font-bold text-[#67E8F9] mr-2">
                            Q{idx + 1}
                          </span>
                          <span className="text-slate-200">{q.prompt}</span>
                        </td>
                        <td className="py-3.5 px-3 text-xs font-medium text-slate-400 whitespace-nowrap">
                          {q.category}
                        </td>
                        <td className="py-3.5 px-3 text-xs whitespace-nowrap">
                          {attempt?.revisedEvaluation ? (
                            <span className="font-bold text-[#3DDBA6]">Revised</span>
                          ) : attempt ? (
                            <span className="font-semibold text-slate-200">Evaluated</span>
                          ) : (
                            <span className="text-slate-500">Not answered</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono-tabular font-bold text-white whitespace-nowrap">
                          {qAvg !== null ? `${qAvg.toFixed(1)} / 5` : '—'}
                        </td>
                        <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                          {attempt ? (
                            <button
                              type="button"
                              onClick={() =>
                                onReviewQuestion(idx, Boolean(attempt.revisedEvaluation))
                              }
                              className="font-mono-tabular text-xs font-bold text-[#67E8F9] hover:text-[#DDEB6B] hover:underline"
                            >
                              {attempt.revisedEvaluation ? 'VIEW COMPARE' : 'VIEW FEEDBACK'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onPracticeRemaining(idx)}
                              className="font-mono-tabular text-xs font-semibold text-slate-400 hover:text-white hover:underline"
                            >
                              ANSWER
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
