import { useState } from 'react';
import {
  AppStep,
  EvaluationResult,
  QuestionAttempt,
  RoleConfig,
} from './types';
import { TopBar } from './components/TopBar';
import { RoleSelector } from './components/RoleSelector';
import { RubricView } from './components/RubricView';
import { PracticeView } from './components/PracticeView';
import { FeedbackView } from './components/FeedbackView';
import { CompareView } from './components/CompareView';
import { SessionSummaryView } from './components/SessionSummaryView';

function isValidEvaluation(data: unknown): data is EvaluationResult {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.scores) &&
    d.scores.length === 4 &&
    Array.isArray(d.evidence) &&
    typeof d.overall_summary === 'string' &&
    Array.isArray(d.top_3_fixes) &&
    typeof d.improved_example === 'string'
  );
}

export default function App() {
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null);
  const [step, setStep] = useState<AppStep>('role-select');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, QuestionAttempt>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [isRevising, setIsRevising] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  const currentQuestion = selectedRole?.questions[questionIndex] ?? null;
  const currentAttempt = currentQuestion ? attempts[currentQuestion.id] : undefined;
  const hasAnsweredAny = Object.keys(attempts).length > 0;

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectRole(role: RoleConfig) {
    setSelectedRole(role);
    setQuestionIndex(0);
    setAttempts({});
    setDrafts({});
    setIsRevising(false);
    setEvalError(null);
    setStep('rubric');
    scrollToTop();
  }

  function handleResetSession() {
    setSelectedRole(null);
    setQuestionIndex(0);
    setAttempts({});
    setDrafts({});
    setIsRevising(false);
    setEvalError(null);
    setStep('role-select');
    scrollToTop();
  }

  function handleNavigateStep(target: AppStep) {
    setEvalError(null);
    if (target === 'role-select') {
      setStep('role-select');
      scrollToTop();
      return;
    }
    if (!selectedRole) return;

    if (target === 'rubric') {
      setStep('rubric');
      scrollToTop();
      return;
    }

    if (target === 'practice') {
      const q = selectedRole.questions[questionIndex];
      const existing = attempts[q.id];
      if (existing && !isRevising) {
        setStep(existing.revisedEvaluation ? 'compare' : 'feedback');
      } else {
        setStep('practice');
      }
      scrollToTop();
      return;
    }

    if (target === 'summary' && hasAnsweredAny) {
      setStep('summary');
      scrollToTop();
    }
  }

  function handleSelectQuestion(idx: number) {
    if (!selectedRole) return;
    const targetQ = selectedRole.questions[idx];
    setQuestionIndex(idx);
    setEvalError(null);
    setIsRevising(false);

    const existing = attempts[targetQ.id];
    if (existing) {
      setStep(existing.revisedEvaluation ? 'compare' : 'feedback');
    } else {
      setStep('practice');
    }
    scrollToTop();
  }

  async function handleSubmitAnswer() {
    if (!selectedRole || !currentQuestion) return;
    const answerText = (drafts[currentQuestion.id] ?? '').trim();
    if (!answerText) return;

    setEvalError(null);
    setIsEvaluating(true);

    const prior = attempts[currentQuestion.id];
    const revisingNow = isRevising && Boolean(prior);

    try {
      const payload = {
        roleTitle: selectedRole.title,
        question: {
          category: currentQuestion.category,
          prompt: currentQuestion.prompt,
        },
        rubric: selectedRole.rubric,
        answer: answerText,
        ...(revisingNow && prior
          ? {
              previousAnswer: prior.initialAnswer,
              previousScores: prior.initialEvaluation.scores.map((s) => ({
                criterion: s.criterion,
                score: s.score,
              })),
            }
          : {}),
      };

      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          data && typeof data.error === 'string'
            ? data.error
            : `Evaluation failed (status ${res.status}). Please retry.`;
        throw new Error(message);
      }

      if (!isValidEvaluation(data)) {
        throw new Error(
          'Received an incomplete evaluation format from the server. Please click Retry.'
        );
      }

      if (revisingNow && prior) {
        setAttempts((prev) => ({
          ...prev,
          [currentQuestion.id]: {
            ...prior,
            revisedAnswer: answerText,
            revisedEvaluation: data,
          },
        }));
        setIsRevising(false);
        setStep('compare');
      } else {
        setAttempts((prev) => ({
          ...prev,
          [currentQuestion.id]: {
            questionId: currentQuestion.id,
            initialAnswer: answerText,
            initialEvaluation: data,
            checkedFixes: {},
          },
        }));
        setIsRevising(false);
        setStep('feedback');
      }
      scrollToTop();
    } catch (err) {
      setEvalError(
        err instanceof Error
          ? err.message
          : 'Network error while evaluating your answer. Please retry.'
      );
    } finally {
      setIsEvaluating(false);
    }
  }

  function handleStartRevision() {
    if (!currentQuestion || !currentAttempt) return;
    const latestAnswer =
      currentAttempt.revisedAnswer ?? currentAttempt.initialAnswer;
    setDrafts((prev) => ({
      ...prev,
      [currentQuestion.id]: latestAnswer,
    }));
    setIsRevising(true);
    setEvalError(null);
    setStep('practice');
    scrollToTop();
  }

  function handleToggleFix(fixIdx: number) {
    if (!currentQuestion) return;
    setAttempts((prev) => {
      const existing = prev[currentQuestion.id];
      if (!existing) return prev;
      return {
        ...prev,
        [currentQuestion.id]: {
          ...existing,
          checkedFixes: {
            ...existing.checkedFixes,
            [fixIdx]: !existing.checkedFixes[fixIdx],
          },
        },
      };
    });
  }

  function handleNextQuestion() {
    if (!selectedRole) return;
    const nextIdx = Math.min(selectedRole.questions.length - 1, questionIndex + 1);
    handleSelectQuestion(nextIdx);
  }

  return (
    <div className="flex min-h-screen flex-col bg-cosmos-grid text-[#E6EDF7]">
      <TopBar
        currentStep={step}
        selectedRole={selectedRole}
        hasAnsweredAny={hasAnsweredAny}
        onNavigateStep={handleNavigateStep}
        onResetSession={handleResetSession}
      />

      <main className="flex-1">
        {step === 'role-select' && (
          <RoleSelector onSelectRole={handleSelectRole} />
        )}

        {step === 'rubric' && selectedRole && (
          <RubricView
            role={selectedRole}
            onBack={() => setStep('role-select')}
            onStartPractice={() => {
              setQuestionIndex(0);
              setIsRevising(false);
              setStep('practice');
              scrollToTop();
            }}
          />
        )}

        {step === 'practice' && selectedRole && currentQuestion && (
          <PracticeView
            role={selectedRole}
            questionIndex={questionIndex}
            question={currentQuestion}
            attempts={attempts}
            draftAnswer={drafts[currentQuestion.id] ?? ''}
            isRevising={isRevising}
            isEvaluating={isEvaluating}
            error={evalError}
            onChangeDraft={(val) =>
              setDrafts((prev) => ({ ...prev, [currentQuestion.id]: val }))
            }
            onSubmit={handleSubmitAnswer}
            onRetry={handleSubmitAnswer}
            onSelectQuestion={handleSelectQuestion}
            onCancelRevision={
              isRevising && currentAttempt
                ? () => {
                    setIsRevising(false);
                    setStep(
                      currentAttempt.revisedEvaluation ? 'compare' : 'feedback'
                    );
                  }
                : undefined
            }
          />
        )}

        {step === 'feedback' &&
          selectedRole &&
          currentQuestion &&
          currentAttempt && (
            <FeedbackView
              role={selectedRole}
              questionIndex={questionIndex}
              question={currentQuestion}
              answer={
                currentAttempt.revisedAnswer ?? currentAttempt.initialAnswer
              }
              evaluation={
                currentAttempt.revisedEvaluation ??
                currentAttempt.initialEvaluation
              }
              checkedFixes={currentAttempt.checkedFixes}
              hasRevision={Boolean(currentAttempt.revisedEvaluation)}
              onToggleFix={handleToggleFix}
              onRevise={handleStartRevision}
              onViewCompare={() => {
                setStep('compare');
                scrollToTop();
              }}
              onNextQuestion={handleNextQuestion}
              onViewSummary={() => {
                setStep('summary');
                scrollToTop();
              }}
            />
          )}

        {step === 'compare' &&
          selectedRole &&
          currentQuestion &&
          currentAttempt &&
          currentAttempt.revisedAnswer &&
          currentAttempt.revisedEvaluation && (
            <CompareView
              role={selectedRole}
              questionIndex={questionIndex}
              question={currentQuestion}
              beforeAnswer={currentAttempt.initialAnswer}
              beforeEval={currentAttempt.initialEvaluation}
              afterAnswer={currentAttempt.revisedAnswer}
              afterEval={currentAttempt.revisedEvaluation}
              onReviseAgain={handleStartRevision}
              onViewFullAfterFeedback={() => {
                setStep('feedback');
                scrollToTop();
              }}
              onNextQuestion={handleNextQuestion}
              onViewSummary={() => {
                setStep('summary');
                scrollToTop();
              }}
            />
          )}

        {step === 'summary' && selectedRole && (
          <SessionSummaryView
            role={selectedRole}
            attempts={attempts}
            onReviewQuestion={(idx, showCompare) => {
              setQuestionIndex(idx);
              setIsRevising(false);
              setStep(showCompare ? 'compare' : 'feedback');
              scrollToTop();
            }}
            onPracticeRemaining={(idx) => {
              setQuestionIndex(idx);
              setIsRevising(false);
              setStep('practice');
              scrollToTop();
            }}
            onStartNewSession={handleResetSession}
          />
        )}
      </main>

      <footer className="border-t border-white/10 bg-[#080712]">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>InterviewMirror · Rubric-anchored interview practice</span>
          <span>AI feedback is practice guidance, not a hiring decision.</span>
        </div>
      </footer>
    </div>
  );
}
