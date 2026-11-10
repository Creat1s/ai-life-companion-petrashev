import React, { useState } from 'react';
import {
  PhoneCall,
  Car,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Clock,
} from 'lucide-react';

interface KazakhstanServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'emergency' | 'taxi';
  onExecuteTool: (tool: string, detail: string) => void;
}

export const KazakhstanServicesModal: React.FC<KazakhstanServicesModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'emergency',
  onExecuteTool,
}) => {
  if (!isOpen) return null;

  const [tab, setTab] = useState<'emergency' | 'taxi'>(defaultTab);
  const [taxiDestination, setTaxiDestination] = useState('');
  const [taxiProvider, setTaxiProvider] = useState<'yandex' | 'indrive'>('yandex');

  const emergencyNumbers = [
    {
      num: '112',
      title: 'Единая служба экстренной помощи Казахстана',
      desc: 'Спасение, МЧС, пожарные, скорая и полиция при любых ЧС (бесплатно, без SIM-карты)',
      color: 'bg-rose-600',
      badge: 'Круглосуточно · 112',
    },
    {
      num: '103',
      title: 'Скорая медицинская помощь (Жедел жәрдем)',
      desc: 'Неотложные медицинские бригады, консультации дежурного врача',
      color: 'bg-red-500',
      badge: 'Скорая помощь · 103',
    },
    {
      num: '102',
      title: 'Полиция (Полиция қызметі)',
      desc: 'Охрана правопорядка, вызов патруля, безопасность граждан',
      color: 'bg-blue-600',
      badge: 'Полиция · 102',
    },
    {
      num: '101',
      title: 'Противопожарная служба (Өрт сөндіру)',
      desc: 'Тушение возгораний, ликвидация пожаров и задымлений',
      color: 'bg-amber-600',
      badge: 'Пожарная охрана · 101',
    },
  ];

  const handleCall = (num: string, title: string) => {
    onExecuteTool('emergency.call', `Вызов службы: ${title} (${num})`);
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${num}`;
    }
  };

  const handleOrderTaxi = () => {
    const dest = taxiDestination.trim() || 'Центр города';
    onExecuteTool('taxi.openBooking', `Заказ такси в ${dest} через ${taxiProvider === 'yandex' ? 'Yandex Go' : 'inDrive'}`);
    
    // Deep link or Web dispatch
    const deepLink =
      taxiProvider === 'yandex'
        ? `https://taxi.yandex.kz/?start_lat=43.238&start_lon=76.889&end_lat=43.25&end_lon=76.95`
        : `https://indrive.com/ru/ride/`;
    
    window.open(deepLink, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Экстренные службы и Такси Казахстана"
    >
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Handle for mobile */}
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {tab === 'emergency' ? (
              <PhoneCall className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            ) : (
              <Car className="w-5 h-5 text-amber-500" />
            )}
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {tab === 'emergency' ? 'Экстренная помощь (Казахстан)' : 'Вызов такси (Казахстан)'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 pt-2 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('emergency')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              tab === 'emergency'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Экстренная служба 112</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('taxi')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              tab === 'taxi'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Такси (Yandex Go / inDrive)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {tab === 'emergency' ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50/60 dark:bg-rose-950/20 p-3 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>
                  Звонок на <strong>112</strong> в Республике Казахстан работает даже без баланса на счёте, при заблокированном телефоне и без активного интернета.
                </p>
              </div>

              {emergencyNumbers.map((emg) => (
                <div
                  key={emg.num}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      {emg.badge}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {emg.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {emg.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCall(emg.num, emg.title)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-transform active:scale-95 whitespace-nowrap shrink-0"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Набрать {emg.num}</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Куда поедем? (Адрес в Казахстане)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={taxiDestination}
                      onChange={(e) => setTaxiDestination(e.target.value)}
                      placeholder="Например: пр. Достык 50, Алматы или Астана"
                      className="w-full min-h-[42px] pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Сервис заказа поездки
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTaxiProvider('yandex')}
                      className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        taxiProvider === 'yandex'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>🚖 Yandex Go KZ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxiProvider('indrive')}
                      className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        taxiProvider === 'indrive'
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>🟢 inDrive KZ</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Правило безопасности <strong>ACT-02</strong>: ассистент рассчитывает маршрут и открывает официальное приложение, а точную стоимость и списание средств подтверждаете вы.
                </p>

                <button
                  type="button"
                  onClick={handleOrderTaxi}
                  className="w-full min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Car className="w-4 h-4" />
                  <span>Открыть {taxiProvider === 'yandex' ? 'Yandex Go' : 'inDrive'} и вызвать такси</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
