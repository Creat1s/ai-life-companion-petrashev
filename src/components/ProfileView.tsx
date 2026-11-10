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
  Gamepad2,
  Layers,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import {
  CompanionState,
  ConsentGrant,
  ConsentSourceId,
  DesignStyle,
  IntegrationCapability,
  Locale,
  MainTab,
  MemoryFact,
  OfflinePack,
  UIMode,
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
  onNavigate?: (tab: MainTab) => void;
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
  onNavigate,
}) => {
  const t = translations[settings.locale].profile;
  const isAdmin = settings.uiMode === 'admin';
  const style: DesignStyle = settings.designStyle || 'game';
  const isGame = style === 'game';

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
          ? `Insufficient storage (${freeDiskMb} MB free, requires ${pack.sizeMb} MB).`
          : `Недостаточно места (${freeDiskMb} МБ свободно, требуется ${pack.sizeMb} МБ).`
      );
      return;
    }
    setPackError(null);
    onDownloadPack(pack.packId);
  };

  const cardSurfaceClass = isGame
    ? 'rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 shadow-sm'
    : 'rounded-3xl bg-white/80 dark:bg-slate-900/65 backdrop-blur-xl border border-indigo-500/20 dark:border-cyan-400/20 shadow-[0_12px_36px_-12px_rgba(79,70,229,0.22)]';

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {t.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        {/* Style Switcher + Language + Theme + Help Link */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('help')}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold hover:bg-emerald-500/25 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Раздел Помощь</span>
            </button>
          )}

          {/* Game Design vs Web 3.0 Switcher */}
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => onUpdateSettings({ designStyle: 'game' })}
              className={`min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isGame
                  ? 'bg-[#58CC02] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Game</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ designStyle: 'web3' })}
              className={`min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                !isGame
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Web 3.0</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80">
            {(['ru', 'en', 'es'] as Locale[]).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => onUpdateSettings({ locale: loc })}
                className={`min-h-[34px] px-2.5 py-1 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
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
            className="min-h-[40px] inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
            <span>{settings.theme === 'dark' ? 'Светлая' : 'Тёмная'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Permissions & Mode Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Permissions / Consents */}
          <div className={`${cardSurfaceClass} p-5 sm:p-6 space-y-4`}>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {t.consentsTitle}
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {consents.map((c) => (
                <div key={c.sourceId} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {c.label[settings.locale]}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {c.description[settings.locale]}
                    </p>
                    {isAdmin && (
                      <p className="text-[11px] font-mono text-slate-400 mt-1">
                        {c.scope} · {c.allowed ? 'Active' : 'Revoked'}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={c.allowed}
                    onClick={() => onToggleConsent(c.sourceId)}
                    className={`min-h-[36px] min-w-[68px] px-3 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                      c.allowed
                        ? isGame
                          ? 'bg-[#58CC02] text-white border-b-2 border-[#46A302]'
                          : 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {c.allowed ? 'ВКЛ' : 'ВЫКЛ'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Device Performance & Creator Mode Switch */}
          <div className={`${cardSurfaceClass} p-5 sm:p-6 space-y-4`}>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {t.deviceQaTitle}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={settings.airplaneMode}
                onClick={() => onUpdateSettings({ airplaneMode: !settings.airplaneMode })}
                className={`min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-2xl border text-xs font-bold transition-colors cursor-pointer ${
                  settings.airplaneMode
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4" />
                  {t.airplaneMode}
                </span>
                <span>{settings.airplaneMode ? 'ВКЛ' : 'ВЫКЛ'}</span>
              </button>

              <button
                type="button"
                aria-pressed={settings.batterySaver}
                onClick={() => onUpdateSettings({ batterySaver: !settings.batterySaver })}
                className={`min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-2xl border text-xs font-bold transition-colors cursor-pointer ${
                  settings.batterySaver
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4" />
                  {t.batterySaver}
                </span>
                <span>{settings.batterySaver ? 'ВКЛ' : 'ВЫКЛ'}</span>
              </button>

              {isAdmin && (
                <>
                  <button
                    type="button"
                    aria-pressed={settings.lowMemoryMode}
                    onClick={() => onUpdateSettings({ lowMemoryMode: !settings.lowMemoryMode })}
                    className={`min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-2xl border text-xs font-bold transition-colors cursor-pointer ${
                      settings.lowMemoryMode
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      {t.lowMemory}
                    </span>
                    <span>{settings.lowMemoryMode ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onSimulate30Days}
                    className="min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarClock className="w-4 h-4" />
                      {t.simulate30Days}
                    </span>
                    <span className="font-mono tabular-nums">+{companion.daysAwaySimulated}d</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2.5">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={onExportData}
                    className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    {t.exportJson}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onResetAll}
                  className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t.resetAll}
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    uiMode: (isAdmin ? 'user' : 'admin') as UIMode,
                  })
                }
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>
                  {isAdmin
                    ? 'Переключить в Пользовательский режим'
                    : 'Режим Создателя (Админка)'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Memory + Offline Packs */}
        <div className="lg:col-span-6 space-y-6">
          {/* Personal Memory Hub */}
          <div className={`${cardSurfaceClass} p-5 sm:p-6 space-y-4`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {t.memoryTitle} ({memories.length})
              </h2>
              {memories.length > 0 && (
                <button
                  type="button"
                  onClick={onWipeMemory}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  {t.wipeMemory}
                </button>
              )}
            </div>

            <form onSubmit={handleAddFact} className="flex flex-wrap gap-2">
              <select
                value={factCategory}
                onChange={(e) => setFactCategory(e.target.value as MemoryFact['category'])}
                aria-label="Категория"
                className="min-h-[42px] px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-slate-100"
              >
                <option value="preferences">Предпочтения</option>
                <option value="schedule">Режим дня</option>
                <option value="context">Важное</option>
              </select>
              <input
                type="text"
                value={factText}
                onChange={(e) => setFactText(e.target.value)}
                placeholder={t.addFactPlaceholder}
                className="flex-1 min-w-[180px] min-h-[42px] px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className={`min-h-[42px] inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-white text-xs font-extrabold cursor-pointer ${
                  isGame
                    ? 'bg-[#58CC02] border-b-2 border-[#46A302]'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                {t.addFact}
              </button>
            </form>

            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {memories.map((m) => (
                <li key={m.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {m.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {m.category === 'preferences'
                        ? 'Предпочтения'
                        : m.category === 'schedule'
                          ? 'Расписание'
                          : 'Контекст'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteMemory(m.id)}
                    aria-label="Удалить заметку"
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
              {memories.length === 0 && (
                <li className="py-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                  Список пуст. Добавьте важные факты, чтобы помощник учитывал их в беседах.
                </li>
              )}
            </ul>
          </div>

          {/* Offline Voice & Language Packs */}
          <div className={`${cardSurfaceClass} p-5 sm:p-6 space-y-4`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {t.packsTitle}
              </h2>
              <span className="text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
                {t.freeDisk}: {freeDiskMb} МБ
              </span>
            </div>

            {packError && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{packError}</p>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {packs.map((pack) => (
                <div key={pack.packId} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {pack.name[settings.locale]}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Объём: {pack.sizeMb} МБ
                    </p>
                  </div>
                  {pack.status === 'installed' ? (
                    <button
                      type="button"
                      onClick={() => onDeletePack(pack.packId)}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0 cursor-pointer"
                    >
                      {t.deletePack}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={settings.airplaneMode}
                      onClick={() => handlePackDownload(pack)}
                      className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-bold shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t.download}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Admin-only Integration Capability Registry */}
          {isAdmin && (
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
