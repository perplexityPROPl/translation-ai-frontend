import { useState } from 'react';

export const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(storedValue) : value;
      setStoredValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error saving to localStorage for key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
