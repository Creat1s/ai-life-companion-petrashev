import React, { useState } from 'react';
import {
  ActivitySummary,
  CompanionState,
  MainTab,
  ReminderItem,
  UserSettings,
} from '../types/companion';
import { translations } from '../data/i18n';

interface InsightsViewProps {
  activity: ActivitySummary;
  usageAllowed: boolean;
  settings: UserSettings;
  companion: CompanionState;
  reminders: ReminderItem[];
  onChangeWidgetType: (w: UserSettings['widgetType']) => void;
  onNavigate: (tab: MainTab) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  activity,
  usageAllowed,
  settings,
  companion,
  reminders,
  onChangeWidgetType,
  onNavigate,
}) => {
  const t = translations[settings.locale].insights;
  const moodLabels = translations[settings.locale].moods;
  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('today');

  const getMinutes = (cat: ActivitySummary['categories'][number]) => {
    if (period === 'today') return cat.minutesToday;
    if (period === '7d') return cat.minutes7d;
    return cat.minutes30d;
  };

  const totalMinutes = activity.categories.reduce(
    (sum, cat) => sum + getMinutes(cat),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        {/* Period Switcher */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80">
          {(['today', '7d', '30d'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {p === 'today' ? t.today : p === '7d' ? t.days7 : t.days30}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          {!usageAllowed ? (
            <div className="py-10 text-center space-y-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t.noAccessTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                {t.noAccessBody}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium"
              >
                {translations[settings.locale].home.grantInProfile}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Всего времени
                  </span>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-x-3 tabular-nums">
                  <span>
                    {t.coverageLabel}: {activity.coveragePercent}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {activity.categories.map((cat) => {
                  const mins = getMinutes(cat);
                  const pct =
                    totalMinutes > 0
                      ? Math.round((mins / totalMinutes) * 100)
                      : 0;
                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {cat.label[settings.locale]}
                        </span>
                        <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
                          {mins} min ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                {t.observationNote}
              </p>
            </div>
          )}
        </div>

        {/* Right: Quick Access Card Configurator (Removed Android Home Widget 4x2 & Event-driven) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.widgetTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.widgetSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'quick_action', label: t.widgetQuick },
                { id: 'companion_status', label: t.widgetCompanion },
                { id: 'tasks_summary', label: t.widgetTasks },
              ] as const
            ).map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => onChangeWidgetType(w.id)}
                className={`min-h-[40px] px-2.5 py-2 rounded-xl border text-xs font-medium transition-colors ${
                  settings.widgetType === w.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-5 space-y-3">
            {settings.widgetType === 'quick_action' && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Люми · Быстрая команда
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('home')}
                    className="flex-1 min-h-[40px] rounded-xl bg-blue-600 text-white text-xs font-medium"
                  >
                    + Напоминание
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('ai')}
                    className="flex-1 min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    Диалог
                  </button>
                </div>
              </div>
            )}

            {settings.widgetType === 'companion_status' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Нова · Уровень {companion.level}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {moodLabels[companion.mood]} · Энергия {companion.energy}%
                  </p>
                </div>
                <span className="text-xs font-mono tabular-nums text-blue-600 dark:text-blue-400">
                  {companion.xp} XP
                </span>
              </div>
            )}

            {settings.widgetType === 'tasks_summary' && (
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {translations[settings.locale].home.remindersTitle} (
                  {reminders.filter((r) => !r.completed).length})
                </p>
                {reminders.slice(0, 2).map((r) => (
                  <p
                    key={r.id}
                    className="text-xs text-slate-600 dark:text-slate-300 truncate"
                  >
                    • {r.title}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
