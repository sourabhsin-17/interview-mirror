import { useEffect, useState } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { CriterionKey, RoleConfig } from '../types';
import { CRITERION_STYLES } from '../constants/criteria';
import {
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  Layers,
  LayoutGrid,
  RefreshCw,
} from 'lucide-react';

interface RubricViewProps {
  role: RoleConfig;
  onBack: () => void;
  onStartPractice: () => void;
}

export function RubricView({ role, onBack, onStartPractice }: RubricViewProps) {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [deckView, setDeckView] = useState<'folder' | 'spread'>('folder');
  const [activeStackIndex, setActiveStackIndex] = useState(0);
  const [replayCount, setReplayCount] = useState(0);

  // Start bunched inside the folder when a role opens (or replay is clicked), then emerge one-by-one into separated cards
  useEffect(() => {
    setFlippedCards({});
    setActiveStackIndex(0);
    setDeckView('folder');
    const timer = window.setTimeout(() => {
      setDeckView('spread');
    }, 450);
    return () => window.clearTimeout(timer);
  }, [role.id, replayCount]);

  function toggleFlip(key: CriterionKey) {
    setFlippedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleReplayFolderOpen() {
    setReplayCount((c) => c + 1);
  }

  function handleCycleStack(dir: 1 | -1) {
    setActiveStackIndex((prev) => (prev + dir + role.rubric.length) % role.rubric.length);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono-tabular text-xs font-bold tracking-wider text-[#67E8F9]">
            STEP 02 / 04 · {role.title.toUpperCase()}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Inspect the 4-Criterion Rubric
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            All four criteria emerge from the role folder—click any card to flip between{' '}
            <strong className="text-[#3DDBA6]">Score 5 Target</strong> and{' '}
            <strong className="text-[#FF8F63]">Levels 1 &amp; 3</strong>, or gather them back
            into the folder stack.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Change Role
          </button>
          <button
            type="button"
            onClick={onStartPractice}
            className="inline-flex items-center gap-2 rounded-full bg-[#DDEB6B] px-5 py-2.5 text-sm font-extrabold text-[#14163F] transition-transform hover:scale-[1.02] whitespace-nowrap shrink-0"
          >
            Start Practice (5 Qs)
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Interactive Sky-Blue & Indigo Folder/Trading Deck Stage */}
      <section className="relative mt-12 rounded-2xl border-[3px] border-[#14163F] bg-[#9CD2F3] px-5 pb-7 pt-12 text-[#14163F] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.65)] sm:px-7">
        {/* Overlapping Deep Indigo Banner */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border-[3px] border-[#14163F] bg-[#14163F] px-5 py-2 text-center font-display text-xs sm:text-sm font-extrabold tracking-wide text-white shadow-[0_0_0_3px_#9CD2F3]">
          RUBRIC FOLDER · {role.title.toUpperCase()}
        </div>

        {/* Deck Mode Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#14163F]/15 pb-4">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Deck view mode">
            <button
              type="button"
              onClick={() => setDeckView('spread')}
              className={`inline-flex items-center gap-1.5 rounded-full border-2 border-[#14163F] px-3.5 py-1.5 font-mono-tabular text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                deckView === 'spread'
                  ? 'bg-[#14163F] text-white'
                  : 'bg-[#FFFDF7] text-[#14163F] hover:bg-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Separate Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setDeckView('folder')}
              className={`inline-flex items-center gap-1.5 rounded-full border-2 border-[#14163F] px-3.5 py-1.5 font-mono-tabular text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                deckView === 'folder'
                  ? 'bg-[#14163F] text-white'
                  : 'bg-[#FFFDF7] text-[#14163F] hover:bg-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Folder Bunch</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReplayFolderOpen}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#14163F] bg-[#DDEB6B] px-3.5 py-1.5 font-mono-tabular text-xs font-extrabold text-[#14163F] hover:bg-white transition-colors whitespace-nowrap shrink-0"
          >
            <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Open Folder Animation</span>
          </button>
        </div>

        <LayoutGroup id={`rubric-deck-${role.id}`}>
          {deckView === 'spread' ? (
            /* SEPARATED GRID: cards smoothly fly out one-by-one from behind each other in the folder */
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {role.rubric.map((criterion, idx) => {
                const style = CRITERION_STYLES[criterion.key];
                const isFlipped = Boolean(flippedCards[criterion.key]);

                return (
                  <motion.div
                    key={criterion.key}
                    layoutId={`rubric-card-${role.id}-${criterion.key}`}
                    transition={{
                      layout: {
                        type: 'spring',
                        stiffness: 220,
                        damping: 25,
                        delay: idx * 0.09,
                      },
                    }}
                    className="flip-perspective flex"
                    style={{ zIndex: role.rubric.length - idx }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFlip(criterion.key)}
                      className="group flex w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#14163F]"
                      aria-label={`Flip ${criterion.label} rubric card`}
                    >
                      <div
                        className={`flip-inner grid min-h-[268px] h-full w-full transition-transform duration-300 group-hover:-translate-y-1.5 ${
                          isFlipped ? 'is-flipped' : ''
                        }`}
                      >
                        {/* FRONT: Warm Cream Trading Card (#FFFDF7) */}
                        <div
                          aria-hidden={isFlipped}
                          className={`flip-face col-start-1 row-start-1 flex flex-col justify-between rounded-2xl border-[3px] border-[#14163F] bg-[#FFFDF7] p-5 shadow-[0_10px_22px_-8px_rgba(10,20,60,0.55)] ${
                            isFlipped ? 'pointer-events-none' : ''
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between border-b-2 border-[#14163F]/10 pb-2.5">
                              <span className="font-mono-tabular text-xs font-extrabold text-[#14163F]/60">
                                0{idx + 1} / 04
                              </span>
                              <span
                                className="h-3 w-3 rounded-sm border border-[#14163F]"
                                style={{ backgroundColor: style.neonHex }}
                                aria-hidden="true"
                              />
                            </div>

                            <h2 className="mt-3 font-display text-lg font-extrabold leading-tight text-[#14163F]">
                              {criterion.label}
                            </h2>
                            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                              {criterion.summary}
                            </p>

                            <div className="mt-3.5 rounded-xl border-2 border-[#14163F]/15 bg-emerald-50 p-3">
                              <div className="font-mono-tabular text-[11px] font-bold text-emerald-800">
                                SCORE 5 · TARGET
                              </div>
                              <p className="mt-1 text-xs font-medium leading-relaxed text-[#14163F]">
                                {criterion.level5}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between pt-2 text-[11px] font-bold text-[#14163F]/75">
                            <span>Flip for Levels 1 &amp; 3</span>
                            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                          </div>
                        </div>

                        {/* BACK: Deep Indigo Card (#14163F) */}
                        <div
                          aria-hidden={!isFlipped}
                          className={`flip-face flip-back col-start-1 row-start-1 flex flex-col justify-between rounded-2xl border-[3px] border-[#14163F] bg-[#14163F] p-5 text-white shadow-[0_10px_22px_-8px_rgba(10,20,60,0.7)] ${
                            !isFlipped ? 'pointer-events-none' : ''
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                              <span
                                className="font-mono-tabular text-xs font-bold"
                                style={{ color: style.neonHex }}
                              >
                                {criterion.label}
                              </span>
                              <span className="font-mono-tabular text-[11px] text-slate-300">
                                1 &amp; 3
                              </span>
                            </div>

                            <div className="mt-3">
                              <div className="font-mono-tabular text-[11px] font-bold text-[#FF8F63]">
                                SCORE 1 · WEAK
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-slate-200">
                                {criterion.level1}
                              </p>
                            </div>

                            <div className="mt-3 border-t border-white/15 pt-2.5">
                              <div className="font-mono-tabular text-[11px] font-bold text-[#67E8F9]">
                                SCORE 3 · DEVELOPING
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-slate-200">
                                {criterion.level3}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between pt-2 text-[11px] font-semibold text-[#9CD2F3]">
                            <span>Flip back to Target 5</span>
                            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* INTERACTIVE FOLDER BUNCH: Cards stacked behind each other inside a folder pocket */
            <div className="mx-auto max-w-2xl py-2">
              {/* Folder Divider Tabs */}
              <div className="flex flex-wrap items-end gap-1.5 px-2">
                {role.rubric.map((criterion, idx) => {
                  const style = CRITERION_STYLES[criterion.key];
                  const isActive = idx === activeStackIndex;
                  return (
                    <button
                      key={criterion.key}
                      type="button"
                      onClick={() => setActiveStackIndex(idx)}
                      className={`inline-flex items-center gap-1.5 rounded-t-xl border-x-[3px] border-t-[3px] border-[#14163F] px-3 py-2 font-mono-tabular text-xs font-extrabold transition-all whitespace-nowrap shrink-0 ${
                        isActive
                          ? '-mb-[3px] z-20 bg-[#FFFDF7] text-[#14163F] pb-2.5'
                          : 'bg-[#14163F]/85 text-white hover:bg-[#14163F]'
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-sm border border-[#14163F]"
                        style={{ backgroundColor: style.neonHex }}
                        aria-hidden="true"
                      />
                      <span>
                        0{idx + 1} · {style.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Stacked Folder Pocket Container */}
              <div className="relative rounded-2xl border-[3px] border-[#14163F] bg-[#14163F] p-5 sm:p-7 shadow-[0_16px_34px_-10px_rgba(10,20,60,0.75)]">
                <div className="relative mx-auto h-[300px] max-w-md">
                  {role.rubric.map((criterion, idx) => {
                    const style = CRITERION_STYLES[criterion.key];
                    const relativePos =
                      (idx - activeStackIndex + role.rubric.length) % role.rubric.length;
                    const isFront = relativePos === 0;
                    const isFlipped = Boolean(flippedCards[criterion.key]);

                    const offsetX = relativePos * 14;
                    const offsetY = relativePos * 8;
                    const rotateDeg = relativePos === 0 ? 0 : relativePos % 2 === 1 ? 2.5 : -2;
                    const scaleVal = 1 - relativePos * 0.035;

                    return (
                      <motion.div
                        key={criterion.key}
                        layoutId={`rubric-card-${role.id}-${criterion.key}`}
                        className="flip-perspective absolute inset-0"
                        style={{
                          zIndex: role.rubric.length - relativePos,
                          pointerEvents: isFront ? 'auto' : 'none',
                        }}
                        animate={{
                          x: offsetX,
                          y: offsetY,
                          rotate: rotateDeg,
                          scale: scaleVal,
                          opacity: 1 - relativePos * 0.1,
                        }}
                        transition={{
                          layout: {
                            type: 'spring',
                            stiffness: 220,
                            damping: 25,
                            delay: idx * 0.05,
                          },
                          type: 'spring',
                          stiffness: 260,
                          damping: 24,
                        }}
                      >
                        <button
                          type="button"
                          disabled={!isFront}
                          onClick={() => isFront && toggleFlip(criterion.key)}
                          className="block h-full w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#67E8F9]"
                        >
                          <div
                            className={`flip-inner grid h-full w-full ${
                              isFlipped && isFront ? 'is-flipped' : ''
                            }`}
                          >
                            <div
                              aria-hidden={isFlipped}
                              className="flip-face col-start-1 row-start-1 flex flex-col justify-between rounded-2xl border-[3px] border-[#14163F] bg-[#FFFDF7] p-6 text-[#14163F] shadow-[0_14px_28px_-8px_rgba(0,0,0,0.5)]"
                            >
                              <div>
                                <div className="flex items-center justify-between border-b-2 border-[#14163F]/10 pb-2.5">
                                  <span className="font-mono-tabular text-xs font-extrabold text-[#14163F]/60">
                                    0{idx + 1} / 04 · IN FOLDER
                                  </span>
                                  <span
                                    className="h-3.5 w-3.5 rounded-sm border border-[#14163F]"
                                    style={{ backgroundColor: style.neonHex }}
                                    aria-hidden="true"
                                  />
                                </div>

                                <h2 className="mt-3 font-display text-xl font-extrabold text-[#14163F]">
                                  {criterion.label}
                                </h2>
                                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                                  {criterion.summary}
                                </p>

                                <div className="mt-4 rounded-xl border-2 border-[#14163F]/15 bg-emerald-50 p-3.5">
                                  <div className="font-mono-tabular text-[11px] font-bold text-emerald-800">
                                    SCORE 5 · TARGET
                                  </div>
                                  <p className="mt-1 text-xs font-medium leading-relaxed text-[#14163F]">
                                    {criterion.level5}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center justify-between pt-2 text-xs font-bold text-[#14163F]/80">
                                <span>Click card to flip for Levels 1 &amp; 3</span>
                                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                              </div>
                            </div>

                            <div
                              aria-hidden={!isFlipped}
                              className="flip-face flip-back col-start-1 row-start-1 flex flex-col justify-between rounded-2xl border-[3px] border-[#67E8F9] bg-[#14163F] p-6 text-white shadow-[0_14px_28px_-8px_rgba(0,0,0,0.65)]"
                            >
                              <div>
                                <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                                  <span
                                    className="font-mono-tabular text-xs font-bold"
                                    style={{ color: style.neonHex }}
                                  >
                                    {criterion.label}
                                  </span>
                                  <span className="font-mono-tabular text-xs text-slate-300">
                                    Levels 1 &amp; 3
                                  </span>
                                </div>

                                <div className="mt-4">
                                  <div className="font-mono-tabular text-[11px] font-bold text-[#FF8F63]">
                                    SCORE 1 · WEAK
                                  </div>
                                  <p className="mt-1 text-xs leading-relaxed text-slate-200">
                                    {criterion.level1}
                                  </p>
                                </div>

                                <div className="mt-4 border-t border-white/15 pt-3">
                                  <div className="font-mono-tabular text-[11px] font-bold text-[#67E8F9]">
                                    SCORE 3 · DEVELOPING
                                  </div>
                                  <p className="mt-1 text-xs leading-relaxed text-slate-200">
                                    {criterion.level3}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center justify-between pt-2 text-xs font-semibold text-[#9CD2F3]">
                                <span>Click to flip back to Target 5</span>
                                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                              </div>
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Stack Controls */}
                <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4 text-white">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCycleStack(-1)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-bold hover:bg-white/20 whitespace-nowrap shrink-0"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      Prev Card
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCycleStack(1)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-bold hover:bg-white/20 whitespace-nowrap shrink-0"
                    >
                      Deal Next
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeckView('spread')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#DDEB6B] px-4 py-1.5 text-xs font-extrabold text-[#14163F] hover:bg-[#67E8F9] transition-colors whitespace-nowrap shrink-0"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                    Fan Out All 4 Cards
                  </button>
                </div>
              </div>
            </div>
          )}
        </LayoutGroup>
      </section>

      {/* Full Side-by-Side 1 / 3 / 5 Matrix Reference */}
      <section className="mt-8 overflow-hidden rounded-2xl border border-white/15 bg-[#121126]/90">
        <div className="hidden md:grid md:grid-cols-12 border-b border-white/10 bg-[#0B0A16] text-xs font-bold">
          <div className="col-span-3 px-6 py-3.5 text-[#E6EDF7]">Criterion (1–5)</div>
          <div className="col-span-3 border-l border-white/10 px-5 py-3.5 text-[#FF8F63]">
            Score 1 · Weak
          </div>
          <div className="col-span-3 border-l border-white/10 px-5 py-3.5 text-[#67E8F9]">
            Score 3 · Developing
          </div>
          <div className="col-span-3 border-l border-white/10 px-5 py-3.5 text-[#3DDBA6]">
            Score 5 · Strong
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {role.rubric.map((criterion) => {
            const style = CRITERION_STYLES[criterion.key];
            return (
              <div key={criterion.key} className="grid grid-cols-1 md:grid-cols-12">
                <div className="p-5 md:col-span-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: style.neonHex }}
                      aria-hidden="true"
                    />
                    <h3 className="font-display text-sm font-bold text-white">
                      {criterion.label}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                    {criterion.summary}
                  </p>
                </div>

                <div className="border-t border-white/10 p-5 md:col-span-3 md:border-t-0 md:border-l">
                  <div className="mb-1 font-mono-tabular text-xs font-bold text-[#FF8F63] md:hidden">
                    1 / 5 · Weak
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{criterion.level1}</p>
                </div>

                <div className="border-t border-white/10 p-5 md:col-span-3 md:border-t-0 md:border-l">
                  <div className="mb-1 font-mono-tabular text-xs font-bold text-[#67E8F9] md:hidden">
                    3 / 5 · Developing
                  </div>
                  <p className="text-sm leading-relaxed text-slate-200">{criterion.level3}</p>
                </div>

                <div className="border-t border-white/10 bg-white/[0.02] p-5 md:col-span-3 md:border-t-0 md:border-l">
                  <div className="mb-1 font-mono-tabular text-xs font-bold text-[#3DDBA6] md:hidden">
                    5 / 5 · Strong
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-white">
                    {criterion.level5}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5-Question Lineup */}
      <section className="mt-7 rounded-2xl border border-white/15 bg-[#121126]/90 p-6">
        <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-white">
              Session Question Lineup
            </h3>
            <p className="text-xs text-slate-400">
              5 mixed Behavioral and Technical prompts—answered one at a time.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartPractice}
            className="inline-flex items-center gap-2 self-start rounded-full bg-[#3DDBA6] px-5 py-2 text-xs font-extrabold text-[#0B0A16] hover:bg-[#67E8F9] transition-colors whitespace-nowrap shrink-0 sm:self-auto"
          >
            Begin Question 1
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {role.questions.map((q, idx) => {
            const isTech = q.category === 'Technical';
            return (
              <div
                key={q.id}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0B0A16]/80 p-4"
              >
                <div>
                  <div className="flex items-center justify-between font-mono-tabular text-xs">
                    <span className="font-bold text-white">Q{idx + 1}</span>
                    <span className={isTech ? 'text-[#63B0FF]' : 'text-[#3DDBA6]'}>
                      {q.category}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-300 line-clamp-4">
                    {q.prompt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
