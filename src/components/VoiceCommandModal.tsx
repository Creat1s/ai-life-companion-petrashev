import React from 'react';
import {
  Mic,
  MicOff,
  Car,
  PhoneCall,
  Sparkles,
  MessageCircle,
  Share2,
  HeartPulse,
  X,
} from 'lucide-react';

interface VoiceCommandModalProps {
  isOpen: boolean;
  isListening: boolean;
  transcript: string;
  onClose: () => void;
  onExecuteVoiceCommand: (text: string) => void;
}

export const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({
  isOpen,
  isListening,
  transcript,
  onClose,
  onExecuteVoiceCommand,
}) => {
  if (!isOpen) return null;

  const quickVoicePrompts = [
    {
      icon: <PhoneCall className="w-4 h-4 text-emerald-500" />,
      text: 'Позвони Маме',
      desc: 'Голосовой вызов из книги контактов',
      color: 'hover:border-emerald-500 hover:bg-emerald-500/10',
    },
    {
      icon: <PhoneCall className="w-4 h-4 text-blue-500" />,
      text: 'Симулируй входящий звонок от Андрея',
      desc: 'Приём звонка голосовым согласием («Принять» / «Отклонить»)',
      color: 'hover:border-blue-500 hover:bg-blue-500/10',
    },
    {
      icon: <MessageCircle className="w-4 h-4 text-purple-500" />,
      text: 'Ответь на сообщения в мессенджерах',
      desc: 'ИИ готовит ответ ➔ подтверждение или диктовка',
      color: 'hover:border-purple-500 hover:bg-purple-500/10',
    },
    {
      icon: <Share2 className="w-4 h-4 text-pink-500" />,
      text: 'Напиши пост для Instagram Reels и подбери видео',
      desc: 'Генерация поста/сторис/рилс с подтверждением публикации',
      color: 'hover:border-pink-500 hover:bg-pink-500/10',
    },
    {
      icon: <HeartPulse className="w-4 h-4 text-teal-500" />,
      text: 'Я сегодня устал, подбодри меня',
      desc: 'Мониторинг здоровья и психологическая поддержка',
      color: 'hover:border-teal-500 hover:bg-teal-500/10',
    },
    {
      icon: <Car className="w-4 h-4 text-amber-500" />,
      text: 'Вызови такси',
      desc: 'Yandex Go / inDrive KZ + экстренная служба 112',
      color: 'hover:border-amber-500 hover:bg-amber-500/10',
    },
    {
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      text: 'Спланируй мой день и дай персональный совет',
      desc: 'Gemini 4 Argon · Анализ контекста жизни',
      color: 'hover:border-indigo-500 hover:bg-indigo-500/10',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Голосовое управление"
    >
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mic className="w-4 h-4 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Голосовая команда · Gemini 4 Argon + Офлайн
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listening wave & transcript visualizer */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center">
          <div className="relative mb-3">
            <div className="w-14 h-14 rounded-full bg-rose-600/20 dark:bg-rose-500/20 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-rose-600 dark:bg-rose-500 flex items-center justify-center shadow-lg text-white">
                <Mic className="w-5 h-5" />
              </div>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {isListening ? 'Слушаю вашу голосовую команду...' : 'Обработка голоса'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[18px] px-2 italic font-mono">
            {transcript || '«Позвони Маме», «Принять звонок», «Ответь в мессенджере», «Создай Reels»...'}
          </p>
        </div>

        {/* Quick Voice Command Shortcuts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Или нажмите готовую голосовую команду:</span>
            <span className="font-mono text-[10px]">1-tap voice intent</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {quickVoicePrompts.map((cmd) => (
              <button
                key={cmd.text}
                type="button"
                onClick={() => {
                  onExecuteVoiceCommand(cmd.text);
                  onClose();
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left transition-all cursor-pointer ${cmd.color}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                    {cmd.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {cmd.text}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {cmd.desc}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 shrink-0 ml-2">
                  Сказать ➔
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stop listening footer */}
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[42px] flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <MicOff className="w-4 h-4 text-slate-400" />
          <span>Остановить прослушивание</span>
        </button>
      </div>
    </div>
  );
};
