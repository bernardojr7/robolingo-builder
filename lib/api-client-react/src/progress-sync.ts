import type { Progress, ProgressInput } from './generated/api.schemas';

export type { Progress, ProgressInput } from './generated/api.schemas';

export type SyncablePlayerState = {
  name: string;
  profileOwnerId: string | null;
  profileRole: ProgressInput['role'] | null;
  teacherClassName: string;
  teacherClassCode: string;
  level: number;
  xp: number;
  xpNextLevel: number;
  coins: number;
  gems: number;
  streakDays: number;
  completedMissions: number;
  selectedThemes: ProgressInput['selectedThemes'];
  ownedItems: string[];
};

export function getProgressStorageKey(userId: string): string {
  return `@robolingo/player/${encodeURIComponent(userId)}`;
}

export function isProgressOwnedByAccount(
  state: Pick<SyncablePlayerState, 'profileOwnerId'> | { profileOwnerId?: string | null },
  userId: string,
): boolean {
  return state.profileOwnerId === userId;
}

export function canSyncProgressForAccount(input: {
  userId: string | null;
  hydratedAccountId: string | null;
  profileOwnerId: string | null;
  remoteSyncAllowed: boolean;
}): boolean {
  return Boolean(
    input.userId &&
      input.hydratedAccountId === input.userId &&
      input.profileOwnerId === input.userId &&
      input.remoteSyncAllowed,
  );
}

export function mergeRemoteProgress<T extends SyncablePlayerState>(
  current: T,
  remote: Progress,
  userId: string,
): T {
  return {
    ...current,
    profileOwnerId: userId,
    name: remote.name,
    profileRole: remote.role,
    teacherClassName: remote.teacherClassName,
    teacherClassCode: remote.teacherClassCode,
    level: remote.level,
    xp: remote.xp,
    xpNextLevel: remote.xpNextLevel,
    coins: remote.coins,
    gems: remote.gems,
    streakDays: remote.streakDays,
    completedMissions: remote.completedMissions,
    selectedThemes: remote.selectedThemes,
    ownedItems: remote.ownedItems,
  } as T;
}

export function buildProgressPayload(player: SyncablePlayerState): ProgressInput {
  return {
    name: player.name,
    role: player.profileRole as ProgressInput['role'],
    teacherClassName: player.teacherClassName,
    teacherClassCode: player.teacherClassCode,
    level: player.level,
    xp: player.xp,
    xpNextLevel: player.xpNextLevel,
    coins: player.coins,
    gems: player.gems,
    streakDays: player.streakDays,
    completedMissions: player.completedMissions,
    selectedThemes: player.selectedThemes,
    ownedItems: player.ownedItems,
  };
}

export function serializeProgressPayload(payload: ProgressInput): string {
  return JSON.stringify(payload);
}