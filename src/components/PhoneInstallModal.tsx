import React, { useState } from 'react';
import { Smartphone, QrCode, X, Check, Copy, ExternalLink } from 'lucide-react';

interface PhoneInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const PhoneInstallModal: React.FC<PhoneInstallModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Google Chart API / QR Server fallback for instant high-contrast QR code rendering
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    appUrl
  )}&margin=8`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Установка на телефон"
    >
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3" />

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Скачать на телефон
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 text-center">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
              <img
                src={qrImageUrl}
                alt="QR-код для открытия на телефоне"
                width={180}
                height={180}
                className="w-44 h-44 object-contain rounded-lg"
              />
            </div>
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
              Наведите камеру смартфона для мгновенного перехода
            </p>
          </div>

          {/* Direct Link Copy */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Прямая ссылка для браузера
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-700 dark:text-slate-300 truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium inline-flex items-center gap-1.5 transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопировано' : 'Копировать'}</span>
              </button>
            </div>
          </div>

          {/* Step-by-step instructions */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 text-xs space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                🤖 Установка на Android (Chrome)
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                1. Откройте ссылку в Chrome. <br />
                2. Нажмите меню <strong>⋮ (три точки)</strong> в правом верхнем углу. <br />
                3. Выберите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 text-xs space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                🍎 Установка на iPhone (Safari)
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                1. Откройте ссылку в браузере Safari. <br />
                2. Нажмите иконку <strong>«Поделиться»</strong> (квадрат со стрелкой вверх). <br />
                3. Прокрутите вниз и выберите <strong>«На экран „Домой“»</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
