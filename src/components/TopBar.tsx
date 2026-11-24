import { AppStep, RoleConfig } from '../types';
import { RotateCcw } from 'lucide-react';

interface TopBarProps {
  currentStep: AppStep;
  selectedRole: RoleConfig | null;
  hasAnsweredAny: boolean;
  onNavigateStep: (step: AppStep) => void;
  onResetSession: () => void;
}

const STEPS: Array<{ id: string; label: string; target: AppStep }> = [
  { id: '01', label: 'Role', target: 'role-select' },
  { id: '02', label: 'Rubric', target: 'rubric' },
  { id: '03', label: 'Practice', target: 'practice' },
  { id: '04', label: 'Summary', target: 'summary' },
];

function getActiveIndex(step: AppStep): number {
  switch (step) {
    case 'role-select':
      return 0;
    case 'rubric':
      return 1;
    case 'practice':
    case 'feedback':
    case 'compare':
      return 2;
    case 'summary':
      return 3;
  }
}

export function TopBar({
  currentStep,
  selectedRole,
  hasAnsweredAny,
  onNavigateStep,
  onResetSession,
}: TopBarProps) {
  const activeIndex = getActiveIndex(currentStep);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0A16]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigateStep('role-select')}
          className="font-display text-lg font-extrabold tracking-tight text-[#E6EDF7] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
        >
          Interview<span className="text-[#3DDBA6]">Mirror</span>
        </button>

        <nav
          aria-label="Session progress"
          className="hidden md:flex items-center gap-6 text-sm"
        >
          {STEPS.map((step, idx) => {
            const isActive = idx === activeIndex;
            const isCompleted = idx < activeIndex;
            const canClick =
              step.target === 'role-select' ||
              (step.target === 'rubric' && selectedRole !== null) ||
              (step.target === 'practice' && selectedRole !== null) ||
              (step.target === 'summary' && hasAnsweredAny);

            return (
              <button
                key={step.id}
                type="button"
                disabled={!canClick}
                onClick={() => canClick && onNavigateStep(step.target)}
                className={`relative flex items-center gap-1.5 whitespace-nowrap shrink-0 pb-1 transition-colors border-b-2 ${
                  isActive
                    ? 'border-[#67E8F9] font-bold text-[#E6EDF7]'
                    : isCompleted
                      ? 'border-transparent font-medium text-[#3DDBA6] hover:text-white'
                      : canClick
                        ? 'border-transparent font-medium text-slate-400 hover:text-[#E6EDF7]'
                        : 'border-transparent text-slate-600 cursor-not-allowed'
                }`}
              >
                <span className="font-mono-tabular text-xs opacity-75">{step.id}</span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {selectedRole ? (
            <button
              type="button"
              onClick={onResetSession}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-[#E6EDF7] hover:border-[#67E8F9] hover:bg-white/15 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#67E8F9]" aria-hidden="true" />
              <span>Start Over</span>
            </button>
          ) : (
            <a
              href="#role-grid"
              className="rounded-full bg-[#3DDBA6] px-4 py-1.5 text-xs font-bold text-[#0B0A16] hover:bg-[#67E8F9] transition-colors whitespace-nowrap shrink-0"
            >
              Choose Role
            </a>
          )}
        </div>
      </div>

      {/* Compact mobile progress strip */}
      <div className="flex md:hidden items-center justify-between border-t border-white/10 bg-[#080712] px-4 py-1.5 text-xs text-slate-300">
        <span>
          Step {activeIndex + 1} of 4 ·{' '}
          <strong className="font-semibold text-[#67E8F9]">
            {STEPS[activeIndex].label}
          </strong>
        </span>
        {selectedRole && (
          <span className="truncate max-w-[160px] text-slate-400">
            {selectedRole.title}
          </span>
        )}
      </div>
    </header>
  );
}
