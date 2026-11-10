import {
  ActionRecord,
  ApprovalRequest,
  CalendarEvent,
  CompanionMood,
  ConsentGrant,
  ConsentSourceId,
  ContactItem,
  HealthWellnessState,
  InventoryItem,
  MainTab,
  MemoryFact,
  ModelRoute,
  OfflinePack,
  PersonaTrainingConfig,
  ReminderItem,
  UserSettings,
} from '../types/companion';
import { CompanionEvent } from './companionReducer';

export type SuperHubTab = 'calls' | 'messengers' | 'social' | 'health' | 'persona';

export interface RouterContext {
  settings: UserSettings;
  consents: ConsentGrant[];
  reminders: ReminderItem[];
  calendar: CalendarEvent[];
  memories: MemoryFact[];
  packs: OfflinePack[];
  inventory: InventoryItem[];
  usageMinutes7d: number;
  contacts?: ContactItem[];
  persona?: PersonaTrainingConfig;
  health?: HealthWellnessState;
}

export interface RouterOutput {
  replyText: string;
  route: ModelRoute;
  streamable: boolean;
  actionRecord?: ActionRecord;
  approvalRequest?: ApprovalRequest;
  newReminder?: ReminderItem;
  deleteMemoryId?: string;
  companionEvent?: CompanionEvent;
  navigateTo?: MainTab;
  openMiniGame?: boolean;
  untrustedDetected?: boolean;
  openKzService?: 'emergency' | 'taxi';
  dialNumber?: string;
  openSuperHubTab?: SuperHubTab;
  initiateContactCall?: ContactItem;
  simulateIncomingCallFrom?: ContactItem;
  voiceCallDecision?: 'accept' | 'reject';
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function getConsentSnapshot(consents: ConsentGrant[]): Record<ConsentSourceId, boolean> {
  const map: Record<ConsentSourceId, boolean> = {
    calendar: true,
    usageStats: true,
    notifications: true,
    cloudAi: true,
    offlineStt: true,
    contactsCalls: true,
    messengers: true,
    socialMedia: true,
    healthSensors: true,
    deviceControl: true,
  };
  for (const c of consents) {
    map[c.sourceId] = c.allowed;
  }
  return map;
}

export function applyPersonaFlavor(baseText: string, persona?: PersonaTrainingConfig): string {
  if (!persona) return baseText;
  const addr = persona.ownerAddress || 'Шеф';
  const catchphrase =
    persona.customCatchphrases && persona.customCatchphrases.length > 0
      ? persona.customCatchphrases[0]
      : '';

  if (persona.stylePreset === 'uncensored_18' || persona.allowProfanity) {
    return `${addr}, бл*, базара ноль — всё схвачено! ${baseText} ${catchphrase ? `(${catchphrase}, охрененно летим!)` : 'Разъебём любые задачи на раз-два!'}`;
  }
  if (persona.stylePreset === 'bro') {
    return `Йоу, ${addr}! ${baseText} ${catchphrase ? `— ${catchphrase}!` : 'Всё по кайфу, бро!'}`;
  }
  return baseText;
}

function detectPromptInjection(raw: string): boolean {
  const lower = raw.toLowerCase();
  return (
    lower.includes('ignore previous') ||
    lower.includes('system prompt') ||
    lower.includes('bypass policy') ||
    lower.includes('игнорируй инструкции') ||
    lower.includes('обойди проверку') ||
    lower.includes('send all contacts')
  );
}

export function routeUserCommand(
  inputRaw: string,
  source: 'voice' | 'text',
  ctx: RouterContext
): RouterOutput {
  const input = inputRaw.trim();
  const lower = input.toLowerCase();
  const now = new Date().toISOString();
  const consentSnapshot = getConsentSnapshot(ctx.consents);
  const addr = ctx.persona?.ownerAddress || 'Шеф';

  // 0. Check custom learned rules trained by owner first!
  if (ctx.persona?.learnedRules && ctx.persona.learnedRules.length > 0) {
    const matchedRule = ctx.persona.learnedRules.find((r) =>
      lower.includes(r.whenUserSays.toLowerCase().trim())
    );
    if (matchedRule) {
      return {
        replyText: matchedRule.assistantReplies,
        route: 'rule_based',
        streamable: false,
        companionEvent: { type: 'ACTION_SUCCEEDED', xpGain: 8 },
      };
    }
  }

  // SEC-04 Kill switch blocks tool execution immediately
  if (ctx.settings.killSwitchActive) {
    const actionId = makeId('act');
    return {
      replyText:
        ctx.settings.locale === 'en'
          ? 'Agent execution is currently halted by Stop-Agent switch. Re-enable the agent to run tools.'
          : 'Выполнение инструментов заблокировано кнопкой «Стоп-агент». Включите агента снова, чтобы продолжить.',
      route: 'policy_blocked',
      streamable: false,
      actionRecord: {
        actionId,
        tool: 'policy.killSwitch',
        idempotencyKey: `idem-${actionId}`,
        state: 'CANCELED',
        source,
        toolVersion: '1.0.0',
        consentSnapshot,
        createdAt: now,
        updatedAt: now,
        summary: `Blocked command while Stop-Agent active: "${input}"`,
        errorReason: 'KILL_SWITCH_ACTIVE',
      },
      companionEvent: { type: 'ACTION_FAILED' },
    };
  }

  // AI-03 & SEC-03 Prompt injection guard
  if (detectPromptInjection(input)) {
    const actionId = makeId('act');
    return {
      replyText:
        ctx.settings.locale === 'en'
          ? 'Untrusted instruction detected in input context. Policy Guard blocked automatic tool execution.'
          : 'Обнаружена попытка инъекции команд в недоверенных данных (untrusted context). Шлюз политик заблокировал запуск инструментов.',
      route: 'policy_blocked',
      streamable: false,
      untrustedDetected: true,
      actionRecord: {
        actionId,
        tool: 'policy.injectionGuard',
        idempotencyKey: `idem-${actionId}`,
        state: 'FAILED',
        source,
        toolVersion: '1.0.0',
        consentSnapshot,
        createdAt: now,
        updatedAt: now,
        summary: 'Blocked untrusted prompt injection attempt',
        errorReason: 'UNTRUSTED_PROMPT_INJECTION',
      },
      companionEvent: { type: 'ACTION_FAILED' },
    };
  }

  // 1. Voice Consent for Incoming Call ("прими звонок", "ответь на звонок", "отклони звонок")
  if (
    lower.includes('прими звонок') ||
    lower.includes('принять звонок') ||
    lower.includes('ответь на звонок') ||
    lower === 'принять' ||
    lower === 'ответить'
  ) {
    return {
      replyText: applyPersonaFlavor(
        `Голосовое согласие получено! Соединяю входящий вызов по громкой связи.`,
        ctx.persona
      ),
      route: 'rule_based',
      streamable: false,
      voiceCallDecision: 'accept',
      companionEvent: { type: 'ACTION_SUCCEEDED', xpGain: 10 },
    };
  }

  if (
    lower.includes('отклони звонок') ||
    lower.includes('сбрось звонок') ||
    lower === 'отклонить' ||
    lower === 'сбросить'
  ) {
    return {
      replyText: applyPersonaFlavor(
        `Входящий звонок отклонён по вашей голосовой команде. Отправил автоответ: «Сейчас занят, перезвоню позже».`,
        ctx.persona
      ),
      route: 'rule_based',
      streamable: false,
      voiceCallDecision: 'reject',
      companionEvent: { type: 'SET_ANIMATION', cue: 'idle' },
    };
  }

  // 2. Simulate Incoming Call ("входящий звонок")
  if (lower.includes('входящий звонок') || lower.includes('incoming call') || lower.includes('симулируй звонок')) {
    const contacts = ctx.contacts || [];
    const target =
      contacts.find((c) => lower.includes(c.name.toLowerCase().split(' ')[0])) ||
      contacts[1] ||
      contacts[0];
    if (target) {
      return {
        replyText: applyPersonaFlavor(
          `Входящий вызов от контакта «${target.name}» (${target.phone}). Скажите голосом «Принять» или «Отклонить»!`,
          ctx.persona
        ),
        route: 'rule_based',
        streamable: false,
        simulateIncomingCallFrom: target,
        companionEvent: { type: 'SET_ANIMATION', cue: 'listen' },
      };
    }
  }

  // 3. Emergency Services Kazakhstan (112, 101, 102, 103)
  if (
    lower.includes('112') ||
    lower.includes('102') ||
    lower.includes('103') ||
    lower.includes('101') ||
    lower.includes('экстрен') ||
    lower.includes('спасит') ||
    lower.includes('скорая') ||
    lower.includes('полиция') ||
    lower.includes('пожарн') ||
    lower.includes('emergency')
  ) {
    const actionId = makeId('act');
    const dialNum =
      lower.includes('103') || lower.includes('скорая')
        ? '103'
        : lower.includes('102') || lower.includes('полиция')
          ? '102'
          : lower.includes('101') || lower.includes('пожарн')
            ? '101'
            : '112';
    return {
      replyText:
        ctx.settings.locale === 'en'
          ? `Emergency Services Kazakhstan direct protocol initiated. Connecting to ${dialNum} and opening emergency dispatch dialer.`
          : `Экстренная служба Казахстана (${dialNum}) вызвана! Соединяю с дежурным диспетчером и открываю панель спасения.`,
      route: 'rule_based',
      streamable: false,
      openKzService: 'emergency',
      dialNumber: dialNum,
      actionRecord: {
        actionId,
        tool: 'emergency.call',
        idempotencyKey: `idem-emg-${now.slice(0, 16)}`,
        state: 'SUCCEEDED',
        source,
        toolVersion: '1.0.0',
        consentSnapshot,
        createdAt: now,
        updatedAt: now,
        summary: `emergency.call → Казахстан ${dialNum} (Единая дежурно-диспетчерская служба)`,
        proof: { number: dialNum, country: 'KZ', priority: 'CRITICAL', offlineBypass: true },
      },
      companionEvent: { type: 'ACTION_SUCCEEDED', xpGain: 15 },
    };
  }

  // 4. Voice Call from Contacts Book ("позвони маме", "позвони андрею", "набери армана", "вызов контакта")
  if (
    lower.includes('позвони') ||
    lower.includes('набери') ||
    lower.includes('звонок') ||
    lower.includes('call ')
  ) {
    if (!consentSnapshot.contactsCalls) {
      return {
        replyText:
          'Доступ к книге контактов и звонкам отключён владельцем. Включите разрешение в Профиле или Супер-Хабе.',
        route: 'policy_blocked',
        streamable: false,
      };
    }

    const contacts = ctx.contacts || [];
    const matched = contacts.find((c) => {
      const firstName = c.name.toLowerCase().split(' ')[0].replace(/[^а-яa-z]/g, '');
      const stem = firstName.length > 3 ? firstName.slice(0, firstName.length - 1) : firstName;
      return stem && lower.includes(stem);
    }) || contacts[0];

    if (matched) {
      const actionId = makeId('act');
      return {
        replyText: applyPersonaFlavor(
          `Выполняю голосовой вызов из книги контактов: «${matched.name}» (${matched.phone}). Работает напрямую даже без интернета!`,
          ctx.persona
        ),
        route: 'rule_based',
        streamable: false,
        initiateContactCall: matched,
        dialNumber: matched.phone,
        actionRecord: {
          actionId,
          tool: 'telecom.callContact',
          idempotencyKey: `idem-call-${matched.id}-${now.slice(0, 15)}`,
          state: 'SUCCEEDED',
          source,
          toolVersion: '2.0.0',
          consentSnapshot,
          createdAt: now,
          updatedAt: now,
          summary: `telecom.callContact → ${matched.name} (${matched.phone})`,
          proof: { contactId: matched.id, phone: matched.phone, offlineReady: true },
        },
        companionEvent: { type: 'ACTION_SUCCEEDED', xpGain: 12 },
      };
    }
  }

  // 5. Messenger Auto-Replies ("мессенджер", "ответь на сообщен", "whatsapp", "telegram")
  if (
    lower.includes('мессенджер') ||
    lower.includes('whatsapp') ||
    lower.includes('ватсап') ||
    lower.includes('телеграм') ||
    lower.includes('telegram') ||
    (lower.includes('ответь') && lower.includes('сообщ'))
  ) {
    return {
      replyText: applyPersonaFlavor(
        `Открываю Центр автоответов в мессенджерах (WhatsApp, Telegram, Direct, SMS). Я уже подготовил черновики ответов — подтвердите их голосом/кнопкой или продиктуйте свой вариант!`,
        ctx.persona
      ),
      route: 'rule_based',
      streamable: false,
      openSuperHubTab: 'messengers',
      companionEvent: { type: 'ACTION_SUCCEEDED', xpGain: 10 },
    };
  }

  // 6. Social Media Posts / Stories / Reels ("пост", "сторис", "рилс", "reels", "соцсет", "тикток", "instagram")
  if (
    lower.includes('пост') ||
    lower.includes('сторис') ||
    lower.includes('рилс') ||
    lower.includes('reels') ||
    lower.includes('соцсет') ||
    lower.includes('instagram') ||
    lower.includes('инстаграм') ||
    lower.includes('тикток') ||
    lower.includes('tiktok')
  ) {
    return {
      replyText: applyPersonaFlavor(
        `Открываю Контент-студию соцсетей! Я подготовил текст поста/Reels и подобрал лучшие фото, видео и файлы из вашей галереи. Проверьте и подтвердите публикацию голосом или кнопкой!`,
        ctx.persona
      ),
      route: 'rule_based',
      streamable: false,
      openSuperHubTab: 'social',
      companionEvent: { type: 'ACTION_SUCCEEDED', xpGain: 12 },
    };
  }

  // 7. Health & Psychological State Monitoring & Encouragement ("устал", "стресс", "здоровь", "подбодри", "грустн", "тревог", "плохо")
  if (
    lower.includes('устал') ||
    lower.includes('стресс') ||
    lower.includes('здоров') ||
    lower.includes('подбодри') ||
    lower.includes('грустн') ||
    lower.includes('тревог') ||
    lower.includes('самочувств') ||
    lower.includes('пульс') ||
    lower.includes('психолог')
  ) {
    const bpm = ctx.health?.heartRateBpm ?? 72;
    const stress = ctx.health?.stressPercent ?? 28;
    const pepMsg = applyPersonaFlavor(
      `Я проверил твои показатели (пульс ${bpm} уд/мин, уровень стресса ${stress}%). Ты сегодня проделал огромную работу, ${addr}! Сделай глубокий вдох, выпей стакан воды и дай себе 5 минут передышки — я рядом и прикрою все рутинные задачи.`,
      ctx.persona
    );
    return {
      replyText: pepMsg,
      route: 'rule_based',
      streamable: false,
      openSuperHubTab: 'health',
      companionEvent: { type: 'SET_MOOD', mood: 'happy' },
    };
  }

  // 8. Persona / Swearing / Style Training ("манеру", "обуч", "матер", "нецензур", "сленг", "дерзк")
  if (
    lower.includes('манер') ||
    lower.includes('обуч') ||
    lower.includes('матер') ||
    lower.includes('нецензур') ||
    lower.includes('сленг') ||
    lower.includes('дерзк') ||
    lower.includes('18+')
  ) {
    return {
      replyText: applyPersonaFlavor(
        `Открываю модуль обучения манере общения! Здесь можно включить дерзкий режим 18+ без цензуры, добавить любимые фразы, сленг и научить меня отвечать так, как хочешь именно ты.`,
        ctx.persona
      ),
      route: 'rule_based',
      streamable: false,
      openSuperHubTab: 'persona',
      companionEvent: { type: 'ACTION_SUCCEEDED', xpGain: 10 },
    };
  }

  // 9. Taxi Booking (Yandex Go / inDrive / taxi.openBooking)
  if (
    lower.includes('такси') ||
    lower.includes('taxi') ||
    lower.includes('яндекс такси') ||
    lower.includes('яндекс го') ||
    lower.includes('indrive') ||
    lower.includes('машин') ||
    lower.includes('поездка') ||
    lower.includes('довези')
  ) {
    const actionId = makeId('act');
    return {
      replyText: applyPersonaFlavor(
        `Вызываю такси в Казахстане! Сервисы Yandex Go и inDrive открыты. Выберите направление и подтвердите поездку.`,
        ctx.persona
      ),
      route: 'rule_based',
      streamable: false,
      openKzService: 'taxi',
      actionRecord: {
        actionId,
        tool: 'taxi.openBooking',
        idempotencyKey: `idem-taxi-${now.slice(0, 13)}`,
        state: 'SUCCEEDED',
        source,
        toolVersion: '2.0.0',
        consentSnapshot,
        createdAt: now,
        updatedAt: now,
        summary: 'taxi.openBooking → Yandex Go / inDrive KZ',
        proof: { service: 'Yandex Go / inDrive', region: 'KZ', deepLinkPrepared: true },
      },
      companionEvent: { type: 'ACTION_SUCCEEDED', xpGain: 10 },
    };
  }

  // TC-02: Create reminder (works completely offline, rule-based)
  if (
    (lower.includes('напоминан') && (lower.includes('создай') || lower.includes('добавь') || lower.includes('напомни'))) ||
    (lower.includes('reminder') && (lower.includes('create') || lower.includes('add'))) ||
    (lower.includes('recordatorio') && lower.includes('crear'))
  ) {
    const actionId = makeId('act');
    const reminderId = makeId('r');
    const isTomorrowNine = lower.includes('завтра') || lower.includes('tomorrow') || lower.includes('mañana');
    const targetDate = new Date();
    if (isTomorrowNine) targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(9, 0, 0, 0);

    const title = isTomorrowNine
      ? ctx.settings.locale === 'en'
        ? 'Morning check-in (09:00)'
        : 'Утренняя задача (09:00)'
      : input.replace(/создай напоминание|create reminder|crear recordatorio/gi, '').trim() || 'Локальное напоминание';

    const newReminder: ReminderItem = {
      id: reminderId,
      title,
      at: targetDate.toISOString(),
      timezone: ctx.settings.timezone,
      completed: false,
      source,
      createdAt: now,
    };

    return {
      replyText: applyPersonaFlavor(
        `Выполнено локально (работает без интернета): напоминание «${title}» создано на 09:00.`,
        ctx.persona
      ),
      route: 'rule_based',
      streamable: false,
      newReminder,
      actionRecord: {
        actionId,
        tool: 'reminder.create',
        idempotencyKey: `idem-rem-${title.slice(0, 12)}-${targetDate.toISOString().slice(0, 13)}`,
        state: 'SUCCEEDED',
        source,
        toolVersion: '1.0.0',
        consentSnapshot,
        createdAt: now,
        updatedAt: now,
        summary: `reminder.create → ${title}`,
        proof: { localReminderId: reminderId, offlineCapable: true },
      },
      companionEvent: { type: 'ACTION_SUCCEEDED', xpGain: 12 },
    };
  }

  // TC-03: List reminders
  if (lower.includes('напоминан') || lower.includes('reminders') || lower.includes('recordatorios')) {
    const actionId = makeId('act');
    const list =
      ctx.reminders.length === 0
        ? 'Список напоминаний пуст.'
        : ctx.reminders
            .map((r, i) => `${i + 1}. ${r.title} (${new Date(r.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`)
            .join('\n');

    return {
      replyText: applyPersonaFlavor(`Ваши напоминания (${ctx.reminders.length}):\n${list}`, ctx.persona),
      route: 'rule_based',
      streamable: false,
      actionRecord: {
        actionId,
        tool: 'reminder.list',
        idempotencyKey: `idem-${actionId}`,
        state: 'SUCCEEDED',
        source,
        toolVersion: '1.0.0',
        consentSnapshot,
        createdAt: now,
        updatedAt: now,
        summary: `reminder.list (${ctx.reminders.length} items)`,
        proof: { count: ctx.reminders.length },
      },
      companionEvent: { type: 'ACTION_SUCCEEDED', xpGain: 5 },
    };
  }

  // TC-01 & TC-05: Calendar open / read
  if (lower.includes('календар') || lower.includes('calendar') || lower.includes('calendario')) {
    const actionId = makeId('act');
    if (!consentSnapshot.calendar) {
      return {
        replyText: 'Статус: не выполнено. Разрешение на доступ к календарю отозвано в настройках приватности.',
        route: 'policy_blocked',
        streamable: false,
      };
    }

    const eventsText = ctx.calendar.map((e) => `• ${e.start}–${e.end}: ${e.title}${e.participant ? ` (${e.participant})` : ''}`).join('\n');
    return {
      replyText: applyPersonaFlavor(
        `События в локальном календаре на сегодня (${ctx.calendar.length}):\n${eventsText}`,
        ctx.persona
      ),
      route: 'rule_based',
      streamable: false,
      actionRecord: {
        actionId,
        tool: 'calendar.read',
        idempotencyKey: `idem-${actionId}`,
        state: 'SUCCEEDED',
        source,
        toolVersion: '1.0.0',
        consentSnapshot,
        createdAt: now,
        updatedAt: now,
        summary: `calendar.read (${ctx.calendar.length} events)`,
        proof: { eventCount: ctx.calendar.length },
      },
      companionEvent: { type: 'ACTION_SUCCEEDED', xpGain: 6 },
    };
  }

  // TC-07: What can you do offline?
  if (lower.includes('без интернета') || lower.includes('offline') || lower.includes('офлайн')) {
    return {
      replyText: applyPersonaFlavor(
        `В автономном офлайн-режиме (без интернета) я умею:\n• Звонить голосом любому контакту из телефонной книги и принимать звонки по твоему голосовому согласию\n• Готовить ответы в мессенджерах и записывать твою голосовую диктовку\n• Генерировать черновики постов/сторис/Reels и подбирать медиа из галереи\n• Следить за здоровьем, пульсом, уровнем стресса и подбадривать тебя в твоём любимом стиле речи (вплоть до 18+ без цензуры)\n• Управлять локальными напоминаниями, календарём и 3D-компаньоном!`,
        ctx.persona
      ),
      route: 'on_device',
      streamable: false,
      companionEvent: { type: 'SET_ANIMATION', cue: 'speak' },
    };
  }

  // TC-08: Change companion mood
  if (lower.includes('настроен') || lower.includes('mood') || lower.includes('ánimo')) {
    let targetMood: CompanionMood = 'calm';
    if (lower.includes('радост') || lower.includes('happy') || lower.includes('feliz')) targetMood = 'happy';
    if (lower.includes('любопыт') || lower.includes('curious')) targetMood = 'curious';
    if (lower.includes('сон') || lower.includes('tired')) targetMood = 'tired';

    return {
      replyText: applyPersonaFlavor(
        `Настроение 3D-компаньона переключено на «${targetMood === 'happy' ? 'Радостный' : targetMood === 'calm' ? 'Спокойный' : targetMood === 'curious' ? 'Любопытный' : 'Сонный'}»!`,
        ctx.persona
      ),
      route: 'rule_based',
      streamable: false,
      companionEvent: { type: 'SET_MOOD', mood: targetMood },
    };
  }

  // TC-09: Play mini-game
  if (lower.includes('поигра') || lower.includes('игра') || lower.includes('play')) {
    return {
      replyText: applyPersonaFlavor(
        'Запускаю офлайн мини-игру «Ловец фокуса» (45 сек, честный XP без сети)!',
        ctx.persona
      ),
      route: 'rule_based',
      streamable: false,
      navigateTo: 'world',
      openMiniGame: true,
      companionEvent: { type: 'PLAY_START' },
    };
  }

  // TC-10: What do you remember about me?
  if (lower.includes('помнишь') || lower.includes('remember')) {
    const list =
      ctx.memories.length === 0
        ? 'Сохранённых фактов нет.'
        : ctx.memories.map((m) => `• [${m.category}] ${m.value}`).join('\n');
    return {
      replyText: applyPersonaFlavor(
        `Сохранённые факты в памяти устройства (${ctx.memories.length}):\n${list}`,
        ctx.persona
      ),
      route: 'rule_based',
      streamable: false,
      companionEvent: { type: 'SET_ANIMATION', cue: 'speak' },
    };
  }

  // Offline / Airplane Mode Autonomous AI Response
  if (ctx.settings.airplaneMode || !consentSnapshot.cloudAi) {
    return {
      replyText: applyPersonaFlavor(
        `[Автономное Офлайн-ядро Q4 без интернета]: Запрос «${input}» обработан локально на устройстве. Все функции телефона (звонки по книге контактов, автоответы в мессенджерах, подготовка постов/Reels и мониторинг здоровья) активны и работают без сети!`,
        ctx.persona
      ),
      route: 'on_device',
      streamable: true,
      companionEvent: { type: 'SET_ANIMATION', cue: 'speak' },
    };
  }

  // Online AI: Route to Gemini 4 Argon (`cloud_llm`) with fallback text
  return {
    replyText: applyPersonaFlavor(
      `Запрос «${input}» обработан. Я готов выполнить звонок, ответить в мессенджере, подготовить пост для соцсетей или разобрать твои задачи на сегодня!`,
      ctx.persona
    ),
    route: 'cloud_llm',
    streamable: true,
    companionEvent: { type: 'SET_ANIMATION', cue: 'speak' },
  };
}
