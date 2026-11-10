import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import { Locale } from '../types/companion';
import { translations } from '../data/i18n';

interface MiniGameProps {
  locale: Locale;
  highScore: number;
  batterySaver: boolean;
  onComplete: (score: number) => void;
}

interface TargetOrb {
  id: number;
  x: number; // % 10..90
  y: number; // % 12..85
  kind: 'focus' | 'noise';
  ttlMs: number;
}

const DURATION_SEC = 45;

export const MiniGame: React.FC<MiniGameProps> = ({
  locale,
  highScore,
  batterySaver,
  onComplete,
}) => {
  const t = translations[locale].world;
  const [phase, setPhase] = useState<'intro' | 'active' | 'paused' | 'done'>('intro');
  const [timeLeft, setTimeLeft] = useState(DURATION_SEC);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [orbs, setOrbs] = useState<TargetOrb[]>([]);
  const nextId = useRef(1);
  const scoreRef = useRef(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (phase !== 'active') return;

    const tickMs = batterySaver ? 250 : 125;
    const timer = window.setInterval(() => {
      setOrbs((prev) => {
        const aged = prev
          .map((o) => ({ ...o, ttlMs: o.ttlMs - tickMs }))
          .filter((o) => o.ttlMs > 0);

        if (aged.length < 4 && Math.random() < 0.55) {
          aged.push({
            id: nextId.current++,
            x: 12 + Math.floor(Math.random() * 76),
            y: 14 + Math.floor(Math.random() * 70),
            kind: Math.random() < 0.78 ? 'focus' : 'noise',
            ttlMs: 2200,
          });
        }
        return aged;
      });
    }, tickMs);

    return () => window.clearInterval(timer);
  }, [phase, batterySaver]);

  useEffect(() => {
    if (phase !== 'active') return;
    const secTimer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(secTimer);
          setPhase('done');
          onComplete(scoreRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(secTimer);
  }, [phase, onComplete]);

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setTimeLeft(DURATION_SEC);
    setOrbs([]);
    setPhase('active');
  };

  const handleTapOrb = (orb: TargetOrb) => {
    if (phase !== 'active') return;
    setOrbs((prev) => prev.filter((o) => o.id !== orb.id));
    if (orb.kind === 'focus') {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setScore((s) => s + 1 + (nextCombo >= 4 ? 1 : 0));
    } else {
      setCombo(0);
      setScore((s) => Math.max(0, s - 2));
    }
  };

  const earnedXp = Math.min(35, Math.max(10, Math.round(score * 1.5)));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.miniGameTitle}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.miniGameDesc}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm tabular-nums">
          <div>
            <span className="text-slate-500 dark:text-slate-400">{t.score}: </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{score}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
          <div>
            <span className="text-slate-500 dark:text-slate-400">{t.timeLeft}: </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{timeLeft}s</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Interactive Play Arena */}
      <div className="relative h-64 sm:h-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden select-none">
        {phase === 'intro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mb-4">
              {locale === 'en'
                ? 'Tap blue Focus orbs (+1 pt, combo bonus at 4x). Avoid dark Noise tokens (-2 pts). Works 100% offline.'
                : 'Нажимайте на синие сферы фокуса (+1 очко, комбо от 4x). Избегайте тёмных помех (-2 очка). Работает полностью офлайн.'}
            </p>
            <button
              type="button"
              onClick={startGame}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4" />
              {t.startGame}
            </button>
          </div>
        )}

        {phase === 'active' && (
          <>
            {orbs.map((orb) => (
              <button
                key={orb.id}
                type="button"
                onClick={() => handleTapOrb(orb)}
                style={{ left: `${orb.x}%`, top: `${orb.y}%`, transform: 'translate(-50%, -50%)' }}
                aria-label={orb.kind === 'focus' ? 'Focus orb' : 'Noise token'}
                className={`absolute w-12 h-12 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-transform active:scale-90 ${
                  orb.kind === 'focus'
                    ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-600/20'
                    : 'bg-slate-800 dark:bg-slate-700 text-slate-200 border border-slate-600'
                }`}
              >
                {orb.kind === 'focus' ? '+1' : '-2'}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPhase('paused')}
              className="absolute bottom-3 right-3 min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              <Pause className="w-3.5 h-3.5" />
              {t.pauseGame}
            </button>
          </>
        )}

        {phase === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {t.pauseGame}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPhase('active')}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium"
              >
                <Play className="w-4 h-4" />
                {t.resumeGame}
              </button>
              <button
                type="button"
                onClick={startGame}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                <RotateCcw className="w-4 h-4" />
                {t.startGame}
              </button>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {t.score}: {score} · +{earnedXp} XP
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              {locale === 'en'
                ? 'Saved to local state offline.'
                : 'Результат сохранён в локальном состоянии без сети.'}
            </p>
            <button
              type="button"
              onClick={startGame}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t.startGame}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
