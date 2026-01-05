import { useEffect, useRef, useState } from "react";

type Options<T> = {
  reviver?: (raw: unknown) => T;        // якщо треба кастомно відновити тип
  serializer?: (value: T) => unknown;   // якщо треба кастомно серіалізувати
};

export function useStorageState<T>(
  key: string,
  initialValue: T | (() => T),
  opts: Options<T> = {}
) {
  const { reviver, serializer } = opts;

  const initialRef = useRef(initialValue);
  const [value, setValue] = useState<T>(() => {
    // 1) пробуємо localStorage
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        const parsed = JSON.parse(raw) as unknown;
        return reviver ? reviver(parsed) : (parsed as T);
      }
    } catch {
      // ignore
    }

    // 2) fallback на initial
    return typeof initialRef.current === "function"
      ? (initialRef.current as () => T)()
      : (initialRef.current as T);
  });

  // persist on change
  useEffect(() => {
    try {
      const payload = serializer ? serializer(value) : value;
      localStorage.setItem(key, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [key, value, serializer]);

  // sync між вкладками/вікнами
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        if (e.newValue == null) return;
        const parsed = JSON.parse(e.newValue) as unknown;
        setValue(reviver ? reviver(parsed) : (parsed as T));
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, reviver]);

  const reset = () => {
    const next =
      typeof initialRef.current === "function"
        ? (initialRef.current as () => T)()
        : (initialRef.current as T);
    setValue(next);
  };

  return { value, setValue, reset };
}
