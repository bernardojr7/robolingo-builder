import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/expo';
import {
  getGetMyProgressQueryKey,
  type ProgressInput,
  useGetMyProgress,
  useUpdateMyProgress,
} from '@workspace/api-client-react';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

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

type PlayerState = {
  name: string;
  profileOwnerId: string | null;
  profileRole: AccountRole | null;
  teacherClassName: string;
  level: number;
  xp: number;
  xpNextLevel: number;
  coins: number;
  gems: number;
  streakDays: number;
  completedMissions: number;
  selectedThemes: InterestId[];
  ownedItems: string[];
};

type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

const DEFAULT_STATE: PlayerState = {
  name: 'Alex',
  profileOwnerId: null,
  profileRole: null,
  teacherClassName: '',
  level: 5,
  xp: 420,
  xpNextLevel: 600,
  coins: 580,
  gems: 120,
  streakDays: 5,
  completedMissions: 7,
  selectedThemes: ['games', 'futebol', 'musica'],
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
  }) => void;
  toggleTheme: (theme: InterestId) => void;
  completeMission: (isCorrect: boolean) => void;
  buyItem: (itemId: string, price: number) => boolean;
  hasItem: (itemId: string) => boolean;
};

const STORAGE_KEY = '@robolingo/player';
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [player, setPlayer] = useState<PlayerState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [lastSyncedPayload, setLastSyncedPayload] = useState('');
  const progressQuery = useGetMyProgress({
    query: {
      enabled: hydrated && isLoaded && Boolean(isSignedIn && userId),
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
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          setPlayer({ ...DEFAULT_STATE, ...JSON.parse(saved) });
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(player)).catch(() => undefined);
    }
  }, [hydrated, player]);

  useEffect(() => {
    setRemoteReady(false);
    setLastSyncedPayload('');
    setSyncStatus(isSignedIn && userId ? 'syncing' : 'offline');
  }, [isSignedIn, userId]);

  useEffect(() => {
    if (!isSignedIn || !userId || !progressQuery.isFetched) return;

    if (progressQuery.data) {
      setPlayer((current) => ({
        ...current,
        profileOwnerId: userId,
        name: progressQuery.data.name,
        profileRole: progressQuery.data.role,
        teacherClassName: progressQuery.data.teacherClassName,
        level: progressQuery.data.level,
        xp: progressQuery.data.xp,
        xpNextLevel: progressQuery.data.xpNextLevel,
        coins: progressQuery.data.coins,
        gems: progressQuery.data.gems,
        streakDays: progressQuery.data.streakDays,
        completedMissions: progressQuery.data.completedMissions,
        selectedThemes: progressQuery.data.selectedThemes,
        ownedItems: progressQuery.data.ownedItems,
      }));
    }

    setRemoteReady(true);
    setSyncStatus(progressQuery.data ? 'synced' : 'offline');
  }, [isSignedIn, progressQuery.data, progressQuery.isFetched, userId]);

  useEffect(() => {
    if (!remoteReady || !isSignedIn || !userId || player.profileOwnerId !== userId || !player.profileRole) {
      return;
    }

    const payload: ProgressInput = {
      name: player.name,
      role: player.profileRole,
      teacherClassName: player.teacherClassName,
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
    const serializedPayload = JSON.stringify(payload);
    if (serializedPayload === lastSyncedPayload) return;

    setSyncStatus('syncing');
    mutateProgress(
      { data: payload },
      {
        onSuccess: () => {
          setLastSyncedPayload(serializedPayload);
          setSyncStatus('synced');
        },
        onError: () => {
          setSyncStatus('error');
        },
      },
    );
  }, [
    isSignedIn,
    lastSyncedPayload,
    player,
    remoteReady,
    mutateProgress,
    userId,
  ]);

  const value = useMemo<AppContextValue>(
    () => ({
      player,
      hydrated,
      profileReady:
        hydrated &&
        player.profileOwnerId !== null &&
        (!isSignedIn || remoteReady),
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
          };
        });
      },
      setProfile: ({ role, name, selectedThemes, teacherClassName }) => {
        setPlayer((current) => ({
          ...current,
          name: name.trim() || current.name,
          profileRole: role,
          selectedThemes: selectedThemes ?? current.selectedThemes,
          teacherClassName: teacherClassName?.trim() ?? current.teacherClassName,
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
    [hydrated, isSignedIn, player, remoteReady, syncStatus],
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