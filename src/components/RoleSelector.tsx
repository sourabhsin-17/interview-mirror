import { FormEvent, useState } from 'react';
import { CRITERION_ORDER, CriterionKey, RoleConfig } from '../types';
import { PRESET_ROLES } from '../data/roles';
import { CRITERION_STYLES } from '../constants/criteria';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Code2,
  Layers,
  RefreshCw,
  Wand2,
} from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: RoleConfig) => void;
}

const ROLE_VISUALS: Record<
  string,
  { icon: typeof Code2; gradient: string; glow: string; accentHex: string }
> = {
  'swe-intern': {
    icon: Code2,
    gradient: 'from-[#0D1E3A] via-[#13424E] to-[#1D9E75]/65',
    glow: 'shadow-[0_0_24px_rgba(61,219,166,0.28)]',
    accentHex: '#3DDBA6',
  },
  'data-analyst': {
    icon: BarChart3,
    gradient: 'from-[#0E1838] via-[#1E3A78] to-[#378ADD]/65',
    glow: 'shadow-[0_0_24px_rgba(99,176,255,0.28)]',
    accentHex: '#63B0FF',
  },
  'product-manager': {
    icon: Layers,
    gradient: 'from-[#1B123C] via-[#3A2778] to-[#7F77DD]/65',
    glow: 'shadow-[0_0_24px_rgba(167,139,250,0.28)]',
    accentHex: '#A78BFA',
  },
};

const PREVIEW_SAMPLES: Record<
  CriterionKey,
  { quote: string; beforeText: string; afterText: string; note: string; scoreJump: string }
> = {
  Relevance: {
    quote: 'we spent a long time trying different things',
    beforeText:
      'Last semester we had a bug. Everyone was confused and we spent a long time trying different things before it worked.',
    afterText:
      'I isolated the 500 error in our validation middleware by reproducing the empty-string payload locally with curl.',
    note: 'Pinpoints drift into generic backstory and anchors directly to the prompt.',
    scoreJump: '2/5 → 5/5',
  },
  'Clarity & Structure': {
    quote: 'changed a few lines and cleared the cache',
    beforeText:
      'I looked at Stack Overflow and changed a few lines and cleared the cache, and eventually it started working again.',
    afterText:
      'Context: intermittent 500s on save. Root cause: unguarded .trim(). Fix: schema defaults. Verification: 3 Jest tests.',
    note: 'Replaces scattered chronology with Context → Cause → Fix → Verification.',
    scoreJump: '2/5 → 5/5',
  },
  Reasoning: {
    quote: 'it started working again',
    beforeText:
      'I wrapped the endpoint in a try/catch block and it started working again in our local environment.',
    afterText:
      'Instead of silencing errors in a broad try/catch, I added explicit 400 validation so malformed inputs fail loudly.',
    note: 'Evaluates why a solution was chosen over alternatives and edge cases.',
    scoreJump: '1/5 → 5/5',
  },
  'Use of Specific Examples': {
    quote: 'a really annoying bug in our web app',
    beforeText:
      'We fixed a really annoying bug in our web app and it taught me that debugging takes teamwork.',
    afterText:
      'Added 3 integration tests covering missing, null, and valid inputs—eliminating 500 errors across staging.',
    note: 'Replaces vague phrases with concrete artifacts, ownership, and metrics.',
    scoreJump: '2/5 → 5/5',
  },
};

const QUICK_CUSTOM_ROLES = ['UX Designer', 'Machine Learning Engineer', 'Cloud Solutions Architect'];

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const [customRole, setCustomRole] = useState('');
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewCriterion, setPreviewCriterion] = useState<CriterionKey>('Reasoning');
  const [isPreviewFlipped, setIsPreviewFlipped] = useState(false);

  async function handleCustomSubmit(e?: FormEvent, overrideRole?: string) {
    if (e) e.preventDefault();
    const trimmed = (overrideRole ?? customRole).trim();
    if (trimmed.length < 2) {
      setError('Please enter a role title (at least 2 characters).');
      return;
    }

    setError(null);
    setIsLoadingCustom(true);

    try {
      const res = await fetch('/api/custom-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customRole: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not generate a rubric for this role.');
      }
      onSelectRole(data as RoleConfig);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to build a custom role right now. Please try again.'
      );
    } finally {
      setIsLoadingCustom(false);
    }
  }

  const activeSample = PREVIEW_SAMPLES[previewCriterion];
  const activeStyle = CRITERION_STYLES[previewCriterion];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Luminous Hero Grid */}
      <div className="grid gap-8 lg:grid-cols-12 items-center">
        {/* Left 7 Cols: Bold Display Typography + Glowing 4 Pillars */}
        <section className="lg:col-span-7">
          <p className="font-mono-tabular text-xs font-semibold tracking-wider text-[#67E8F9]">
            STEP 01 / 04 · RUBRIC-ANCHORED PRACTICE
          </p>
          <h1
            className="mt-3 font-display text-4xl font-extrabold tracking-tight text-[#E6EDF7] sm:text-5xl leading-[1.08]"
            style={{ textWrap: 'balance' }}
          >
            See why your answers{' '}
            <span className="text-[#3DDBA6] [text-shadow:0_0_26px_rgba(61,219,166,0.45)]">
              land
            </span>
            —or fall{' '}
            <span className="text-[#FF8F63] [text-shadow:0_0_26px_rgba(255,143,99,0.4)]">
              short
            </span>
            .
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
            Inspect a visible 4-criterion scoring rubric before you answer, get exact quote
            highlights mapped to your own words, and measure your score jump after revising.
          </p>

          {/* 4 Glowing Criterion Pillars (inspired by B/Stack 4-col glowing stats) */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-white/10 pt-6">
            {CRITERION_ORDER.map((crit, idx) => {
              const s = CRITERION_STYLES[crit];
              return (
                <button
                  key={crit}
                  type="button"
                  onClick={() => {
                    setPreviewCriterion(crit);
                    setIsPreviewFlipped(false);
                  }}
                  className="group text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#67E8F9]"
                >
                  <div
                    className="font-display text-2xl font-extrabold tabular-nums transition-transform group-hover:-translate-y-0.5"
                    style={{
                      color: s.neonHex,
                      textShadow: `0 0 20px ${s.glowRgba}`,
                    }}
                  >
                    0{idx + 1}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#E6EDF7] group-hover:text-white">
                    {crit}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right 5 Cols: Tactile 3D-Flippable Quote Diagnosis Trading Card */}
        <section className="lg:col-span-5">
          {/* Focus Pills above card */}
          <div
            className="mb-3 flex flex-wrap gap-1.5"
            role="tablist"
            aria-label="Preview feedback criterion"
          >
            {CRITERION_ORDER.map((crit) => {
              const s = CRITERION_STYLES[crit];
              const isSelected = crit === previewCriterion;
              return (
                <button
                  key={crit}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setPreviewCriterion(crit);
                    setIsPreviewFlipped(false);
                  }}
                  style={
                    isSelected
                      ? {
                          backgroundColor: s.neonHex,
                          color: '#080812',
                          boxShadow: `0 0 18px ${s.glowRgba}`,
                        }
                      : {
                          borderColor: `${s.neonHex}66`,
                        }
                  }
                  className={`rounded-full border px-3 py-1 font-mono-tabular text-[11px] font-bold transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? ''
                      : 'bg-[#121126]/90 text-slate-300 hover:text-white'
                  }`}
                >
                  {s.shortLabel}
                </button>
              );
            })}
          </div>

          {/* 3D Flippable Trading Card */}
          <div className="flip-perspective">
            <button
              type="button"
              onClick={() => setIsPreviewFlipped((prev) => !prev)}
              className="block w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#67E8F9]"
              aria-label="Flip preview card between initial draft and revised answer"
            >
              <div
                className={`flip-inner grid w-full ${
                  isPreviewFlipped ? 'is-flipped' : ''
                }`}
              >
                {/* FRONT: Warm Cream Card with #14163F 3px border */}
                <div
                  aria-hidden={isPreviewFlipped}
                  className={`flip-face col-start-1 row-start-1 flex min-h-[270px] flex-col justify-between rounded-2xl border-[3px] border-[#14163F] bg-[#FFFDF7] p-5 text-[#14163F] shadow-[0_14px_30px_-8px_rgba(0,0,0,0.6)] ${
                    isPreviewFlipped ? 'pointer-events-none' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-[#14163F]/10 pb-2.5">
                      <span className="font-mono-tabular text-[11px] font-bold uppercase tracking-wider text-[#14163F]/70">
                        Draft · {previewCriterion}
                      </span>
                      <span className="font-mono-tabular text-xs font-extrabold text-[#14163F]">
                        {activeSample.scoreJump}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-[#14163F]">
                      {activeSample.beforeText.split(activeSample.quote)[0]}
                      <span
                        className={`rounded px-1.5 py-0.5 font-semibold ${activeStyle.highlightBg} ${activeStyle.highlightBorder}`}
                      >
                        {activeSample.quote}
                      </span>
                      {activeSample.beforeText.split(activeSample.quote)[1]}
                    </p>

                    <p className="mt-4 text-xs leading-relaxed text-slate-600">
                      {activeSample.note}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#14163F]/10 pt-3 text-xs font-bold text-[#14163F]">
                    <span>Click card to flip to revision</span>
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                </div>

                {/* BACK: Deep Indigo Card (#14163F) */}
                <div
                  aria-hidden={!isPreviewFlipped}
                  className={`flip-face flip-back col-start-1 row-start-1 flex min-h-[270px] flex-col justify-between rounded-2xl border-[3px] border-[#67E8F9] bg-[#14163F] p-5 text-[#E6EDF7] shadow-[0_14px_32px_-8px_rgba(103,232,249,0.28)] ${
                    !isPreviewFlipped ? 'pointer-events-none' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                      <span
                        className="font-mono-tabular text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: activeStyle.neonHex }}
                      >
                        Revised · 5 / 5 Target
                      </span>
                      <span className="font-mono-tabular text-xs font-bold text-[#DDEB6B]">
                        {activeSample.scoreJump}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-white">
                      &ldquo;{activeSample.afterText}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-xs font-semibold text-[#67E8F9]">
                    <span>Click to flip back to draft</span>
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>

      {/* Role Cards Grid */}
      <div id="role-grid" className="mt-14">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">
              Choose Your Target Role
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Each track unlocks a role-specific 1/3/5 rubric and 5 mixed Behavioral &amp; Technical prompts.
            </p>
          </div>
          <span className="font-mono-tabular text-xs text-[#67E8F9]">
            3 Presets · Custom Role Supported
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {PRESET_ROLES.map((role) => {
            const visual = ROLE_VISUALS[role.id] ?? ROLE_VISUALS['swe-intern'];
            const Icon = visual.icon;
            const behavioralCount = role.questions.filter(
              (q) => q.category === 'Behavioral'
            ).length;
            const technicalCount = role.questions.filter(
              (q) => q.category === 'Technical'
            ).length;

            return (
              <button
                key={role.id}
                type="button"
                disabled={isLoadingCustom}
                onClick={() => onSelectRole(role)}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-[#121126]/90 text-left transition-all hover:-translate-y-1 hover:border-[#67E8F9]/70 hover:shadow-[0_12px_36px_-10px_rgba(103,232,249,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9] disabled:opacity-60"
              >
                <div>
                  {/* Gradient Showcase Stage */}
                  <div
                    className={`bg-gradient-to-br ${visual.gradient} p-6 border-b border-white/10`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/35 bg-white/10 text-white ${visual.glow}`}
                      >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <span className="font-mono-tabular text-xs font-bold text-white/90">
                        {role.questions.length} Qs
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-xl font-extrabold text-white">
                      {role.title}
                    </h3>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <p className="text-sm leading-relaxed text-slate-300">
                      {role.subtitle}
                    </p>

                    <div className="mt-4 border-t border-white/10 pt-4">
                      <div className="font-mono-tabular text-[11px] uppercase tracking-wider text-slate-400">
                        Opening Prompt
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-200">
                        &ldquo;{role.questions[0].prompt}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-6 py-4 text-xs">
                  <span className="font-mono-tabular text-slate-400">
                    {behavioralCount} Behavioral · {technicalCount} Technical
                  </span>
                  <span
                    className="inline-flex items-center gap-1 font-bold whitespace-nowrap shrink-0"
                    style={{ color: visual.accentHex }}
                  >
                    Inspect Rubric
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Role Builder Strip */}
      <section className="mt-8 rounded-2xl border border-white/15 bg-[#121126]/95 p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 font-mono-tabular text-xs font-bold text-[#DDEB6B]">
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              <span>CUSTOM ROLE GENERATOR</span>
            </div>
            <h2 className="mt-2 font-display text-xl font-extrabold text-white">
              Practising for another discipline?
            </h2>
            <p className="mt-1.5 text-sm text-slate-300">
              Generate a tailored 4-criterion rubric and 5 mixed questions for any role title.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_CUSTOM_ROLES.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  disabled={isLoadingCustom}
                  onClick={() => setCustomRole(sample)}
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono-tabular text-[11px] font-medium text-slate-200 hover:border-[#67E8F9] hover:text-[#67E8F9] transition-colors whitespace-nowrap shrink-0"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={(e) => handleCustomSubmit(e)}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="custom-role-input" className="sr-only">
                Custom target role
              </label>
              <input
                id="custom-role-input"
                type="text"
                value={customRole}
                onChange={(e) => {
                  setCustomRole(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. UX Designer, Security Engineer, iOS Developer"
                maxLength={80}
                disabled={isLoadingCustom}
                className="flex-1 rounded-xl border border-white/20 bg-[#0B0A16] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#67E8F9] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoadingCustom}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#DDEB6B] px-6 py-3 text-sm font-extrabold text-[#14163F] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                {isLoadingCustom ? 'Generating...' : 'Build Role Rubric'}
              </button>
            </form>

            {isLoadingCustom && (
              <div className="mt-4 border-t border-white/10 pt-4" aria-live="polite">
                <p className="mb-2 font-mono-tabular text-xs text-[#67E8F9]">
                  Drafting 1/3/5 rubric anchors and 5 mixed questions...
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-white/10" />
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-4 flex flex-col gap-3 rounded-xl border border-rose-400/40 bg-rose-950/50 p-3.5 text-sm text-rose-200 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCustomSubmit()}
                  className="self-start rounded-full border border-rose-400/50 bg-rose-900/50 px-3.5 py-1 text-xs font-bold text-white hover:bg-rose-900 whitespace-nowrap shrink-0"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
