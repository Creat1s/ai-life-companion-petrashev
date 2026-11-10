import React, { useState } from 'react';
import { Lock, LayoutGrid, Clock } from 'lucide-react';
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
  onChangeWidgetType: (type: UserSettings['widgetType']) => void;
  onNavigate: (tab: MainTab) => void;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
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
  const [range, setRange] = useState<'today' | '7d' | '30d'>('7d');

  const getValue = (cat: ActivitySummary['categories'][number]) =>
    range === 'today' ? cat.minutesToday : range === '7d' ? cat.minutes7d : cat.minutes30d;

  const totalMinutes = activity.categories.reduce((acc, c) => acc + getValue(c), 0);

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

        {/* Period Filter Segmented Control */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80">
          {(['today', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                range === r
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {r === 'today' ? t.today : r === '7d' ? t.days7 : t.days30}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Screen Time Card (INS-01) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          {!usageAllowed ? (
            <div className="py-10 text-center space-y-3">
              <Lock className="w-8 h-8 text-slate-400 mx-auto" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t.noAccessTitle}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {t.noAccessBody}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium"
              >
                {translations[settings.locale].home.grantInProfile}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {formatDuration(totalMinutes)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {activity.comparison7dPercent}% vs previous window
                  </p>
                </div>

                {/* INS-01 Source & Trust Unboxed Metadata */}
                <div className="text-xs text-slate-500 dark:text-slate-400 text-right space-y-0.5">
                  <div>
                    {t.sourceLabel}: <span className="font-mono">{activity.sourceId}</span> ·{' '}
                    {t.coverageLabel}: <span className="tabular-nums">{activity.coveragePercent}%</span>
                  </div>
                  <div>
                    {t.updatedLabel}:{' '}
                    <span className="tabular-nums">
                      {new Date(activity.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Bars */}
              <div className="space-y-4">
                {activity.categories.map((cat) => {
                  const val = getValue(cat);
                  const pct = totalMinutes > 0 ? Math.round((val / totalMinutes) * 100) : 0;
                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {cat.label[settings.locale]}
                        </span>
                        <span className="font-mono tabular-nums text-xs text-slate-600 dark:text-slate-400">
                          {formatDuration(val)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                {t.observationNote}
              </p>
            </div>
          )}
        </div>

        {/* Android Home Widget Configurator (§11 & §13) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t.widgetTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.widgetSubtitle}
              </p>
            </div>
            <LayoutGrid className="w-5 h-5 text-slate-400 shrink-0" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ['quick_action', t.widgetQuick],
                ['companion_status', t.widgetCompanion],
                ['tasks_summary', t.widgetTasks],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onChangeWidgetType(key)}
                className={`min-h-[40px] px-2.5 py-2 rounded-xl border text-xs font-medium transition-colors truncate ${
                  settings.widgetType === key
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Live Android Launcher Widget Preview */}
          <div className="rounded-2xl bg-slate-900 dark:bg-slate-950 text-white p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Android Home Widget 4x2</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Event-driven
              </span>
            </div>

            {settings.widgetType === 'quick_action' && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <p className="text-sm font-semibold">Voice & Reminder</p>
                  <p className="text-xs text-slate-400">Push-to-Talk · No background mic</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-xs font-medium text-white whitespace-nowrap shrink-0"
                >
                  Open
                </button>
              </div>
            )}

            {settings.widgetType === 'companion_status' && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <p className="text-sm font-semibold">
                    {companion.avatarId.toUpperCase()} · Lvl {companion.level}
                  </p>
                  <p className="text-xs text-slate-400 tabular-nums">
                    Energy {companion.energy}% · Bond {companion.bond}% · Offline ready
                  </p>
                </div>
                <span className="font-mono text-xs text-teal-400 tabular-nums">
                  {companion.xp} XP
                </span>
              </div>
            )}

            {settings.widgetType === 'tasks_summary' && (
              <div className="space-y-1.5 pt-1">
                <p className="text-sm font-semibold tabular-nums">
                  {reminders.filter((r) => !r.completed).length} active reminders
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {reminders[0]?.title || 'No reminders scheduled'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
