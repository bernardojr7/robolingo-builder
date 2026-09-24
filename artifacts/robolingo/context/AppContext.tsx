import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/expo';
import {
  getGetMyProgressQueryKey,
  useGetMyProgress,
  useUpdateMyProgress,
} from '@workspace/api-client-react';
import {
  buildProgressPayload,
  canSyncProgressForAccount,
  getProgressStorageKey,
  isProgressOwnedByAccount,
  mergeRemoteProgress,
  serializeProgressPayload,
  type SyncablePlayerState,
} from '@workspace/api-client-react/progress-sync';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CurriculumYearId } from '@/data/gameDesign';

export type InterestId =
  | 'games'
  | 'futebol'
  | 'moda'
  | 'musica'
  | 'anime'
  | 'culinaria'
  | 'leitura'
  | 'matematica'
  | 'ciencia'
  | 'historia'
  | 'geografia'
  | 'hq'
  | 'filme'
  | 'serie'
  | 'viagem';
export type AccountRole = 'student' | 'teacher';

export const INTERESTS: Array<{ id: InterestId; label: string; icon: string }> = [
  { id: 'games', label: 'Games', icon: 'game-controller-outline' },
  { id: 'futebol', label: 'Futebol', icon: 'football-outline' },
  { id: 'moda', label: 'Moda', icon: 'shirt-outline' },
  { id: 'musica', label: 'Música', icon: 'musical-notes-outline' },
  { id: 'anime', label: 'Anime', icon: 'sparkles-outline' },
  { id: 'culinaria', label: 'Culinária', icon: 'restaurant-outline' },
  { id: 'leitura', label: 'Leitura', icon: 'book-outline' },
  { id: 'matematica', label: 'Matemática', icon: 'calculator-outline' },
  { id: 'ciencia', label: 'Ciência', icon: 'flask-outline' },
  { id: 'historia', label: 'História', icon: 'time-outline' },
  { id: 'geografia', label: 'Geografia', icon: 'globe-outline' },
  { id: 'hq', label: 'HQ', icon: 'chatbox-ellipses-outline' },
  { id: 'filme', label: 'Filme', icon: 'film-outline' },
  { id: 'serie', label: 'Série', icon: 'tv-outline' },
  { id: 'viagem', label: 'Viagem', icon: 'airplane-outline' },
];

export type PlayerState = SyncablePlayerState & {
  profileRole: AccountRole | null;
  selectedThemes: InterestId[];
  curriculumYear: CurriculumYearId;
};

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

const DEFAULT_STATE: PlayerState = {
  name: 'Alex',
  profileOwnerId: null,
  profileRole: null,
  teacherClassName: '',
  teacherClassCode: '',
  level: 5,
  xp: 420,
  xpNextLevel: 600,
  coins: 580,
  gems: 120,
  streakDays: 5,
  completedMissions: 7,
  selectedThemes: ['games', 'futebol', 'musica'],
  curriculumYear: '6',
  ownedItems: ['hair_default', 'jacket_default'],
};

type AppContextValue = {
  player: PlayerState;
  hydrated: boolean;
  profileReady: boolean;
  syncStatus: SyncStatus;
  ensureProfileOwner: (userId: string) => void;
  setProfile: (profile: {
    role: AccountRole;
    name: string;
    selectedThemes?: InterestId[];
    teacherClassName?: string;
    teacherClassCode?: string;
  }) => void;
  toggleTheme: (theme: InterestId) => void;
  setCurriculumYear: (year: CurriculumYearId) => void;
  completeMission: (isCorrect: boolean) => void;
  buyItem: (itemId: string, price: number) => boolean;
  hasItem: (itemId: string) => boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [player, setPlayer] = useState<PlayerState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [hydratedAccountId, setHydratedAccountId] = useState<string | null>(null);
  const [remoteReady, setRemoteReady] = useState(false);
  const [remoteSyncAllowed, setRemoteSyncAllowed] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [lastSyncedPayload, setLastSyncedPayload] = useState('');
  const [lastServerUpdatedAt, setLastServerUpdatedAt] = useState<string | null>(null);
  const latestMutationId = useRef(0);
  const latestHydrationId = useRef(0);
  const latestPlayer = useRef(player);
  latestPlayer.current = player;
  const activeAccountId = isSignedIn && userId ? userId : null;
  const progressQuery = useGetMyProgress({
    query: {
      enabled: hydrated && hydratedAccountId === activeAccountId && isLoaded && Boolean(activeAccountId),
      retry: false,
      staleTime: Infinity,
      queryKey: [...getGetMyProgressQueryKey(), userId ?? 'signed-out'],
    },
  });
  const { mutate: mutateProgress } = useUpdateMyProgress({
    mutation: {
      retry: 3,
      retryDelay: 5_000,
    },
  });

  useEffect(() => {
    if (!isLoaded) return;

    const hydrationId = latestHydrationId.current + 1;
    latestHydrationId.current = hydrationId;
    const accountId = activeAccountId;
    const current = latestPlayer.current;
    const hasPendingProfile = current.profileOwnerId === null && current.profileRole !== null;
    const pendingProfile = hasPendingProfile
      ? {
          ...DEFAULT_STATE,
          name: current.name,
          selectedThemes: current.selectedThemes,
          curriculumYear: current.curriculumYear,
        }
      : DEFAULT_STATE;

    setHydrated(false);
    setHydratedAccountId(null);
    setRemoteReady(false);
    setRemoteSyncAllowed(false);
    setLastSyncedPayload('');
    setLastServerUpdatedAt(null);
    latestMutationId.current += 1;
    setSyncStatus(accountId ? 'syncing' : 'offline');
    setPlayer(pendingProfile);

    if (!accountId) {
      setHydratedAccountId(null);
      setHydrated(true);
      return;
    }

    AsyncStorage.getItem(getProgressStorageKey(accountId))
      .then((saved) => {
        if (latestHydrationId.current !== hydrationId) return;

        let nextState = pendingProfile;
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Partial<PlayerState>;
            if (isProgressOwnedByAccount(parsed, accountId)) {
              nextState = { ...DEFAULT_STATE, ...parsed, profileOwnerId: accountId };
            }
          } catch {
            // Ignore a corrupt account cache and wait for the remote state.
          }
        }

        setPlayer(nextState);
        setHydratedAccountId(accountId);
        setHydrated(true);
      })
      .catch(() => {
        if (latestHydrationId.current !== hydrationId) return;
        setPlayer(pendingProfile);
        setHydratedAccountId(accountId);
        setHydrated(true);
      });
  }, [activeAccountId, isLoaded]);

  useEffect(() => {
    if (
      !hydrated ||
      !activeAccountId ||
      hydratedAccountId !== activeAccountId ||
      !isProgressOwnedByAccount(player, activeAccountId)
    ) {
      return;
    }
    AsyncStorage.setItem(getProgressStorageKey(activeAccountId), JSON.stringify(player)).catch(() => undefined);
  }, [activeAccountId, hydrated, hydratedAccountId, player]);

  useEffect(() => {
    if (
      !activeAccountId ||
      hydratedAccountId !== activeAccountId ||
      !progressQuery.isFetched ||
      progressQuery.isFetching
    ) {
      return;
    }

    if (progressQuery.data) {
      setPlayer((current) => mergeRemoteProgress(current, progressQuery.data, activeAccountId));
      setLastServerUpdatedAt(progressQuery.data.updatedAt);
    }

    setRemoteReady(true);
    setRemoteSyncAllowed(Boolean(progressQuery.data) || progressQuery.error?.status === 404);
    setSyncStatus(progressQuery.data ? 'synced' : 'offline');
  }, [
    activeAccountId,
    hydratedAccountId,
    progressQuery.data,
    progressQuery.error,
    progressQuery.isFetched,
    progressQuery.isFetching,
  ]);

  useEffect(() => {
    if (
      !remoteReady ||
      !player.profileRole ||
      !canSyncProgressForAccount({
        userId: activeAccountId,
        hydratedAccountId,
        profileOwnerId: player.profileOwnerId,
        remoteSyncAllowed,
      })
    ) {
      return;
    }

    const payload = buildProgressPayload(player);
    const serializedPayload = serializeProgressPayload(payload);
    if (serializedPayload === lastSyncedPayload) return;

    const mutationId = latestMutationId.current + 1;
    latestMutationId.current = mutationId;
    const requestPayload = {
      ...payload,
      ...(lastServerUpdatedAt ? { updatedAt: lastServerUpdatedAt } : {}),
    };
    setSyncStatus('syncing');
    mutateProgress(
      { data: requestPayload },
      {
        onSuccess: (savedProgress) => {
          if (mutationId !== latestMutationId.current) return;
          setPlayer((current) => ({
            ...current,
            teacherClassCode: savedProgress.teacherClassCode,
          }));
          setLastServerUpdatedAt(savedProgress.updatedAt);
          setLastSyncedPayload(
            serializeProgressPayload({
              ...payload,
              teacherClassCode: savedProgress.teacherClassCode,
            }),
          );
          setSyncStatus('synced');
        },
        onError: () => {
          if (mutationId !== latestMutationId.current) return;
          setSyncStatus('error');
        },
      },
    );
  }, [
    isSignedIn,
    lastServerUpdatedAt,
    lastSyncedPayload,
    player,
    activeAccountId,
    hydratedAccountId,
    remoteReady,
    remoteSyncAllowed,
    mutateProgress,
  ]);

  const value = useMemo<AppContextValue>(
    () => ({
      player,
      hydrated,
      profileReady:
        hydrated &&
        (!isSignedIn ||
          (player.profileOwnerId === activeAccountId && remoteReady)),
      syncStatus,
      ensureProfileOwner: (userId) => {
        setPlayer((current) => {
          if (current.profileOwnerId === userId) {
            return current;
          }
          return {
            ...DEFAULT_STATE,
            profileOwnerId: userId,
            name: current.name,
            selectedThemes: current.selectedThemes,
            curriculumYear: current.curriculumYear,
          };
        });
      },
      setProfile: ({ role, name, selectedThemes, teacherClassName, teacherClassCode }) => {
        setPlayer((current) => ({
          ...current,
          name: name.trim() || current.name,
          profileRole: role,
          selectedThemes: selectedThemes ?? current.selectedThemes,
          teacherClassName: teacherClassName?.trim() ?? current.teacherClassName,
          teacherClassCode: teacherClassCode?.trim().toUpperCase() ?? current.teacherClassCode,
        }));
      },
      toggleTheme: (theme) => {
        setPlayer((current) => ({
          ...current,
          selectedThemes: current.selectedThemes.includes(theme)
            ? current.selectedThemes.filter((item) => item !== theme)
            : [...current.selectedThemes, theme],
        }));
      },
      setCurriculumYear: (curriculumYear) => {
        setPlayer((current) => ({ ...current, curriculumYear }));
      },
      completeMission: (isCorrect) => {
        setPlayer((current) => {
          if (!isCorrect) {
            return {
              ...current,
              completedMissions: current.completedMissions + 1,
            };
          }
          const nextXp = current.xp + 85;
          const leveledUp = nextXp >= current.xpNextLevel;
          return {
            ...current,
            xp: leveledUp ? nextXp - current.xpNextLevel : nextXp,
            level: leveledUp ? current.level + 1 : current.level,
            xpNextLevel: leveledUp ? current.xpNextLevel + 220 : current.xpNextLevel,
            coins: current.coins + 35,
            completedMissions: current.completedMissions + 1,
            streakDays: Math.max(current.streakDays, 6),
          };
        });
      },
      buyItem: (itemId, price) => {
        let purchased = false;
        setPlayer((current) => {
          if (current.ownedItems.includes(itemId) || current.coins < price) {
            return current;
          }
          purchased = true;
          return {
            ...current,
            coins: current.coins - price,
            ownedItems: [...current.ownedItems, itemId],
          };
        });
        return purchased;
      },
      hasItem: (itemId) => player.ownedItems.includes(itemId),
    }),
    [activeAccountId, hydrated, isSignedIn, player, remoteReady, syncStatus],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used inside AppProvider');
  }
  return context;
}