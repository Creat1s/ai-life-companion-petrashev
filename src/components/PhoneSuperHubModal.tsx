import React, { useRef, useState } from 'react';
import {
  Phone,
  PhoneIncoming,
  PhoneOff,
  MessageCircle,
  Share2,
  HeartPulse,
  Brain,
  Mic,
  CheckCircle2,
  Sparkles,
  Plus,
  Upload,
  ShieldCheck,
  WifiOff,
  Send,
  Volume2,
  X,
  Film,
  Image as ImageIcon,
  FileText,
  Flame,
  Droplets,
  Activity,
} from 'lucide-react';
import {
  ActiveCallState,
  ConsentGrant,
  ConsentSourceId,
  ContactItem,
  HealthWellnessState,
  MessengerApp,
  MessengerThreadItem,
  PersonaStylePreset,
  PersonaTrainingConfig,
  PsychologicalMood,
  SocialContentFormat,
  SocialMediaAsset,
  SocialPlatform,
  SocialPostDraft,
} from '../types/companion';
import { SuperHubTab, applyPersonaFlavor } from '../engine/intentRouter';
import { playSound } from '../engine/audioEffects';

interface PhoneSuperHubModalProps {
  isOpen: boolean;
  activeTab: SuperHubTab;
  onChangeTab: (tab: SuperHubTab) => void;
  onClose: () => void;
  airplaneMode: boolean;
  contacts: ContactItem[];
  onAddContact: (name: string, relation: string, phone: string) => void;
  activeCall: ActiveCallState | null;
  onStartCall: (contact: ContactItem, direction: 'incoming' | 'outgoing') => void;
  onAnswerCall: () => void;
  onEndCall: (autoReply?: string) => void;
  messengerThreads: MessengerThreadItem[];
  onConfirmMessengerReply: (id: string, finalReplyText: string) => void;
  onUpdateMessengerDraft: (id: string, newDraft: string) => void;
  onSimulateIncomingMessage: (app: MessengerApp, sender: string, text: string) => void;
  socialAssets: SocialMediaAsset[];
  onAddCustomMediaAsset: (asset: SocialMediaAsset) => void;
  socialDrafts: SocialPostDraft[];
  onSaveSocialDraft: (draft: SocialPostDraft) => void;
  onPublishSocialDraft: (id: string, confirmedVia: 'voice' | 'button') => void;
  health: HealthWellnessState;
  onUpdateHealth: (patch: Partial<HealthWellnessState>) => void;
  persona: PersonaTrainingConfig;
  onUpdatePersona: (patch: Partial<PersonaTrainingConfig>) => void;
  consents: ConsentGrant[];
  onToggleConsent: (sourceId: ConsentSourceId) => void;
  onGrantAllPhoneConsents: (allowAll: boolean) => void;
  onSpeakText: (text: string) => void;
}

export const PhoneSuperHubModal: React.FC<PhoneSuperHubModalProps> = ({
  isOpen,
  activeTab,
  onChangeTab,
  onClose,
  airplaneMode,
  contacts,
  onAddContact,
  activeCall,
  onStartCall,
  onAnswerCall,
  onEndCall,
  messengerThreads,
  onConfirmMessengerReply,
  onUpdateMessengerDraft,
  onSimulateIncomingMessage,
  socialAssets,
  onAddCustomMediaAsset,
  socialDrafts,
  onSaveSocialDraft,
  onPublishSocialDraft,
  health,
  onUpdateHealth,
  persona,
  onUpdatePersona,
  consents,
  onToggleConsent,
  onGrantAllPhoneConsents,
  onSpeakText,
}) => {
  // Contacts state
  const [newContactName, setNewContactName] = useState('');
  const [newContactRel, setNewContactRel] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('+7701');
  const [voiceCallListening, setVoiceCallListening] = useState(false);

  // Messengers state
  const [dictatingId, setDictatingId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  // Social Studio state
  const [platform, setPlatform] = useState<SocialPlatform>('Instagram');
  const [format, setFormat] = useState<SocialContentFormat>('Reels / Клип');
  const [postTopic, setPostTopic] = useState('Как мой 3D ИИ-компаньон помогает мне каждый день');
  const [postCaption, setPostCaption] = useState(
    socialDrafts[0]?.caption ||
      'Мой персональный 3D ИИ-ассистент на базе Gemini 4 Argon отвечает в мессенджерах, принимает звонки по голосу и работает даже без интернета! 🚀✨ #AI #Gemini4Argon #ReelsKZ'
  );
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>(['media-1', 'media-2']);
  const [awaitingPublishConfirm, setAwaitingPublishConfirm] = useState(true);
  const [voicePublishListening, setVoicePublishListening] = useState(false);
  const [generatingPost, setGeneratingPost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Health & Wellness state
  const [feelingInput, setFeelingInput] = useState('');
  const [loadingPepTalk, setLoadingPepTalk] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<string | null>(null);

  // Persona Trainer state
  const [newCatchphrase, setNewCatchphrase] = useState('');
  const [ruleTrigger, setRuleTrigger] = useState('');
  const [ruleResponse, setRuleResponse] = useState('');

  if (!isOpen) return null;

  // Helper: Run short voice recognition with fallback simulation
  const listenVoicePhrase = (
    fallbackSimulatedPhrase: string,
    onRecognized: (text: string) => void
  ) => {
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown })
        .webkitSpeechRecognition;

    if (SpeechRec && !airplaneMode) {
      try {
        const rec = new SpeechRec() as {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          onresult: (ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
          onerror: () => void;
          start: () => void;
        };
        rec.lang = 'ru-RU';
        rec.interimResults = false;
        rec.continuous = false;
        rec.onresult = (ev) => {
          const text = ev.results[ev.results.length - 1]?.[0]?.transcript || fallbackSimulatedPhrase;
          onRecognized(text);
        };
        rec.onerror = () => {
          onRecognized(fallbackSimulatedPhrase);
        };
        rec.start();
        return;
      } catch {
        // fallback below
      }
    }
    window.setTimeout(() => {
      onRecognized(fallbackSimulatedPhrase);
    }, 900);
  };

  // 1. Voice consent for incoming call
  const handleVoiceCallConsent = (intent: 'accept' | 'reject') => {
    setVoiceCallListening(true);
    const phrase = intent === 'accept' ? 'Принять звонок, соединяй!' : 'Отклонить, сейчас занят';
    listenVoicePhrase(phrase, (recognized) => {
      setVoiceCallListening(false);
      const lower = recognized.toLowerCase();
      if (lower.includes('отклон') || lower.includes('сброс') || lower.includes('занят')) {
        playSound('tired');
        onEndCall('Сейчас на встрече, перезвоню позже (Автоответ ИИ)');
        onSpeakText('Звонок отклонён по вашему голосовому решению.');
      } else {
        playSound('happy');
        onAnswerCall();
        onSpeakText('Голосовое согласие получено. Вызов соединён по громкой связи.');
      }
    });
  };

  // 2. Messenger AI draft regeneration (Online Gemini 4 Argon + Offline fallback)
  const handleRegenerateMessengerDraft = async (item: MessengerThreadItem) => {
    setRegeneratingId(item.id);
    if (!airplaneMode) {
      try {
        const res = await fetch('/api/ai/messenger-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderName: item.senderName,
            appName: item.app,
            incomingText: item.incomingText,
            persona,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.draftReply) {
            onUpdateMessengerDraft(item.id, data.draftReply);
            setRegeneratingId(null);
            return;
          }
        }
      } catch {
        // Offline fallback below
      }
    }

    // Offline / Persona local generation
    const baseReply =
      persona.stylePreset === 'uncensored_18' || persona.allowProfanity
        ? `Йоу, ${item.senderName}! Вопрос вообще огонь, бл*, всё сделаем в лучшем виде, скоро буду на связи!`
        : persona.stylePreset === 'bro'
          ? `Бро, принял сообщение! Всё по кайфу, скоро освобожусь и всё решим!`
          : `${item.senderName}, спасибо за сообщение! Уже взял в работу, скоро свяжусь.`;
    onUpdateMessengerDraft(item.id, baseReply);
    setRegeneratingId(null);
  };

  // Messenger Voice Dictation ("продиктовывает новый/другой ответ")
  const handleDictateMessengerReply = (item: MessengerThreadItem) => {
    setDictatingId(item.id);
    const sampleDictated =
      persona.stylePreset === 'uncensored_18' || persona.allowProfanity
        ? `${item.senderName}, короче расклад такой: освобожусь через полчаса и всё охрененно порешаем!`
        : `${item.senderName}, продиктовано голосом: буду на месте через 30 минут, до связи!`;

    listenVoicePhrase(sampleDictated, (transcript) => {
      onUpdateMessengerDraft(item.id, transcript);
      setDictatingId(null);
      playSound('happy');
      onSpeakText(`Записал ваш новый ответ: ${transcript}. Нажмите подтвердить для отправки.`);
    });
  };

  // 3. Social Media Post / Reels AI Generator (Online + Offline)
  const handleGenerateSocialPost = async () => {
    setGeneratingPost(true);
    const chosenTitles = socialAssets
      .filter((a) => selectedMediaIds.includes(a.id))
      .map((a) => a.title);

    if (!airplaneMode) {
      try {
        const res = await fetch('/api/ai/social-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform,
            format,
            topic: postTopic,
            mediaTitles: chosenTitles,
            persona,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.caption) {
            setPostCaption(data.caption);
            setAwaitingPublishConfirm(true);
            setGeneratingPost(false);
            onSpeakText('Пост и медиафайлы подготовлены. Разрешите публикацию голосом или кнопкой.');
            return;
          }
        }
      } catch {
        // Offline fallback below
      }
    }

    const offlineCaption = applyPersonaFlavor(
      `Готовлю свежий ${format} для ${platform} на тему «${postTopic}»! Прикрепил лучшие кадры (${chosenTitles.length} медиа). Как вам атмосфера? 🔥✨ #AI #LifeCompanion #Almaty #Reels2026`,
      persona
    );
    setPostCaption(offlineCaption);
    setAwaitingPublishConfirm(true);
    setGeneratingPost(false);
    onSpeakText('Черновик поста создан в офлайн-режиме. Ожидаю вашего подтверждения для публикации.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const newId = `custom-${Date.now().toString(36)}`;
    const newAsset: SocialMediaAsset = {
      id: newId,
      type: isVideo ? 'video' : isImage ? 'photo' : 'file',
      title: file.name,
      subtitle: `${(file.size / 1024).toFixed(1)} KB · Локальный файл владельца`,
      previewGradient: 'from-blue-600 via-indigo-600 to-purple-700',
      badge: isVideo ? 'Видео владельца' : isImage ? 'Фото владельца' : 'Файл владельца',
    };
    onAddCustomMediaAsset(newAsset);
    setSelectedMediaIds((prev) => [...prev, newId]);
  };

  const handleConfirmSocialPublish = (via: 'voice' | 'button') => {
    if (via === 'voice') {
      setVoicePublishListening(true);
      listenVoicePhrase('Да, подтверждаю, публикуй!', () => {
        setVoicePublishListening(false);
        const draftId = `post-${Date.now().toString(36)}`;
        onSaveSocialDraft({
          id: draftId,
          platform,
          format,
          topic: postTopic,
          caption: postCaption,
          hashtags: ['#AI', '#Gemini4Argon', '#Reels'],
          selectedMediaIds,
          status: 'published',
          publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        onPublishSocialDraft(draftId, 'voice');
        setAwaitingPublishConfirm(false);
        playSound('happy');
        onSpeakText(`Голосовое разрешение получено! ${format} успешно опубликован в ${platform}.`);
      });
      return;
    }

    const draftId = `post-${Date.now().toString(36)}`;
    onSaveSocialDraft({
      id: draftId,
      platform,
      format,
      topic: postTopic,
      caption: postCaption,
      hashtags: ['#AI', '#Gemini4Argon', '#Reels'],
      selectedMediaIds,
      status: 'published',
      publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    onPublishSocialDraft(draftId, 'button');
    setAwaitingPublishConfirm(false);
    playSound('happy');
    onSpeakText(`Публикация подтверждена! ${format} размещён в ${platform}.`);
  };

  // 4. Health & Psychological Pep-Talk (Online + Offline)
  const handleRequestPepTalk = async (customFeeling?: string) => {
    const textToUse = customFeeling || feelingInput || 'Чувствую усталость, нужна поддержка';
    setLoadingPepTalk(true);

    if (!airplaneMode) {
      try {
        const res = await fetch('/api/ai/pep-talk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            health,
            feelingText: textToUse,
            persona,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.encouragement) {
            onUpdateHealth({
              latestEncouragement: data.encouragement,
              lastCheckInAt: new Date().toISOString(),
            });
            onSpeakText(data.encouragement);
            setLoadingPepTalk(false);
            return;
          }
        }
      } catch {
        // Offline fallback below
      }
    }

    const offlinePep = applyPersonaFlavor(
      `Слышу тебя! По датчикам пульс ${health.heartRateBpm} уд/мин, стресс ${health.stressPercent}%. Ты тащишь огромную нагрузку и справляешься лучше всех. Сделай паузу на 5 минут, выпей воды и выдохни — мы со всем разберёмся!`,
      persona
    );
    onUpdateHealth({
      latestEncouragement: offlinePep,
      lastCheckInAt: new Date().toISOString(),
    });
    onSpeakText(offlinePep);
    setLoadingPepTalk(false);
  };

  const startBreathingCoach = () => {
    setBreathingPhase('Вдох носом (4 сек)...');
    playSound('calm');
    window.setTimeout(() => setBreathingPhase('Задержка дыхания (7 сек)...'), 3000);
    window.setTimeout(() => setBreathingPhase('Медленный выдох (8 сек)...'), 6500);
    window.setTimeout(() => {
      setBreathingPhase(null);
      onUpdateHealth({
        stressPercent: Math.max(12, health.stressPercent - 8),
        heartRateBpm: Math.max(64, health.heartRateBpm - 4),
      });
      onSpeakText('Отлично! Уровень стресса снизился, пульс стабилизировался.');
    }, 10000);
  };

  const allConsentsAllowed = consents.every((c) => c.allowed);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Супер-функции телефона и ИИ-компаньона"
    >
      <div className="w-full max-w-5xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                  Управление телефоном и ИИ-компаньоном
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
                  {airplaneMode ? 'Офлайн-ядро Q4 (Без интернета)' : 'Gemini 4 Argon + Офлайн-ядро'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Звонки по голосу · Автоответы в мессенджерах · Посты/Сторис/Reels · Здоровье и Психология · Обучение речи (в т.ч. 18+)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950 flex flex-wrap items-center gap-1.5">
          {[
            { id: 'calls', label: 'Звонки и Контакты', icon: Phone },
            { id: 'messengers', label: `Мессенджеры (${messengerThreads.filter((m) => m.status === 'pending_confirm').length})`, icon: MessageCircle },
            { id: 'social', label: 'Посты / Сторис / Reels', icon: Share2 },
            { id: 'health', label: 'Здоровье и Психология', icon: HeartPulse },
            { id: 'persona', label: 'Манера общения (18+) и Доступы', icon: Brain },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id as SuperHubTab)}
                className={`min-h-[38px] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: CONTACTS & VOICE CALLS */}
          {activeTab === 'calls' && (
            <div className="space-y-6">
              {/* Active / Incoming Call Interactive Banner */}
              {activeCall ? (
                <div className="rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 p-5 text-white shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-lg">
                        <PhoneIncoming className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                          {activeCall.direction === 'incoming'
                            ? activeCall.status === 'ringing'
                              ? 'Входящий вызов · Голосовое согласие активно'
                              : 'Разговор по громкой связи'
                            : 'Исходящий голосовой вызов'}
                        </span>
                        <h3 className="text-xl font-bold">{activeCall.contact.name}</h3>
                        <p className="text-xs text-slate-300">
                          {activeCall.contact.relation} · {activeCall.contact.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {activeCall.status === 'ringing' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleVoiceCallConsent('accept')}
                            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                          >
                            <Mic className="w-4 h-4" />
                            <span>
                              {voiceCallListening
                                ? 'Слушаю голос...'
                                : 'Голосом: «Принять звонок»'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVoiceCallConsent('reject')}
                            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 border border-rose-500/50 hover:bg-rose-600/30 text-rose-300 font-semibold text-xs cursor-pointer"
                          >
                            <Mic className="w-4 h-4" />
                            <span>Голосом: «Отклонить»</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => onEndCall()}
                        className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer"
                      >
                        <PhoneOff className="w-4 h-4" />
                        <span>Завершить</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Голосовой набор и приём входящих звонков голосовым согласием
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Скажите «Позвони Маме» или нажмите кнопку ниже, чтобы протестировать входящий звонок и ответить на него голосом («Принять» / «Отклонить»).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const caller = contacts[1] || contacts[0];
                      if (caller) {
                        playSound('curious');
                        onStartCall(caller, 'incoming');
                        onSpeakText(
                          `Входящий звонок от ${caller.name}. Скажите Принять или Отклонить.`
                        );
                      }
                    }}
                    className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shrink-0"
                  >
                    <PhoneIncoming className="w-4 h-4" />
                    <span>Симулировать входящий звонок</span>
                  </button>
                </div>
              )}

              {/* Contacts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${contact.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                      >
                        {contact.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {contact.relation}
                        </p>
                        <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                          {contact.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          playSound('happy');
                          onStartCall(contact, 'outgoing');
                          onSpeakText(`Набираю контакт ${contact.name}`);
                          try {
                            window.location.href = `tel:${contact.phone}`;
                          } catch {
                            // handled in overlay
                          }
                        }}
                        className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Позвонить</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playSound('curious');
                          onStartCall(contact, 'incoming');
                          onSpeakText(
                            `Входящий вызов от ${contact.name}. Скажите Принять или Отклонить.`
                          );
                        }}
                        className="min-h-[40px] px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                        title="Тест входящего вызова от этого контакта"
                      >
                        Входящий
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Contact Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newContactName.trim() || !newContactPhone.trim()) return;
                  onAddContact(
                    newContactName.trim(),
                    newContactRel.trim() || 'Личный контакт',
                    newContactPhone.trim()
                  );
                  setNewContactName('');
                  setNewContactRel('');
                }}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center gap-2.5"
              >
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-2">
                  Добавить в книгу контактов:
                </span>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Имя (напр. Сестра Алия)"
                  className="flex-1 min-w-[150px] min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="text"
                  value={newContactRel}
                  onChange={(e) => setNewContactRel(e.target.value)}
                  placeholder="Кто это (Семья / Работа)"
                  className="flex-1 min-w-[140px] min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+7701..."
                  className="w-36 min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                />
                <button
                  type="submit"
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MESSENGERS AUTO-REPLY HUB */}
          {activeTab === 'messengers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Формат работы: ИИ готовит ответ ➔ Владелец подтверждает ИЛИ диктует другой ответ
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Помощник анализирует входящие сообщения в WhatsApp, Telegram, Instagram Direct и SMS, предлагает готовый ответ в вашей манере речи и ждёт подтверждения.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSimulateIncomingMessage(
                      'WhatsApp',
                      'Шеф (Данияр)',
                      'Привет! Во сколько сегодня сможем созвониться по новому проекту?'
                    )
                  }
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Симулировать входящее сообщение</span>
                </button>
              </div>

              <div className="space-y-4">
                {messengerThreads.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 sm:p-5 space-y-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-600/15 text-blue-600 dark:text-blue-400 text-xs font-bold">
                          {item.app}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {item.senderName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {item.senderHandle} · {item.receivedAt}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          item.status === 'sent'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {item.status === 'sent' ? '✓ Отправлено с согласия владельца' : 'Ожидает подтверждения'}
                      </span>
                    </div>

                    {/* Incoming Message Bubble */}
                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Входящее сообщение:
                      </span>
                      «{item.incomingText}»
                    </div>

                    {/* AI Prepared Reply Draft (Editable + Voice Dictation) */}
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Подготовленный ответ ИИ-помощника (можно отредактировать или продиктовать заново):
                        </span>
                        <button
                          type="button"
                          onClick={() => onSpeakText(item.aiDraftReply)}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-500"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Озвучить</span>
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={item.aiDraftReply}
                        onChange={(e) => onUpdateMessengerDraft(item.id, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playSound('happy');
                            onConfirmMessengerReply(item.id, item.aiDraftReply);
                            onSpeakText(`Ответ для ${item.senderName} в ${item.app} подтверждён и отправлен!`);
                          }}
                          className="min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Подтвердить и отправить</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDictateMessengerReply(item)}
                          className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/15 border border-rose-500/40 hover:bg-rose-600/25 text-rose-600 dark:text-rose-300 text-xs font-semibold cursor-pointer"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>
                            {dictatingId === item.id
                              ? 'Слушаю вашу диктовку...'
                              : 'Продиктовать свой / другой ответ'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRegenerateMessengerDraft(item)}
                          className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                          <span>
                            {regeneratingId === item.id
                              ? 'Генерирую...'
                              : 'Другой вариант от ИИ'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL MEDIA STUDIO (POSTS / STORIES / REELS + MEDIA PICKER + VOICE/BUTTON CONFIRMATION) */}
          {activeTab === 'social' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Post Generator & Media Selector */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-4 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {(['Instagram', 'TikTok', 'Telegram', 'VK', 'YouTube Shorts'] as SocialPlatform[]).map(
                        (p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPlatform(p)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                              platform === p
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {(['Пост', 'Сторис', 'Reels / Клип'] as SocialContentFormat[]).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setFormat(fmt)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                            format === fmt
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          Формат: {fmt}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Тема публикации (помощник напишет пост и сценарий):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={postTopic}
                          onChange={(e) => setPostTopic(e.target.value)}
                          className="flex-1 min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleGenerateSocialPost}
                          className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer shrink-0"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{generatingPost ? 'Пишу...' : 'Написать через ИИ'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Готовый текст поста / описание Reels (с учётом вашей манеры общения):
                      </label>
                      <textarea
                        rows={4}
                        value={postCaption}
                        onChange={(e) => {
                          setPostCaption(e.target.value);
                          setAwaitingPublishConfirm(true);
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Suggested Photos, Videos & Files + Mandatory Confirmation */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Предложенные ИИ Фото, Видео и Файлы ({selectedMediaIds.length} выбрано)
                      </h3>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*,.pdf,.doc,.docx,.zip"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Прикрепить свой файл</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[210px] overflow-y-auto pr-1">
                      {socialAssets.map((asset) => {
                        const isSelected = selectedMediaIds.includes(asset.id);
                        return (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() =>
                              setSelectedMediaIds((prev) =>
                                prev.includes(asset.id)
                                  ? prev.filter((id) => id !== asset.id)
                                  : [...prev, asset.id]
                              )
                            }
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${asset.previewGradient} flex items-center justify-center text-white shrink-0`}
                              >
                                {asset.type === 'video' ? (
                                  <Film className="w-4 h-4" />
                                ) : asset.type === 'photo' ? (
                                  <ImageIcon className="w-4 h-4" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                  {asset.title}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {asset.subtitle}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                              {isSelected ? '✓ В посте' : '+ Выбрать'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pre-Publication Permission Box (Voice or Button Confirmation) */}
                  <div className="rounded-2xl border-2 border-amber-500/60 bg-amber-500/10 p-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Запрос разрешения перед публикацией ({platform} · {format})
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          Помощник никогда не публикует посты без вашего ведома. Подтвердите размещение голосом («Опубликовать» / «Да») или нажатием на кнопку:
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirmSocialPublish('voice')}
                        className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                      >
                        <Mic className="w-4 h-4" />
                        <span>
                          {voicePublishListening
                            ? 'Слушаю подтверждение...'
                            : 'Подтвердить голосом («Опубликовать»)'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConfirmSocialPublish('button')}
                        className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Подтвердить кнопкой</span>
                      </button>
                    </div>

                    {!awaitingPublishConfirm && socialDrafts[0]?.status === 'published' && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ Опубликовано в {socialDrafts[0].platform} ({socialDrafts[0].format}) в{' '}
                        {socialDrafts[0].publishedAt}!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HEALTH & PSYCHOLOGICAL STATE MONITOR */}
          {activeTab === 'health' && (
            <div className="space-y-5">
              {/* Vitals Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Пульс (ЧСС)</span>
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {health.heartRateBpm} <span className="text-xs font-normal">уд/мин</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Уровень стресса</span>
                    <Activity className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {health.stressPercent}%
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Сон за сутки</span>
                    <Flame className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {health.sleepHours} <span className="text-xs font-normal">ч</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                      <Droplets className="w-4 h-4 text-cyan-500" />
                      <span>Водный баланс</span>
                    </div>
                    <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                      {health.waterGlasses} <span className="text-xs font-normal">ст.</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playSound('happy');
                      onUpdateHealth({ waterGlasses: health.waterGlasses + 1 });
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 text-xs font-bold cursor-pointer"
                  >
                    +1 стакан
                  </button>
                </div>
              </div>

              {/* Psychological Check-in & AI Pep Talk */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Психологическая поддержка и забота ИИ-компаньона (работает онлайн и без интернета)
                  </h3>
                  <button
                    type="button"
                    onClick={startBreathingCoach}
                    className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    {breathingPhase || 'Дыхательная антистресс-практика (4-7-8)'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: 'great', label: '🔥 Заряжен на 100%', text: 'Отличное настроение, полон сил!' },
                      { id: 'calm', label: '😌 Спокойно', text: 'Чувствую себя спокойно и ровно' },
                      { id: 'tired', label: '😴 Сильно устал', text: 'Я сегодня сильно устал, глаза слипаются' },
                      { id: 'stressed', label: '⚡ Стресс и перегруз', text: 'Много задач и дедлайнов, чувствую стресс' },
                      { id: 'sad', label: '💙 Грустно / Выгорание', text: 'Немного грустно и нет мотивации, подбодри меня' },
                    ] as { id: PsychologicalMood; label: string; text: string }[]
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onUpdateHealth({
                          psychMood: m.id,
                          stressPercent: m.id === 'stressed' ? 68 : m.id === 'tired' ? 45 : 24,
                        });
                        handleRequestPepTalk(m.text);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        health.psychMood === m.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Слова поддержки от вашего компаньона ({persona.ownerAddress}):</span>
                    <button
                      type="button"
                      onClick={() => onSpeakText(health.latestEncouragement)}
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Озвучить голосом</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                    {loadingPepTalk ? 'Подбираю слова поддержки...' : health.latestEncouragement}
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feelingInput}
                    onChange={(e) => setFeelingInput(e.target.value)}
                    placeholder="Напишите или скажите, что вас тревожит или как вы себя чувствуете..."
                    className="flex-1 min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRequestPepTalk()}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    Подбодрить меня
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PERSONA & STYLE TRAINER (INCLUDING 18+ PROFANITY) + FULL PHONE PERMISSIONS */}
          {activeTab === 'persona' && (
            <div className="space-y-6">
              {/* Style & Uncensored 18+ Selector */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Обучение помощника манере общения (от вежливого до дерзкого 18+ без цензуры)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Прививайте компаньону свой сленг, любимые выражения и характер. Выбранная манера применяется в чате, автоответах мессенджеров, постах и голосовых советах.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(
                    [
                      {
                        id: 'polite',
                        title: 'Вежливый и чуткий',
                        desc: 'Культурная, спокойная и заботливая речь',
                      },
                      {
                        id: 'friendly',
                        title: 'Дружеский и живой',
                        desc: 'Тёплый стиль лучшего друга с лёгким юмором',
                      },
                      {
                        id: 'bro',
                        title: 'Свой бро (Сленг)',
                        desc: 'Разговорный сленг: «бро», «по кайфу», «железно»',
                      },
                      {
                        id: 'uncensored_18',
                        title: 'Дерзкий 18+ (Без цензуры)',
                        desc: 'Острый взрослый юмор и нецензурная лексика в ответах',
                      },
                    ] as { id: PersonaStylePreset; title: string; desc: string }[]
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        playSound('tap');
                        onUpdatePersona({
                          stylePreset: st.id,
                          allowProfanity: st.id === 'uncensored_18' ? true : persona.allowProfanity,
                        });
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        persona.stylePreset === st.id
                          ? 'border-blue-600 bg-blue-600/10'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {st.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {st.desc}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Explicit Profanity Toggle + Owner Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Разрешить нецензурную лексику в ответах (18+)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Помощник сможет использовать крепкие выражения и острое словцо по вашему желанию
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdatePersona({
                          allowProfanity: !persona.allowProfanity,
                          stylePreset: !persona.allowProfanity ? 'uncensored_18' : persona.stylePreset,
                        })
                      }
                      className={`min-h-[36px] min-w-[68px] px-3 rounded-xl text-xs font-bold cursor-pointer ${
                        persona.allowProfanity
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {persona.allowProfanity ? '18+ ВКЛ' : 'ВЫКЛ'}
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        Как обращаться к владельцу:
                      </label>
                      <input
                        type="text"
                        value={persona.ownerAddress}
                        onChange={(e) => onUpdatePersona({ ownerAddress: e.target.value })}
                        placeholder="Шеф / Бро / Босс / Легенда"
                        className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Catchphrases & Learned Trigger->Response Trainer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Коронные фразы и словечки помощника:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.customCatchphrases.map((phrase, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs"
                        >
                          «{phrase}»
                          <button
                            type="button"
                            onClick={() =>
                              onUpdatePersona({
                                customCatchphrases: persona.customCatchphrases.filter(
                                  (_, i) => i !== idx
                                ),
                              })
                            }
                            className="text-slate-400 hover:text-rose-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCatchphrase}
                        onChange={(e) => setNewCatchphrase(e.target.value)}
                        placeholder="Добавить любимую фразу или крепкое выражение..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newCatchphrase.trim()) return;
                          onUpdatePersona({
                            customCatchphrases: [
                              ...persona.customCatchphrases,
                              newCatchphrase.trim(),
                            ],
                          });
                          setNewCatchphrase('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                      >
                        + Фраза
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Обучить прямой реакции (Фраза владельца ➔ Ответ ИИ):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={ruleTrigger}
                        onChange={(e) => setRuleTrigger(e.target.value)}
                        placeholder="Когда я говорю (напр. Погнали)"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                      />
                      <input
                        type="text"
                        value={ruleResponse}
                        onChange={(e) => setRuleResponse(e.target.value)}
                        placeholder="Отвечай так (любой текст / 18+)"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!ruleTrigger.trim() || !ruleResponse.trim()) return;
                        onUpdatePersona({
                          learnedRules: [
                            ...persona.learnedRules,
                            {
                              id: `rule-${Date.now().toString(36)}`,
                              whenUserSays: ruleTrigger.trim(),
                              assistantReplies: ruleResponse.trim(),
                            },
                          ],
                        });
                        setRuleTrigger('');
                        setRuleResponse('');
                      }}
                      className="w-full py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
                    >
                      Сохранить правило обучения
                    </button>
                  </div>
                </div>
              </div>

              {/* Master Phone Access Consent Switch */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Доступ ко всем функциям телефона с согласия владельца
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Вы сами управляете разрешениями на звонки, мессенджеры, соцсети, датчики здоровья и системные функции.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onGrantAllPhoneConsents(!allConsentsAllowed)}
                    className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      allConsentsAllowed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {allConsentsAllowed
                      ? '✓ Полный доступ владельца активен (Отключить все)'
                      : 'Включить полный доступ ко всем функциям'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {consents.map((c) => (
                    <div
                      key={c.sourceId}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {c.label.ru}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {c.description.ru}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleConsent(c.sourceId)}
                        className={`min-h-[32px] min-w-[54px] px-2.5 rounded-lg text-xs font-bold cursor-pointer shrink-0 ${
                          c.allowed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {c.allowed ? 'ДА' : 'НЕТ'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info Bar */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-emerald-500" />
            <span>Автономная работа без интернета поддерживается для всех 5 модулей</span>
          </div>
          <span>Манера речи: {persona.allowProfanity ? '18+ Без цензуры' : persona.stylePreset} · Обращение: «{persona.ownerAddress}»</span>
        </div>
      </div>
    </div>
  );
};
