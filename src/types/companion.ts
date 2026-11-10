export type Locale = 'ru' | 'en' | 'es';
export type ThemeMode = 'light' | 'dark';
export type UIMode = 'user' | 'admin';
export type DesignStyle = 'game' | 'web3';
export type MainTab = 'home' | 'ai' | 'insights' | 'world' | 'profile' | 'help';

export type AvatarId = 'lumi' | 'nova' | 'shadow' | 'yobao' | 'bobo' | 'pico' | 'maya' | 'kira' | 'orion' | 'mochi';
export type CompanionMood = 'happy' | 'calm' | 'curious' | 'tired';
export type AnimationCue =
  | 'idle'
  | 'listen'
  | 'think'
  | 'speak'
  | 'success'
  | 'error'
  | 'eat'
  | 'sleep'
  | 'play';

export type RoomAtmosphere = 'studio' | 'morning' | 'night';

export type ClothingSlot = 'glasses' | 'headphones' | 'scarf' | 'hat';

export interface InventoryItem {
  itemId: string;
  slot: ClothingSlot;
  name: Record<Locale, string>;
  costXp: number;
  compatibleAvatars: AvatarId[];
  owned: boolean;
  equipped: boolean;
}

export interface CompanionState {
  avatarId: AvatarId;
  mood: CompanionMood;
  energy: number; // 0..100
  bond: number; // 0..100
  xp: number;
  level: number;
  animation: AnimationCue;
  room: RoomAtmosphere;
  lastActiveAt: string;
  daysAwaySimulated: number;
  highScoreMiniGame: number;
  gamesPlayed: number;
  version: number;
}

export type ConsentSourceId =
  | 'calendar'
  | 'usageStats'
  | 'notifications'
  | 'cloudAi'
  | 'offlineStt'
  | 'contactsCalls'
  | 'messengers'
  | 'socialMedia'
  | 'healthSensors'
  | 'deviceControl';

export interface ConsentGrant {
  sourceId: ConsentSourceId;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
  scope: string;
  allowed: boolean;
  issuedAt: string | null;
  revokedAt: string | null;
  version: number;
}

export interface UserSettings {
  locale: Locale;
  timezone: string;
  theme: ThemeMode;
  uiMode?: UIMode;
  designStyle?: DesignStyle;
  airplaneMode: boolean;
  batterySaver: boolean;
  lowMemoryMode: boolean;
  reducedMotion: boolean;
  killSwitchActive: boolean;
  ttsMuted: boolean;
  widgetType: 'quick_action' | 'companion_status' | 'tasks_summary';
}

export type ActionStatus =
  | 'CREATED'
  | 'VALIDATED'
  | 'POLICY_CHECK'
  | 'NEEDS_APPROVAL'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELED'
  | 'UNKNOWN';

export interface ActionRecord {
  actionId: string;
  tool: string;
  idempotencyKey: string;
  state: ActionStatus;
  approvalId?: string;
  source: 'voice' | 'text' | 'form' | 'system';
  toolVersion: string;
  consentSnapshot: Record<ConsentSourceId, boolean>;
  createdAt: string;
  updatedAt: string;
  summary: string;
  proof?: Record<string, string | number | boolean>;
  errorReason?: string;
}

export interface ApprovalRequest {
  approvalId: string;
  actionId: string;
  tool: string;
  title: string;
  destination: string;
  payloadPreview: string;
  riskLevel: 'medium' | 'high';
  createdAt: string;
  canSimulateTimeout?: boolean;
}

export interface ReminderItem {
  id: string;
  title: string;
  at: string;
  timezone: string;
  completed: boolean;
  source: 'form' | 'text' | 'voice';
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  participant?: string;
  location?: string;
}

export interface MemoryFact {
  id: string;
  category: 'preferences' | 'schedule' | 'context';
  value: string;
  source: string;
  confidence: number;
  createdAt: string;
  expiresAt: string | null;
}

export type ModelRoute =
  | 'rule_based'
  | 'on_device'
  | 'cloud_small'
  | 'cloud_large'
  | 'cloud_llm'
  | 'offline_fallback'
  | 'policy_blocked';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  createdAt: string;
  route?: ModelRoute;
  actionId?: string;
  status?: 'streaming' | 'complete' | 'canceled' | 'error';
  untrustedInput?: boolean;
}

export interface ActivityCategoryStat {
  id: string;
  label: Record<Locale, string>;
  minutesToday: number;
  minutes7d: number;
  minutes30d: number;
  color: string;
}

export interface ActivitySummary {
  sourceId: 'usageStats';
  updatedAt: string;
  coveragePercent: number;
  comparison7dPercent: number;
  categories: ActivityCategoryStat[];
}

export interface OfflinePack {
  packId: string;
  name: Record<Locale, string>;
  version: string;
  sizeMb: number;
  checksum: string;
  status: 'installed' | 'available' | 'downloading';
  requiredRamGb: number;
}

export interface IntegrationCapability {
  id: string;
  name: string;
  releaseTier: 'P0' | 'P1' | 'P2';
  status: 'connected' | 'available' | 'unsupported' | 'revoked';
  capabilities: Record<Locale, string>;
  limitations: Record<Locale, string>;
  rateLimit: string;
  tokenHealth: 'ok' | 'none' | 'expired';
}

export interface TestCommandPreset {
  id: string;
  label: string;
  prompt: Record<Locale, string>;
}

// --- NEW SUPER-COMPANION PHONE & PERSONA TYPES ---

export interface ContactItem {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatarColor: string;
  favorite?: boolean;
}

export interface ActiveCallState {
  contact: ContactItem;
  direction: 'incoming' | 'outgoing';
  status: 'ringing' | 'connected' | 'ended';
  startedAt: string;
  voiceConsentListening?: boolean;
  transcript?: string;
}

export type MessengerApp = 'WhatsApp' | 'Telegram' | 'Instagram Direct' | 'SMS';

export interface MessengerThreadItem {
  id: string;
  app: MessengerApp;
  senderName: string;
  senderHandle: string;
  incomingText: string;
  receivedAt: string;
  aiDraftReply: string;
  status: 'pending_confirm' | 'sent';
  sentReplyText?: string;
}

export type SocialPlatform = 'Instagram' | 'TikTok' | 'Telegram' | 'VK' | 'YouTube Shorts';
export type SocialContentFormat = 'Пост' | 'Сторис' | 'Reels / Клип';

export interface SocialMediaAsset {
  id: string;
  type: 'photo' | 'video' | 'file';
  title: string;
  subtitle: string;
  previewGradient: string;
  badge: string;
  customUrl?: string;
}

export interface SocialPostDraft {
  id: string;
  platform: SocialPlatform;
  format: SocialContentFormat;
  topic: string;
  caption: string;
  hashtags: string[];
  selectedMediaIds: string[];
  status: 'draft' | 'awaiting_confirmation' | 'published';
  publishedAt?: string;
}

export type PsychologicalMood = 'great' | 'calm' | 'tired' | 'stressed' | 'sad';

export interface HealthWellnessState {
  heartRateBpm: number;
  stressPercent: number;
  sleepHours: number;
  waterGlasses: number;
  psychMood: PsychologicalMood;
  lastCheckInAt: string;
  latestEncouragement: string;
}

export type PersonaStylePreset = 'polite' | 'friendly' | 'bro' | 'uncensored_18';

export interface LearnedPhraseRule {
  id: string;
  whenUserSays: string;
  assistantReplies: string;
}

export interface PersonaTrainingConfig {
  stylePreset: PersonaStylePreset;
  allowProfanity: boolean;
  ownerAddress: string;
  customCatchphrases: string[];
  customBehaviorPrompt: string;
  learnedRules: LearnedPhraseRule[];
}
