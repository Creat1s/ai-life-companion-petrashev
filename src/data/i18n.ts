import { Locale } from '../types/companion';

export const translations: Record<Locale, {
  appName: string;
  nav: {
    home: string;
    ai: string;
    insights: string;
    world: string;
    profile: string;
    approvals: string;
  };
  modes: {
    offlineBasic: string;
    offlineVoice: string;
    offlineAi: string;
    onlineAi: string;
    killSwitch: string;
  };
  home: {
    heroSubtitle: string;
    feed: string;
    pet: string;
    sleep: string;
    play: string;
    voiceCta: string;
    listening: string;
    commandPlaceholder: string;
    send: string;
    remindersTitle: string;
    addReminder: string;
    reminderTitlePlaceholder: string;
    createOffline: string;
    calendarTitle: string;
    noAccessCalendar: string;
    grantInProfile: string;
    pendingApprovalBanner: string;
    reviewNow: string;
    moodLabel: string;
    energyLabel: string;
    bondLabel: string;
    levelLabel: string;
    xpLabel: string;
    noPunishmentNote: string;
  };
  ai: {
    title: string;
    subtitle: string;
    testCommandsTitle: string;
    injectionTest: string;
    cancelStream: string;
    stopAgent: string;
    resumeAgent: string;
    approvalsTab: string;
    auditTab: string;
    chatTab: string;
    voiceModeHint: string;
    partialTranscript: string;
    muteTts: string;
    unmuteTts: string;
    noApprovals: string;
    approve: string;
    reject: string;
    simulateTimeout: string;
    reconcileUnknown: string;
  };
  insights: {
    title: string;
    subtitle: string;
    today: string;
    days7: string;
    days30: string;
    noAccessTitle: string;
    noAccessBody: string;
    sourceLabel: string;
    coverageLabel: string;
    updatedLabel: string;
    observationNote: string;
    widgetTitle: string;
    widgetSubtitle: string;
    widgetQuick: string;
    widgetCompanion: string;
    widgetTasks: string;
  };
  world: {
    title: string;
    subtitle: string;
    avatarsTitle: string;
    switchNoLoss: string;
    moodTitle: string;
    roomTitle: string;
    wardrobeTitle: string;
    equip: string;
    unequip: string;
    unlock: string;
    owned: string;
    miniGameTitle: string;
    miniGameDesc: string;
    startGame: string;
    pauseGame: string;
    resumeGame: string;
    score: string;
    highScore: string;
    timeLeft: string;
  };
  profile: {
    title: string;
    subtitle: string;
    memoryTitle: string;
    addFactPlaceholder: string;
    addFact: string;
    wipeMemory: string;
    consentsTitle: string;
    integrationsTitle: string;
    packsTitle: string;
    freeDisk: string;
    download: string;
    deletePack: string;
    deviceQaTitle: string;
    airplaneMode: string;
    batterySaver: string;
    lowMemory: string;
    reducedMotion: string;
    simulate30Days: string;
    exportJson: string;
    resetAll: string;
    language: string;
    theme: string;
  };
  moods: {
    happy: string;
    calm: string;
    curious: string;
    tired: string;
  };
}> = {
  ru: {
    appName: 'Life Companion',
    nav: {
      home: 'Главная',
      ai: 'Ассистент',
      insights: 'Аналитика',
      world: 'Мир',
      profile: 'Профиль',
      approvals: 'Одобрения',
    },
    modes: {
      offlineBasic: 'Offline Basic',
      offlineVoice: 'Offline Voice',
      offlineAi: 'Offline AI',
      onlineAi: 'Online AI',
      killSwitch: 'Агент остановлен',
    },
    home: {
      heroSubtitle: 'Ваш умный голосовой и текстовый помощник на каждый день',
      feed: 'Покормить',
      pet: 'Погладить',
      sleep: 'Отдых',
      play: 'Играть',
      voiceCta: 'Голосом',
      listening: 'Слушаю...',
      commandPlaceholder: 'Введите команду, например: Создай напоминание завтра в девять',
      send: 'Выполнить',
      remindersTitle: 'Мои задачи и напоминания',
      addReminder: 'Добавить',
      reminderTitlePlaceholder: 'Например: Позвонить Андрею',
      createOffline: 'Быстрое создание задач на день',
      calendarTitle: 'Расписание на сегодня',
      noAccessCalendar: 'Нет доступа к календарю',
      grantInProfile: 'Настроить доступ',
      pendingApprovalBanner: 'Действия ожидают вашего подтверждения',
      reviewNow: 'Подтвердить действие',
      moodLabel: 'Настроение',
      energyLabel: 'Энергия',
      bondLabel: 'Дружба',
      levelLabel: 'Уровень',
      xpLabel: 'Опыт',
      noPunishmentNote: 'Никаких штрафов за паузы: ваш прогресс всегда в безопасности.',
    },
    ai: {
      title: 'Умный Диалог и Голосовой Помощник',
      subtitle: 'Живое общение, помощь в делах, составление планов и выполнение поручений',
      testCommandsTitle: 'Быстрые сценарии и команды',
      injectionTest: 'Тест безопасности',
      cancelStream: 'Остановить ответ',
      stopAgent: 'Пауза помощника',
      resumeAgent: 'Включить помощника',
      approvalsTab: 'Подтверждения',
      auditTab: 'История команд',
      chatTab: 'Диалог',
      voiceModeHint: 'Говорите свободно — помощник поймёт вашу просьбу.',
      partialTranscript: 'Распознавание речи',
      muteTts: 'Выкл. озвучку',
      unmuteTts: 'Вкл. озвучку',
      noApprovals: 'Все поручения выполнены, новых запросов нет.',
      approve: 'Подтвердить и выполнить',
      reject: 'Отклонить',
      simulateTimeout: 'Проверка связи',
      reconcileUnknown: 'Обновить статус',
    },
    insights: {
      title: 'Баланс Времени и Полезные Привычки',
      subtitle: 'Наглядная статистика вашего дня, фокуса и отдыха',
      today: 'Сегодня',
      days7: '7 дней',
      days30: '30 дней',
      noAccessTitle: 'Статистика экранного времени отключена',
      noAccessBody: 'Включите доступ к статистике в настройках, чтобы видеть баланс дня.',
      sourceLabel: 'Категории',
      coverageLabel: 'Точность',
      updatedLabel: 'Обновлено',
      observationNote: 'Приватная сводка для вашего личного комфорта и продуктивности.',
      widgetTitle: 'Виджет быстрого доступа',
      widgetSubtitle: 'Выберите удобный формат карточки для главного экрана',
      widgetQuick: 'Быстрое действие',
      widgetCompanion: 'Статус компаньона',
      widgetTasks: 'Сводка задач',
    },
    world: {
      title: 'Мир 3D-Компаньона',
      subtitle: 'Выберите героя, настройте уютную атмосферу комнаты, гардероб и сыграйте в мини-игру',
      avatarsTitle: 'Выберите своего 3D-героя',
      switchNoLoss: 'При смене героя ваш уровень, опыт и открытые аксессуары сохраняются',
      moodTitle: 'Настроение',
      roomTitle: 'Освещение и атмосфера',
      wardrobeTitle: 'Гардероб и аксессуары',
      equip: 'Надеть',
      unequip: 'Снять',
      unlock: 'Открыть',
      owned: 'В коллекции',
      miniGameTitle: 'Мини-игра: Ловец фокуса',
      miniGameDesc: 'Тренируйте внимание и зарабатывайте бонусный опыт XP для аксессуаров',
      startGame: 'Начать игру',
      pauseGame: 'Пауза',
      resumeGame: 'Продолжить',
      score: 'Счёт',
      highScore: 'Рекорд',
      timeLeft: 'Осталось',
    },
    profile: {
      title: 'Настройки, Память и Персонализация',
      subtitle: 'Управление предпочтениями, памятью помощника и разрешениями',
      memoryTitle: 'Что помощник помнит о вас',
      addFactPlaceholder: 'Добавить заметку (например: Люблю утренние пробежки)',
      addFact: 'Сохранить',
      wipeMemory: 'Очистить список',
      consentsTitle: 'Разрешения и приватность',
      integrationsTitle: 'Подключённые сервисы',
      packsTitle: 'Голосовые и языковые пакеты',
      freeDisk: 'Свободно памяти',
      download: 'Скачать',
      deletePack: 'Удалить',
      deviceQaTitle: 'Дополнительные параметры режима',
      airplaneMode: 'Автономный режим (офлайн)',
      batterySaver: 'Беречь заряд батареи',
      lowMemory: 'Лёгкий режим графики',
      reducedMotion: 'Плавные спокойные движения',
      simulate30Days: 'Симулировать +30 дней отсутствия',
      exportJson: 'Экспорт резервной копии',
      resetAll: 'Сбросить настройки по умолчанию',
      language: 'Язык приложения',
      theme: 'Тема оформления',
    },
    moods: {
      happy: 'Радостный',
      calm: 'Спокойный',
      curious: 'Любопытный',
      tired: 'Сонный',
    },
  },
  en: {
    appName: 'Life Companion',
    nav: {
      home: 'Home',
      ai: 'AI',
      insights: 'Insights',
      world: 'World',
      profile: 'Profile',
      approvals: 'Approvals',
    },
    modes: {
      offlineBasic: 'Offline Basic',
      offlineVoice: 'Offline Voice',
      offlineAi: 'Offline AI',
      onlineAi: 'Online AI',
      killSwitch: 'Agent Halted',
    },
    home: {
      heroSubtitle: 'Offline-capable companion & policy-guarded action agent',
      feed: 'Feed',
      pet: 'Pet',
      sleep: 'Rest',
      play: 'Play',
      voiceCta: 'Voice (Push-to-Talk)',
      listening: 'Listening...',
      commandPlaceholder: 'Type a command, e.g.: Create reminder tomorrow at nine',
      send: 'Run',
      remindersTitle: 'Reminders (Offline Ready)',
      addReminder: 'Add',
      reminderTitlePlaceholder: 'e.g. Call Andrew',
      createOffline: 'Create without mic or network',
      calendarTitle: 'Today in Calendar',
      noAccessCalendar: 'No calendar access',
      grantInProfile: 'Manage access',
      pendingApprovalBanner: 'Actions waiting for your approval',
      reviewNow: 'Open Approval Center',
      moodLabel: 'Mood',
      energyLabel: 'Energy',
      bondLabel: 'Bond',
      levelLabel: 'Level',
      xpLabel: 'XP',
      noPunishmentNote: 'No absence penalties: your companion state persists locally.',
    },
    ai: {
      title: 'AI Orchestrator & Action Gateway',
      subtitle: 'Deterministic parser, model router, and strict policy verification',
      testCommandsTitle: 'Test Commands (TC-01 — TC-15)',
      injectionTest: 'Test Prompt Injection',
      cancelStream: 'Cancel stream',
      stopAgent: 'Stop Agent',
      resumeAgent: 'Resume Agent',
      approvalsTab: 'Approval Center',
      auditTab: 'Action Audit',
      chatTab: 'Chat',
      voiceModeHint: 'Tools execute only after finalized transcript.',
      partialTranscript: 'Partial transcript',
      muteTts: 'Mute TTS',
      unmuteTts: 'Unmute TTS',
      noApprovals: 'No actions pending your confirmation.',
      approve: 'Approve & Execute',
      reject: 'Reject',
      simulateTimeout: 'Simulate network timeout (UNKNOWN)',
      reconcileUnknown: 'Reconcile service status',
    },
    insights: {
      title: 'Local Insights & Widgets',
      subtitle: 'On-device aggregation without uploading app usage history',
      today: 'Today',
      days7: '7 Days',
      days30: '30 Days',
      noAccessTitle: 'No access to Usage Stats',
      noAccessBody: 'UsageStats consent is revoked. Missing data is never reported as 0.',
      sourceLabel: 'Source',
      coverageLabel: 'Data coverage',
      updatedLabel: 'Updated',
      observationNote: 'Observation: metrics computed locally with no behavioral diagnoses.',
      widgetTitle: 'Home Widget Configurator',
      widgetSubtitle: 'Event-driven updates respecting system battery limits',
      widgetQuick: 'Quick Action',
      widgetCompanion: 'Companion Status',
      widgetTasks: 'Tasks Summary',
    },
    world: {
      title: 'Companion World',
      subtitle: 'Shared rig across 3 avatars, calm progression, and offline mini-game',
      avatarsTitle: 'Select Avatar (Zero Progress Loss)',
      switchNoLoss: 'Switching appearance keeps your level, XP, and items',
      moodTitle: 'Character State',
      roomTitle: 'Room Atmosphere',
      wardrobeTitle: 'Wardrobe & Accessories',
      equip: 'Equip',
      unequip: 'Remove',
      unlock: 'Unlock',
      owned: 'Owned',
      miniGameTitle: 'Mini-Game: Focus Catch (45s)',
      miniGameDesc: '100% offline deterministic game with capped XP reward',
      startGame: 'Start Game',
      pauseGame: 'Pause',
      resumeGame: 'Resume',
      score: 'Score',
      highScore: 'Best',
      timeLeft: 'Time',
    },
    profile: {
      title: 'Memory, Privacy & Diagnostics',
      subtitle: 'Granular data controls, offline packs, and runtime capability checks',
      memoryTitle: 'Personal Memory (Data Hub)',
      addFactPlaceholder: 'Add memory fact (e.g. Prefer morning meetings)',
      addFact: 'Save fact',
      wipeMemory: 'Wipe all memory',
      consentsTitle: 'Granular Consents (ConsentStore)',
      integrationsTitle: 'Integration Capability Registry',
      packsTitle: 'Offline Packs & Storage',
      freeDisk: 'Free disk space',
      download: 'Download',
      deletePack: 'Delete',
      deviceQaTitle: 'Environment Simulator & QA Controls',
      airplaneMode: 'Airplane mode (offline)',
      batterySaver: 'Battery saver (30 FPS)',
      lowMemory: 'Low memory (static avatar)',
      reducedMotion: 'Reduced motion',
      simulate30Days: 'Simulate +30 days away',
      exportJson: 'Export JSON',
      resetAll: 'Reset state',
      language: 'Language (i18n)',
      theme: 'Appearance',
    },
    moods: {
      happy: 'Happy',
      calm: 'Calm',
      curious: 'Curious',
      tired: 'Tired',
    },
  },
  es: {
    appName: 'Life Companion',
    nav: {
      home: 'Inicio',
      ai: 'Asistente',
      insights: 'Analítica',
      world: 'Mundo',
      profile: 'Perfil',
      approvals: 'Permisos',
    },
    modes: {
      offlineBasic: 'Offline Básico',
      offlineVoice: 'Voz Offline',
      offlineAi: 'IA Offline',
      onlineAi: 'IA Online',
      killSwitch: 'Agente detenido',
    },
    home: {
      heroSubtitle: 'Compañero virtual autónomo y agente de acciones seguro',
      feed: 'Alimentar',
      pet: 'Acariciar',
      sleep: 'Descansar',
      play: 'Jugar',
      voiceCta: 'Voz (Push-to-Talk)',
      listening: 'Escuchando...',
      commandPlaceholder: 'Escribe un comando: Crear recordatorio mañana a las nueve',
      send: 'Ejecutar',
      remindersTitle: 'Recordatorios (Modo Offline)',
      addReminder: 'Añadir',
      reminderTitlePlaceholder: 'Ej: Llamar a Andrés',
      createOffline: 'Crear sin red ni micrófono',
      calendarTitle: 'Calendario de hoy',
      noAccessCalendar: 'Sin acceso al calendario',
      grantInProfile: 'Configurar acceso',
      pendingApprovalBanner: 'Acciones esperando tu confirmación',
      reviewNow: 'Abrir Centro de Aprobación',
      moodLabel: 'Ánimo',
      energyLabel: 'Energía',
      bondLabel: 'Vínculo',
      levelLabel: 'Nivel',
      xpLabel: 'XP',
      noPunishmentNote: 'Sin penalizaciones por ausencia: tu progreso se guarda localmente.',
    },
    ai: {
      title: 'Orquestador de IA y Acciones',
      subtitle: 'Analizador determinista, enrutamiento y validación de políticas',
      testCommandsTitle: 'Comandos de prueba (TC-01 — TC-15)',
      injectionTest: 'Probar Prompt Injection',
      cancelStream: 'Cancelar flujo',
      stopAgent: 'Detener agente',
      resumeAgent: 'Reanudar agente',
      approvalsTab: 'Aprobaciones',
      auditTab: 'Registro',
      chatTab: 'Chat',
      voiceModeHint: 'Las herramientas solo se ejecutan tras transcripción final.',
      partialTranscript: 'Transcripción parcial',
      muteTts: 'Silenciar voz',
      unmuteTts: 'Activar voz',
      noApprovals: 'No hay acciones pendientes de confirmación.',
      approve: 'Aprobar y ejecutar',
      reject: 'Rechazar',
      simulateTimeout: 'Simular timeout (UNKNOWN)',
      reconcileUnknown: 'Verificar estado',
    },
    insights: {
      title: 'Analítica Local y Widgets',
      subtitle: 'Cálculo en el dispositivo sin enviar historial a la nube',
      today: 'Hoy',
      days7: '7 días',
      days30: '30 días',
      noAccessTitle: 'Sin acceso a estadísticas de uso',
      noAccessBody: 'El permiso UsageStats fue revocado. No se muestran ceros falsos.',
      sourceLabel: 'Fuente',
      coverageLabel: 'Cobertura',
      updatedLabel: 'Actualizado',
      observationNote: 'Observación: datos locales sin diagnósticos médicos.',
      widgetTitle: 'Configurador de Widget',
      widgetSubtitle: 'Actualización por eventos respetando la batería',
      widgetQuick: 'Acción rápida',
      widgetCompanion: 'Estado del compañero',
      widgetTasks: 'Resumen de tareas',
    },
    world: {
      title: 'Mundo del Compañero',
      subtitle: 'Rig compartido para 3 avatares, progreso tranquilo y minijuego',
      avatarsTitle: 'Elegir Avatar (Sin perder progreso)',
      switchNoLoss: 'Cambiar de avatar conserva nivel, XP e inventario',
      moodTitle: 'Estado del personaje',
      roomTitle: 'Ambiente de la habitación',
      wardrobeTitle: 'Vestuario y accesorios',
      equip: 'Equipar',
      unequip: 'Quitar',
      unlock: 'Desbloquear',
      owned: 'En colección',
      miniGameTitle: 'Minijuego: Atrapa el Enfoque (45s)',
      miniGameDesc: 'Juego 100% offline con recompensa XP determinista',
      startGame: 'Iniciar juego',
      pauseGame: 'Pausa',
      resumeGame: 'Continuar',
      score: 'Puntos',
      highScore: 'Récord',
      timeLeft: 'Tiempo',
    },
    profile: {
      title: 'Memoria, Privacidad y Diagnóstico',
      subtitle: 'Control granular de datos, paquetes offline y pruebas de sistema',
      memoryTitle: 'Memoria Personal (Data Hub)',
      addFactPlaceholder: 'Añadir hecho (ej: Prefiero reuniones por la mañana)',
      addFact: 'Guardar',
      wipeMemory: 'Borrar toda la memoria',
      consentsTitle: 'Consentimientos Granulares',
      integrationsTitle: 'Registro de Integraciones',
      packsTitle: 'Paquetes Offline y Almacenamiento',
      freeDisk: 'Espacio libre',
      download: 'Descargar',
      deletePack: 'Eliminar',
      deviceQaTitle: 'Simulador de Entorno y QA',
      airplaneMode: 'Modo avión (sin red)',
      batterySaver: 'Ahorro de batería (30 FPS)',
      lowMemory: 'Poca memoria (avatar estático)',
      reducedMotion: 'Reducir movimiento',
      simulate30Days: 'Simular +30 días ausente',
      exportJson: 'Exportar JSON',
      resetAll: 'Restablecer',
      language: 'Idioma (i18n)',
      theme: 'Tema',
    },
    moods: {
      happy: 'Feliz',
      calm: 'Tranquilo',
      curious: 'Curioso',
      tired: 'Cansado',
    },
  },
};
