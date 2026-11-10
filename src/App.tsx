import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Home,
  MessageSquare,
  BarChart2,
  Sparkles,
  User,
  ShieldAlert,
  WifiOff,
  Wifi,
  Smartphone,
  Sun,
  Moon,
  Palette,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Car,
  HardDriveDownload,
  Mic,
} from 'lucide-react';
import { PhoneInstallModal } from './components/PhoneInstallModal';
import { DesignShowcaseModal } from './components/DesignShowcaseModal';
import { KazakhstanServicesModal } from './components/KazakhstanServicesModal';
import { VoiceCommandModal } from './components/VoiceCommandModal';
import { PhoneSuperHubModal } from './components/PhoneSuperHubModal';
import { SourceDownloadModal } from './components/SourceDownloadModal';
import {
  ActionRecord,
  ActiveCallState,
  ApprovalRequest,
  ChatMessage,
  CompanionState,
  ConsentGrant,
  ConsentSourceId,
  ContactItem,
  HealthWellnessState,
  InventoryItem,
  MainTab,
  MemoryFact,
  MessengerApp,
  MessengerThreadItem,
  OfflinePack,
  PersonaTrainingConfig,
  ReminderItem,
  SocialMediaAsset,
  SocialPostDraft,
  UserSettings,
} from './types/companion';
import {
  INITIAL_ACTIONS,
  INITIAL_ACTIVITY,
  INITIAL_CALENDAR,
  INITIAL_COMPANION,
  INITIAL_CONSENTS,
  INITIAL_CONTACTS,
  INITIAL_HEALTH_STATE,
  INITIAL_INTEGRATIONS,
  INITIAL_INVENTORY,
  INITIAL_MEMORIES,
  INITIAL_MESSAGES,
  INITIAL_MESSENGER_THREADS,
  INITIAL_PACKS,
  INITIAL_PERSONA_TRAINING,
  INITIAL_REMINDERS,
  INITIAL_SETTINGS,
  INITIAL_SOCIAL_ASSETS,
  INITIAL_SOCIAL_DRAFTS,
} from './data/initialState';
import { translations } from './data/i18n';
import { CompanionEvent, companionReducer } from './engine/companionReducer';
import { SuperHubTab, routeUserCommand } from './engine/intentRouter';
import { HomeView } from './components/HomeView';
import { ChatView } from './components/ChatView';
import { InsightsView } from './components/InsightsView';
import { WorldView } from './components/WorldView';
import { ProfileView } from './components/ProfileView';
import { ApprovalModal } from './components/ApprovalModal';
import { playSound } from './engine/audioEffects';

const STORAGE_KEY = 'ai_life_companion_state_v3';

interface PersistedState {
  settings: UserSettings;
  companion: CompanionState;
  inventory: InventoryItem[];
  consents: ConsentGrant[];
  reminders: ReminderItem[];
  memories: MemoryFact[];
  messages: ChatMessage[];
  actions: ActionRecord[];
  approvals: ApprovalRequest[];
  packs: OfflinePack[];
  freeDiskMb: number;
  contacts: ContactItem[];
  messengerThreads: MessengerThreadItem[];
  socialAssets: SocialMediaAsset[];
  socialDrafts: SocialPostDraft[];
  health: HealthWellnessState;
  persona: PersonaTrainingConfig;
}

function loadInitialState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        settings: { ...INITIAL_SETTINGS, ...parsed.settings },
        companion: { ...INITIAL_COMPANION, ...parsed.companion },
        inventory: parsed.inventory ?? INITIAL_INVENTORY,
        consents: parsed.consents ?? INITIAL_CONSENTS,
        reminders: parsed.reminders ?? INITIAL_REMINDERS,
        memories: parsed.memories ?? INITIAL_MEMORIES,
        messages: parsed.messages ?? INITIAL_MESSAGES,
        actions: parsed.actions ?? INITIAL_ACTIONS,
        approvals: parsed.approvals ?? [],
        packs: parsed.packs ?? INITIAL_PACKS,
        freeDiskMb: parsed.freeDiskMb ?? 1850,
        contacts: parsed.contacts ?? INITIAL_CONTACTS,
        messengerThreads: parsed.messengerThreads ?? INITIAL_MESSENGER_THREADS,
        socialAssets: parsed.socialAssets ?? INITIAL_SOCIAL_ASSETS,
        socialDrafts: parsed.socialDrafts ?? INITIAL_SOCIAL_DRAFTS,
        health: { ...INITIAL_HEALTH_STATE, ...parsed.health },
        persona: { ...INITIAL_PERSONA_TRAINING, ...parsed.persona },
      };
    }
  } catch {
    // Fallback to clean seed state if storage unavailable
  }

  return {
    settings: INITIAL_SETTINGS,
    companion: INITIAL_COMPANION,
    inventory: INITIAL_INVENTORY,
    consents: INITIAL_CONSENTS,
    reminders: INITIAL_REMINDERS,
    memories: INITIAL_MEMORIES,
    messages: INITIAL_MESSAGES,
    actions: INITIAL_ACTIONS,
    approvals: [],
    packs: INITIAL_PACKS,
    freeDiskMb: 1850,
    contacts: INITIAL_CONTACTS,
    messengerThreads: INITIAL_MESSENGER_THREADS,
    socialAssets: INITIAL_SOCIAL_ASSETS,
    socialDrafts: INITIAL_SOCIAL_DRAFTS,
    health: INITIAL_HEALTH_STATE,
    persona: INITIAL_PERSONA_TRAINING,
  };
}

export default function App() {
  const [initial] = useState<PersistedState>(() => loadInitialState());

  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [settings, setSettings] = useState<UserSettings>(initial.settings);
  const [companion, setCompanion] = useState<CompanionState>(initial.companion);
  const [inventory, setInventory] = useState<InventoryItem[]>(initial.inventory);
  const [consents, setConsents] = useState<ConsentGrant[]>(initial.consents);
  const [reminders, setReminders] = useState<ReminderItem[]>(initial.reminders);
  const [memories, setMemories] = useState<MemoryFact[]>(initial.memories);
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [actions, setActions] = useState<ActionRecord[]>(initial.actions);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(initial.approvals);
  const [packs, setPacks] = useState<OfflinePack[]>(initial.packs);
  const [freeDiskMb, setFreeDiskMb] = useState<number>(initial.freeDiskMb);

  // Super-Companion Phone & Persona States
  const [contacts, setContacts] = useState<ContactItem[]>(initial.contacts);
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [messengerThreads, setMessengerThreads] = useState<MessengerThreadItem[]>(
    initial.messengerThreads
  );
  const [socialAssets, setSocialAssets] = useState<SocialMediaAsset[]>(initial.socialAssets);
  const [socialDrafts, setSocialDrafts] = useState<SocialPostDraft[]>(initial.socialDrafts);
  const [health, setHealth] = useState<HealthWellnessState>(initial.health);
  const [persona, setPersona] = useState<PersonaTrainingConfig>(initial.persona);

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [phoneInstallModalOpen, setPhoneInstallModalOpen] = useState(false);
  const [designShowcaseOpen, setDesignShowcaseOpen] = useState(false);
  const [kzModalOpen, setKzModalOpen] = useState(false);
  const [kzModalTab, setKzModalTab] = useState<'emergency' | 'taxi'>('emergency');
  const [superHubOpen, setSuperHubOpen] = useState(false);
  const [superHubTab, setSuperHubTab] = useState<SuperHubTab>('calls');
  const [sourceDownloadOpen, setSourceDownloadOpen] = useState(false);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');

  const streamTimerRef = useRef<number | null>(null);
  const streamingMsgIdRef = useRef<string | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  // Sync persisted state to localStorage (PRD-03, OFF-01)
  useEffect(() => {
    try {
      const payload: PersistedState = {
        settings,
        companion,
        inventory,
        consents,
        reminders,
        memories,
        messages,
        actions,
        approvals,
        packs,
        freeDiskMb,
        contacts,
        messengerThreads,
        socialAssets,
        socialDrafts,
        health,
        persona,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota issues cleanly
    }
  }, [
    settings,
    companion,
    inventory,
    consents,
    reminders,
    memories,
    messages,
    actions,
    approvals,
    packs,
    freeDiskMb,
    contacts,
    messengerThreads,
    socialAssets,
    socialDrafts,
    health,
    persona,
  ]);

  // Sync Dark Theme & Reduced Motion on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', settings.theme === 'dark');
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    root.lang = settings.locale;
  }, [settings.theme, settings.reducedMotion, settings.locale]);

  const stopStreaming = useCallback((markCanceled: boolean) => {
    if (streamTimerRef.current !== null) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    const targetId = streamingMsgIdRef.current;
    if (markCanceled && targetId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === targetId ? { ...m, status: 'canceled' } : m))
      );
    }
    streamingMsgIdRef.current = null;
    setIsStreaming(false);
  }, []);

  // AI-02: If Airplane mode is turned on mid-stream, halt cleanly & preserve partial text
  useEffect(() => {
    if (settings.airplaneMode && isStreaming) {
      stopStreaming(true);
    }
  }, [settings.airplaneMode, isStreaming, stopStreaming]);

  const speakText = useCallback(
    (text: string) => {
      if (settings.ttsMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text.slice(0, 240));
        utter.lang =
          settings.locale === 'ru'
            ? 'ru-RU'
            : settings.locale === 'es'
              ? 'es-ES'
              : 'en-US';
        window.speechSynthesis.speak(utter);
      } catch {
        // Fallback silently if TTS engine unavailable
      }
    },
    [settings.ttsMuted, settings.locale]
  );

  const dispatchCompanion = useCallback((event: CompanionEvent) => {
    setCompanion((prev) => companionReducer(prev, event));
  }, []);

  const handleRunCommand = useCallback(
    (rawText: string, source: 'text' | 'voice') => {
      const text = rawText.trim();
      if (!text) return;

      // Cancel any prior stream cleanly
      if (isStreaming) stopStreaming(true);

      const userMsg: ChatMessage = {
        id: `u-${Date.now().toString(36)}`,
        role: 'user',
        text,
        createdAt: new Date().toISOString(),
        status: 'complete',
      };

      const usage7d = INITIAL_ACTIVITY.categories.reduce((acc, c) => acc + c.minutes7d, 0);
      const result = routeUserCommand(text, source, {
        settings,
        consents,
        reminders,
        calendar: INITIAL_CALENDAR,
        memories,
        packs,
        inventory,
        usageMinutes7d: usage7d,
        contacts,
        persona,
        health,
      });

      if (result.newReminder) {
        setReminders((prev) => [result.newReminder!, ...prev]);
      }
      if (result.deleteMemoryId) {
        setMemories((prev) => prev.filter((m) => m.id !== result.deleteMemoryId));
      }
      if (result.actionRecord) {
        setActions((prev) => [result.actionRecord!, ...prev]);
      }
      if (result.approvalRequest) {
        setApprovals((prev) => [result.approvalRequest!, ...prev]);
      }
      if (result.companionEvent) {
        dispatchCompanion(result.companionEvent);
      }
      if (result.initiateContactCall) {
        setActiveCall({
          contact: result.initiateContactCall,
          direction: 'outgoing',
          status: 'connected',
          startedAt: new Date().toISOString(),
        });
        setSuperHubTab('calls');
        setSuperHubOpen(true);
        if (result.dialNumber) {
          try {
            window.location.href = `tel:${result.dialNumber}`;
          } catch {
            // handled in modal
          }
        }
      }
      if (result.simulateIncomingCallFrom) {
        setActiveCall({
          contact: result.simulateIncomingCallFrom,
          direction: 'incoming',
          status: 'ringing',
          startedAt: new Date().toISOString(),
        });
        setSuperHubTab('calls');
        setSuperHubOpen(true);
      }
      if (result.voiceCallDecision) {
        if (result.voiceCallDecision === 'accept') {
          setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
        } else {
          setActiveCall(null);
        }
      }
      if (result.openSuperHubTab) {
        setSuperHubTab(result.openSuperHubTab);
        setSuperHubOpen(true);
      }
      if (result.openKzService) {
        setKzModalTab(result.openKzService);
        setKzModalOpen(true);
        if (result.openKzService === 'emergency' && result.dialNumber) {
          try {
            window.location.href = `tel:${result.dialNumber}`;
          } catch {
            // Modal fallback
          }
        }
      }
      if (result.navigateTo) {
        setActiveTab(result.navigateTo);
      } else if (
        source === 'text' &&
        activeTab === 'home' &&
        !result.openKzService &&
        !result.openSuperHubTab &&
        !result.initiateContactCall &&
        !result.simulateIncomingCallFrom
      ) {
        setActiveTab('ai');
      }

      const assistantId = `a-${Date.now().toString(36)}`;
      if (result.route === 'cloud_llm' && !settings.airplaneMode) {
        const initialMsg: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          text: 'Gemini 4 Argon анализирует контекст...',
          createdAt: new Date().toISOString(),
          route: 'cloud_llm',
          actionId: result.actionRecord?.actionId,
          status: 'streaming',
          untrustedInput: result.untrustedDetected,
        };
        setMessages((prev) => [...prev, userMsg, initialMsg]);
        setIsStreaming(true);
        streamingMsgIdRef.current = assistantId;
        dispatchCompanion({ type: 'SET_ANIMATION', cue: 'think' });

        fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: text,
            locale: settings.locale,
            context: {
              avatarId: companion.avatarId,
              mood: companion.mood,
              energy: companion.energy,
              level: companion.level,
              reminders,
              calendar: INITIAL_CALENDAR,
              memories,
              persona,
              health,
            },
          }),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((data: { replyText?: string }) => {
            const finalReply = data.replyText?.trim() || result.replyText;
            const words = finalReply.split(' ');
            let idx = 0;
            dispatchCompanion({ type: 'SET_ANIMATION', cue: 'speak' });

            streamTimerRef.current = window.setInterval(() => {
              idx += 2;
              if (idx >= words.length) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, text: finalReply, status: 'complete' }
                      : m
                  )
                );
                stopStreaming(false);
                dispatchCompanion({ type: 'ACTION_SUCCEEDED', xpGain: 12 });
                speakText(finalReply);
                return;
              }
              const partial = words.slice(0, idx + 1).join(' ');
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, text: partial } : m))
              );
            }, 35);
          })
          .catch(() => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, text: result.replyText, status: 'complete' }
                  : m
              )
            );
            stopStreaming(false);
            dispatchCompanion({ type: 'SET_ANIMATION', cue: 'idle' });
            speakText(result.replyText);
          });
      } else if (result.streamable && !settings.airplaneMode) {
        const words = result.replyText.split(' ');
        let idx = 0;
        const initialMsg: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          text: words[0] ?? '',
          createdAt: new Date().toISOString(),
          route: result.route,
          actionId: result.actionRecord?.actionId,
          status: 'streaming',
          untrustedInput: result.untrustedDetected,
        };
        setMessages((prev) => [...prev, userMsg, initialMsg]);
        setIsStreaming(true);
        streamingMsgIdRef.current = assistantId;

        streamTimerRef.current = window.setInterval(() => {
          idx += 1;
          if (idx >= words.length) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, text: result.replyText, status: 'complete' }
                  : m
              )
            );
            stopStreaming(false);
            speakText(result.replyText);
            return;
          }
          const partial = words.slice(0, idx + 1).join(' ');
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, text: partial } : m))
          );
        }, 45);
      } else {
        const assistantMsg: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          text: result.replyText,
          createdAt: new Date().toISOString(),
          route: result.route,
          actionId: result.actionRecord?.actionId,
          status: 'complete',
          untrustedInput: result.untrustedDetected,
        };
        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        speakText(result.replyText);
      }
    },
    [
      isStreaming,
      stopStreaming,
      settings,
      consents,
      reminders,
      memories,
      packs,
      inventory,
      contacts,
      persona,
      health,
      companion,
      dispatchCompanion,
      activeTab,
      speakText,
    ]
  );

  const handleGenerateDailyPlan = useCallback(() => {
    if (isStreaming) stopStreaming(true);
    const promptText =
      settings.locale === 'en'
        ? 'Generate my personalized Daily Action Plan & Advice with Gemini 4 Argon'
        : 'Составь мой персональный план дня и рекомендации с Gemini 4 Argon';

    const userMsg: ChatMessage = {
      id: `u-plan-${Date.now().toString(36)}`,
      role: 'user',
      text: promptText,
      createdAt: new Date().toISOString(),
      status: 'complete',
    };

    const assistantId = `a-plan-${Date.now().toString(36)}`;
    const initialMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      text: 'Gemini 4 Argon анализирует ваши задачи, календарь, здоровье и манеру общения...',
      createdAt: new Date().toISOString(),
      route: 'cloud_llm',
      status: 'streaming',
    };

    setMessages((prev) => [...prev, userMsg, initialMsg]);
    setActiveTab('ai');
    setIsStreaming(true);
    streamingMsgIdRef.current = assistantId;
    dispatchCompanion({ type: 'SET_ANIMATION', cue: 'think' });

    fetch('/api/ai/plan-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale: settings.locale,
        context: {
          avatarId: companion.avatarId,
          mood: companion.mood,
          energy: companion.energy,
          level: companion.level,
          reminders,
          calendar: INITIAL_CALENDAR,
          memories,
          persona,
          health,
        },
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { replyText?: string }) => {
        const planText =
          data.replyText?.trim() ||
          '1. Утренний фокус: разберите ключевые напоминания.\n2. Дневной ритм: сделайте 15-минутную паузу для восстановления энергии.\n3. Вечерний ритуал: отметьте выполненные задачи.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: planText, status: 'complete' } : m
          )
        );
        stopStreaming(false);
        dispatchCompanion({ type: 'ACTION_SUCCEEDED', xpGain: 15 });
        speakText(planText);
      })
      .catch(() => {
        const fallbackPlan =
          'Персональный план дня (автономное офлайн-ядро):\n1. Главный приоритет: утренние напоминания из списка задач.\n2. Мессенджеры и звонки: подтвердите готовые черновики ответов.\n3. Здоровье и тонус: пульс в норме, выпейте стакан воды.\n4. Вечерний обзор: подготовьте Reels или сторис с итогами дня.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: fallbackPlan, status: 'complete' } : m
          )
        );
        stopStreaming(false);
        dispatchCompanion({ type: 'ACTION_SUCCEEDED', xpGain: 10 });
        speakText(fallbackPlan);
      });
  }, [
    isStreaming,
    stopStreaming,
    settings.locale,
    companion,
    reminders,
    memories,
    persona,
    health,
    dispatchCompanion,
    speakText,
  ]);

  // Voice Push-to-Talk
  const handleToggleVoice = useCallback(() => {
    const sttAllowed = consents.find((c) => c.sourceId === 'offlineStt')?.allowed;
    if (!sttAllowed) {
      setActiveTab('profile');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setPartialTranscript('');
      dispatchCompanion({ type: 'SET_ANIMATION', cue: 'idle' });
      return;
    }

    setIsListening(true);
    dispatchCompanion({ type: 'SET_ANIMATION', cue: 'listen' });

    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown })
        .webkitSpeechRecognition;

    if (SpeechRec && !settings.airplaneMode) {
      try {
        const rec = new SpeechRec() as {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          onresult: (ev: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void;
          onerror: () => void;
          onend: () => void;
          start: () => void;
          stop: () => void;
        };
        rec.lang =
          settings.locale === 'ru' ? 'ru-RU' : settings.locale === 'es' ? 'es-ES' : 'en-US';
        rec.interimResults = true;
        rec.continuous = false;

        let finalTranscript = '';
        rec.onresult = (event) => {
          const last = event.results[event.results.length - 1];
          const text = last?.[0]?.transcript ?? '';
          if (last?.isFinal) {
            finalTranscript = text;
            setPartialTranscript('');
          } else {
            setPartialTranscript(text);
          }
        };
        rec.onend = () => {
          setIsListening(false);
          setPartialTranscript('');
          if (finalTranscript.trim()) {
            handleRunCommand(finalTranscript.trim(), 'voice');
          } else {
            dispatchCompanion({ type: 'SET_ANIMATION', cue: 'idle' });
          }
        };
        rec.onerror = () => {
          setIsListening(false);
          setPartialTranscript('');
          dispatchCompanion({ type: 'SET_ANIMATION', cue: 'idle' });
        };

        recognitionRef.current = rec;
        rec.start();
        return;
      } catch {
        // Fall through to voice modal
      }
    }
  }, [consents, isListening, settings.airplaneMode, settings.locale, dispatchCompanion, handleRunCommand]);

  const handleCreateReminderForm = (title: string, timeStr: string) => {
    const [hh, mm] = timeStr.split(':').map((n) => parseInt(n, 10));
    const at = new Date();
    at.setHours(Number.isFinite(hh) ? hh : 9, Number.isFinite(mm) ? mm : 0, 0, 0);
    const id = `r-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const item: ReminderItem = {
      id,
      title,
      at: at.toISOString(),
      timezone: settings.timezone,
      completed: false,
      source: 'form',
      createdAt: now,
    };
    setReminders((prev) => [item, ...prev]);
    dispatchCompanion({ type: 'ACTION_SUCCEEDED', xpGain: 10 });
  };

  const handleApprove = (req: ApprovalRequest, simulateTimeout = false) => {
    const now = new Date().toISOString();
    setApprovals((prev) => prev.filter((a) => a.approvalId !== req.approvalId));

    if (simulateTimeout) {
      setActions((prev) =>
        prev.map((a) =>
          a.actionId === req.actionId
            ? {
                ...a,
                state: 'UNKNOWN',
                updatedAt: now,
                summary: `${req.tool} timeout → requires reconciliation`,
                errorReason: 'GATEWAY_TIMEOUT_RECONCILE_REQUIRED',
              }
            : a
        )
      );
      dispatchCompanion({ type: 'ACTION_FAILED' });
      setApprovalModalOpen(false);
      return;
    }

    setActions((prev) =>
      prev.map((a) =>
        a.actionId === req.actionId
          ? {
              ...a,
              state: 'SUCCEEDED',
              updatedAt: now,
              summary: `${req.tool} approved & verified`,
            }
          : a
      )
    );
    dispatchCompanion({ type: 'ACTION_SUCCEEDED', xpGain: 12 });
    setApprovalModalOpen(false);
  };

  const handleReject = (req: ApprovalRequest) => {
    const now = new Date().toISOString();
    setApprovals((prev) => prev.filter((a) => a.approvalId !== req.approvalId));
    setActions((prev) =>
      prev.map((a) =>
        a.actionId === req.actionId
          ? { ...a, state: 'CANCELED', updatedAt: now, summary: `${req.tool} rejected by user` }
          : a
      )
    );
    setApprovalModalOpen(false);
  };

  const handleReconcileUnknown = (actionId: string) => {
    const now = new Date().toISOString();
    setActions((prev) =>
      prev.map((a) =>
        a.actionId === actionId
          ? {
              ...a,
              state: 'SUCCEEDED',
              updatedAt: now,
              errorReason: undefined,
              summary: `${a.tool} reconciled cleanly`,
            }
          : a
      )
    );
    dispatchCompanion({ type: 'ACTION_SUCCEEDED', xpGain: 5 });
  };

  const handleUnlockOrToggleItem = (itemId: string) => {
    const target = inventory.find((i) => i.itemId === itemId);
    if (!target) return;

    if (!target.owned) {
      if (companion.xp < target.costXp) return;
      setInventory((prev) =>
        prev.map((item) =>
          item.itemId === itemId ? { ...item, owned: true, equipped: true } : item
        )
      );
      dispatchCompanion({ type: 'SET_ANIMATION', cue: 'success' });
      return;
    }

    setInventory((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, equipped: !item.equipped } : item
      )
    );
  };

  const handleToggleConsent = (sourceId: ConsentSourceId) => {
    const now = new Date().toISOString();
    setConsents((prev) =>
      prev.map((c) =>
        c.sourceId === sourceId
          ? {
              ...c,
              allowed: !c.allowed,
              issuedAt: !c.allowed ? now : c.issuedAt,
              revokedAt: c.allowed ? now : null,
              version: c.version + 1,
            }
          : c
      )
    );
  };

  const handleGrantAllPhoneConsents = (allowAll: boolean) => {
    const now = new Date().toISOString();
    setConsents((prev) =>
      prev.map((c) => ({
        ...c,
        allowed: allowAll,
        issuedAt: allowAll ? now : c.issuedAt,
        revokedAt: allowAll ? null : now,
        version: c.version + 1,
      }))
    );
  };

  const handleDownloadPack = (packId: string) => {
    const pack = packs.find((p) => p.packId === packId);
    if (!pack || freeDiskMb < pack.sizeMb) return;
    setFreeDiskMb((d) => d - pack.sizeMb);
    setPacks((prev) =>
      prev.map((p) => (p.packId === packId ? { ...p, status: 'installed' } : p))
    );
  };

  const handleDeletePack = (packId: string) => {
    const pack = packs.find((p) => p.packId === packId);
    if (!pack || pack.status !== 'installed') return;
    setFreeDiskMb((d) => d + pack.sizeMb);
    setPacks((prev) =>
      prev.map((p) => (p.packId === packId ? { ...p, status: 'available' } : p))
    );
  };

  const handleExportData = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { settings, companion, reminders, memories, consents, actions, contacts, persona, health },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-life-companion-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetAll = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSettings(INITIAL_SETTINGS);
    setCompanion(INITIAL_COMPANION);
    setInventory(INITIAL_INVENTORY);
    setConsents(INITIAL_CONSENTS);
    setReminders(INITIAL_REMINDERS);
    setMemories(INITIAL_MEMORIES);
    setMessages(INITIAL_MESSAGES);
    setActions(INITIAL_ACTIONS);
    setApprovals([]);
    setPacks(INITIAL_PACKS);
    setFreeDiskMb(1850);
    setContacts(INITIAL_CONTACTS);
    setMessengerThreads(INITIAL_MESSENGER_THREADS);
    setSocialAssets(INITIAL_SOCIAL_ASSETS);
    setSocialDrafts(INITIAL_SOCIAL_DRAFTS);
    setHealth(INITIAL_HEALTH_STATE);
    setPersona(INITIAL_PERSONA_TRAINING);
  };

  const tNav = translations[settings.locale].nav;
  const calendarAllowed = consents.find((c) => c.sourceId === 'calendar')?.allowed ?? false;
  const usageAllowed = consents.find((c) => c.sourceId === 'usageStats')?.allowed ?? false;

  const navItems: { id: MainTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: tNav.home, icon: Home },
    { id: 'ai', label: tNav.ai, icon: MessageSquare },
    { id: 'insights', label: tNav.insights, icon: BarChart2 },
    { id: 'world', label: tNav.world, icon: Sparkles },
    { id: 'profile', label: tNav.profile, icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] dark:bg-[#0B0F17] text-[#0F172A] dark:text-[#F1F5F9]">
      {/* Global Incoming Call Floating Banner (if call ringing while modal closed) */}
      {activeCall && !superHubOpen && (
        <div className="bg-emerald-950 border-b border-emerald-500/50 text-white px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <PhoneIncoming className="w-4 h-4 text-emerald-400" />
              <span>
                {activeCall.status === 'ringing' ? 'Входящий звонок:' : 'На линии:'}{' '}
                {activeCall.contact.name} ({activeCall.contact.phone})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {activeCall.status === 'ringing' && (
                <button
                  type="button"
                  onClick={() => {
                    playSound('happy');
                    setActiveCall({ ...activeCall, status: 'connected' });
                    speakText('Голосовое согласие получено! Вызов принят.');
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Голосом: «Принять»</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveCall(null)}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Сбросить</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop & Mobile Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 text-left"
          >
            {translations[settings.locale].appName}
          </button>

          {/* Zone 2: 5 concise single-line nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-5" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === item.id
                    ? 'border-blue-600 text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Super-Phone Hub Button */}
            <button
              type="button"
              onClick={() => {
                setSuperHubTab('calls');
                setSuperHubOpen(true);
              }}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Звонки, Мессенджеры, Соцсети, Здоровье и Манера речи"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Функции телефона</span>
            </button>

            {/* Download Full Source ZIP & GitHub Sync */}
            <button
              type="button"
              onClick={() => setSourceDownloadOpen(true)}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Синхронизация с GitHub / GitLab, Свидетельство об авторстве и скачивание полного проекта (.ZIP)"
            >
              <HardDriveDownload className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub / Скачать .ZIP</span>
            </button>

            {/* Catalog of Design Versions */}
            <button
              type="button"
              onClick={() => setDesignShowcaseOpen(true)}
              className="min-h-[40px] hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors whitespace-nowrap shrink-0"
              title="Открыть каталог версий дизайна"
            >
              <Palette className="w-4 h-4" />
              <span>3D-Дизайны</span>
            </button>

            {/* Quick Dark/Light Theme Switcher */}
            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
              }
              aria-label="Сменить тему"
              className="min-h-[40px] inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setPhoneInstallModalOpen(true)}
              className="min-h-[40px] hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              title="Открыть на телефоне"
            >
              <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Runtime Strip */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {settings.airplaneMode
                ? 'Автономное Офлайн-ядро (Без интернета)'
                : 'Gemini 4 Argon · Online'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Автор: Петрашев Виктор Владимирович
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {companion.avatarId === 'lumi'
                ? 'Люми (3D)'
                : companion.avatarId === 'nova'
                  ? 'Нова (3D)'
                  : companion.avatarId === 'shadow'
                    ? 'Шэдоу (3D)'
                    : 'Компаньон'}{' '}
              Lvl {companion.level}
            </span>
            <span aria-hidden="true">·</span>

            {/* Quick Kazakhstan Services Triggers */}
            <button
              type="button"
              onClick={() => {
                setKzModalTab('emergency');
                setKzModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-700 dark:text-rose-400 font-semibold transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3 h-3" />
              <span>112 KZ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setKzModalTab('taxi');
                setKzModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold transition-colors cursor-pointer"
            >
              <Car className="w-3 h-3" />
              <span>Такси KZ</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setSettings((s) => ({ ...s, airplaneMode: !s.airplaneMode }))
            }
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            {settings.airplaneMode ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-teal-600" />
            )}
            <span>
              {settings.airplaneMode
                ? 'Режим без интернета (ВКЛ)'
                : 'Интернет активен (Переключить в Офлайн)'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10">
        {activeTab === 'home' && (
          <HomeView
            companion={companion}
            settings={settings}
            inventory={inventory}
            reminders={reminders}
            calendar={INITIAL_CALENDAR}
            calendarAllowed={calendarAllowed}
            approvals={approvals}
            isListening={isListening}
            partialTranscript={partialTranscript}
            messengerThreads={messengerThreads}
            health={health}
            persona={persona}
            onDispatchCompanion={dispatchCompanion}
            onRunCommand={handleRunCommand}
            onToggleVoice={handleToggleVoice}
            onCreateReminderForm={handleCreateReminderForm}
            onToggleReminder={(id) =>
              setReminders((prev) =>
                prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
              )
            }
            onDeleteReminder={(id) =>
              setReminders((prev) => prev.filter((r) => r.id !== id))
            }
            onNavigate={setActiveTab}
            onOpenApprovals={() => setApprovalModalOpen(true)}
            onGenerateDailyPlan={handleGenerateDailyPlan}
            onOpenSuperHub={(tab) => {
              setSuperHubTab(tab);
              setSuperHubOpen(true);
            }}
            onOpenSourceDownload={() => setSourceDownloadOpen(true)}
          />
        )}

        {activeTab === 'ai' && (
          <ChatView
            messages={messages}
            actions={actions}
            approvals={approvals}
            settings={settings}
            isStreaming={isStreaming}
            isListening={isListening}
            partialTranscript={partialTranscript}
            onSendMessage={handleRunCommand}
            onCancelStream={() => stopStreaming(true)}
            onToggleVoice={handleToggleVoice}
            onToggleMuteTts={() =>
              setSettings((s) => ({ ...s, ttsMuted: !s.ttsMuted }))
            }
            onToggleKillSwitch={() =>
              setSettings((s) => ({ ...s, killSwitchActive: !s.killSwitchActive }))
            }
            onApprove={handleApprove}
            onReject={handleReject}
            onReconcileUnknown={handleReconcileUnknown}
            onGenerateDailyPlan={handleGenerateDailyPlan}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            activity={INITIAL_ACTIVITY}
            usageAllowed={usageAllowed}
            settings={settings}
            companion={companion}
            reminders={reminders}
            onChangeWidgetType={(widgetType) =>
              setSettings((s) => ({ ...s, widgetType }))
            }
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'world' && (
          <WorldView
            companion={companion}
            settings={settings}
            inventory={inventory}
            onDispatchCompanion={dispatchCompanion}
            onUnlockOrToggleItem={handleUnlockOrToggleItem}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            settings={settings}
            companion={companion}
            memories={memories}
            consents={consents}
            integrations={INITIAL_INTEGRATIONS}
            packs={packs}
            freeDiskMb={freeDiskMb}
            onUpdateSettings={(patch) =>
              setSettings((s) => ({ ...s, ...patch }))
            }
            onAddMemory={(value, category) =>
              setMemories((prev) => [
                {
                  id: `mem-${Date.now().toString(36)}`,
                  category,
                  value,
                  source: 'Ручной ввод',
                  confidence: 1.0,
                  createdAt: new Date().toISOString(),
                  expiresAt: null,
                },
                ...prev,
              ])
            }
            onDeleteMemory={(id) =>
              setMemories((prev) => prev.filter((m) => m.id !== id))
            }
            onWipeMemory={() => setMemories([])}
            onToggleConsent={handleToggleConsent}
            onDownloadPack={handleDownloadPack}
            onDeletePack={handleDeletePack}
            onSimulate30Days={() =>
              dispatchCompanion({ type: 'SIMULATE_DAYS_AWAY', days: 30 })
            }
            onExportData={handleExportData}
            onResetAll={handleResetAll}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Approval Center Modal */}
      <ApprovalModal
        approvals={approvals}
        locale={settings.locale}
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Phone Install & QR Modal */}
      <PhoneInstallModal
        isOpen={phoneInstallModalOpen}
        onClose={() => setPhoneInstallModalOpen(false)}
        appUrl="https://ais-dev-l4uq56zoalc7yxvrsaaqng-209535223757.asia-southeast1.run.app"
      />

      {/* Design Versions Showcase Modal */}
      <DesignShowcaseModal
        isOpen={designShowcaseOpen}
        onClose={() => setDesignShowcaseOpen(false)}
        currentAvatar={companion.avatarId}
        currentTheme={settings.theme}
        companion={companion}
        settings={settings}
        onSelectDesign={(avatarId, theme) => {
          dispatchCompanion({ type: 'SWITCH_AVATAR', avatarId });
          setSettings((s) => ({ ...s, theme }));
          setDesignShowcaseOpen(false);
        }}
      />

      {/* Kazakhstan Emergency & Taxi Modal */}
      <KazakhstanServicesModal
        isOpen={kzModalOpen}
        onClose={() => setKzModalOpen(false)}
        defaultTab={kzModalTab}
        onExecuteTool={(_tool, detail) => {
          handleRunCommand(detail, 'text');
        }}
      />

      {/* Voice Command Sheet / Modal */}
      <VoiceCommandModal
        isOpen={isListening}
        isListening={isListening}
        transcript={partialTranscript}
        onClose={() => {
          setIsListening(false);
          setPartialTranscript('');
          dispatchCompanion({ type: 'SET_ANIMATION', cue: 'idle' });
        }}
        onExecuteVoiceCommand={(cmd) => {
          setIsListening(false);
          setPartialTranscript('');
          handleRunCommand(cmd, 'voice');
        }}
      />

      {/* Phone Super-Hub Modal (Calls, Messengers, Social Studio, Health, Persona 18+) */}
      <PhoneSuperHubModal
        isOpen={superHubOpen}
        activeTab={superHubTab}
        onChangeTab={setSuperHubTab}
        onClose={() => setSuperHubOpen(false)}
        airplaneMode={settings.airplaneMode}
        contacts={contacts}
        onAddContact={(name, relation, phone) =>
          setContacts((prev) => [
            ...prev,
            {
              id: `c-${Date.now().toString(36)}`,
              name,
              relation,
              phone,
              avatarColor: 'from-blue-500 to-indigo-600',
              favorite: false,
            },
          ])
        }
        activeCall={activeCall}
        onStartCall={(contact, direction) =>
          setActiveCall({
            contact,
            direction,
            status: direction === 'incoming' ? 'ringing' : 'connected',
            startedAt: new Date().toISOString(),
          })
        }
        onAnswerCall={() =>
          setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null))
        }
        onEndCall={() => setActiveCall(null)}
        messengerThreads={messengerThreads}
        onConfirmMessengerReply={(id, finalReplyText) => {
          setMessengerThreads((prev) =>
            prev.map((m) =>
              m.id === id
                ? { ...m, aiDraftReply: finalReplyText, sentReplyText: finalReplyText, status: 'sent' }
                : m
            )
          );
          dispatchCompanion({ type: 'ACTION_SUCCEEDED', xpGain: 10 });
        }}
        onUpdateMessengerDraft={(id, newDraft) => {
          setMessengerThreads((prev) =>
            prev.map((m) => (m.id === id ? { ...m, aiDraftReply: newDraft, status: 'pending_confirm' } : m))
          );
        }}
        onSimulateIncomingMessage={(app: MessengerApp, sender: string, text: string) => {
          const newId = `m-${Date.now().toString(36)}`;
          setMessengerThreads((prev) => [
            {
              id: newId,
              app,
              senderName: sender,
              senderHandle: '@incoming',
              incomingText: text,
              receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              aiDraftReply:
                persona.allowProfanity
                  ? `${sender}, принял! Скоро освобожусь и всё охрененно обсудим!`
                  : `Привет, ${sender}! Уже увидел сообщение, через 15 минут выйду на связь.`,
              status: 'pending_confirm',
            },
            ...prev,
          ]);
        }}
        socialAssets={socialAssets}
        onAddCustomMediaAsset={(asset) => setSocialAssets((prev) => [asset, ...prev])}
        socialDrafts={socialDrafts}
        onSaveSocialDraft={(draft) => setSocialDrafts((prev) => [draft, ...prev])}
        onPublishSocialDraft={() => dispatchCompanion({ type: 'ACTION_SUCCEEDED', xpGain: 15 })}
        health={health}
        onUpdateHealth={(patch) => setHealth((prev) => ({ ...prev, ...patch }))}
        persona={persona}
        onUpdatePersona={(patch) => setPersona((prev) => ({ ...prev, ...patch }))}
        consents={consents}
        onToggleConsent={handleToggleConsent}
        onGrantAllPhoneConsents={handleGrantAllPhoneConsents}
        onSpeakText={speakText}
      />

      {/* Full Local Project ZIP Download Modal */}
      <SourceDownloadModal
        isOpen={sourceDownloadOpen}
        onClose={() => setSourceDownloadOpen(false)}
      />
    </div>
  );
}
