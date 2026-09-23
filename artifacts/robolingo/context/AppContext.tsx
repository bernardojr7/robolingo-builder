import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type InterestId = 'games' | 'futebol' | 'moda' | 'musica' | 'anime';

export const INTERESTS: Array<{ id: InterestId; label: string; icon: string }> = [
  { id: 'games', label: 'Games', icon: 'game-controller-outline' },
  { id: 'futebol', label: 'Futebol', icon: 'football-outline' },
  { id: 'moda', label: 'Moda', icon: 'shirt-outline' },
  { id: 'musica', label: 'Música', icon: 'musical-notes-outline' },
  { id: 'anime', label: 'Anime', icon: 'sparkles-outline' },
];

type PlayerState = {
  name: string;
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

const DEFAULT_STATE: PlayerState = {
  name: 'Alex',
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
  toggleTheme: (theme: InterestId) => void;
  completeMission: (isCorrect: boolean) => void;
  buyItem: (itemId: string, price: number) => boolean;
  hasItem: (itemId: string) => boolean;
};

const STORAGE_KEY = '@robolingo/player';
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

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

  const value = useMemo<AppContextValue>(
    () => ({
      player,
      hydrated,
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
    [hydrated, player],
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