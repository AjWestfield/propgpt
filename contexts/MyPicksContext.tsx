import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlayerProp } from '../types/playerProp';

interface MyPicksContextValue {
  picks: PlayerProp[];
  addPick: (prop: PlayerProp) => void;
  removePick: (propId: string) => void;
  togglePick: (prop: PlayerProp) => void;
  isPicked: (propId: string) => boolean;
  clearPicks: () => void;
}

const MyPicksContext = createContext<MyPicksContextValue | undefined>(undefined);

const STORAGE_KEY = 'myPicks';

export const MyPicksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [picks, setPicks] = useState<PlayerProp[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const addPick = useCallback((prop: PlayerProp) => {
    setPicks(prev => {
      if (prev.find(existing => existing.id === prop.id)) {
        return prev;
      }
      return [...prev, prop];
    });
  }, []);

  const removePick = useCallback((propId: string) => {
    setPicks(prev => prev.filter(pick => pick.id !== propId));
  }, []);

  const togglePick = useCallback((prop: PlayerProp) => {
    setPicks(prev => {
      const exists = prev.find(pick => pick.id === prop.id);
      if (exists) {
        return prev.filter(pick => pick.id !== prop.id);
      }
      return [...prev, prop];
    });
  }, []);

  const isPicked = useCallback(
    (propId: string) => picks.some(pick => pick.id === propId),
    [picks]
  );

  const clearPicks = useCallback(() => {
    setPicks([]);
  }, []);

  // Load picks from AsyncStorage on mount
  useEffect(() => {
    const loadPicks = async () => {
      try {
        const storedPicks = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedPicks) {
          const parsedPicks = JSON.parse(storedPicks);
          setPicks(parsedPicks);
        }
      } catch (error) {
        console.log('Error loading picks from storage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadPicks();
  }, []);

  // Save picks to AsyncStorage whenever they change
  useEffect(() => {
    const savePicks = async () => {
      // Only save after initial load to avoid overwriting on mount
      if (!isLoaded) return;

      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
      } catch (error) {
        console.log('Error saving picks to storage:', error);
      }
    };

    savePicks();
  }, [picks, isLoaded]);

  const value = useMemo<MyPicksContextValue>(
    () => ({
      picks,
      addPick,
      removePick,
      togglePick,
      isPicked,
      clearPicks,
    }),
    [picks, addPick, removePick, togglePick, isPicked, clearPicks]
  );

  return (
    <MyPicksContext.Provider value={value}>
      {children}
    </MyPicksContext.Provider>
  );
};

export function useMyPicks() {
  const context = useContext(MyPicksContext);
  if (!context) {
    throw new Error('useMyPicks must be used within a MyPicksProvider');
  }
  return context;
}
