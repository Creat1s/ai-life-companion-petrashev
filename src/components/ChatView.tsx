import React, { useState } from 'react';
import {
  Send,
  Mic,
  Volume2,
  VolumeX,
  OctagonAlert,
  Play,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  ActionRecord,
  ApprovalRequest,
  ChatMessage,
  DesignStyle,
  UserSettings,
} from '../types/companion';
import { translations } from '../data/i18n';
import { TEST_COMMAND_PRESETS } from '../data/initialState';

interface ChatViewProps {
  messages: ChatMessage[];
  actions: ActionRecord[];
  approvals: ApprovalRequest[];
  settings: UserSettings;
  isStreaming: boolean;
  isListening: boolean;
  partialTranscript: string;
  onSendMessage: (text: string, source: 'text' | 'voice') => void;
  onCancelStream: () => void;
  onToggleVoice: () => void;
  onToggleMuteTts: () => void;
  onToggleKillSwitch: () => void;
  onApprove: (req: ApprovalRequest, simulateTimeout?: boolean) => void;
  onReject: (req: ApprovalRequest) => void;
  onReconcileUnknown: (actionId: string) => void;
  onGenerateDailyPlan?: () => void;
}

const USER_QUICK_PROMPTS = [
  'Составь мой план на сегодня',
  'Напомни позвонить маме в 19:00',
  'Какие у меня встречи по расписанию?',
  'Расскажи что-нибудь вдохновляющее',
  'Помоги придумать идею для Reels',
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  actions,
  approvals,
  settings,
  isStreaming,
  isListening,
  partialTranscript,
  onSendMessage,
  onCancelStream,
  onToggleVoice,
  onToggleMuteTts,
  onToggleKillSwitch,
  onApprove,
  onReject,
  onReconcileUnknown,
  onGenerateDailyPlan,
}) => {
  const t = translations[settings.locale].ai;
  const isAdmin = settings.uiMode === 'admin';
  const style: DesignStyle = settings.designStyle || 'game';
  const isGame = style === 'game';

  const [subTab, setSubTab] = useState<'chat' | 'approvals' | 'audit'>('chat');
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim(), 'text');
    setInput('');
  };

  const cardSurfaceClass = isGame
    ? 'rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 shadow-sm'
    : 'rounded-3xl bg-white/80 dark:bg-slate-900/65 backdrop-blur-xl border border-indigo-500/20 dark:border-cyan-400/20 shadow-[0_12px_36px_-12px_rgba(79,70,229,0.22)]';

  return (
    <div className="space-y-6 pb-8">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {t.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onGenerateDailyPlan && (
            <button
              type="button"
              onClick={onGenerateDailyPlan}
              className={`min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-white text-xs font-extrabold transition-all cursor-pointer ${
                isGame
                  ? 'bg-[#CE82FF] hover:bg-[#B865F0] border-b-4 border-[#9A42D1]'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Составить план дня</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMuteTts}
            aria-pressed={settings.ttsMuted}
            className="min-h-[40px] inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {settings.ttsMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#1CB0F6]" />
            )}
            <span>{settings.ttsMuted ? t.unmuteTts : t.muteTts}</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={onToggleKillSwitch}
              aria-pressed={settings.killSwitchActive}
              className={`min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-colors ${
                settings.killSwitchActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {settings.killSwitchActive ? (
                <>
                  <Play className="w-4 h-4" />
                  <span>{t.resumeAgent}</span>
                </>
              ) : (
                <>
                  <OctagonAlert className="w-4 h-4" />
                  <span>{t.stopAgent}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSubTab('chat')}
          className={`min-h-[40px] px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'chat'
              ? isGame
                ? 'bg-[#1CB0F6] text-white border-b-4 border-[#0088CC]'
                : 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
        >
          {t.chatTab} ({messages.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('approvals')}
          className={`min-h-[40px] px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'approvals'
              ? isGame
                ? 'bg-[#1CB0F6] text-white border-b-4 border-[#0088CC]'
                : 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
        >
          {t.approvalsTab} ({approvals.length})
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setSubTab('audit')}
            className={`min-h-[40px] px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              subTab === 'audit'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            {t.auditTab} ({actions.length})
          </button>
        )}
      </div>

      {/* Sub-Tab 1: Chat */}
      {subTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chat Transcript & Input */}
          <div
            className={`${
              isAdmin ? 'lg:col-span-8' : 'lg:col-span-12'
            } ${cardSurfaceClass} flex flex-col h-[560px]`}
          >
            {/* Friendly Quick Suggestion Chips in User Mode */}
            {!isAdmin && (
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto">
                {USER_QUICK_PROMPTS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => onSendMessage(chip, 'text')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            <div
              className="flex-1 overflow-y-auto p-5 space-y-4"
              aria-live="polite"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? isGame
                          ? 'bg-[#1CB0F6] text-white font-semibold'
                          : 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-medium'
                        : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isAdmin && m.route && (
                      <>
                        <span>·</span>
                        <span className="font-mono">{m.route}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {isListening && (
                <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 px-4 py-3 text-xs text-slate-700 dark:text-slate-200">
                  <span className="font-bold">{t.partialTranscript}: </span>
                  <span className="italic">{partialTranscript || '...'}</span>
                </div>
              )}
            </div>

            {/* Stream Cancel Banner */}
            {isStreaming && (
              <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Помощник печатает ответ...
                </span>
                <button
                  type="button"
                  onClick={onCancelStream}
                  className="min-h-[36px] px-3 py-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t.cancelStream}
                </button>
              </div>
            )}

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите сообщение или вопрос..."
                className="flex-1 min-h-[46px] px-4 py-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1CB0F6]"
              />
              <button
                type="submit"
                aria-label={translations[settings.locale].home.send}
                className={`min-h-[46px] px-5 py-2 rounded-2xl text-white text-sm font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isGame
                    ? 'bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#46A302] active:border-b-0 active:translate-y-0.5'
                    : 'bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-md'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onToggleVoice}
                aria-pressed={isListening}
                aria-label="Голосовой ввод"
                className={`min-h-[46px] px-4 py-2 rounded-2xl text-sm font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : isGame
                      ? 'bg-[#1CB0F6] text-white border-b-4 border-[#0088CC]'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Admin-only Test Suite Presets (TC-01 — TC-15) */}
          {isAdmin && (
            <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t.testCommandsTitle}
              </h2>
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {TEST_COMMAND_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      onSendMessage(preset.prompt[settings.locale], 'text')
                    }
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {preset.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {preset.prompt[settings.locale]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Approval Center */}
      {subTab === 'approvals' && (
        <div className="space-y-4">
          {approvals.length === 0 ? (
            <div className={`${cardSurfaceClass} p-8 text-center text-sm text-slate-500 dark:text-slate-400`}>
              {t.noApprovals}
            </div>
          ) : (
            approvals.map((req) => (
              <div
                key={req.approvalId}
                className={`${cardSurfaceClass} p-5 flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {req.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Получатель: {req.destination}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {req.payloadPreview}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onApprove(req, false)}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#58CC02] hover:bg-[#46A302] text-white text-xs font-extrabold cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t.approve}
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(req)}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    {t.reject}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub-Tab 3: Admin Action Audit */}
      {isAdmin && subTab === 'audit' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-950/60">
                  <th className="py-3 px-4 font-medium">Action ID</th>
                  <th className="py-3 px-4 font-medium">Tool</th>
                  <th className="py-3 px-4 font-medium">State</th>
                  <th className="py-3 px-4 font-medium">Summary</th>
                  <th className="py-3 px-4 font-medium text-right">Reconcile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {actions.map((a) => (
                  <tr key={a.actionId}>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {a.actionId}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-900 dark:text-slate-100">
                      {a.tool}
                    </td>
                    <td className="py-3 px-4 font-mono">{a.state}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {a.summary}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {a.state === 'UNKNOWN' && (
                        <button
                          type="button"
                          onClick={() => onReconcileUnknown(a.actionId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 text-white text-xs font-medium"
                        >
                          <RefreshCw className="w-3 h-3" />
                          {t.reconcileUnknown}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
