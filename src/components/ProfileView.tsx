import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Download,
  WifiOff,
  BatteryCharging,
  Cpu,
  Sun,
  Moon,
  RotateCcw,
  CalendarClock,
  FileDown,
} from 'lucide-react';
import {
  CompanionState,
  ConsentGrant,
  ConsentSourceId,
  IntegrationCapability,
  Locale,
  MemoryFact,
  OfflinePack,
  UserSettings,
} from '../types/companion';
import { translations } from '../data/i18n';

interface ProfileViewProps {
  settings: UserSettings;
  companion: CompanionState;
  memories: MemoryFact[];
  consents: ConsentGrant[];
  integrations: IntegrationCapability[];
  packs: OfflinePack[];
  freeDiskMb: number;
  onUpdateSettings: (patch: Partial<UserSettings>) => void;
  onAddMemory: (value: string, category: MemoryFact['category']) => void;
  onDeleteMemory: (id: string) => void;
  onWipeMemory: () => void;
  onToggleConsent: (sourceId: ConsentSourceId) => void;
  onDownloadPack: (packId: string) => void;
  onDeletePack: (packId: string) => void;
  onSimulate30Days: () => void;
  onExportData: () => void;
  onResetAll: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  settings,
  companion,
  memories,
  consents,
  integrations,
  packs,
  freeDiskMb,
  onUpdateSettings,
  onAddMemory,
  onDeleteMemory,
  onWipeMemory,
  onToggleConsent,
  onDownloadPack,
  onDeletePack,
  onSimulate30Days,
  onExportData,
  onResetAll,
}) => {
  const t = translations[settings.locale].profile;
  const [factText, setFactText] = useState('');
  const [factCategory, setFactCategory] = useState<MemoryFact['category']>('preferences');
  const [packError, setPackError] = useState<string | null>(null);

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factText.trim()) return;
    onAddMemory(factText.trim(), factCategory);
    setFactText('');
  };

  const handlePackDownload = (pack: OfflinePack) => {
    if (freeDiskMb < pack.sizeMb) {
      setPackError(
        settings.locale === 'en'
          ? `Insufficient storage (${freeDiskMb} MB free, requires ${pack.sizeMb} MB). Delete an existing pack first.`
          : `Недостаточно места (${freeDiskMb} МБ свободно, требуется ${pack.sizeMb} МБ). Удалите другой пакет.`
      );
      return;
    }
    setPackError(null);
    onDownloadPack(pack.packId);
  };

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

        {/* Language (RU/EN/ES) & Theme Switch */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80">
            {(['ru', 'en', 'es'] as Locale[]).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => onUpdateSettings({ locale: loc })}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-colors ${
                  settings.locale === loc
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
            }
            aria-label={t.theme}
            className="min-h-[40px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
            <span>{settings.theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Granular Consents + Device QA Simulator */}
        <div className="lg:col-span-6 space-y-6">
          {/* ConsentStore */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.consentsTitle}
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {consents.map((c) => (
                <div key={c.sourceId} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {c.label[settings.locale]}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {c.description[settings.locale]}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      {c.scope} · {c.allowed ? 'Active' : 'Revoked'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={c.allowed}
                    onClick={() => onToggleConsent(c.sourceId)}
                    className={`min-h-[36px] min-w-[64px] px-3 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                      c.allowed
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {c.allowed ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Simulator & QA Controls (DEV-01, OFF-01, UC-09, PRD-05) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.deviceQaTitle}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={settings.airplaneMode}
                onClick={() => onUpdateSettings({ airplaneMode: !settings.airplaneMode })}
                className={`min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                  settings.airplaneMode
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4" />
                  {t.airplaneMode}
                </span>
                <span className="font-mono">{settings.airplaneMode ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                aria-pressed={settings.batterySaver}
                onClick={() => onUpdateSettings({ batterySaver: !settings.batterySaver })}
                className={`min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                  settings.batterySaver
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4" />
                  {t.batterySaver}
                </span>
                <span className="font-mono">{settings.batterySaver ? '30fps' : '60fps'}</span>
              </button>

              <button
                type="button"
                aria-pressed={settings.lowMemoryMode}
                onClick={() => onUpdateSettings({ lowMemoryMode: !settings.lowMemoryMode })}
                className={`min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                  settings.lowMemoryMode
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  {t.lowMemory}
                </span>
                <span className="font-mono">{settings.lowMemoryMode ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={onSimulate30Days}
                className="min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <span className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" />
                  {t.simulate30Days}
                </span>
                <span className="font-mono tabular-nums">+{companion.daysAwaySimulated}d</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onExportData}
                className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <FileDown className="w-4 h-4" />
                {t.exportJson}
              </button>
              <button
                type="button"
                onClick={onResetAll}
                className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <RotateCcw className="w-4 h-4" />
                {t.resetAll}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Memory + Offline Packs + Integrations Registry */}
        <div className="lg:col-span-6 space-y-6">
          {/* Personal Memory Hub (DATA-03, UC-10) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t.memoryTitle} ({memories.length})
              </h2>
              {memories.length > 0 && (
                <button
                  type="button"
                  onClick={onWipeMemory}
                  className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
                >
                  {t.wipeMemory}
                </button>
              )}
            </div>

            <form onSubmit={handleAddFact} className="flex flex-wrap gap-2">
              <select
                value={factCategory}
                onChange={(e) => setFactCategory(e.target.value as MemoryFact['category'])}
                aria-label="Category"
                className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="preferences">preferences</option>
                <option value="schedule">schedule</option>
                <option value="context">context</option>
              </select>
              <input
                type="text"
                value={factText}
                onChange={(e) => setFactText(e.target.value)}
                placeholder={t.addFactPlaceholder}
                className="flex-1 min-w-[180px] min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.addFact}
              </button>
            </form>

            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {memories.map((m) => (
                <li key={m.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 dark:text-slate-100">{m.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {m.category} · {m.source} · {Math.round(m.confidence * 100)}%
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteMemory(m.id)}
                    aria-label="Delete memory"
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
              {memories.length === 0 && (
                <li className="py-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                  Memory store is empty.
                </li>
              )}
            </ul>
          </div>

          {/* Offline Packs & Storage (OFF-03, UC-08) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t.packsTitle}
              </h2>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {t.freeDisk}: {freeDiskMb} MB
              </span>
            </div>

            {packError && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{packError}</p>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {packs.map((pack) => (
                <div key={pack.packId} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {pack.name[settings.locale]}
                    </p>
                    <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {pack.sizeMb} MB · min {pack.requiredRamGb} GB RAM · {pack.checksum}
                    </p>
                  </div>
                  {pack.status === 'installed' ? (
                    <button
                      type="button"
                      onClick={() => onDeletePack(pack.packId)}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0"
                    >
                      {t.deletePack}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={settings.airplaneMode}
                      onClick={() => handlePackDownload(pack)}
                      className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-medium shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t.download}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Integration Capability Registry (§14, PRD-04) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.integrationsTitle}
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {integrations.map((intg) => (
                <div key={intg.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {intg.name}
                    </span>
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {intg.releaseTier} · {intg.status} · {intg.rateLimit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {intg.capabilities[settings.locale]}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {intg.limitations[settings.locale]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
