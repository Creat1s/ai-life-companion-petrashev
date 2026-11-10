import {
  AnimationCue,
  AvatarId,
  CompanionMood,
  CompanionState,
  InventoryItem,
  RoomAtmosphere,
} from '../types/companion';

export type CompanionEvent =
  | { type: 'FEED' }
  | { type: 'PET' }
  | { type: 'SLEEP' }
  | { type: 'PLAY_START' }
  | { type: 'PLAY_FINISH'; score: number }
  | { type: 'ACTION_SUCCEEDED'; xpGain?: number }
  | { type: 'ACTION_FAILED' }
  | { type: 'SET_ANIMATION'; cue: AnimationCue }
  | { type: 'SET_MOOD'; mood: CompanionMood }
  | { type: 'SWITCH_AVATAR'; avatarId: AvatarId }
  | { type: 'SET_ROOM'; room: RoomAtmosphere }
  | { type: 'SIMULATE_DAYS_AWAY'; days: number };

const XP_PER_LEVEL = 100;

function applyXp(currentXp: number, currentLevel: number, delta: number): { xp: number; level: number } {
  const cappedDelta = Math.min(Math.max(delta, 0), 40); // deterministic cap per event
  const total = currentXp + cappedDelta;
  const level = Math.max(1, Math.floor(total / XP_PER_LEVEL) + 1);
  return { xp: total, level: Math.max(currentLevel, level) };
}

export function companionReducer(state: CompanionState, event: CompanionEvent): CompanionState {
  const now = new Date().toISOString();

  switch (event.type) {
    case 'FEED': {
      const { xp, level } = applyXp(state.xp, state.level, 12);
      return {
        ...state,
        energy: Math.min(100, state.energy + 15),
        bond: Math.min(100, state.bond + 4),
        mood: 'happy',
        animation: 'eat',
        xp,
        level,
        lastActiveAt: now,
        version: state.version + 1,
      };
    }
    case 'PET': {
      const { xp, level } = applyXp(state.xp, state.level, 8);
      return {
        ...state,
        bond: Math.min(100, state.bond + 5),
        mood: 'happy',
        animation: 'success',
        xp,
        level,
        lastActiveAt: now,
        version: state.version + 1,
      };
    }
    case 'SLEEP': {
      return {
        ...state,
        energy: Math.min(100, state.energy + 20),
        mood: 'calm',
        animation: 'sleep',
        lastActiveAt: now,
        version: state.version + 1,
      };
    }
    case 'PLAY_START': {
      return {
        ...state,
        mood: 'curious',
        animation: 'play',
        lastActiveAt: now,
        version: state.version + 1,
      };
    }
    case 'PLAY_FINISH': {
      const reward = Math.min(35, Math.max(10, Math.round(event.score * 1.5)));
      const { xp, level } = applyXp(state.xp, state.level, reward);
      return {
        ...state,
        energy: Math.max(15, state.energy - 6),
        bond: Math.min(100, state.bond + 6),
        mood: 'happy',
        animation: 'success',
        xp,
        level,
        gamesPlayed: state.gamesPlayed + 1,
        highScoreMiniGame: Math.max(state.highScoreMiniGame, event.score),
        lastActiveAt: now,
        version: state.version + 1,
      };
    }
    case 'ACTION_SUCCEEDED': {
      const { xp, level } = applyXp(state.xp, state.level, event.xpGain ?? 10);
      return {
        ...state,
        mood: 'happy',
        animation: 'success',
        xp,
        level,
        lastActiveAt: now,
        version: state.version + 1,
      };
    }
    case 'ACTION_FAILED': {
      return {
        ...state,
        mood: 'curious',
        animation: 'error',
        lastActiveAt: now,
        version: state.version + 1,
      };
    }
    case 'SET_ANIMATION': {
      return {
        ...state,
        animation: event.cue,
      };
    }
    case 'SET_MOOD': {
      return {
        ...state,
        mood: event.mood,
        animation:
          event.mood === 'tired'
            ? 'sleep'
            : event.mood === 'happy'
              ? 'success'
              : event.mood === 'curious'
                ? 'think'
                : 'idle',
        lastActiveAt: now,
        version: state.version + 1,
      };
    }
    case 'SWITCH_AVATAR': {
      // CMP-01: Switching avatars preserves XP, level, bond, energy, inventory
      return {
        ...state,
        avatarId: event.avatarId,
        animation: 'success',
        version: state.version + 1,
      };
    }
    case 'SET_ROOM': {
      return {
        ...state,
        room: event.room,
        version: state.version + 1,
      };
    }
    case 'SIMULATE_DAYS_AWAY': {
      // PRD-05 & CMP-03: Zero penalties, zero guilt, zero negative mood/XP drops!
      return {
        ...state,
        daysAwaySimulated: state.daysAwaySimulated + event.days,
        mood: 'calm',
        animation: 'idle',
        version: state.version + 1,
      };
    }
    default:
      return state;
  }
}

export function validateInventoryCompatibility(
  item: InventoryItem,
  avatarId: AvatarId
): boolean {
  return item.compatibleAvatars.includes(avatarId);
}
